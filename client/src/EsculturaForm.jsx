// src/EsculturaForm.jsx
import React, { useState, useEffect } from 'react';

export default function EsculturaForm() {
  const [colecciones, setColecciones] = useState([]);
  const [salas,        setSalas]       = useState([]);
  const [artistas,     setArtistas]    = useState([]);
  const [form, setForm] = useState({
    nombre:'', anio_creacion:'', estilo:'', material:'', dimensiones:'',
    id_coleccion:'', id_sala:'', id_artista:''
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/colecciones').then(r=>r.json()),
      fetch('/api/salas').then(r=>r.json()),
      fetch('/api/artistas').then(r=>r.json())
    ]).then(([c,s,a])=>{
      setColecciones(c); setSalas(s); setArtistas(a);
    }).catch(console.error);
  }, []);

  const handleChange = e => {
    const { name,value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if(+form.anio_creacion > new Date().getFullYear())
      return alert('Año de creación no puede ser futuro');

    try {
      const res = await fetch('/api/obras', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ ...form, tipo:'E' })
      });
      if(!res.ok) throw new Error((await res.json()).error || res.statusText);
      alert('Escultura creada ✔');
      window.dispatchEvent(new Event('esculturaAdded'));
      setForm(f=>({ nombre:'', anio_creacion:'', estilo:'', material:'', dimensiones:'',
                    id_coleccion:f.id_coleccion, id_sala:'', id_artista:'' }));
    } catch(err) {
      alert('Error: '+err.message);
    }
  };

  return (
    <form className="emp-form" onSubmit={handleSubmit}>
      <div className="grid-2">
        {/* Los mismos campos que PinturaForm */}
        <label>Nombre *
          <input name="nombre" value={form.nombre}
                 onChange={handleChange} required/>
        </label>
        <label>Año creación *
          <input type="number" name="anio_creacion" min="1000"
                 max={new Date().getFullYear()}
                 value={form.anio_creacion}
                 onChange={handleChange} required/>
        </label>
        <label>Estilo
          <input name="estilo" value={form.estilo}
                 onChange={handleChange}/>
        </label>
        <label>Material
          <input name="material" value={form.material}
                 onChange={handleChange}/>
        </label>
        <label className="full">Dimensiones
          <input name="dimensiones" value={form.dimensiones}
                 onChange={handleChange}
                 placeholder="Ej. 180 cm"/>
        </label>
        <label>Colección *
          <select name="id_coleccion" value={form.id_coleccion}
                  onChange={handleChange} required>
            <option value="">— Elige —</option>
            {colecciones.map(c=>(
              <option key={c.id_coleccion} value={c.id_coleccion}>{c.nombre}</option>
            ))}
          </select>
        </label>
        <label>Sala *
          <select name="id_sala" value={form.id_sala}
                  onChange={handleChange} required>
            <option value="">— Elige —</option>
            {salas.map(s=>(
              <option key={s.id_sala} value={s.id_sala}>{s.nombre}</option>
            ))}
          </select>
        </label>
        <label className="full">Artista principal *
          <select name="id_artista" value={form.id_artista}
                  onChange={handleChange} required>
            <option value="">— Elige —</option>
            {artistas.map(a=>(
              <option key={a.id_artista} value={a.id_artista}>{a.nombre}</option>
            ))}
          </select>
        </label>
      </div>
      <button type="submit" className="btn-submit">Crear Escultura</button>
    </form>
  );
}
