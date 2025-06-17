// EmpleadoList.jsx – listado reactivo de empleados (turnos visibles)

import React, { useState, useEffect, useCallback } from 'react';

/* util: convierte "{M,T,N}" -> ['M','T','N'] */
const parseTurnos = t => {
  if (Array.isArray(t)) return t;
  if (typeof t === 'string' && t.startsWith('{') && t.endsWith('}')) {
    return t
      .slice(1, -1)                 // quitar llaves
      .split(',')                   // separar
      .map(s => s.replace(/^"|"$/g, '')); // quitar comillas dobles si existen
  }
  return [];
};

export default function EmpleadoList() {
  const [emps, setEmps] = useState([]);

  /* ---------- cargar desde API ---------- */
  const load = useCallback(() => {
    fetch('/api/empleados')
      .then(r => r.json())
      .then(data =>
        setEmps(
          data.map(e => ({
            ...e,
            turnos: parseTurnos(e.turnos)
          }))
        )
      )
      .catch(console.error);
  }, []);

  /* primera carga + refrescos desde EmpleadoForm */
  useEffect(() => {
    load();
    const h = () => load();
    window.addEventListener('empleadoAdded', h);
    return () => window.removeEventListener('empleadoAdded', h);
  }, [load]);

  return (
    <div className="list-container">
      <h2>Empleados Registrados</h2>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Depto</th>
            <th>Nac.</th>
            <th>Ingreso</th>
            <th>Turnos</th>
          </tr>
        </thead>

        <tbody>
          {emps.map(e => (
            <tr key={e.expediente}>
              <td>{e.expediente}</td>
              <td>{e.nombre_completo}</td>
              <td>{e.departamento}</td>
              <td>{e.fecha_nacimiento}</td>
              <td>{e.fecha_ingreso}</td>
              <td>{e.turnos.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
