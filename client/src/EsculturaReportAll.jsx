// src/PinturaReportAll.jsx
import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';

export default function PinturaReportAll() {
  const [list, setList] = useState([]);

  useEffect(() => {
    fetch('/api/obras?tipo=E')
      .then(r=>r.json())
      .then(setList)
      .catch(console.error);
  }, []);

  const exportAll = () => {
    const doc = new jsPDF({ unit:'pt', format:'letter' });
    let y = 40;
    doc.setFontSize(16);
    doc.text('Listado de Pinturas', 210, y, { align:'center' });
    y += 30;
    doc.setFontSize(12);

    // Cabecera de tabla
    const cols = ['ID','Título','Año','Estilo','Colección','Autores'];
    const colWidths = [30, 120, 40, 80, 150, 120];
    let x = 40;
    cols.forEach((h,i)=> { doc.text(h, x, y); x += colWidths[i]; });
    y += 20;

    list.forEach((o,idx) => {
      if (y > 780) { doc.addPage(); y = 40; }
      x = 40;
      [o.id_obra, o.nombre, o.anio_creacion, o.estilo, o.coleccion, (o.autores||[]).join(', ')]
        .forEach((cell,i) => {
          doc.text(String(cell), x, y, { maxWidth: colWidths[i]-5 });
          x += colWidths[i];
        });
      y += 18;
    });

    doc.save('Listado_Pinturas.pdf');
  };

  return (
    <button className="btn-submit" onClick={exportAll}>
      📄 Exportar listado completo PDF
    </button>
  );
}
