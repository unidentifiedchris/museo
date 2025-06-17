// src/Itinerario.jsx
import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';

export default function Itinerario() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/api/itinerario')
      .then(r => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  const exportPDF = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    let y = 40, m = 40;
    doc.setFontSize(18);
    doc.text('Itinerario de Visita', 300, y, { align: 'center' });
    y += 30; doc.setFontSize(12);

    data.forEach(col => {
      if (y > 750) { doc.addPage(); y = 40; }
      // Título de colección
      doc.setFontSize(14);
      doc.text(`Colección: ${col.coleccion}`, m, y);
      y += 20;
      doc.setFontSize(12);
      // Lista de obras
      col.obras.forEach(o => {
        if (y > 750) { doc.addPage(); y = 40; }
        doc.text(`• [${o.id_obra}] ${o.titulo} (${o.anio_creacion})`, m + 10, y);
        y += 16;
      });
      y += 12;
    });

    doc.save('Itinerario_Visita.pdf');
  };

  return (
    <div>
      <button
        className="btn-submit"
        disabled={data.length === 0}
        onClick={exportPDF}
      >
        📄 Exportar Itinerario PDF
      </button>
    </div>
  );
}
