// Scroll suave para el botón "volver arriba"
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-scroll]');
  if (!btn) return;
  const to = document.querySelector(btn.dataset.scroll);
  if (!to) return;
  e.preventDefault();
  to.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Aviso en consola si faltan los HTML enlazados
['IGA_2023.html','IGA_2024.html'].forEach(path => {
  fetch(path, { method: 'HEAD' })
    .then(r => { if(!r.ok) throw 0; })
    .catch(() => console.warn(`No se encontró ${path}. Crea ese archivo o ajusta el enlace.`));
});

