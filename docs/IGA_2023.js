/* ========= Config ========= */
const RUTA_XLSX = 'Matriz_IGA.xlsx';
const HOJA = 'Resultado';
const COLUMNA_DIM = 'B'; // Dimensiones (con encabezado)

/* ========= Elementos UI ========= */
const estadoCarga = document.getElementById('estado-carga');
const contenedor   = document.getElementById('botonera');

const panel         = document.getElementById('panel-def');
const panelTitulo   = document.getElementById('def-titulo');
const panelContenido= document.getElementById('def-contenido');

// Gráficos
const gaugeContainer  = document.getElementById('gauge');
const dimBarsContainer= document.getElementById('dim-bars'); // 2ª fila, izquierda
const indBarsContainer= document.getElementById('ind-bars'); // 2ª fila, derecha

/* ========= Data en memoria ========= */
const INDICADORES_BY_DIM = new Map();

/* ========= Utiles ========= */
function quitarTildes(s){ return s.normalize('NFD').replace(/\p{Diacritic}/gu,''); }
function normalizarClave(s){
  if(!s) return '';
  let x = s.trim().replace(/^\s*dimensi[oó]n\s+/i, '').replace(/\s+/g,' ');
  return quitarTildes(x).toLowerCase();
}
function fmtPct01(v){
  return new Intl.NumberFormat('es-CO',{ style:'percent', minimumFractionDigits:2, maximumFractionDigits:2 }).format(v);
}
function colorClase(v){ 
  // v llega en 0..1
  const pct = v * 100;
  if(pct < 40) return 'bad';        // rojo
  if(pct < 80) return 'mid';        // naranja
  return 'good';                    // verde
}

/* ========= Definiciones (map por clave normalizada) ========= */
const DEFINICIONES = new Map([
  [ normalizarClave('Gestión y Evaluación Ambiental'),
    `
    <p>La dimensión de Gestión y Evaluación Ambiental en la gobernanza ambiental es clave para asegurar el cumplimiento de los requisitos normativos y la mejora continua en el desempeño ambiental del sector minero-energético. Los indicadores propuestos responden a los principios de <strong>efectividad</strong> y <strong>responsabilidad</strong>, con atributos de <strong>eficiencia</strong> y <strong>cumplimiento</strong>.</p>
    <p>Estos indicadores evalúan la efectividad del proceso de licenciamiento ambiental, el cumplimiento de obligaciones ambientales a través de procesos sancionatorios y la generación de residuos peligrosos por unidad producida. Su monitoreo permite fortalecer la capacidad de gestión del sector, garantizar la aplicación de estándares ambientales y promover prácticas más sostenibles.</p>
    `
  ],
  [ normalizarClave('Biofísica y Ecológica'),
    `
    <p>La dimensión biofísica y ecológica en la gobernanza ambiental es clave para garantizar el equilibrio entre la actividad del sector minero-energético y la conservación de los ecosistemas. Los indicadores propuestos responden a los principios de <strong>efectividad</strong> y al atributo de <strong>eficiencia</strong>.</p>
    <p>Estos indicadores evalúan la demanda hídrica, la huella hídrica azul, el área compensada en ecosistemas degradados y la superposición del sector con áreas de exclusión y conservación, promoviendo estrategias de mitigación y restauración.</p>
    `
  ],
  [ normalizarClave('Transición Energética Justa'),
    `
    <p>La dimensión de Transición Energética Justa (TEJ) se enfoca en evaluar la transformación del sector energético hacia un modelo más sustentable, eficiente y equitativo. Para ello, se analizan indicadores clave como la intensidad energética, la adopción de fuentes no convencionales de energía renovable (FNCER), la reducción de la dependencia del modelo extractivista y la producción de minerales estratégicos para la transición.</p>
    <p>Estos miden la gobernanza ambiental del sector a través de los atributos de <strong>adaptación</strong> y <strong>flexibilidad</strong>, y el objetivo de <strong>receptividad</strong>, evaluando su capacidad para ajustarse a los cambios y alineándose con las metas nacionales de descarbonización y diversificación productiva.</p>
    `
  ],
  [ normalizarClave('Cambio Climático y Gestión del Riesgo'),
    `
    <p>La dimensión de Cambio Climático y Gestión del Riesgo en la gobernanza ambiental fortalece la resiliencia del sector minero-energético y su capacidad de respuesta ante desafíos climáticos y operativos. Sus indicadores, basados en <strong>adaptación</strong> y <strong>anticipación</strong>, evalúan <strong>mitigación</strong>, gestión del riesgo, <strong>planificación</strong> y sostenibilidad.</p>
    <p>El monitoreo de estos indicadores orienta la toma de decisiones, permitiendo identificar tendencias, evaluar estrategias y fortalecer la gobernanza ambiental con datos objetivos. Su implementación impulsa una gestión más sostenible y resiliente, alineada con compromisos ambientales y la reducción de vulnerabilidad ante eventos adversos.</p>
    `
  ],
  [ normalizarClave('Económica'),
    `
    <p>La dimensión económica en la gobernanza ambiental es fundamental para garantizar el uso sostenible de los recursos naturales y una <strong>distribución equitativa de la carga de costos y beneficios</strong>.</p>
    <p>Los indicadores propuestos responden a los principios de <strong>eficiencia</strong>, <strong>efectividad</strong> y <strong>capacidad institucional</strong>, con atributos de <strong>transparencia</strong>, <strong>acceso a la información</strong> y rendición de cuentas financieras, asegurando una gestión económica sostenible.</p>
    <p>Su integración en los procesos de gobernanza refuerza el compromiso con una planificación equilibrada, promoviendo inversiones responsables y la optimización de los recursos para el desarrollo sostenible.</p>
    `
  ],
  [ normalizarClave('Subsector de Hidrocarburos'),
    `
    <p>El subsector de hidrocarburos es clave en la gobernanza ambiental, ya que su impacto en ecosistemas y comunidades exige una gestión transparente, equitativa y sostenible. Su efectividad depende de la distribución justa de beneficios económicos y la administración eficiente de recursos, garantizando un sistema energético resiliente.</p>
    <p>Los indicadores propuestos evalúan la capacidad, equidad, adaptación, legitimidad, responsabilidad y eficiencia, midiendo inversiones sociales, extracción de recursos y reservas disponibles. Esto permite anticipar riesgos y tomar decisiones informadas para que el país migre hacia una transición energética planificada y ordenada.</p>
    `
  ],
  [ normalizarClave('Subsector de Mineria'),
    `
    <p>El subsector minero es clave en la gobernanza ambiental, pues su impacto exige una gestión transparente y sostenible. Su regulación y cumplimiento normativo son esenciales para garantizar una extracción responsable.</p>
    <p>Los indicadores propuestos evalúan el cumplimiento legal, la formalización minera, la recuperación de áreas degradadas y la variación de minerales estratégicos, asegurando que la actividad minera contribuya al desarrollo sostenible y la protección ambiental.</p>
    `
  ],
  [ normalizarClave('Subsector de energía eléctrica'),
    `
    <p>El subsector de energía eléctrica es clave en la gobernanza ambiental, ya que su operación requiere eficiencia en la gestión de recursos, equidad en el acceso a la energía, transparencia en su regulación y disponibilidad de información para la toma de decisiones.</p>
    <p>Los indicadores propuestos evalúan la eficiencia en el uso del agua en la generación eléctrica, la optimización del consumo energético y la accesibilidad a la información, garantizando una gestión sostenible y alineada con principios de equidad y transparencia.</p>
    `
  ],
  [ normalizarClave('Social'),
    `
    <p>La dimensión social en la gobernanza ambiental es clave para garantizar inclusión y participación efectiva en la toma de decisiones. Los indicadores propuestos responden a los principio de equidad, con atributos de transparencia, reconocimiento, justicia y participación, asegurando procesos justos y una representación diversa.</p>
    <p>Su alineación con el Acuerdo de Escazú refuerza el compromiso con una participación abierta y accesible para todos los actores.</p>
    `
  ],
  [ normalizarClave('Análisis jurídico-Normativo'),
    `
    <p>La dimensión normativa en la gobernanza ambiental evalúa la congruencia del marco normativo sectorial con la Constitución, el Sistema Interamericano de Derechos Humanos y el Acuerdo de Escazú, así como su cumplimiento eficaz.</p>
    <p>Sus indicadores miden robustez, equidad y transparencia, fortaleciendo la participación ciudadana y la rendición de cuentas en la gestión ambiental.</p>
    `
  ],
  [ normalizarClave('Análisis institucional'),
    `
    <p>La dimensión institucional en la gobernanza ambiental evalúa la congruencia del marco normativo sectorial con la Constitución, el Sistema Interamericano de Derechos Humanos y el Acuerdo de Escazú, así como su cumplimiento eficaz.</p>
    <p>A nivel institucional, se enfoca en un funcionamiento transparente, eficaz y eficiente para el cumplimiento de su misionalidad. Sus indicadores miden robustez, equidad y transparencia, fortaleciendo la participación ciudadana y la rendición de cuentas en la gestión ambiental.</p>
    `
  ],
]);

/* ========= Lectura XLSX ========= */
async function cargarDimensiones(){
  try{
    const res = await fetch(RUTA_XLSX);
    if(!res.ok) throw new Error('No se pudo abrir Matriz_IGA.xlsx');
    const buf = await res.arrayBuffer();
    const wb  = XLSX.read(buf, { type:'array' });

    const wsRes = wb.Sheets[HOJA];
    if(!wsRes) throw new Error(`No existe la hoja '${HOJA}'`);

    // 1) Preparar indicadores por dimensión (B, E, I)
    prepararIndicadoresDesdeResultado(wsRes);

    // 2) Pintar barras por dimensión (promedio por B usando I)
    renderBarrasDimensionesDesdeResultado(wsRes);

    // 3) Construir botonera (desde B)
    const range  = XLSX.utils.decode_range(wsRes['!ref']);
    const colIdx = COLUMNA_DIM.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
    const conjunto = new Set();

    for(let r = range.s.r + 1; r <= range.e.r; r++){
      const ref  = XLSX.utils.encode_cell({ r, c: colIdx });
      const cell = wsRes[ref];
      if(cell && String(cell.v).trim()) conjunto.add(String(cell.v).trim());
    }

    const lista = Array.from(conjunto);
    if(lista.length === 0){
      estadoCarga.textContent = 'No se encontraron dimensiones en la columna B.';
    }else{
      estadoCarga.textContent = `${lista.length} dimensiones encontradas:`;
      contenedor.innerHTML = '';
      lista.forEach(nombre => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-dimension';
        btn.innerHTML = `<span>${nombre}</span><small>Ver definición</small>`;
        btn.addEventListener('click', () => {
          document.querySelectorAll('.btn-dimension.is-active').forEach(b=>b.classList.remove('is-active'));
          btn.classList.add('is-active');
          abrirPanel(nombre);
          renderIndicadoresPorDimension(nombre); // -> 2ª fila / col derecha
        });
        contenedor.appendChild(btn);
      });
    }

    // 4) Gauge con Resultado!G56 (0..1)
    if (gaugeContainer){
      const g56 = wsRes['G56'] ? Number(wsRes['G56'].v) : NaN;
      let valor01 = Number.isFinite(g56) ? g56 : 0;
      valor01 = Math.max(0, Math.min(1, valor01));
      renderGauge150(gaugeContainer, valor01);
    }

  }catch(err){
    estadoCarga.innerHTML = `⚠️ ${err.message}. Si abres el HTML como <code>file://</code>, usa un servidor local para permitir <code>fetch</code>.`;
    if (gaugeContainer) renderGauge150(gaugeContainer, 0);
  }
}

/* ========= Mapear B (dim), E (indicador), I (porcentaje) ========= */
function prepararIndicadoresDesdeResultado(ws){
  if(!ws || !ws['!ref']) return;

  const range = XLSX.utils.decode_range(ws['!ref']);
  const COL_DIM = 1; // B
  const COL_IND = 4; // E
  const COL_VAL = 8; // I

  for(let r = range.s.r + 1; r <= range.e.r; r++){
    const dimCell = ws[XLSX.utils.encode_cell({ r, c: COL_DIM })];
    const indCell = ws[XLSX.utils.encode_cell({ r, c: COL_IND })];
    const valCell = ws[XLSX.utils.encode_cell({ r, c: COL_VAL })];

    const dim = dimCell ? String(dimCell.v).trim() : '';
    const ind = indCell ? String(indCell.v).trim() : '';
    let   val = valCell ? Number(valCell.v) : NaN;

    if(!dim || !ind || !Number.isFinite(val)) continue;

    if(Math.abs(val) > 1.0001) val = val / 100;
    val = Math.max(0, Math.min(1, val));

    const key = normalizarClave(dim);
    if(!INDICADORES_BY_DIM.has(key)) INDICADORES_BY_DIM.set(key, []);
    INDICADORES_BY_DIM.get(key).push({ ind, val });
  }
}

/* ========= Barras por Dimensión (promedio de I por cada B) ========= */
function renderBarrasDimensionesDesdeResultado(ws){
  if(!dimBarsContainer || !ws || !ws['!ref']) return;

  // agrupar por dimensión (usamos los datos ya construidos en INDICADORES_BY_DIM)
  const filas = [];
  for(const [key, arr] of INDICADORES_BY_DIM.entries()){
    if(!arr.length) continue;
    const promedio = arr.reduce((a,b)=>a + b.val, 0) / arr.length;
    // recuperar el nombre "bonito" (primera ocurrencia)
    const nombreBonito = arr._nombreOriginal || key;
    filas.push({ dim: nombreBonito, value: promedio });
  }

  // Si no se guardó el nombre bonito, muéstralo como estaba: capitaliza por simpleza
  const beautify = s => s.replace(/\b\w/g, ch => ch.toUpperCase());

  // Render
  dimBarsContainer.innerHTML = '';
  filas
    .sort((a,b)=> b.value - a.value)
    .forEach(({dim, value}) => {
      const row = document.createElement('div');
      row.className = 'bar-row';

      const title = document.createElement('div');
      title.className = 'bar-title';
      title.textContent = dim || beautify(key);

      const right = document.createElement('div');
      right.className = 'bar-right';

      const val = document.createElement('div');
      val.className = 'bar-value';
      val.textContent = fmtPct01(value);

      const track = document.createElement('div');
      track.className = 'bar-track';

      const fill = document.createElement('div');
      fill.className = `bar-fill ${colorClase(value)}`;
      fill.style.width = `${(value*100).toFixed(2)}%`;

      track.appendChild(fill);
      right.appendChild(val);
      right.appendChild(track);

      row.appendChild(title);
      row.appendChild(right);
      dimBarsContainer.appendChild(row);
    });
}

/* ========= Panel inline ========= */
function abrirPanel(nombreOriginal){
  const clave = normalizarClave(nombreOriginal);
  const def = DEFINICIONES.get(clave);
  panelTitulo.textContent = nombreOriginal;
  panelContenido.innerHTML = def || `<p><em>Definición no disponible para: "${nombreOriginal}"</em></p>`;
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ========= Indicadores por dimensión seleccionada ========= */
function renderIndicadoresPorDimension(nombreDimension){
  if(!indBarsContainer) return;

  const key = normalizarClave(nombreDimension);
  const lista = INDICADORES_BY_DIM.get(key) || [];

  if(lista.length === 0){
    indBarsContainer.innerHTML = `<p class="muted">No hay indicadores para <strong>${nombreDimension}</strong> (E/I en Resultado).</p>`;
    return;
  }

  const datos = [...lista].sort((a,b)=> b.val - a.val);

  indBarsContainer.innerHTML = '';
  datos.forEach(({ ind, val }) => {
    const row = document.createElement('div');
    row.className = 'bar-row';

    const title = document.createElement('div');
    title.className = 'bar-title';
    title.textContent = ind;

    const right = document.createElement('div');
    right.className = 'bar-right';

    const valBox = document.createElement('div');
    valBox.className = 'bar-value';
    valBox.textContent = fmtPct01(val);

    const track = document.createElement('div');
    track.className = 'bar-track';

    const fill = document.createElement('div');
    fill.className = `bar-fill ${colorClase(val)}`;
    fill.style.width = `${(val*100).toFixed(2)}%`;

    track.appendChild(fill);
    right.appendChild(valBox);
    right.appendChild(track);

    row.appendChild(title);
    row.appendChild(right);
    indBarsContainer.appendChild(row);
  });
}

/* ========= Gauge 150x150 ========= */
function renderGauge150(host, value){
  host.innerHTML = '';

  const W = 150, H = 150;
  const CX = W/2, CY = 100;
  const R  = 55;
  const STROKE = 16;

  value = Math.max(0, Math.min(1, Number(value) || 0));

  const polar = (r,a) => [CX + r*Math.cos(a), CY + r*Math.sin(a)];
  const arcPath = (r,a0,a1) => {
    const [x0,y0] = polar(r,a0);
    const [x1,y1] = polar(r,a1);
    const sweep = Math.abs(a1 - a0);
    const large = sweep > Math.PI ? 1 : 0;
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
  };

  const d = arcPath(R, Math.PI, 0);

  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', '150');
  svg.setAttribute('height', '150');

  const track = document.createElementNS('http://www.w3.org/2000/svg','path');
  track.setAttribute('d', d);
  track.setAttribute('fill','none');
  track.setAttribute('class','gauge-track');
  track.setAttribute('stroke-width', STROKE);
  track.setAttribute('stroke-linecap','round');

  const fill = document.createElementNS('http://www.w3.org/2000/svg','path');
  fill.setAttribute('d', d);
  fill.setAttribute('fill','none');
  fill.setAttribute('class','gauge-fill');
  fill.setAttribute('stroke-width', STROKE);
  fill.setAttribute('stroke-linecap','round');

  const len = Math.PI * R;
  fill.setAttribute('stroke-dasharray', `${value * len} ${len}`);
  fill.setAttribute('stroke-dashoffset', '0');

  const txtY = CY - R * 0.55;
  const txt = document.createElementNS('http://www.w3.org/2000/svg','text');
  txt.setAttribute('x', String(CX));
  txt.setAttribute('y', String(txtY));
  txt.setAttribute('text-anchor','middle');
  txt.setAttribute('dominant-baseline','middle');
  txt.setAttribute('class','gauge-value');
  txt.textContent = new Intl.NumberFormat('es-CO',{ minimumFractionDigits:2, maximumFractionDigits:2 }).format(value);

  svg.appendChild(track);
  svg.appendChild(fill);
  svg.appendChild(txt);
  host.appendChild(svg);
}

/* ========= Init ========= */
document.addEventListener('DOMContentLoaded', cargarDimensiones);
