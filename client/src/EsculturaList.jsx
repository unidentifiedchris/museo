// src/EsculturaList.jsx
import React, { useState, useEffect, useCallback } from 'react';

export default function EsculturaList() {
  const [obras, setObras] = useState([]);

  const load = useCallback(()=> {
    // usa el alias o el querystring
    fetch('/api/esculturas')   
      .then(r=>r.json())
      .then(setObras)
      .catch(console.error);
  },[]);

  useEffect(()=>{
    load();
    const h = ()=>load();
    window.addEventListener('esculturaAdded',h);
    return ()=>window.removeEventListener('esculturaAdded',h);
  },[load]);

  return (
    <div className="list-container">
      <h2>Esculturas Registradas</h2>
      <table>
        <thead>
          <tr><th>ID</th><th>Nombre</th><th>Año</th><th>Estilo</th>
              <th>Colección</th><th>Autores</th></tr>
        </thead>
        <tbody>
          {obras.map(o=>(
            <tr key={o.id_obra}>
              <td>{o.id_obra}</td>
              <td>{o.nombre}</td>
              <td>{o.anio_creacion}</td>
              <td>{o.estilo}</td>
              <td>{o.coleccion}</td>
              <td>{(o.autores||[]).join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
