/* ========= Config ========= */
const RUTA_XLSX = '../xlsx/Matriz_IGA.xlsx';
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

/* ========= Estado UI ========= */
let SELECTED_DIM = null;                 // clave normalizada de la dimensión seleccionada
const DIM_NAME_BY_KEY = new Map();       // key -> nombre original (bonito)

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

    // 1) Preparar indicadores por dimensión (B, E, I) y nombres "bonitos"
    prepararIndicadoresDesdeResultado(wsRes);

    // 2) Pintar barras por dimensión (promedio por B usando I)
    renderBarrasDimensionesDesdeResultado();

    // 3) Construir botonera desde lo que ya quedó en memoria
    const claves = Array.from(DIM_NAME_BY_KEY.keys());
    if(claves.length === 0){
      estadoCarga.textContent = 'No se encontraron dimensiones en la columna B.';
    }else{
      estadoCarga.textContent = `${claves.length} dimensiones encontradas:`;
      contenedor.innerHTML = '';
      claves
        .map(k => DIM_NAME_BY_KEY.get(k))
        .sort((a,b)=> a.localeCompare(b, 'es'))
        .forEach(nombre => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'btn-dimension';
          btn.innerHTML = `<span>${nombre}</span><small>Ver definición</small>`;
          btn.addEventListener('click', () => {
            seleccionarDimension(nombre);
          });
          contenedor.appendChild(btn);
        });

      // Selección inicial (opcional): primera dimensión alfabética
      seleccionarDimension(DIM_NAME_BY_KEY.get(claves[0]));
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
    if(!DIM_NAME_BY_KEY.has(key)) DIM_NAME_BY_KEY.set(key, dim); // guardar “bonito” la 1ª vez

    INDICADORES_BY_DIM.get(key).push({ ind, val });
  }
}

/* ========= Barras por Dimensión (promedio de I por cada B) ========= */
function renderBarrasDimensionesDesdeResultado(){
  if(!dimBarsContainer) return;

  // agrupar por dimensión (usamos los datos ya construidos en INDICADORES_BY_DIM)
  const filas = [];
  for(const [key, arr] of INDICADORES_BY_DIM.entries()){
    if(!arr.length) continue;
    const promedio = arr.reduce((a,b)=>a + b.val, 0) / arr.length;
    const nombreBonito = DIM_NAME_BY_KEY.get(key) || key;
    filas.push({ key, dim: nombreBonito, value: promedio });
  }

  // orden: primero la seleccionada (si existe), luego resto por valor desc
  filas.sort((a,b)=>{
    if(SELECTED_DIM && (a.key === SELECTED_DIM || b.key === SELECTED_DIM)){
      return a.key === SELECTED_DIM ? -1 : 1;
    }
    return b.value - a.value;
  });

  // Render
  dimBarsContainer.innerHTML = '';
  filas.forEach(({key, dim, value}) => {
    const row = document.createElement('div');
    row.className = 'bar-row';
    if (SELECTED_DIM && key === SELECTED_DIM) row.classList.add('is-selected');
    row.dataset.dimKey = key;

    const title = document.createElement('div');
    title.className = 'bar-title';
    title.textContent = dim;

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

    // clic en la barra también selecciona
    row.addEventListener('click', () => {
      const nombre = DIM_NAME_BY_KEY.get(key) || dim;
      seleccionarDimension(nombre);
    });
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

/* ========= Enlaces a fichas metodológicas (DOCX) ========= */
const DOCX_DIR = '../dox/';

function normalizarIndicador(s){
  if(!s) return '';
  return s.normalize('NFD')
          .replace(/\p{Diacritic}/gu,'')
          .replace(/\s+/g,' ')
          .trim()
          .toLowerCase();
}

const DOCX_MAP = new Map([
  [ normalizarIndicador('Reconocimiento y protección de los derechos ambientales en la política sectorial de derechos humanos'), 
    DOCX_DIR + '01. Reconocimiento y protección de los derechos ambientales en la política sectorial de derechos humanos.docx' ],
  [ normalizarIndicador('Contexto favorable para el ejercicio de los derechos ambientales'),
    DOCX_DIR + '02. Contexto favorable para el ejercicio de los derechos ambientales.docx' ],
  [ normalizarIndicador('Análisis de impacto regulatorio con dimensión ambiental'),
    DOCX_DIR + '03. Análisis de impacto regulatorio con dimensión ambiental.docx' ],
  [ normalizarIndicador('Evaluación ex post de regulaciones'),
    DOCX_DIR + '04. Evaluación ex post de regulaciones.docx' ],
  [ normalizarIndicador('Procesos de consulta pública en la producción normativa'),
    DOCX_DIR + '05. Procesos de consulta pública en la producción normativa.docx' ],
  [ normalizarIndicador('Puntaje del sector de minas y energía en el índice de Desempeño Institucional'),
    DOCX_DIR + '6. Puntaje del sector de minas y energía en el índice de Desempeño Institucional.docx' ],
  [ normalizarIndicador('Coordinación intersectorial'),
    DOCX_DIR + '07. Coordinación interinstitucional.docx' ],
  [ normalizarIndicador('Acceso a justicia'),
    DOCX_DIR + '08. Acceso a justicia.docx' ],
  [ normalizarIndicador('Participación ciudadana'),
    DOCX_DIR + '09. Participación Ciudadana.docx' ],
  [ normalizarIndicador('Interacción de género y enfoque diferencial'),
    DOCX_DIR + '10. Interacción de género y enfoque diferencial.docx' ],
  [ normalizarIndicador('Conflictividad socioambiental'),
    DOCX_DIR + '11. Conflictividad Socioambiental.docx' ],
  [ normalizarIndicador('Cumplimiento a PQRSD'),
    DOCX_DIR + '12. Cumplimiento a PQRSD (peticiones, quejas, reclamos, sugerencias y denuncias).docx' ],
  [ normalizarIndicador('Variación de la demanda hídrica'),
    DOCX_DIR + '13. Variación de la demanda hídrica.docx' ],
  [ normalizarIndicador('Variación de la huella hídrica azul'),
    DOCX_DIR + '14. Variación de la huella hídrica azul.docx' ],
  [ normalizarIndicador('Variación del área compensada por cada subsector minero energético'),
    DOCX_DIR + '15. Variación del área compensada para el sector minero energético.docx' ],
  [ normalizarIndicador('Área de superposición de cada subsector minero energético con determinantes ambientales'),
    DOCX_DIR + '16. Área de superposición de cada subsector minero energético con determinantes ambientales.docx' ],
  [ normalizarIndicador('Área de superposición de cada subsector minero energético con áreas prioritarias de conservación'),
    DOCX_DIR + '17. Área de superposición de cada subsector minero energético con áreas prioritarias de conservación.docx' ],
  [ normalizarIndicador('Variación en la generación de residuos peligrosos (respel) por unidad producida'),
    DOCX_DIR + '18. Variación de la generación de residuos peligrosos (respel) por unidad producida.docx' ],
  [ normalizarIndicador('Licenciamiento Ambiental'),
    DOCX_DIR + '19. Licenciamiento Ambiental.docx' ],
  [ normalizarIndicador('Procesos sancionatorios ambientales'),
    DOCX_DIR + '20. Procesos sancionatorios ambientales.docx' ],
  [ normalizarIndicador('Variación de emisiones de GEI del sector'),
    DOCX_DIR + '21. Variación de emisiones de GEI del SME.docx' ],
  [ normalizarIndicador('Tasa de variación de financiamiento climático'),
    DOCX_DIR + '22. Tasa de Variación del Financiamiento Climático.docx' ],
  [ normalizarIndicador('Índice de vulnerabilidad climática'),
    DOCX_DIR + '23. Índice de vulnerabilidad climática.docx' ],
  [ normalizarIndicador('Índice de Derrames de Hidrocarburos (IDH)'),
    DOCX_DIR + '24. Índice de Derrames de Hidrocarburos (IDH).docx' ],  
  [ normalizarIndicador('Índice de Gravedad de Accidentes Mineros (IGAM)'),
    DOCX_DIR + '25. Índice de Gravedad de Accidentes Mineros (IGAM).docx' ],
  [ normalizarIndicador('índice de Severidad de Accidentes Eléctricos (ISAE)'),
    DOCX_DIR + '26. Índice de Severidad de Accidentes Eléctricos (ISAE).docx' ],
  [ normalizarIndicador('Variación de la intensidad energética por subsector'),
    DOCX_DIR + '27. Variación de la intensidad energética del sector minero energético.docx' ],
  [ normalizarIndicador('Variación de la intensidad energética nacional'),
    DOCX_DIR + '28. Variación de la intensidad energética nacional.docx' ],
  [ normalizarIndicador('Participación de las FNCER en la matriz energética primaria'),
    DOCX_DIR + '29. Participación de las FNCER en la matriz energética primaria.' ],
  [ normalizarIndicador('Participación de las FNCER en la matriz energética eléctrica.'),
    DOCX_DIR + '30. Participación de las FNCER en la matriz energética eléctrica.docx' ],
  [ normalizarIndicador('Producción de minerales estratégicos y críticos para la TEJ.'),
    DOCX_DIR + '31. Producción de Minerales Estratégicos y Críticos para la TEJ.docx' ],
  [ normalizarIndicador('Pobreza multidimensional en municipios productores de minerales estratégicos'),
    DOCX_DIR + '32.Pobreza multidimensional en municipios productores de minerales estratégicos TEJ.docx' ],
  [ normalizarIndicador('Recaudo efectivo de regalías'),
    DOCX_DIR + '33. Recaudo efectivo de Regalías.docx' ],
  [ normalizarIndicador('Regalías destinadas al sector ambiente y desarrollo sostenible'),
    DOCX_DIR + '34. Regalías destinadas al sector Ambiente y Desarrollo Sostenible.docx' ],
  [ normalizarIndicador('Variación de proyectos del SGR dirigidos al sector ambiente y desarrollo sostenible'),
    DOCX_DIR + '35. Variación de proyectos del SGR dirigidos al sector ambiente y desarrollo sostenible.docx' ],
  [ normalizarIndicador('Participación del sector minero energético en el PIB nacional'),
    DOCX_DIR + '36. Participación del sector Minero Energético en el PIB nacional.docx' ],
  [ normalizarIndicador('Participación del sector minero energético en las exportaciones del país.'),
    DOCX_DIR + '37. Participación del sector Minero Energético en las exportaciones del país.docx' ],
  [ normalizarIndicador('Pobreza multidimensional en municipios productores de hidrocarburos.'),
    DOCX_DIR + '38. Pobreza multidimensional en municipios productores de hidrocarburos.docx' ],
  [ normalizarIndicador('Índice de cobertura y equidad territorial en municipios productores'),
    DOCX_DIR + '39. Cobertura y equidad territorial en municipios productores de hidrocarburos.docx' ],
  [ normalizarIndicador('Participación de los hidrocarburos en la matriz energética (IPHME)'),
    DOCX_DIR + '40. Participación de los hidrocarburos en la matriz energética (IPHME).docx' ],
  [ normalizarIndicador('Variación del stock de hidrocarburos'),
    DOCX_DIR + '41. Variación del stock de hidrocarburos.docx' ],
  [ normalizarIndicador('Disponibilidad de reservas de hidrocarburos (R/P)'),
    DOCX_DIR + '42. Disponibilidad de reservas de hidrocarburos.docx' ],
  [ normalizarIndicador('Tasa de extracción de hidrocarburos (TEH)'),
    DOCX_DIR + '43. Tasa de extracción de hidrocarburos (TEH).docx' ],
  [ normalizarIndicador('Superposición de títulos mineros activos con áreas ambientales excluibles, restrictivas e informativas para la minería'),
    DOCX_DIR + '44. Superposición de títulos mineros activos con áreas ambientales excluibles.docx' ],
  [ normalizarIndicador('Superposición de áreas de reserva especial declaradas y solicitadas con áreas ambientales excluibles, restrictivas e informativas para la minería'),
    DOCX_DIR + '45. Superposición de áreas de reserva especial declaradas y solicitadas con áreas ambientales excluibles.docx' ],
  [ normalizarIndicador('Procesos de formalización y registro minero'),
    DOCX_DIR + '46. Procesos de formalización y registro Minero.docx' ],
  [ normalizarIndicador('Áreas recuperadas por gestión y control a la explotación ilegal de minerales'),
    DOCX_DIR + '47. Áreas recuperadas por gestión y control por explotación ilegal de minerales.docx' ],
  [ normalizarIndicador('Variación del Consumo de Energía Eléctrica en el país.'),
    DOCX_DIR + '48. Variación del Consumo de Energía Eléctrica en el país.docx' ],
  [ normalizarIndicador('Variación en el nivel de pobreza energética multidimensional nacional.'),
    DOCX_DIR + '49. Variación en el nivel de pobreza energética multifuncional en el país.docx' ],
  [ normalizarIndicador('Variación en la cobertura en el acceso al servicio de energía eléctrica en el país.'),
    DOCX_DIR + '50. Variación en la cobertura en el acceso al servicio de energía eléctrica en el país.docx' ],
  [ normalizarIndicador('Porcentaje de Informes de Sostenibilidad anuales publicados por empresas generadoras del país.'),
    DOCX_DIR + '51. Porcentaje de Informes de Sostenibilidad anuales publicados por empresas generadoras del país.docx' ],
]);

function getDocxUrlFromIndicador(nombreIndicador){
  const key = normalizarIndicador(nombreIndicador);
  return DOCX_MAP.get(key) || null;
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

  // Título con el nombre de la dimensión seleccionada
  const header = document.createElement('div');
  header.className = 'ind-header';
  header.innerHTML = `<h4 class="ind-dim-title">${nombreDimension}</h4>`;
  indBarsContainer.appendChild(header);

  // Barras
  datos.forEach(({ ind, val }) => {
    const row = document.createElement('div');
    row.className = 'bar-row';

    const title = document.createElement('div');
    title.className = 'bar-title';

    // enlace a DOCX si existe
    const urlDocx = getDocxUrlFromIndicador(ind);
    if (urlDocx){
      const a = document.createElement('a');
      a.href = urlDocx;
      a.target = '_blank';
      a.rel = 'noopener';
      a.className = 'ind-link';
      a.textContent = ind;
      title.appendChild(a);

      row.classList.add('is-link');
      row.addEventListener('click', (e) => {
        if(e.target.tagName.toLowerCase() !== 'a'){
          window.open(urlDocx, '_blank', 'noopener');
        }
      });
    }else{
      title.textContent = ind;
    }

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

/* ========= Selección centralizada ========= */
function seleccionarDimension(nombreOriginal){
  const key = normalizarClave(nombreOriginal);
  SELECTED_DIM = key;

  // activar el botón correspondiente
  document.querySelectorAll('.btn-dimension').forEach(b=>{
    const txt = b.querySelector('span')?.textContent?.trim() || '';
    const k = normalizarClave(txt);
    b.classList.toggle('is-active', k === key);
  });

  abrirPanel(DIM_NAME_BY_KEY.get(key) || nombreOriginal);
  renderIndicadoresPorDimension(DIM_NAME_BY_KEY.get(key) || nombreOriginal); // derecha
  renderBarrasDimensionesDesdeResultado(); // izquierda (reordena y resalta)
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

