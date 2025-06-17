import React, { useState, useEffect } from 'react';

export default function EmpleadoForm() {
  const [departamentos, setDepartamentos] = useState([]);
  const [turnos, setTurnos]               = useState([]);
  const [especialidades, setEspecialidades]= useState([]);
  const [form, setForm] = useState({
    primer_nombre:   '',
    segundo_nombre:  '',
    primer_apellido: '',
    segundo_apellido:'',
    fecha_nacimiento:'',
    genero:          'M',
    fecha_ingreso:   '',
    telefono:        '',
    idioma:          '',
    titulo:          '',
    id_departamento: '',
    turnos:          [],
    especialidades:  []
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/departamentos').then(r=>r.json()),
      fetch('/api/turnos').then(r=>r.json()),
      fetch('/api/especialidades').then(r=>r.json())
    ]).then(([deps, ts, es]) => {
      setDepartamentos(deps);
      setTurnos(ts);
      setEspecialidades(es);
    }).catch(console.error);
  }, []);

  const handleChange = e => {
    const { name, type, value, checked } = e.target;
    setForm(f => {
      if (type === 'checkbox') {
        const arr = new Set(f[name]);
        checked ? arr.add(value) : arr.delete(value);
        return { ...f, [name]: Array.from(arr) };
      }
      return { ...f, [name]: value };
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('/api/empleados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error((await res.json()).error || res.statusText);
      alert('Empleado creado correctamente');
      setForm(f => ({
        primer_nombre:'', segundo_nombre:'', primer_apellido:'',
        segundo_apellido:'', fecha_nacimiento:'', genero:'M',
        fecha_ingreso:'', telefono:'', idioma:'', titulo:'',
        id_departamento: f.id_departamento,
        turnos: [], especialidades: []
      }));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <form className="emp-form" onSubmit={handleSubmit}>
      <div className="grid-2">
        <label>
          Primer nombre *
          <input name="primer_nombre"
                 value={form.primer_nombre}
                 onChange={handleChange}
                 required />
        </label>
        <label>
          Segundo nombre
          <input name="segundo_nombre"
                 value={form.segundo_nombre}
                 onChange={handleChange} />
        </label>
        <label>
          Primer apellido *
          <input name="primer_apellido"
                 value={form.primer_apellido}
                 onChange={handleChange}
                 required />
        </label>
        <label>
          Segundo apellido
          <input name="segundo_apellido"
                 value={form.segundo_apellido}
                 onChange={handleChange} />
        </label>
        <label>
          Fecha nacimiento *
          <input type="date" name="fecha_nacimiento"
                 value={form.fecha_nacimiento}
                 onChange={handleChange}
                 required />
        </label>
        <label>
          Género *
          <select name="genero"
                  value={form.genero}
                  onChange={handleChange}>
            <option value="M">M</option>
            <option value="F">F</option>
          </select>
        </label>
        <label>
          Fecha ingreso *
          <input type="date" name="fecha_ingreso"
                 value={form.fecha_ingreso}
                 onChange={handleChange}
                 required />
        </label>
        <label>
          Teléfono
          <input name="telefono"
                 value={form.telefono}
                 onChange={handleChange} />
        </label>
        <label>
          Idioma
          <input name="idioma"
                 value={form.idioma}
                 onChange={handleChange} />
        </label>
        <label>
          Título
          <input name="titulo"
                 value={form.titulo}
                 onChange={handleChange} />
        </label>
        <label>
          Departamento *
          <select name="id_departamento"
                  value={form.id_departamento}
                  onChange={handleChange}
                  required>
            <option value="">— Elige —</option>
            {departamentos.map(d => (
              <option key={d.id_departamento}
                      value={d.id_departamento}>
                {d.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset>
        <legend>Turnos</legend>
        <div className="inline-list">
          {turnos.map(t => (
            <label key={t.id_turno}>
              <input type="checkbox"
                     name="turnos"
                     value={t.id_turno}
                     checked={form.turnos.includes(String(t.id_turno))}
                     onChange={handleChange} />
              {t.tipo} ({t.hora_inicio}-{t.hora_fin})
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Especialidades</legend>
        <div className="inline-list">
          {especialidades.map(s => (
            <label key={s.id_especialidad}>
              <input type="checkbox"
                     name="especialidades"
                     value={s.id_especialidad}
                     checked={form.especialidades.includes(String(s.id_especialidad))}
                     onChange={handleChange} />
              {s.nombre}
            </label>
          ))}
        </div>
      </fieldset>

      <button type="submit" className="btn-submit">
        Crear Empleado
      </button>
    </form>
  );
}