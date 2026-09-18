/* ============================================================
   UNO Brokers — Asistente de Directorio Rápido (widget embebible)
   Sin IA / sin backend: respuestas pre-programadas + WhatsApp.
   Uso: agrega esta línea antes del cierre de "body" en cualquier página:
   [script src="uno-chat-widget.js"]
   ============================================================ */
(function () {
  var WA_NUMERO = "523339675255";

  // ---------- Directorio de temas ----------
  // Cada tema: título del botón, mensaje del asistente, link a la página,
  // y texto que arma el mensaje de WhatsApp si el usuario quiere hablar con un asesor.
  var TEMAS = {
    inicio: {
      titulo: "Menú principal",
      categorias: [
        {
          nombre: "Vender o rentar tu propiedad",
          items: ["vender_casa", "vender_depa", "rentar", "investigacion"]
        },
        {
          nombre: "Herramientas gratuitas",
          items: ["opinion_valor", "isr", "inpc", "contrato_renta"]
        },
        {
          nombre: "Desarrollos en preventa",
          items: ["vivaria", "nara", "nubax", "los_suenos", "lope_de_vega"]
        },
        {
          nombre: "Inversión",
          items: ["pool_rentas", "aportacion_terrenos"]
        }
      ]
    },

    vender_casa: {
      titulo: "Vender mi casa",
      texto: "Te ayudamos a vender tu casa en Guadalajara o Zapopan con valuación gratuita, respaldo legal y asesoría en ISR.",
      link: "vender-casa-guadalajara.html",
      wa: "Hola, me interesa vender mi casa en Guadalajara/Zapopan."
    },
    vender_depa: {
      titulo: "Vender mi departamento",
      texto: "Opinión de valor comercial con datos reales de tu zona y conexión con compradores calificados.",
      link: "captacion-departamentos-venta-zapopan-guadalajara.html",
      wa: "Hola, me interesa vender mi departamento en Zapopan/Guadalajara."
    },
    rentar: {
      titulo: "Rentar mi propiedad",
      texto: "Administramos tu propiedad en renta: inquilino, contrato con respaldo notarial, cobro y facturación.",
      link: "rentar-propiedad-guadalajara.html",
      wa: "Hola, quiero poner mi propiedad en renta."
    },
    investigacion: {
      titulo: "Investigación de inquilinos",
      texto: "Buró de crédito, antecedentes legales, ingresos y referencias antes de rentar. Dictamen en 24 horas.",
      link: "investigacion-inquilinos.html",
      wa: "Hola, quiero información sobre el servicio de investigación de inquilinos."
    },

    opinion_valor: {
      titulo: "Calculadora de opinión de valor",
      texto: "Calcula gratis el valor estimado de tu casa, departamento o terreno con comparables de mercado.",
      link: "calculadora-opinion-valor.html",
      wa: "Hola, quiero una opinión de valor de mi propiedad."
    },
    isr: {
      titulo: "Calculadora de ISR por venta",
      texto: "Estima cuánto pagarías de ISR por la ganancia al vender tu propiedad, con la tarifa fiscal vigente.",
      link: "calculadora-isr-venta-propiedad.html",
      wa: "Hola, tengo una duda sobre el ISR al vender mi propiedad."
    },
    inpc: {
      titulo: "Ajuste de renta por INPC",
      texto: "Calcula el incremento legal de renta anual según el INPC.",
      link: "calculadora-ajuste-renta-inpc.html",
      wa: "Hola, tengo una duda sobre el ajuste de renta por INPC."
    },
    contrato_renta: {
      titulo: "Generador de contrato de renta",
      texto: "Genera gratis un contrato de arrendamiento base en minutos.",
      link: "generador-contrato-renta.html",
      wa: "Hola, quiero generar un contrato de renta."
    },

    vivaria: {
      titulo: "VIVARIA 2360",
      texto: "Departamentos en preventa a 470m del Tren Ligero L2, en el corazón de Guadalajara.",
      link: "vivaria-2360.html",
      wa: "Hola, me interesa VIVARIA 2360."
    },
    nara: {
      titulo: "NARA Américas",
      texto: "Desarrollo mixto en preventa en el corredor Américas, Zapopan.",
      link: "nara-americas.html",
      wa: "Hola, me interesa NARA Américas."
    },
    nubax: {
      titulo: "Parque Nubax",
      texto: "Lotes industriales y naves en el corredor de El Salto, Jalisco.",
      link: "parque-nubax.html",
      wa: "Hola, me interesan los lotes de Parque Nubax."
    },
    los_suenos: {
      titulo: "Los Sueños Residencial",
      texto: "Lotes residenciales en una de las zonas de mayor plusvalía de Zapopan.",
      link: "los-suenos-residencial.html",
      wa: "Hola, me interesa Los Sueños Residencial."
    },
    lope_de_vega: {
      titulo: "Lope de Vega 182",
      texto: "Próximo desarrollo de DALA Desarrollos en Guadalajara. Precios por liberar.",
      link: "lope-de-vega-182.html",
      wa: "Hola, quiero que me avisen cuando liberen precios de Lope de Vega 182."
    },

    pool_rentas: {
      titulo: "Pool de Rentas y Fractional",
      texto: "Invierte en bienes raíces desde $500,000 MXN mediante Pool de Rentas o Co-propiedad Fractional.",
      link: "pool-de-rentas-fractional-guadalajara-zapopan.html",
      wa: "Hola, quiero el catálogo de proyectos Pool de Rentas y Fractional."
    },
    aportacion_terrenos: {
      titulo: "Aportación de terrenos",
      texto: "¿Tienes un terreno o casa vieja en zona de alta demanda? Evalúa su potencial de desarrollo vertical, gratis.",
      link: "aportacion-terrenos-guadalajara-zapopan.html",
      wa: "Hola, tengo un terreno y quiero evaluar su potencial de desarrollo."
    }
  };

  // ---------- Estilos ----------
  var css = "\n" +
  "#unoChatBtn{position:fixed;bottom:24px;left:20px;width:58px;height:58px;border-radius:50%;background:#0f1923;color:#c9a84c;display:flex;align-items:center;justify-content:center;font-size:26px;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.25);z-index:9999;border:2px solid #c9a84c;transition:transform .2s}" +
  "#unoChatBtn:hover{transform:scale(1.08)}" +
  "#unoChatPanel{position:fixed;bottom:92px;left:20px;width:330px;max-width:90vw;max-height:70vh;background:#fff;border-radius:16px;box-shadow:0 16px 48px rgba(0,0,0,.25);display:none;flex-direction:column;overflow:hidden;z-index:9999;font-family:'DM Sans',Arial,sans-serif}" +
  "#unoChatPanel.open{display:flex}" +
  "#unoChatHeader{background:#0f1923;color:#f7f4ef;padding:14px 16px;display:flex;justify-content:space-between;align-items:center}" +
  "#unoChatHeader b{font-size:14.5px}" +
  "#unoChatHeader span{font-size:11px;color:#9AA6B5;display:block;margin-top:2px}" +
  "#unoChatClose{cursor:pointer;font-size:18px;color:#c9a84c;background:none;border:none}" +
  "#unoChatBody{padding:14px;overflow-y:auto;flex:1;background:#f7f4ef}" +
  ".uno-bubble{background:#fff;border-radius:12px;padding:10px 13px;font-size:13px;color:#1a1a2e;line-height:1.5;margin-bottom:12px;box-shadow:0 1px 4px rgba(0,0,0,.06)}" +
  ".uno-cat{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:#9a8552;margin:14px 0 6px}" +
  ".uno-btn{display:block;width:100%;text-align:left;background:#fff;border:1px solid rgba(15,25,35,.1);border-radius:9px;padding:9px 12px;font-size:12.5px;font-weight:600;color:#1a1a2e;cursor:pointer;margin-bottom:6px}" +
  ".uno-btn:hover{border-color:#c9a84c}" +
  ".uno-back{background:none;border:none;color:#6b7280;font-size:12px;cursor:pointer;margin-bottom:10px;padding:0}" +
  ".uno-link{display:inline-block;margin-top:8px;font-size:12.5px;font-weight:700;color:#0f1923;text-decoration:underline}" +
  "#unoChatFooter{padding:10px 14px;background:#fff;border-top:1px solid rgba(15,25,35,.08)}" +
  "#unoChatWaBtn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;background:#25D366;color:#fff;border:none;padding:11px;border-radius:9px;font-weight:700;font-size:13px;cursor:pointer}";
  var styleTag = document.createElement("style");
  styleTag.textContent = css;
  document.head.appendChild(styleTag);

  // ---------- Estructura HTML ----------
  var btn = document.createElement("div");
  btn.id = "unoChatBtn";
  btn.innerHTML = "💬";
  document.body.appendChild(btn);

  var panel = document.createElement("div");
  panel.id = "unoChatPanel";
  panel.innerHTML =
    '<div id="unoChatHeader">' +
      '<div><b>Asistente UNO Brokers</b><span>Directorio rápido</span></div>' +
      '<button id="unoChatClose">✕</button>' +
    '</div>' +
    '<div id="unoChatBody"></div>' +
    '<div id="unoChatFooter">' +
      '<button id="unoChatWaBtn">💬 Hablar con un asesor</button>' +
    '</div>';
  document.body.appendChild(panel);

  var body = panel.querySelector("#unoChatBody");
  var waBtn = panel.querySelector("#unoChatWaBtn");
  var currentWaMsg = "Hola, vengo del sitio de UNO Brokers y me gustaría más información.";

  function waLink(msg) {
    return "https://wa.me/" + WA_NUMERO + "?text=" + encodeURIComponent(msg);
  }
  waBtn.onclick = function () { window.open(waLink(currentWaMsg), "_blank"); };

  function renderInicio() {
    currentWaMsg = "Hola, vengo del sitio de UNO Brokers y me gustaría más información.";
    var html = '<div class="uno-bubble">¡Hola! 👋 Soy el asistente de UNO Brokers. Elige un tema para conocer más, o habla directo con un asesor abajo.</div>';
    TEMAS.inicio.categorias.forEach(function (cat) {
      html += '<div class="uno-cat">' + cat.nombre + '</div>';
      cat.items.forEach(function (key) {
        html += '<button class="uno-btn" data-tema="' + key + '">' + TEMAS[key].titulo + '</button>';
      });
    });
    body.innerHTML = html;
    body.querySelectorAll("[data-tema]").forEach(function (b) {
      b.onclick = function () { renderTema(b.getAttribute("data-tema")); };
    });
  }

  function renderTema(key) {
    var t = TEMAS[key];
    currentWaMsg = t.wa;
    body.innerHTML =
      '<button class="uno-back" id="unoBack">← Volver al menú</button>' +
      '<div class="uno-bubble"><strong>' + t.titulo + '</strong><br>' + t.texto +
      '<br><a class="uno-link" href="' + t.link + '" target="_blank">Ver página completa →</a></div>';
    body.querySelector("#unoBack").onclick = renderInicio;
  }

  btn.onclick = function () {
    panel.classList.toggle("open");
    if (panel.classList.contains("open") && !body.innerHTML) renderInicio();
  };
  panel.querySelector("#unoChatClose").onclick = function () {
    panel.classList.remove("open");
  };

  renderInicio();
})();
