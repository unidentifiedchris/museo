// src/FichaArtista.jsx
import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';

export default function FichaArtista() {
  const [lista, setLista] = useState([]);
  const [sel, setSel] = useState('');
  const [info, setInfo] = useState(null);

  useEffect(() => {
    fetch('/api/artistas')
      .then(r => r.json())
      .then(setLista)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!sel) return setInfo(null);
    fetch(`/api/artistas/${sel}`)
      .then(r => r.json())
      .then(setInfo)
      .catch(console.error);
  }, [sel]);

  const exportPDF = () => {
    if (!info) return;
    const doc = new jsPDF({ unit:'pt', format:'letter' });
    let y = 40, m = 40;

    doc.setFontSize(18);
    doc.text('Ficha de Artista', 300, y, { align:'center' });
    y += 30; doc.setFontSize(12);

    const a = info.artista;
    const nombreFull = [
      a.primer_nombre,
      a.segundo_nombre,
      a.primer_apellido,
      a.segundo_apellido
    ].filter(Boolean).join(' ');
    doc.text(`Nombre: ${nombreFull}`, m, y); y += 18;
    if (a.apodo)     { doc.text(`Apodo: ${a.apodo}`, m, y); y += 18; }
    doc.text(`Nacimiento: ${a.fecha_nacimiento}`, m, y); y += 18;
    if (a.fecha_muerte) { doc.text(`Fallecimiento: ${a.fecha_muerte}`, m, y); y += 18; }

    y += 10;
    doc.setFontSize(14);
    doc.text('Técnicas / Estilos:', m, y); y += 18;
    doc.setFontSize(12);
    doc.text(info.tecnicas.join(', ') || '—', m, y); y += 24;

    doc.setFontSize(14);
    doc.text('Obras del artista:', m, y); y += 18;
    doc.setFontSize(12);
    doc.text('ID | Título | Año | Museo | Ciudad', m, y); y += 16;

    info.obras.forEach(o => {
      if (y > 780) { doc.addPage(); y = 40; }
      doc.text(
        `${o.id_obra} | ${o.titulo} | ${o.anio_creacion} | ${o.museo} | ${o.ciudad}`,
        m, y, { maxWidth: 500 }
      );
      y += 16;
    });

    doc.save(`Ficha_Artista_${sel}.pdf`);
  };

  return (
    <div>
      <label>Elige Artista:
        <select value={sel} onChange={e => setSel(e.target.value)}>
          <option value="">— Ninguno —</option>
          {lista.map(a => (
            <option key={a.id_artista} value={a.id_artista}>
              {a.nombre}
            </option>
          ))}
        </select>
      </label>

      <button
        className="btn-submit"
        disabled={!info}
        onClick={exportPDF}
        style={{ marginLeft:'1rem' }}
      >
        📄 Exportar Ficha PDF
      </button>
    </div>
  );
}
