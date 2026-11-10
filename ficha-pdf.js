/* UNO Brokers · Ficha PDF descargable para páginas de propiedad
   Uso: <script type="application/json" id="fichaData">{...}</script>
        <button data-ficha>Descargar ficha PDF</button>
        <script src="/ficha-pdf.js?v=1" defer></script>
   Si el link trae ?a=Nombre&w=3312345678, la ficha sale con los datos del asesor. */
(function(){
  var JSPDF = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  var D;
  try{ D = JSON.parse(document.getElementById('fichaData').textContent.replace(/²/g,'2').replace(/[“”]/g,'"')); }catch(e){ return; }

  function cleanName(s){ return (s||'').replace(/[^\p{L}\p{M}\s.'-]/gu,'').replace(/\s+/g,' ').trim().slice(0,40); }
  function cleanPhone(s){
    var d=(s||'').replace(/\D/g,'');
    if(d.length===10) return '52'+d;
    if(d.length===12 && d.indexOf('52')===0) return d;
    if(d.length===13 && d.indexOf('521')===0) return '52'+d.slice(3);
    return '';
  }
  var adv = {name:'UNO Brokers', wa:'523339675255', personal:false};
  try{
    var qs=new URLSearchParams(location.search), qn=cleanName(qs.get('a')), qw=cleanPhone(qs.get('w'));
    if(qn && qw) adv={name:qn, wa:qw, personal:true};
  }catch(e){}
  function telFmt(wa){ var l=wa.slice(2); return l.slice(0,2)+' '+l.slice(2,6)+' '+l.slice(6); }

  function loadScript(src){
    return new Promise(function(ok,ko){
      if(window.jspdf) return ok();
      var s=document.createElement('script'); s.src=src; s.onload=ok; s.onerror=ko; document.head.appendChild(s);
    });
  }
  function toDataURL(url){
    return fetch(url,{mode:'cors'}).then(function(r){ if(!r.ok) throw 0; return r.blob(); }).then(function(b){
      return new Promise(function(ok,ko){ var fr=new FileReader(); fr.onload=function(){ok(fr.result);}; fr.onerror=ko; fr.readAsDataURL(b); });
    }).then(function(src){
      return new Promise(function(ok,ko){ var im=new Image(); im.onload=function(){ ok({src:src,w:im.naturalWidth,h:im.naturalHeight}); }; im.onerror=ko; im.src=src; });
    });
  }
  function conTiempo(p,ms){ return Promise.race([p,new Promise(function(_,ko){ setTimeout(ko,ms); })]); }

  // Dibuja la imagen recortada (tipo "cover") dentro del recuadro
  function cover(doc,img,x,y,w,h){
    try{
      var r=w/h, ir=img.w/img.h, sw,sh,sx,sy;
      if(ir>r){ sh=img.h; sw=sh*r; sx=(img.w-sw)/2; sy=0; } else { sw=img.w; sh=sw/r; sx=0; sy=(img.h-sh)/2; }
      var c=document.createElement('canvas'), k=Math.min(1, 1400/sw);
      c.width=Math.round(sw*k); c.height=Math.round(sh*k);
      var im=new Image(); im.src=img.src;
      c.getContext('2d').drawImage(im,sx,sy,sw,sh,0,0,c.width,c.height);
      doc.addImage(c.toDataURL('image/jpeg',0.82),'JPEG',x,y,w,h);
    }catch(e){}
  }

  function generar(btn){
    var txtOrig = btn ? btn.innerHTML : '';
    if(btn){ btn.disabled=true; btn.innerHTML='Generando ficha…'; }
    var fotos=(D.fotos||[]).slice(0,4);
    loadScript(JSPDF).then(function(){
      return Promise.all(fotos.map(function(u){ return conTiempo(toDataURL(u),8000).catch(function(){ return null; }); }));
    }).then(function(imgs){
      imgs = imgs.filter(Boolean);
      var jsPDF=window.jspdf.jsPDF, doc=new jsPDF({unit:'mm',format:'letter'});
      var W=doc.internal.pageSize.getWidth(), H=doc.internal.pageSize.getHeight(), M=14, UW=W-2*M, y=0;
      var navy=[12,31,61], gold=[201,162,75], ink=[30,36,46], gray=[95,104,115];

      // Banda superior
      doc.setFillColor.apply(doc,navy); doc.rect(0,0,W,24,'F');
      doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(15);
      doc.text(adv.personal ? adv.name : 'UNO Brokers', M, 11);
      doc.setFont('helvetica','normal'); doc.setFontSize(9.5); doc.setTextColor(227,205,154);
      doc.text('WhatsApp ' + telFmt(adv.wa) + (adv.personal ? '' : '  ·  unobrokers.com.mx'), M, 18);
      doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(255,255,255);
      doc.text((D.operacion||'').toUpperCase(), W-M, 11, {align:'right'});
      doc.setFont('helvetica','normal'); doc.setFontSize(8.5); doc.setTextColor(227,205,154);
      if(D.ref) doc.text('Ref. ' + D.ref, W-M, 18, {align:'right'});
      y=32;

      // Título, dirección y precio
      doc.setTextColor.apply(doc,navy); doc.setFont('helvetica','bold'); doc.setFontSize(16);
      var tl=doc.splitTextToSize(D.titulo,UW-58); doc.text(tl,M,y);
      doc.setFontSize(18); doc.setTextColor.apply(doc,gold); doc.text(D.precio, W-M, y, {align:'right'});
      if(D.precioNota){ doc.setFont('helvetica','normal'); doc.setFontSize(8.5); doc.setTextColor.apply(doc,gray); doc.text(D.precioNota, W-M, y+5, {align:'right'}); }
      y += tl.length*6.2;
      doc.setFont('helvetica','normal'); doc.setFontSize(9.5); doc.setTextColor.apply(doc,gray);
      var dl=doc.splitTextToSize(D.direccion,UW-58); doc.text(dl,M,y); y+=dl.length*4.5+3;

      // Fotos
      if(imgs.length){
        var big=UW*0.64, gap=2.5, ph=74;
        cover(doc,imgs[0],M,y,big,ph);
        var rest=imgs.slice(1,4), sw=UW-big-gap, sh=rest.length? (ph-gap*(rest.length-1))/rest.length : 0;
        rest.forEach(function(im,i){ cover(doc,im,M+big+gap,y+i*(sh+gap),sw,sh); });
        y+=ph+6;
      }

      // Datos clave
      var st=D.datos||[], cw=UW/Math.max(st.length,1);
      doc.setDrawColor(230,221,200); doc.setFillColor(247,243,234); doc.roundedRect(M,y,UW,16,2,2,'F');
      st.forEach(function(s,i){
        var cx=M+cw*i+cw/2;
        doc.setFont('helvetica','bold'); doc.setFontSize(13); doc.setTextColor.apply(doc,navy); doc.text(String(s[0]),cx,y+7,{align:'center'});
        doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor.apply(doc,gray); doc.text(String(s[1]),cx,y+12.3,{align:'center'});
      });
      y+=22;

      // Gancho
      if(D.gancho){
        doc.setFillColor.apply(doc,gold); doc.rect(M,y-1,1.2,0,'F');
        doc.setFont('helvetica','bolditalic'); doc.setFontSize(11.5); doc.setTextColor.apply(doc,navy);
        var gl=doc.splitTextToSize(D.gancho,UW-6); doc.setFillColor.apply(doc,gold); doc.rect(M,y-4,1.3,gl.length*5.4+1,'F');
        doc.text(gl,M+5,y); y+=gl.length*5.4+5;
      }

      // Descripción
      if(D.descripcion){
        doc.setFont('helvetica','normal'); doc.setFontSize(9.8); doc.setTextColor.apply(doc,ink);
        var ds=doc.splitTextToSize(D.descripcion,UW); doc.text(ds,M,y); y+=ds.length*4.6+5;
      }

      // Características en 2 columnas
      var car=D.caracteristicas||[];
      if(car.length){
        doc.setFont('helvetica','bold'); doc.setFontSize(10.5); doc.setTextColor.apply(doc,gold); doc.text('CARACTERÍSTICAS',M,y); y+=5.5;
        doc.setFont('helvetica','normal'); doc.setFontSize(9.3); doc.setTextColor.apply(doc,ink);
        var half=Math.ceil(car.length/2), colW=UW/2-3;
        car.forEach(function(c,i){
          var col=i<half?0:1, row=col?i-half:i;
          doc.text('•  '+doc.splitTextToSize(c,colW-5)[0], M+col*(UW/2), y+row*5);
        });
        y+=half*5+4;
      }

      // Pie: contacto y link
      var fy=H-30;
      doc.setFillColor.apply(doc,navy); doc.roundedRect(M,fy,UW,20,2,2,'F');
      doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(11.5);
      doc.text('Informes y visitas: ' + adv.name, M+6, fy+8);
      doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor(227,205,154);
      doc.text('WhatsApp ' + telFmt(adv.wa), M+6, fy+14.5);
      var link=location.origin+location.pathname+(adv.personal?location.search:'');
      if(location.protocol==='file:') link=D.url;
      doc.setTextColor(255,255,255); doc.setFontSize(9);
      doc.textWithLink('Ver todas las fotos y detalles  ›', W-M-6, fy+11.5, {align:'right', url:link});
      doc.link(M,fy,UW,20,{url:'https://wa.me/'+adv.wa});
      doc.setFontSize(7); doc.setTextColor.apply(doc,gray);
      doc.text('Precio y disponibilidad sujetos a cambio sin previo aviso. Información proporcionada por el propietario.', W/2, H-6, {align:'center'});

      doc.save(D.archivo || 'ficha-propiedad.pdf');
      try{ if(window.gtag) gtag('event','download_ficha',{item_id:D.ref||'',advisor:adv.personal?adv.name:'default'}); }catch(e){}
    }).catch(function(){
      alert('No se pudo generar la ficha. Revisa tu conexión e intenta de nuevo.');
    }).then(function(){
      if(btn){ btn.disabled=false; btn.innerHTML=txtOrig; }
    });
  }

  document.querySelectorAll('[data-ficha]').forEach(function(b){
    b.addEventListener('click', function(e){ e.preventDefault(); generar(b); });
  });
})();
