// ── PERSONALIZACIÓN POR ASESOR ──
const DEFAULT_AGENT = { name:'UNO Brokers', tel:'523339675255', telDisplay:'33 3967 5255', isDefault:true };
function buildAgentFromParams(){
  const qs = new URLSearchParams(window.location.search);
  const nombre = qs.get('asesor');
  const telRaw = qs.get('tel');
  if(!nombre || !telRaw) return DEFAULT_AGENT;
  const telClean = telRaw.replace(/\D/g,'');
  if(telClean.length < 10) return DEFAULT_AGENT;
  const tel10 = telClean.slice(-10);
  const telFull = telClean.length===10 ? '52'+telClean : telClean;
  const display = tel10.replace(/(\d{2})(\d{4})(\d{4})/,'$1 $2 $3');
  return { name: decodeURIComponent(nombre).slice(0,60), tel: telFull, telDisplay: display, isDefault:false };
}
const AGENT = buildAgentFromParams();

function applyAgentBranding(){
  const a = AGENT;
  const waLink = (msg) => `https://wa.me/${a.tel}` + (msg ? `?text=${encodeURIComponent(msg)}` : '');
  const telLink = `tel:+${a.tel}`;

  const setHref = (id,href)=>{const el=document.getElementById(id); if(el) el.href=href;};
  const setTxt = (id,txt)=>{const el=document.getElementById(id); if(el) el.textContent=txt;};

  setHref('hdrWa', waLink()); setTxt('hdrTel','📞 '+a.telDisplay); setHref('hdrTel', telLink);
  setHref('heroWa', waLink());
  setHref('ctaWa', waLink('Hola, me interesa vender o rentar mi propiedad. ¿Me puede dar más información?'));
  setTxt('ctaTel','📞 '+a.telDisplay); setHref('ctaTel', telLink);
  setHref('bottomWa', waLink('Quiero información sobre vender o rentar mi propiedad'));
  setTxt('bottomTel','📞 '+a.telDisplay); setHref('bottomTel', telLink);
  setHref('faqWa', waLink()); setTxt('faqWa', a.telDisplay);
  setTxt('faqTelTxt', a.telDisplay);
  setTxt('faqAgentName', a.name);
  setHref('floatWa', waLink());
  setTxt('footerName', a.isDefault ? 'UNO BROKERS' : a.name.toUpperCase());
  setTxt('footerTel', a.telDisplay);

  const resLabel = document.getElementById('resLabel');
  if(resLabel) resLabel.textContent = `OPINIÓN DE VALOR — ${a.isDefault ? 'UNO BROKERS' : a.name.toUpperCase()} 2026`;

  if(!a.isDefault){
    setTxt('heroP', `Obtén gratis una opinión de valor inmobiliario con comparables de mercado actualizados y estimación de renta mensual. Respaldado por ${a.name}.`);
    setTxt('ctaP', `Con ${a.name} te ayudamos a obtener el mejor precio del mercado con una estrategia de venta o renta personalizada. Contacta ahora a un asesor.`);
    setTxt('bottomP', `Asesórate con expertos. Con ${a.name} te ayudamos a conseguir el mejor precio del mercado.`);
    const pb = document.getElementById('poweredBy');
    if(pb) pb.textContent = 'Herramienta de UNO Brokers, usada por ' + a.name;
  }

  // Link de referidos: comparte la MISMA url actual (con los params del asesor) para que el crédito se mantenga
  const shareUrl = window.location.origin + window.location.pathname + window.location.search;
  const refShare = document.getElementById('refShare');
  if(refShare) refShare.href = `https://wa.me/?text=${encodeURIComponent('Encontré esta calculadora gratis de opinión de valor para saber cuánto vale tu casa o depa en Guadalajara/Zapopan: '+shareUrl)}`;
  const refClaim = document.getElementById('refClaim');
  if(refClaim) refClaim.href = waLink('Hola, ya compartí la calculadora de opinión de valor con 3 personas, quiero reclamar mi opinión de valor premium gratis.');
}
applyAgentBranding();

// ── Generador de link personalizado para asesores ──
(function(){
  const toggleBtn = document.getElementById('personalizaToggle');
  const panel = document.getElementById('personalizaPanel');
  if(toggleBtn) toggleBtn.addEventListener('click', ()=>{ panel.style.display = panel.style.display==='none' ? 'block' : 'none'; });

  const genBtn = document.getElementById('pGenBtn');
  if(genBtn) genBtn.addEventListener('click', ()=>{
    const nombre = document.getElementById('pAgentName').value.trim();
    const tel = document.getElementById('pAgentTel').value.trim().replace(/\D/g,'');
    if(!nombre || tel.length!==10){
      alert('Escribe tu nombre y un WhatsApp válido a 10 dígitos.');
      return;
    }
    const base = window.location.origin + window.location.pathname;
    const link = `${base}?asesor=${encodeURIComponent(nombre)}&tel=${tel}`;
    document.getElementById('pResultLink').value = link;
    document.getElementById('pResultBox').style.display = 'block';
  });

  const copyBtn = document.getElementById('pCopyBtn');
  if(copyBtn) copyBtn.addEventListener('click', ()=>{
    const input = document.getElementById('pResultLink');
    input.select(); input.setSelectionRange(0,9999);
    navigator.clipboard.writeText(input.value).then(()=>{
      copyBtn.textContent='✅ ¡Copiado!';
      setTimeout(()=>{copyBtn.textContent='📋 Copiar link';},2000);
    }).catch(()=>{document.execCommand('copy');});
  });

  // Si alguien entra ya con datos de asesor, ocultamos el panel de auto-generación (no aplica para el cliente final)
  if(!AGENT.isDefault){
    const box = document.getElementById('personalizaBox');
    if(box) box.style.display='none';
  }
})();

const PRECIOS={
  'zapopan-premium':     {min:30000,mid:42000,max:58000,tierra:.35,yield:[.0045,.0055]},
  'zapopan-residencial': {min:20000,mid:28000,max:38000,tierra:.28,yield:[.005,.006]},
  'zapopan-popular':     {min:12000,mid:16000,max:21000,tierra:.20,yield:[.006,.0075]},
  'gdl-poniente':        {min:18000,mid:25000,max:34000,tierra:.26,yield:[.005,.0065]},
  'gdl-centro':          {min:14000,mid:19000,max:26000,tierra:.22,yield:[.0055,.007]},
  'gdl-oriente':         {min: 9000,mid:12000,max:17000,tierra:.16,yield:[.007,.009]},
  'tlajomulco':          {min:10000,mid:14000,max:19000,tierra:.18,yield:[.006,.008]},
  'tlaquepaque':         {min:11000,mid:15000,max:20000,tierra:.19,yield:[.0065,.008]},
  'tonala':              {min: 8000,mid:11000,max:15000,tierra:.15,yield:[.007,.009]},
  'santa-fe-cdmx':       {min:48000,mid:58000,max:68000,tierra:.32,yield:[.004,.0048]},
};
const DEP=a=>{if(a<=0)return 1;if(a<=5)return .97;if(a<=10)return .92;if(a<=20)return .84;if(a<=30)return .73;if(a<=40)return .62;return .50;};
const CONS={excelente:1.12,bueno:1.00,regular:.86,remodelacion:.70};
const TIPOF={casa:1.00,departamento:.90,terreno:0,local:.85,oficina:.82,bodega:.68};
const ZL={'zapopan-premium':'Zapopan Residencial Premium','zapopan-residencial':'Zapopan Residencial','zapopan-popular':'Zapopan Popular','gdl-poniente':'GDL Poniente / Vallarta','gdl-centro':'GDL Centro / Tradicional','gdl-oriente':'GDL Oriente / Norte / Sur','tlajomulco':'Tlajomulco de Zuniga','tlaquepaque':'San Pedro Tlaquepaque','tonala':'Tonala','santa-fe-cdmx':'Santa Fe, CDMX'};
const TL={casa:'Casa',departamento:'Departamento',terreno:'Terreno',local:'Local Comercial',oficina:'Oficina',bodega:'Bodega / Nave Industrial'};
const CL={excelente:'Excelente',bueno:'Bueno',regular:'Regular',remodelacion:'Requiere remodelacion'};
// Factores catastral → mercado por zona (valor mercado ≈ catastral × factor)
const CATF={'zapopan-premium':5.5,'zapopan-residencial':4.8,'zapopan-popular':4.0,'gdl-poniente':4.5,'gdl-centro':3.8,'gdl-oriente':3.2,'tlajomulco':3.5,'tlaquepaque':3.6,'tonala':3.2,'santa-fe-cdmx':5.0};

let DC={};
const fmt=n=>'$'+Math.round(n).toLocaleString('es-MX');
const rnd10=n=>Math.round(n/10)*10;

function getAms(){return[...document.querySelectorAll('#checkGrid input:checked')].map(c=>c.value);}

function generarComparables(d){
  const b=PRECIOS[d.zona],dep=DEP(d.ant),cf=CONS[d.cons]||1,tf=TIPOF[d.tipo]||1;
  const zl=ZL[d.zona]||d.zona,tl=TL[d.tipo]||d.tipo;
  const vars=d.tipo==='terreno'
    ?[{cf2:.65,tf2:.65,lbl:'Menor superficie'},{cf2:.85,tf2:.85,lbl:'Superficie parecida'},{cf2:1,tf2:1,lbl:'Superficie similar'},{cf2:1.4,tf2:1.4,lbl:'Mayor superficie'}]
    :[{cf2:.70,tf2:.70,lbl:'Menor superficie'},{cf2:.90,tf2:.85,lbl:'Parecida'},{cf2:1.10,tf2:1.10,lbl:'Similar'},{cf2:1.35,tf2:1.30,lbl:'Mayor superficie'}];
  return vars.map((v,i)=>{
    const mc=rnd10(d.mConst*v.cf2),mt=rnd10(d.mTerr*v.tf2);
    const depV=DEP(Math.max(0,d.ant+(i<2?3:-2)));
    let pm,px;
    if(d.tipo==='terreno'){pm=Math.round(mt*b.min*.80);px=Math.round(mt*b.max*.80);}
    else{pm=Math.round((mc*b.min*depV*cf*tf)+(mt*b.min*b.tierra));px=Math.round((mc*b.max*depV*cf*tf)+(mt*b.max*b.tierra));}
    const sup=d.tipo==='terreno'?`${mt} m² terr.`:`${mc} m² const. / ${mt} m² terr.`;
    const pm2=Math.round(b.min*tf*depV*cf),px2=Math.round(b.max*tf*depV*cf);
    return{desc:`${tl} en ${zl} — ${v.lbl}`,sup,precio:`${fmt(pm)} – ${fmt(px)}`,porM2:`${fmt(pm2)} – ${fmt(px2)} /m²`,ref:i===2};
  });
}

function generarComparablesRenta(d,vMid){
  const b=PRECIOS[d.zona],tl=TL[d.tipo]||d.tipo,zl=ZL[d.zona]||d.zona;
  const yl=b.yield[0],yh=b.yield[1];
  const vars=[{f:.70,lbl:'Menor superficie'},{f:.90,lbl:'Parecida'},{f:1.00,lbl:'Similar'},{f:1.30,lbl:'Mayor superficie'}];
  return vars.map((v,i)=>{
    const m=rnd10((d.tipo==='terreno'?d.mTerr:d.mConst)*v.f);
    const rentaLow=Math.round(vMid*v.f*yl);
    const rentaHigh=Math.round(vMid*v.f*yh);
    const pm2Low=m>0?Math.round(rentaLow/m):0;
    const pm2High=m>0?Math.round(rentaHigh/m):0;
    return{desc:`${tl} en ${zl} — ${v.lbl}`,sup:`${m} m²`,
           renta:`${fmt(rentaLow)} – ${fmt(rentaHigh)}/mes`,porM2:`${fmt(pm2Low)} – ${fmt(pm2High)} /m²/mes`,ref:i===2};
  });
}

function calcular(){
  const zona=document.getElementById('zona').value;
  const tipo=document.getElementById('tipo').value;
  const cons=document.getElementById('conservacion').value;
  const mConst=parseFloat(document.getElementById('mConst').value)||0;
  const mTerr=parseFloat(document.getElementById('mTerr').value)||0;
  const ant=parseInt(document.getElementById('antiguedad').value)||0;
  const predial=parseFloat(document.getElementById('predial').value)||0;
  const uso=document.getElementById('uso').value;

  if(!zona){alert('Selecciona una zona o municipio');return;}
  if(!tipo){alert('Selecciona el tipo de inmueble');return;}
  if(!cons){alert('Selecciona el estado de conservación');return;}
  if(tipo!=='terreno'&&mConst<=0){alert('Ingresa los metros de construcción');return;}
  if(mTerr<=0){alert('Ingresa los metros de terreno');return;}

  const b=PRECIOS[zona],dep=DEP(ant),cf=CONS[cons]||1,tf=TIPOF[tipo];
  const ams=getAms();

  let amenBonus=1.0;
  const BN={alberca:.04,jardin:.03,gym:.02,roof:.025,vigilancia:.02,elevador:.02,paneles:.02,smart:.015,cuarto_serv:.015,terraza:.01,cisterna:.01,bodega_util:.01};
  ams.forEach(a=>{if(BN[a])amenBonus+=BN[a];});

  let vMin,vMid,vMax;
  if(tipo==='terreno'){
    vMin=mTerr*b.min*.80*(amenBonus-.03);
    vMid=mTerr*b.mid*.80*amenBonus;
    vMax=mTerr*b.max*.80*(amenBonus+.03);
  } else {
    const cMin=mConst*b.min*dep*cf*tf,cMid=mConst*b.mid*dep*cf*tf,cMax=mConst*b.max*dep*cf*tf;
    const lMin=mTerr*b.min*b.tierra,lMid=mTerr*b.mid*b.tierra,lMax=mTerr*b.max*b.tierra;
    vMin=(cMin+lMin)*(amenBonus-.03);
    vMid=(cMid+lMid)*amenBonus;
    vMax=(cMax+lMax)*(amenBonus+.03);
  }

  // Calibración con predial
  if(predial>0){
    const catFactor=CATF[zona]||4.0;
    const vCatastral=predial*catFactor;
    // Promedio ponderado: 70% mercado, 30% catastral
    vMid=vMid*.70+vCatastral*.30;
    vMin=vMid*.82; vMax=vMid*1.18;
  }

  // Renta mensual estimada
  const rentaMid=Math.round(vMid*((b.yield[0]+b.yield[1])/2));
  const rentaMin=Math.round(vMid*b.yield[0]);
  const rentaMax=Math.round(vMid*b.yield[1]);

  DC={
    cliente:document.getElementById('cliente').value||'No especificado',
    email:document.getElementById('email').value,
    tel:document.getElementById('telefono').value,
    zona,tipo,cons,mConst,mTerr,ant,predial,uso,
    recamaras:document.getElementById('recamaras').value,
    banos:document.getElementById('banos').value,
    mediobanos:document.getElementById('mediobanos').value,
    estacionamiento:document.getElementById('estacionamiento').value,
    niveles:document.getElementById('niveles').value,
    colonia:document.getElementById('colonia').value,
    direccion:document.getElementById('direccion').value,
    notas:document.getElementById('notas').value,
    amenidades:ams,vMin,vMid,vMax,rentaMid,rentaMin,rentaMax,
    fecha:new Date().toLocaleDateString('es-MX',{day:'2-digit',month:'long',year:'numeric'})
  };

  document.getElementById('res-min').textContent=fmt(vMin);
  document.getElementById('res-mid').textContent=fmt(vMid);
  document.getElementById('res-max').textContent=fmt(vMax);

  // Renta display
  const showRenta=uso==='renta'||uso==='ambos';
  document.getElementById('renta-tab').style.display=showRenta?'block':'none';
  document.getElementById('renta-divider').style.display=showRenta?'block':'none';
  if(showRenta) document.getElementById('res-renta').textContent=fmt(rentaMid)+'/mes';

  // Resumen
  const esTerr=tipo==='terreno';
  const items=[
    ['Tipo de inmueble',TL[tipo]||tipo],['Zona / Municipio',ZL[zona]||zona],
    ['Colonia / Fracc.',DC.colonia||'No especificada'],
    ['m² construcción',esTerr?'N/A':mConst+' m²'],['m² terreno',mTerr+' m²'],
    ['Recámaras',esTerr?'N/A':DC.recamaras],['Baños completos',esTerr?'N/A':DC.banos],
    ['Estacionamiento',esTerr?'N/A':DC.estacionamiento+' lugar(es)'],
    ['Antigüedad',ant>0?ant+' años':'Nueva'],['Conservación',CL[cons]||cons],
    ['Predial anual',predial>0?fmt(predial):'No proporcionado'],['Uso solicitado',uso==='ambos'?'Venta y Renta':uso==='renta'?'Renta':'Venta'],
  ];
  document.getElementById('resumenGrid').innerHTML=items.map(([l,v])=>`
    <div class="resumen-item"><div class="ri-label">${l}</div><div class="ri-val">${v}</div></div>`).join('');

  // Comparables venta
  const comps=generarComparables(DC);
  document.getElementById('compBody').innerHTML=comps.map(c=>`
    <tr${c.ref?' class="comp-ref"':''}>
      <td>${c.desc}${c.ref?'<span class="comp-badge">★ Referencia</span>':''}</td>
      <td>${c.sup}</td><td><strong>${c.precio}</strong></td>
      <td style="color:var(--teal);font-weight:700">${c.porM2}</td>
    </tr>`).join('')+`
    <tr class="row-sujeto">
      <td>Tu propiedad — Valor estimado</td>
      <td>${esTerr?mTerr+' m² terr.':mConst+' m² const.'}</td>
      <td>${fmt(vMin)} – ${fmt(vMax)}</td>
      <td>${fmt(Math.round(vMid/(esTerr?mTerr:mConst)))} /m²</td>
    </tr>`;

  // Comparables renta
  const rentaDiv=document.getElementById('rentaComps');
  if(showRenta){
    rentaDiv.style.display='block';
    const cr=generarComparablesRenta(DC,vMid);
    document.getElementById('compRentaBody').innerHTML=cr.map(c=>`
      <tr${c.ref?' class="comp-ref"':''}>
        <td>${c.desc}${c.ref?'<span class="comp-badge">★ Referencia</span>':''}</td>
        <td>${c.sup}</td><td><strong>${c.renta}</strong></td>
        <td style="color:var(--teal);font-weight:700">${c.porM2}</td>
      </tr>`).join('')+`
      <tr class="row-sujeto">
        <td>Tu propiedad — Renta estimada</td>
        <td>${esTerr?mTerr+' m² terr.':mConst+' m² const.'}</td>
        <td>${fmt(rentaMin)} – ${fmt(rentaMax)}/mes</td>
        <td>${fmt(Math.round(rentaMid/(esTerr?mTerr:mConst)))}/m²/mes</td>
      </tr>`;
  } else rentaDiv.style.display='none';

  document.getElementById('formulario').style.display='none';
  document.getElementById('resultado').style.display='block';
  window.scrollTo({top:0,behavior:'smooth'});
}

function nuevaConsulta(){
  document.getElementById('resultado').style.display='none';
  document.getElementById('formulario').style.display='block';
  window.scrollTo({top:0,behavior:'smooth'});
}

function toggleFaq(btn){
  const ans=btn.nextElementSibling;
  const isOpen=ans.classList.contains('open');
  document.querySelectorAll('.faq-a.open').forEach(a=>{a.classList.remove('open');a.previousElementSibling.classList.remove('open');});
  if(!isOpen){ans.classList.add('open');btn.classList.add('open');}
}

document.querySelectorAll('.check-item input').forEach(cb=>{
  cb.addEventListener('change',function(){this.closest('.check-item').classList.toggle('checked',this.checked);});
});

// ── PDF ──
function san(s){if(!s)return'';
  return String(s).replace(/á/g,'a').replace(/é/g,'e').replace(/í/g,'i').replace(/ó/g,'o').replace(/ú/g,'u')
   .replace(/ñ/g,'n').replace(/Á/g,'A').replace(/É/g,'E').replace(/Í/g,'I').replace(/Ó/g,'O')
   .replace(/Ú/g,'U').replace(/Ñ/g,'N').replace(/ü/g,'u').replace(/Ü/g,'U').replace(/–/g,'-').replace(/°/g,' ');
}

function generarPDF(){
  const{jsPDF}=window.jspdf;
  const doc=new jsPDF({unit:'mm',format:'a4'});
  const W=210,mar=14;let y=0;
  const NAVY=[13,27,42],AMBER=[232,160,32],TEAL=[29,158,117],WHITE=[255,255,255],
        GRAY=[100,112,130],BGL=[248,250,252],BGR=[244,247,250],BGGREEN=[232,248,242],BGYELLOW=[255,251,235],WA=[37,211,102];
  const d=DC,esTerr=d.tipo==='terreno',showRenta=d.uso==='renta'||d.uso==='ambos';

  // ══ HEADER ══
  doc.setFillColor(...NAVY);doc.rect(0,0,W,40,'F');
  doc.setFillColor(...AMBER);doc.rect(0,40,W,3,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(21);doc.setTextColor(...WHITE);
  doc.text(san(AGENT.name.toUpperCase()),mar,16);
  doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(150,175,200);
  doc.text('INMOBILIARIA  |  GUADALAJARA & ZAPOPAN, JALISCO',mar,23);
  doc.text('Tel: '+AGENT.telDisplay+(AGENT.isDefault?'   |   unobrokers.mx':''),mar,29);
  doc.setFontSize(7.5);doc.setTextColor(100,140,170);
  doc.text('wa.me/'+AGENT.tel,mar,35);

  doc.setFillColor(...AMBER);doc.roundedRect(W-70,7,58,24,3,3,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(8.5);doc.setTextColor(...NAVY);
  doc.text('OPINION DE VALOR',W-41,15,{align:'center'});
  doc.text('REFERENCIAL 2026',W-41,21,{align:'center'});
  doc.setFontSize(7);
  doc.text(san(AGENT.name),W-41,27,{align:'center'});
  y=52;

  // Datos generales
  const secH=(lbl,col)=>{
    doc.setFillColor(...col);doc.rect(mar,y,W-(mar*2),7,'F');
    doc.setFont('helvetica','bold');doc.setFontSize(8.5);doc.setTextColor(...AMBER);
    doc.text('  '+lbl,mar,y+5);y+=10;
  };
  const row2=(items)=>{
    const cw=(W-(mar*2)-2)/2;
    items.forEach(([lbl,val],i)=>{
      const col=i%2,row=Math.floor(i/2),xc=mar+col*(cw+2),yc=y+row*7;
      doc.setFillColor(...(col===0?BGL:BGR));doc.rect(xc,yc,cw,6.5,'F');
      doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor(...GRAY);
      doc.text(lbl+':',xc+2,yc+4.5);
      doc.setFont('helvetica','bold');doc.setTextColor(...NAVY);
      doc.text(san(String(val)),xc+cw*.52,yc+4.5);
    });
    y+=Math.ceil(items.length/2)*7+4;
  };

  secH('DATOS GENERALES',NAVY);
  row2([['Cliente',san(d.cliente)],['Email',san(d.email)||'No especificado'],['Telefono',san(d.tel)||'No especificado'],['Fecha',d.fecha]]);

  secH('CARACTERISTICAS DE LA PROPIEDAD',NAVY);
  row2([
    ['Tipo',san(TL[d.tipo]||d.tipo)],['Zona',san(ZL[d.zona]||d.zona)],
    ['Colonia',san(d.colonia)||'No especificada'],['Direccion',san(d.direccion)||'No especificada'],
    ['m2 construccion',esTerr?'N/A':d.mConst+' m2'],['m2 terreno',d.mTerr+' m2'],
    ['Recamaras',esTerr?'N/A':d.recamaras],['Banos',esTerr?'N/A':d.banos],
    ['Medios banos',esTerr?'N/A':d.mediobanos],['Estacionamiento',esTerr?'N/A':d.estacionamiento+' lugar(es)'],
    ['Niveles',esTerr?'N/A':d.niveles],['Antiguedad',d.ant>0?d.ant+' anos':'Nueva'],
    ['Conservacion',san(CL[d.cons]||d.cons)],['Predial anual',d.predial>0?fmt(d.predial):'No proporcionado'],
    ['Uso solicitado',d.uso==='ambos'?'Venta y Renta':d.uso==='renta'?'Renta':'Venta'],['','-'],
  ]);

  if(d.amenidades&&d.amenidades.length>0){
    const amap={alberca:'Alberca',jardin:'Jardin',gym:'Gimnasio',roof:'Roof garden',vigilancia:'Vigilancia 24h',elevador:'Elevador',bodega_util:'Bodega',cuarto_serv:'Cto. servicio',terraza:'Terraza',cisterna:'Cisterna',paneles:'Paneles solares',smart:'Casa inteligente'};
    doc.setFillColor(...BGGREEN);doc.rect(mar,y,W-(mar*2),7,'F');
    doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(...TEAL);
    doc.text('Amenidades:',mar+2,y+5);
    doc.setFont('helvetica','normal');doc.setTextColor(40,80,60);
    doc.text(d.amenidades.map(a=>amap[a]||a).join('  •  '),mar+26,y+5);
    y+=10;
  }
  if(d.notas){
    doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(...TEAL);
    doc.text('Notas:',mar+2,y+4);
    doc.setFont('helvetica','normal');doc.setTextColor(60,80,100);
    const nl=doc.splitTextToSize(san(d.notas),W-(mar*2)-24);
    doc.text(nl,mar+20,y+4);y+=nl.length*4.5+5;
  }
  y+=3;

  // ══ OPINION DE VALOR ══
  secH('OPINION DE VALOR REFERENCIAL',TEAL);
  doc.setFillColor(...NAVY);doc.roundedRect(mar,y,W-(mar*2),28,3,3,'F');
  doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(150,175,200);
  doc.text('VALOR ESTIMADO DE MERCADO',W/2,y+6,{align:'center'});
  doc.setFont('helvetica','bold');doc.setFontSize(21);doc.setTextColor(...AMBER);
  doc.text(fmt(d.vMid),W/2,y+18,{align:'center'});
  doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(150,175,200);
  doc.text('Valor de venta estimado',W/2,y+24,{align:'center'});
  y+=32;

  // Min/Max/Renta
  const nCols=showRenta?3:2;
  const colW2=(W-(mar*2)-(nCols-1)*2)/nCols;
  [[fmt(d.vMin),'Valor minimo'],[fmt(d.vMax),'Valor maximo'],showRenta?[fmt(d.rentaMid)+'/mes','Renta mensual est.']:null]
    .filter(Boolean).forEach(([v,lbl],i)=>{
      const xv=mar+i*(colW2+2);
      doc.setFillColor(...BGGREEN);doc.roundedRect(xv,y,colW2,15,2,2,'F');
      doc.setFont('helvetica','bold');doc.setFontSize(showRenta?10:12);doc.setTextColor(...TEAL);
      doc.text(v,xv+colW2/2,y+7,{align:'center'});
      doc.setFont('helvetica','normal');doc.setFontSize(7);doc.setTextColor(...GRAY);
      doc.text(lbl,xv+colW2/2,y+13,{align:'center'});
    });
  if(d.predial>0){
    y+=18;
    doc.setFillColor(255,248,220);doc.roundedRect(mar,y,W-(mar*2),7,'F');
    doc.setFont('helvetica','italic');doc.setFontSize(7.5);doc.setTextColor(140,100,20);
    doc.text('Calculo calibrado con valor catastral (predial anual: '+fmt(d.predial)+')',W/2,y+5,{align:'center'});
  }
  y+=22;

  // ══ COMPARABLES VENTA ══
  secH('COMPARABLES DE MERCADO — REFERENCIA ZMG 2026',NAVY);
  const cols=[68,30,44,32];
  const hds=['Descripcion','Superficie','Rango de precio','Precio/m2'];
  let xr=mar;
  doc.setFillColor(...NAVY);doc.rect(mar,y,W-(mar*2),7,'F');
  hds.forEach((h,i)=>{doc.setFont('helvetica','bold');doc.setFontSize(7.5);doc.setTextColor(...AMBER);doc.text(h,xr+2,y+5);xr+=cols[i];});
  y+=9;

  const comps=generarComparables(DC);
  comps.forEach((c,idx)=>{
    doc.setFillColor(...(idx%2===0?BGL:BGR));doc.rect(mar,y,W-(mar*2),8,'F');
    let xrr=mar;
    [san(c.desc),san(c.sup),san(c.precio),san(c.porM2)].forEach((cell,ci)=>{
      doc.setFont('helvetica',c.ref?'bold':'normal');doc.setFontSize(7.5);doc.setTextColor(...(c.ref?NAVY:[60,80,100]));
      doc.text(doc.splitTextToSize(cell,cols[ci]-3),xrr+2,y+5);xrr+=cols[ci];
    });
    y+=9;
  });
  doc.setFillColor(...BGGREEN);doc.rect(mar,y,W-(mar*2),8,'F');
  let xs=mar;
  const pm2s=Math.round(d.vMid/(esTerr?d.mTerr:d.mConst));
  [san('Tu propiedad (valor estimado)'),san(esTerr?d.mTerr+' m2 terr.':d.mConst+' m2 const.'),san(fmt(d.vMin)+' - '+fmt(d.vMax)),san(fmt(pm2s)+'/m2')]
    .forEach((cell,ci)=>{doc.setFont('helvetica','bold');doc.setFontSize(7.5);doc.setTextColor(...TEAL);doc.text(cell,xs+2,y+5);xs+=cols[ci];});
  y+=13;

  // ══ COMPARABLES RENTA ══
  if(showRenta){
    secH('COMPARABLES DE RENTA MENSUAL — ZMG 2026',NAVY);
    const rCols=[68,24,52,30];
    const rHds=['Descripcion','Superficie','Renta mensual est.','$/m2/mes'];
    let rxr=mar;
    doc.setFillColor(...NAVY);doc.rect(mar,y,W-(mar*2),7,'F');
    rHds.forEach((h,i)=>{doc.setFont('helvetica','bold');doc.setFontSize(7.5);doc.setTextColor(...AMBER);doc.text(h,rxr+2,y+5);rxr+=rCols[i];});
    y+=9;
    const cr=generarComparablesRenta(DC,d.vMid);
    cr.forEach((c,idx)=>{
      doc.setFillColor(...(idx%2===0?BGL:BGR));doc.rect(mar,y,W-(mar*2),8,'F');
      let rr=mar;
      [san(c.desc),san(c.sup),san(c.renta),san(c.porM2)].forEach((cell,ci)=>{
        doc.setFont('helvetica',c.ref?'bold':'normal');doc.setFontSize(7.5);doc.setTextColor(...(c.ref?NAVY:[60,80,100]));
        doc.text(doc.splitTextToSize(cell,rCols[ci]-3),rr+2,y+5);rr+=rCols[ci];
      });y+=9;
    });
    doc.setFillColor(...BGGREEN);doc.rect(mar,y,W-(mar*2),8,'F');
    let rs=mar;
    const rm2=Math.round(d.rentaMid/(esTerr?d.mTerr:d.mConst));
    [san('Tu propiedad (renta estimada)'),san(esTerr?d.mTerr+' m2':d.mConst+' m2'),san(fmt(d.rentaMin)+' - '+fmt(d.rentaMax)+'/mes'),san(fmt(rm2)+'/m2/mes')]
      .forEach((cell,ci)=>{doc.setFont('helvetica','bold');doc.setFontSize(7.5);doc.setTextColor(...TEAL);doc.text(cell,rs+2,y+5);rs+=rCols[ci];});
    y+=13;
  }

  // ══ AVISO ══
  y+=3;
  doc.setFillColor(...BGYELLOW);doc.roundedRect(mar,y,W-(mar*2),18,2,2,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(7);doc.setTextColor(180,120,20);
  doc.text('AVISO IMPORTANTE:',mar+3,y+5);
  doc.setFont('helvetica','normal');
  const av='Esta opinion de valor es una estimacion referencial y no constituye un avaluo comercial formal certificado. Para una valuacion con validez notarial o bancaria consulte a un perito valuador certificado. Los precios de referencia provienen de anuncios y ofertas publicadas, no de precios de cierre de operaciones reales. Valores sujetos a condiciones de mercado.';
  doc.setTextColor(140,90,10);
  doc.text(doc.splitTextToSize(av,W-(mar*2)-6),mar+3,y+10);
  y+=22;

  // ══ CTA ══
  doc.setFillColor(...NAVY);doc.roundedRect(mar,y,W-(mar*2),22,3,3,'F');
  doc.setFillColor(...WA);doc.roundedRect(mar+3,y+4,52,14,3,3,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(...WHITE);
  doc.text('WhatsApp: '+AGENT.telDisplay,mar+7,y+12);
  doc.setFillColor(...AMBER);doc.roundedRect(mar+60,y+4,60,14,3,3,'F');
  doc.setTextColor(...NAVY);doc.text('Tel: '+AGENT.telDisplay,mar+64,y+12);
  doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(150,175,200);
  doc.text(AGENT.isDefault?'unobrokers.mx  |  Guadalajara & Zapopan':'Guadalajara & Zapopan, Jalisco',mar+125,y+12);
  y+=26;

  // ══ FOOTER ══
  doc.setFillColor(...AMBER);doc.rect(0,279,W,2,'F');
  doc.setFillColor(...NAVY);doc.rect(0,281,W,16,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(9.5);doc.setTextColor(...WHITE);
  doc.text(san(AGENT.name.toUpperCase()),mar,289);
  doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(150,175,200);
  doc.text('Tel: '+AGENT.telDisplay+(AGENT.isDefault?'   |   unobrokers.mx':'')+'   |   Guadalajara & Zapopan, Jalisco',mar+38,289);
  doc.setFontSize(6.5);doc.setTextColor(80,110,130);
  doc.text('Generado el '+d.fecha+' por '+san(AGENT.name)+' — Documento referencial, no sustituye avaluo formal.',mar,294);

  doc.save('Opinion-de-Valor-UNO-Brokers.pdf');
}
