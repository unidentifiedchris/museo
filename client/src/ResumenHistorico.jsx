// src/ResumenHistorico.jsx
import React, { useState, useEffect } from 'react';

export default function ResumenHistorico() {
  const [museos, setMuseos] = useState([]);
  const [sel, setSel]        = useState('');
  const [hist, setHist]      = useState([]);
  const [form, setForm]      = useState({ fecha:'', descripcion:'' });

  useEffect(() => {
    fetch('/api/museos')
      .then(r=>r.json()).then(setMuseos).catch(console.error);
  }, []);

  useEffect(() => {
    if (!sel) return setHist([]);
    fetch(`/api/historial-museo/${sel}`)
      .then(r=>r.json()).then(setHist).catch(console.error);
  }, [sel]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await fetch('/api/historial-museo', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ id_museo:+sel, ...form })
      });
      // refrescar lista
      const res = await fetch(`/api/historial-museo/${sel}`);
      setHist(await res.json());
      setForm({ fecha:'', descripcion:'' });
    } catch (err) {
      alert('Error: '+err.message);
    }
  };

  return (
    <div>
      <label>Museo:
        <select value={sel} onChange={e=>setSel(e.target.value)}>
          <option value="">— Elige —</option>
          {museos.map(m=>(
            <option key={m.id_museo} value={m.id_museo}>{m.nombre}</option>
          ))}
        </select>
      </label>

      {sel && (
        <>
          <h4>Historial existente</h4>
          <ul>
            {hist.map(h=>(
              <li key={h.fecha}>{h.fecha} → {h.descripcion}</li>
            ))}
          </ul>

          <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
            <label>
              Fecha *
              <input
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Descripción *
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                required
              />
            </label>
            <button type="submit" className="btn-submit">
              Agregar Histórico
            </button>
          </form>
        </>
      )}
    </div>
  );
}
