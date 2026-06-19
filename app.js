/**
 * Panel de Atención — Ana Ruiz
 * app.js · Lógica principal (sin dependencias externas)
 * Persistencia: localStorage
 */

'use strict';

/* ═══════════════════════ ICONOS (SVG inline, sin dependencias) ═══════════════════════ */
const ICON_PATHS = {
  calendar:    '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  clock:       '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  book:        '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  pencil:      '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  trash:       '<path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>',
  arrowLeft:   '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
  arrowRight:  '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  download:    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
  upload:      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/>',
  moon:        '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  sun:         '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  search:      '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  plus:        '<path d="M12 5v14M5 12h14"/>',
  x:           '<path d="M18 6 6 18M6 6l12 12"/>',
  alert:       '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>',
  inbox:       '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  searchX:     '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/><path d="m13.5 8.5-5 5M8.5 8.5l5 5"/>',
  info:        '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  check:       '<path d="M20 6 9 17l-5-5"/>',
  undo:        '<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
  grip:        '<path d="M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01"/>',
  cap:         '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/>',
};

function svgIcon(name, cls = 'icon') {
  const paths = ICON_PATHS[name] || '';
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

/* ═══════════════════════ CONSTANTES ══════════════════════════ */
const STORAGE_KEY = 'anaruiz_estudiantes';
const SEED_KEY    = 'anaruiz_seeded';
const THEME_KEY   = 'anaruiz_theme';
const ESTADOS     = ['programado', 'pendiente', 'atendido'];

const ESTADO_NOMBRES = {
  programado: 'Programado',
  pendiente:  'Pendiente',
  atendido:   'Atendido',
};

const ESTADO_ICON = {
  programado: 'calendar',
  pendiente:  'clock',
  atendido:   'checkCircle',
};

const ESTADO_NEXT = {
  programado: 'pendiente',
  pendiente:  'atendido',
  atendido:   null,
};

const ESTADO_PREV = {
  programado: null,
  pendiente:  'programado',
  atendido:   'pendiente',
};

const TOAST_ICON = {
  success: 'check',
  info:    'info',
  danger:  'alert',
};

/* ═══════════════════════ ESTADO ══════════════════════════════ */
let estudiantes  = [];
let filtroTexto  = '';
let editandoId   = null;
let eliminandoId = null;
let arrastrandoId = null;
let ultimoFoco   = null; // elemento que abrió un overlay (para devolver el foco)

/* ═══════════════════════ UTILS ═══════════════════════════════ */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function iniciales(nombre) {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('');
}

function formatDate(iso) {
  if (!iso) return '';
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

function hoyISO() {
  return new Date().toISOString().split('T')[0];
}

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

/* ═══════════════════════ STORAGE ════════════════════════════ */
function cargar() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    estudiantes = raw ? JSON.parse(raw) : [];
  } catch {
    estudiantes = [];
  }
}

function guardar() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(estudiantes));
}

/* ═══════════════════════ RENDER ═════════════════════════════ */
function render() {
  const query = filtroTexto.trim().toLowerCase();

  const filtrados = query
    ? estudiantes.filter(e =>
        e.nombre.toLowerCase().includes(query) ||
        e.curso.toLowerCase().includes(query)
      )
    : estudiantes;

  // Contadores: si hay búsqueda, reflejan lo visible (filtrado)
  const base  = query ? filtrados : estudiantes;
  const total = base.length;
  ESTADOS.forEach(estado => {
    const n = base.filter(e => e.estado === estado).length;
    document.getElementById(`count-${estado}`).textContent = n;
    document.getElementById(`badge-${estado}`).textContent  = n;
  });
  document.getElementById('count-total').textContent = total;

  // Vaciar columnas
  ESTADOS.forEach(estado => {
    const col = document.getElementById(`col-${estado}`);
    col.innerHTML = '';

    const grupo = filtrados
      .filter(e => e.estado === estado)
      .sort((a, b) =>
        (a.fecha || '').localeCompare(b.fecha || '') ||
        a.nombre.localeCompare(b.nombre)
      );

    if (grupo.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'col-empty';
      empty.setAttribute('role', 'listitem');
      const icono = estado === 'programado' ? 'inbox' : estado === 'pendiente' ? 'clock' : 'checkCircle';
      const txt   = estado === 'programado' ? 'programados' : estado === 'pendiente' ? 'pendientes' : 'atendidos';
      empty.innerHTML = `
        <span class="col-empty-icon" aria-hidden="true">${svgIcon(icono)}</span>
        <span>Sin estudiantes ${txt}${query ? ' que coincidan' : ''}</span>
      `;
      col.appendChild(empty);
    } else {
      grupo.forEach(e => {
        col.appendChild(crearTarjeta(e));
      });
    }
  });

  // Estado vacío global / sin resultados
  const emptyState = document.getElementById('empty-state');
  const board      = document.getElementById('board');
  const titulo     = document.getElementById('empty-title');
  const desc       = document.getElementById('empty-desc');
  const icono      = emptyState.querySelector('.empty-icon');

  if (total === 0 && !query) {
    board.style.display = 'none';
    emptyState.hidden   = false;
    icono.innerHTML     = svgIcon('inbox', 'icon-xl');
    titulo.textContent  = 'No hay estudiantes registrados';
    desc.innerHTML      = 'Haz clic en <strong>Nuevo Estudiante</strong> para comenzar.';
  } else if (filtrados.length === 0 && query) {
    board.style.display = 'none';
    emptyState.hidden   = false;
    icono.innerHTML     = svgIcon('searchX', 'icon-xl');
    titulo.textContent  = 'Sin resultados';
    desc.textContent    = `No hay estudiantes que coincidan con "${filtroTexto.trim()}".`;
  } else {
    board.style.display = '';
    emptyState.hidden   = true;
  }

  actualizarProgreso();
}

function crearTarjeta(estudiante) {
  const { id, nombre, fecha, curso, estado, observaciones } = estudiante;

  const div = document.createElement('article');
  div.className = `card card--${estado}`;
  div.setAttribute('role', 'listitem');
  div.dataset.id = id;
  div.draggable = true;

  const prevEstado = ESTADO_PREV[estado];
  const nextEstado = ESTADO_NEXT[estado];

  const tieneObs = observaciones && observaciones.trim().length > 0;

  // Indicador de vencido / hoy (solo para no-atendidos)
  let flag = '';
  if (estado !== 'atendido' && fecha) {
    const hoy = hoyISO();
    if (fecha < hoy)        flag = '<span class="card-flag card-flag--vencido">Vencido</span>';
    else if (fecha === hoy) flag = '<span class="card-flag card-flag--hoy">Hoy</span>';
  }

  div.innerHTML = `
    <span class="card-grip" aria-hidden="true" title="Arrastrar">${svgIcon('grip')}</span>
    <div class="card-top">
      <div class="card-avatar card-avatar--${estado}" aria-hidden="true">${esc(iniciales(nombre))}</div>
      <div class="card-info">
        <div class="card-name" title="${esc(nombre)}">${esc(nombre)}</div>
        <div class="card-meta">
          <span class="card-tag">${svgIcon('calendar')} ${formatDate(fecha)}</span>
          <span class="card-tag">${svgIcon('book')} ${esc(curso)}</span>
          ${flag}
        </div>
      </div>
      <div class="card-actions-top">
        <button
          class="icon-btn edit"
          title="Editar estudiante"
          aria-label="Editar a ${esc(nombre)}"
          data-action="edit"
        >${svgIcon('pencil')}</button>
        <button
          class="icon-btn delete"
          title="Eliminar estudiante"
          aria-label="Eliminar a ${esc(nombre)}"
          data-action="delete"
        >${svgIcon('trash')}</button>
      </div>
    </div>

    ${tieneObs ? `
      <div
        class="card-obs"
        title="Clic para expandir"
        role="button"
        tabindex="0"
        data-action="toggle-obs"
      >${esc(observaciones)}</div>
    ` : ''}

    <div class="card-footer">
      ${prevEstado ? `
        <button
          class="state-btn state-btn--${prevEstado}"
          title="Mover a ${ESTADO_NOMBRES[prevEstado]}"
          aria-label="Mover a ${ESTADO_NOMBRES[prevEstado]}"
          data-action="move"
          data-to="${prevEstado}"
        >${svgIcon('arrowLeft')} ${ESTADO_NOMBRES[prevEstado]}</button>
      ` : '<span></span>'}

      ${nextEstado ? `
        <button
          class="state-btn state-btn--${nextEstado}"
          title="Mover a ${ESTADO_NOMBRES[nextEstado]}"
          aria-label="Mover a ${ESTADO_NOMBRES[nextEstado]}"
          data-action="move"
          data-to="${nextEstado}"
        >${ESTADO_NOMBRES[nextEstado]} ${svgIcon('arrowRight')}</button>
      ` : ''}
    </div>
  `;

  return div;
}

/* ═══════════════════════ ACCIONES ══════════════════════════ */
function toggleObs(el) {
  if (el) el.classList.toggle('expanded');
}

function cambiarEstado(id, nuevoEstado) {
  const est = estudiantes.find(e => e.id === id);
  if (!est || est.estado === nuevoEstado) return;
  est.estado = nuevoEstado;
  est.actualizadoEn = new Date().toISOString();
  guardar();
  render();
  toast(`${est.nombre} movido a ${ESTADO_NOMBRES[nuevoEstado]}`, 'success');
}

function confirmarEliminar(id) {
  const est = estudiantes.find(e => e.id === id);
  if (!est) return;
  eliminandoId = id;
  document.getElementById('confirm-text').textContent =
    `¿Seguro que quieres eliminar a "${est.nombre}"? Esta acción no se puede deshacer.`;
  abrirOverlay('confirm-overlay', 'confirm-cancel');
}

function eliminar(id) {
  const idx = estudiantes.findIndex(e => e.id === id);
  if (idx === -1) return;
  const [borrado] = estudiantes.splice(idx, 1);
  guardar();
  render();
  toast(`${borrado.nombre} eliminado`, 'danger', {
    label: 'Deshacer',
    onClick: () => {
      estudiantes.splice(Math.min(idx, estudiantes.length), 0, borrado);
      guardar();
      render();
      toast(`${borrado.nombre} restaurado`, 'info');
    },
  });
}

/* ═══════════════════════ MODAL FORM ════════════════════════ */
function abrirNuevo() {
  editandoId = null;
  document.getElementById('modal-title').textContent = 'Nuevo Estudiante';
  document.getElementById('btn-guardar').textContent  = 'Guardar';
  limpiarForm();
  document.getElementById('form-fecha').value = hoyISO();
  abrirOverlay('modal-overlay', 'form-nombre');
}

function abrirEditar(id) {
  const est = estudiantes.find(e => e.id === id);
  if (!est) return;
  editandoId = id;
  document.getElementById('modal-title').textContent = 'Editar Estudiante';
  document.getElementById('btn-guardar').textContent  = 'Actualizar';
  document.getElementById('form-id').value             = est.id;
  document.getElementById('form-nombre').value         = est.nombre;
  document.getElementById('form-fecha').value          = est.fecha;
  document.getElementById('form-curso').value          = est.curso;
  document.getElementById('form-estado').value         = est.estado;
  document.getElementById('form-observaciones').value  = est.observaciones || '';
  limpiarErrores();
  abrirOverlay('modal-overlay', 'form-nombre');
}

function cerrarModal() {
  cerrarOverlay('modal-overlay');
  editandoId = null;
  limpiarForm();
}

function limpiarForm() {
  document.getElementById('student-form').reset();
  document.getElementById('form-id').value = '';
  limpiarErrores();
}

function limpiarErrores() {
  ['nombre', 'fecha', 'curso'].forEach(campo => {
    const errEl  = document.getElementById(`error-${campo}`);
    const inputEl = document.getElementById(`form-${campo}`);
    if (errEl)  errEl.textContent = '';
    if (inputEl) inputEl.classList.remove('error');
  });
}

function validarForm() {
  let valido = true;

  const campos = [
    { id: 'nombre', label: 'El nombre es obligatorio' },
    { id: 'fecha',  label: 'La fecha es obligatoria' },
    { id: 'curso',  label: 'El curso es obligatorio' },
  ];

  campos.forEach(({ id, label }) => {
    const input = document.getElementById(`form-${id}`);
    const err   = document.getElementById(`error-${id}`);
    if (!input.value.trim()) {
      err.textContent = label;
      input.classList.add('error');
      valido = false;
    } else {
      err.textContent = '';
      input.classList.remove('error');
    }
  });

  return valido;
}

function guardarEstudiante(e) {
  e.preventDefault();
  if (!validarForm()) return;

  const nombre        = document.getElementById('form-nombre').value.trim();
  const fecha         = document.getElementById('form-fecha').value;
  const curso         = document.getElementById('form-curso').value.trim();
  const estado        = document.getElementById('form-estado').value;
  const observaciones = document.getElementById('form-observaciones').value.trim();

  if (editandoId) {
    const est = estudiantes.find(e => e.id === editandoId);
    if (est) {
      est.nombre        = nombre;
      est.fecha         = fecha;
      est.curso         = curso;
      est.estado        = estado;
      est.observaciones = observaciones;
      est.actualizadoEn = new Date().toISOString();
    }
    toast(`${nombre} actualizado`, 'info');
  } else {
    estudiantes.push({
      id:           uid(),
      nombre,
      fecha,
      curso,
      estado,
      observaciones,
      creadoEn:     new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
    });
    toast(`${nombre} agregado como ${ESTADO_NOMBRES[estado]}`, 'success');
  }

  guardar();
  cerrarModal();
  render();
}

/* ═══════════════════════ OVERLAYS / FOCO ═══════════════════ */
function elementosEnfocables(contenedor) {
  return Array.from(contenedor.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )).filter(el => el.offsetParent !== null);
}

function abrirOverlay(overlayId, focoInicialId) {
  ultimoFoco = document.activeElement;
  const overlay = document.getElementById(overlayId);
  overlay.hidden = false;
  setTimeout(() => {
    const foco = document.getElementById(focoInicialId);
    if (foco) foco.focus();
  }, 50);
}

function cerrarOverlay(overlayId) {
  document.getElementById(overlayId).hidden = true;
  if (ultimoFoco && typeof ultimoFoco.focus === 'function') {
    ultimoFoco.focus();
    ultimoFoco = null;
  }
}

function overlayAbierto() {
  // Devuelve el overlay superior visible (confirmación tiene prioridad)
  const confirm = document.getElementById('confirm-overlay');
  const modal   = document.getElementById('modal-overlay');
  if (!confirm.hidden) return confirm;
  if (!modal.hidden)   return modal;
  return null;
}

function atraparFoco(e) {
  if (e.key !== 'Tab') return;
  const overlay = overlayAbierto();
  if (!overlay) return;
  const focos = elementosEnfocables(overlay);
  if (focos.length === 0) return;
  const primero = focos[0];
  const ultimo  = focos[focos.length - 1];
  if (e.shiftKey && document.activeElement === primero) {
    e.preventDefault();
    ultimo.focus();
  } else if (!e.shiftKey && document.activeElement === ultimo) {
    e.preventDefault();
    primero.focus();
  }
}

/* ═══════════════════════ TOAST ════════════════════════════ */
function toast(mensaje, tipo = 'info', accion = null) {
  const container = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast toast--${tipo}`;

  const ico = document.createElement('span');
  ico.className = 'toast-icon';
  ico.innerHTML = svgIcon(TOAST_ICON[tipo] || 'info');
  t.appendChild(ico);

  const span = document.createElement('span');
  span.className = 'toast-msg';
  span.textContent = mensaje;
  t.appendChild(span);

  if (accion && typeof accion.onClick === 'function') {
    t.classList.add('toast--action');
    const btn = document.createElement('button');
    btn.className = 'toast-btn';
    btn.innerHTML = `${svgIcon('undo')}<span>${accion.label || 'Deshacer'}</span>`;
    btn.addEventListener('click', () => {
      accion.onClick();
      t.remove();
    });
    t.appendChild(btn);
  }

  container.appendChild(t);

  const vida = accion ? 6000 : 3000;
  setTimeout(() => {
    t.classList.add('toast-exit');
    t.addEventListener('animationend', () => t.remove(), { once: true });
  }, vida);
}

/* ═══════════════════════ BÚSQUEDA ═════════════════════════ */
let debounceTimer = null;
function onSearch(e) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    filtroTexto = e.target.value;
    render();
  }, 200);
}

/* ═══════════════════════ EXPORT / IMPORT ══════════════════ */
function exportarJSON() {
  if (estudiantes.length === 0) { toast('No hay datos para exportar', 'info'); return; }
  const json = JSON.stringify(estudiantes, null, 2);
  descargarBlob(new Blob([json], { type: 'application/json' }), `panel-atencion-${hoyISO()}.json`);
  toast('Exportado como JSON ✓', 'success');
}

function exportarCSV() {
  if (estudiantes.length === 0) { toast('No hay datos para exportar', 'info'); return; }
  const cols  = ['Nombre', 'Fecha', 'Curso', 'Estado', 'Observaciones', 'Creado'];
  const filas = estudiantes.map(e => [
    csvVal(e.nombre),
    csvVal(formatDate(e.fecha)),
    csvVal(e.curso),
    csvVal(e.estado.charAt(0).toUpperCase() + e.estado.slice(1)),
    csvVal(e.observaciones || ''),
    csvVal(e.creadoEn ? e.creadoEn.split('T')[0] : ''),
  ]);
  const contenido = [cols, ...filas].map(r => r.join(',')).join('\r\n');
  // BOM para que Excel abra bien los tildes
  const bom  = '\uFEFF';
  descargarBlob(new Blob([bom + contenido], { type: 'text/csv;charset=utf-8;' }), `panel-atencion-${hoyISO()}.csv`);
  toast('Exportado como CSV ✓ (abre en Excel)', 'success');
}

function csvVal(v) {
  const s = String(v ?? '');
  // Escapar comillas y envolver si contiene coma/salto
  return (s.includes(',') || s.includes('"') || s.includes('\n'))
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

function descargarBlob(blob, nombre) {
  const url = URL.createObjectURL(blob);
  const a   = Object.assign(document.createElement('a'), { href: url, download: nombre });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Menú de exportación flotante
function toggleExportMenu() {
  let menu = document.getElementById('export-menu');
  if (menu) { menu.remove(); return; }
  menu = document.createElement('div');
  menu.id        = 'export-menu';
  menu.className = 'export-menu';
  menu.setAttribute('role', 'menu');
  menu.innerHTML = `
    <button class="export-menu-item" id="exp-json" role="menuitem">
      ${svgIcon('download')} Descargar JSON
    </button>
    <button class="export-menu-item" id="exp-csv" role="menuitem">
      ${svgIcon('download')} Descargar CSV (Excel)
    </button>
  `;
  const btn = document.getElementById('btn-export');
  btn.parentElement.style.position = 'relative';
  btn.parentElement.appendChild(menu);
  menu.querySelector('#exp-json').addEventListener('click', () => { exportarJSON(); menu.remove(); });
  menu.querySelector('#exp-csv').addEventListener('click',  () => { exportarCSV();  menu.remove(); });
  // Cerrar al hacer clic fuera
  setTimeout(() => {
    document.addEventListener('click', function handler(e) {
      if (!menu.contains(e.target) && e.target !== btn) { menu.remove(); }
      document.removeEventListener('click', handler);
    });
  }, 0);
}

/* ─── Barra de progreso de atención ─────────────────────────── */
function actualizarProgreso() {
  const total     = estudiantes.length;
  const atendidos = estudiantes.filter(e => e.estado === 'atendido').length;
  const pct       = total === 0 ? 0 : Math.round((atendidos / total) * 100);

  let barra = document.getElementById('progress-bar-fill');
  let label = document.getElementById('progress-label');
  if (!barra || !label) return;
  barra.style.width    = `${pct}%`;
  label.textContent    = total === 0 ? '' : `${pct}% atendidos`;
  barra.setAttribute('aria-valuenow', pct);
}

function esEstudianteValido(e) {
  return e && typeof e === 'object' &&
    typeof e.nombre === 'string' && e.nombre.trim() &&
    typeof e.fecha  === 'string' &&
    typeof e.curso  === 'string' &&
    ESTADOS.includes(e.estado);
}

function importarDatos(file) {
  const reader = new FileReader();
  reader.onload = () => {
    let datos;
    try {
      datos = JSON.parse(reader.result);
    } catch {
      toast('El archivo no es un JSON válido', 'danger');
      return;
    }
    if (!Array.isArray(datos)) {
      toast('Formato no reconocido (se esperaba una lista)', 'danger');
      return;
    }

    let nuevos = 0, actualizados = 0, descartados = 0;
    datos.forEach(item => {
      if (!esEstudianteValido(item)) { descartados++; return; }
      const reg = {
        id:            item.id || uid(),
        nombre:        item.nombre.trim(),
        fecha:         item.fecha,
        curso:         item.curso.trim(),
        estado:        item.estado,
        observaciones: typeof item.observaciones === 'string' ? item.observaciones.trim() : '',
        creadoEn:      item.creadoEn || new Date().toISOString(),
        actualizadoEn: new Date().toISOString(),
      };
      const existente = estudiantes.find(e => e.id === reg.id);
      if (existente) {
        Object.assign(existente, reg);
        actualizados++;
      } else {
        estudiantes.push(reg);
        nuevos++;
      }
    });

    guardar();
    render();
    const extra = descartados ? ` · ${descartados} descartados` : '';
    toast(`${nuevos} importados, ${actualizados} actualizados${extra}`,
          nuevos || actualizados ? 'success' : 'info');
  };
  reader.onerror = () => toast('No se pudo leer el archivo', 'danger');
  reader.readAsText(file);
}

/* ═══════════════════════ TEMA (claro/oscuro) ══════════════ */
function aplicarTema(tema) {
  document.documentElement.setAttribute('data-theme', tema);
  const btn = document.getElementById('btn-tema');
  if (btn) {
    btn.innerHTML = svgIcon(tema === 'dark' ? 'sun' : 'moon');
    btn.setAttribute('aria-label', tema === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
  }
}

function initTema() {
  let tema = localStorage.getItem(THEME_KEY);
  if (!tema) {
    tema = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  aplicarTema(tema);
}

function toggleTema() {
  const actual = document.documentElement.getAttribute('data-theme');
  const nuevo  = actual === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, nuevo);
  aplicarTema(nuevo);
}

/* ═══════════════════════ DRAG & DROP ══════════════════════ */
function onDragStart(e) {
  const card = e.target.closest('.card');
  if (!card) return;
  arrastrandoId = card.dataset.id;
  card.classList.add('card--dragging');
  e.dataTransfer.effectAllowed = 'move';
  try { e.dataTransfer.setData('text/plain', arrastrandoId); } catch {}
}

function onDragEnd(e) {
  const card = e.target.closest('.card');
  if (card) card.classList.remove('card--dragging');
  document.querySelectorAll('.column-body.drop-target')
    .forEach(c => c.classList.remove('drop-target'));
  arrastrandoId = null;
}

function estadoDeColumna(colBody) {
  return ESTADOS.find(es => colBody.id === `col-${es}`) || null;
}

function initDragAndDrop() {
  ESTADOS.forEach(estado => {
    const col = document.getElementById(`col-${estado}`);
    col.addEventListener('dragover', e => {
      if (!arrastrandoId) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      col.classList.add('drop-target');
    });
    col.addEventListener('dragleave', e => {
      if (!col.contains(e.relatedTarget)) col.classList.remove('drop-target');
    });
    col.addEventListener('drop', e => {
      e.preventDefault();
      col.classList.remove('drop-target');
      const destino = estadoDeColumna(col);
      if (arrastrandoId && destino) cambiarEstado(arrastrandoId, destino);
    });
  });
}

/* ═══════════════════════ DELEGACIÓN TABLERO ═══════════════ */
function onBoardClick(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const card = btn.closest('.card');
  if (!card) return;
  const id = card.dataset.id;

  switch (btn.dataset.action) {
    case 'edit':       abrirEditar(id); break;
    case 'delete':     confirmarEliminar(id); break;
    case 'move':       cambiarEstado(id, btn.dataset.to); break;
    case 'toggle-obs': toggleObs(btn); break;
  }
}

function onBoardKeydown(e) {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const btn = e.target.closest('[data-action="toggle-obs"]');
  if (!btn) return;
  e.preventDefault();
  toggleObs(btn);
}

/* ═══════════════════════ INIT ═════════════════════════════ */
function init() {
  initTema();
  cargar();

  // Botón nuevo
  document.getElementById('btn-nuevo').addEventListener('click', abrirNuevo);

  // Tema
  document.getElementById('btn-tema').addEventListener('click', toggleTema);

  // Export / Import
  document.getElementById('btn-export').addEventListener('click', toggleExportMenu);
  document.getElementById('btn-import').addEventListener('click', () =>
    document.getElementById('import-file').click());
  document.getElementById('import-file').addEventListener('change', e => {
    if (e.target.files[0]) importarDatos(e.target.files[0]);
    e.target.value = '';
  });

  // Form submit
  document.getElementById('student-form').addEventListener('submit', guardarEstudiante);

  // Cerrar modal
  document.getElementById('modal-close').addEventListener('click', cerrarModal);
  document.getElementById('btn-cancelar').addEventListener('click', cerrarModal);
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target.id === 'modal-overlay') cerrarModal();
  });

  // Confirm dialog
  document.getElementById('confirm-cancel').addEventListener('click', () => {
    cerrarOverlay('confirm-overlay');
    eliminandoId = null;
  });
  document.getElementById('confirm-ok').addEventListener('click', () => {
    cerrarOverlay('confirm-overlay');
    if (eliminandoId) {
      eliminar(eliminandoId);
      eliminandoId = null;
    }
  });
  document.getElementById('confirm-overlay').addEventListener('click', e => {
    if (e.target.id === 'confirm-overlay') {
      cerrarOverlay('confirm-overlay');
      eliminandoId = null;
    }
  });

  // Búsqueda
  document.getElementById('search-input').addEventListener('input', onSearch);

  // Delegación del tablero (clicks, teclado, drag & drop)
  const board = document.getElementById('board');
  board.addEventListener('click', onBoardClick);
  board.addEventListener('keydown', onBoardKeydown);
  board.addEventListener('dragstart', onDragStart);
  board.addEventListener('dragend', onDragEnd);
  initDragAndDrop();

  // Teclado global: Escape cierra el overlay superior; Tab queda atrapado
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const overlay = overlayAbierto();
      if (overlay === document.getElementById('confirm-overlay')) {
        cerrarOverlay('confirm-overlay');
        eliminandoId = null;
      } else if (overlay) {
        cerrarModal();
      }
    } else if (e.key === 'Tab') {
      atraparFoco(e);
    }
  });

  // Semilla de ejemplos: solo la primera vez (no reaparece si se borra todo)
  if (estudiantes.length === 0 && !localStorage.getItem(SEED_KEY)) {
    cargarEjemplos();
  }

  render();
  actualizarProgreso();
}

function cargarEjemplos() {
  const hoy    = new Date();
  const ayer   = new Date(hoy); ayer.setDate(ayer.getDate() - 1);
  const manana = new Date(hoy); manana.setDate(manana.getDate() + 1);

  const fmt = d => d.toISOString().split('T')[0];

  estudiantes = [
    {
      id: uid(), nombre: 'María González', fecha: fmt(manana),
      curso: 'Matemáticas', estado: 'programado',
      observaciones: 'Necesita refuerzo en álgebra.',
      creadoEn: new Date().toISOString(), actualizadoEn: new Date().toISOString(),
    },
    {
      id: uid(), nombre: 'Carlos Pérez', fecha: fmt(hoy),
      curso: 'Historia', estado: 'programado',
      observaciones: '',
      creadoEn: new Date().toISOString(), actualizadoEn: new Date().toISOString(),
    },
    {
      id: uid(), nombre: 'Laura Martínez', fecha: fmt(hoy),
      curso: 'Ciencias', estado: 'pendiente',
      observaciones: 'Tiene dudas sobre el experimento de la semana pasada.',
      creadoEn: new Date().toISOString(), actualizadoEn: new Date().toISOString(),
    },
    {
      id: uid(), nombre: 'Andrés López', fecha: fmt(ayer),
      curso: 'Lengua', estado: 'atendido',
      observaciones: 'Sesión muy productiva. Mejoró su comprensión lectora.',
      creadoEn: new Date().toISOString(), actualizadoEn: new Date().toISOString(),
    },
  ];

  guardar();
  localStorage.setItem(SEED_KEY, '1');
}

document.addEventListener('DOMContentLoaded', init);
