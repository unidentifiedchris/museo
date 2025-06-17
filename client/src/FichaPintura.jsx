// src/FichaPintura.jsx
import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';

export default function FichaPintura() {
  const [lista, setLista] = useState([]);
  const [selected, setSelected] = useState('');
  const [data, setData] = useState(null);

  // Cargar todas las pinturas
  useEffect(() => {
    fetch('/api/obras?tipo=P')
      .then(r => r.json())
      .then(setLista)
      .catch(console.error);
  }, []);

  // Al cambiar selección, traer ficha
  useEffect(() => {
    if (!selected) return setData(null);
    fetch(`/api/pinturas/${selected}`)
      .then(r => r.json())
      .then(setData)
      .catch(console.error);
  }, [selected]);

  // Generar PDF
  const exportPDF = () => {
    if (!data) return;
    const doc = new jsPDF({ unit:'pt', format:'a4' });
    let y = 40, m = 40;
    doc.setFontSize(18);
    doc.text('Ficha de Pintura', 210, y, { align:'center' });
    y += 30; doc.setFontSize(12);

    // Campos
    const campos = [
      ['ID', data.id_obra],
      ['Título', data.titulo],
      ['Año creación', data.año_creacion],
      ['Estilo', data.estilo],
      ['Material', data.material],
      ['Dimensiones', data.dimensiones],
      ['Valor', data.valor],
      ['Colección', data.coleccion],
      ['Museo', data.museo],
      ['Ciudad', data.ciudad],
      ['Artista', data.artista_nombre],
    ];
    campos.forEach(([label, val]) => {
      doc.text(`${label}:`, m, y);
      doc.text(String(val), m + 120, y);
      y += 18;
    });

    // Historial de movimientos
    y += 10;
    doc.setFontSize(14);
    doc.text('Historial de Movimientos:', m, y);
    y += 18; doc.setFontSize(12);
    data.historial_movimientos.forEach(mov => {
      if (y > 780) { doc.addPage(); y = 40; }
      doc.text(`• ${mov}`, m + 10, y);
      y += 16;
    });

    doc.save(`Ficha_Pintura_${data.id_obra}.pdf`);
  };

  return (
    <div>
      <label>Elige Pintura:
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
        >
          <option value="">— Ninguna —</option>
          {lista.map(o => (
            <option key={o.id_obra} value={o.id_obra}>
              {o.id_obra} – {o.nombre}
            </option>
          ))}
        </select>
      </label>

      <button
        className="btn-submit"
        disabled={!data}
        onClick={exportPDF}
        style={{ marginLeft:'1rem' }}
      >
        📄 Exportar Ficha PDF
      </button>
    </div>
  );
}
