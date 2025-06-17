// index.js – Express + pg backend for Museo Admin API

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const { Pool } = require('pg');

// ─── Configuración y Conexión ────────────────────────────────────────────────

const pool = new Pool();  // Lee PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT

console.log('Conectando a base de datos:', pool.options.database || process.env.PGDATABASE);

pool.connect()
  .then(() => console.log('✔ Connected to Postgres'))
  .catch(err => {
    console.error('❌ DB connection error', err);
    process.exit(1);
  });

const app = express();
app.use(cors());
app.use(express.json());

// ─── CATÁLOGOS BÁSICOS ──────────────────────────────────────────────────────

// departamentos
app.get('/api/departamentos', async (_, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id_departamento, nombre FROM departamento ORDER BY id_departamento'
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/departamentos', err);
    res.status(500).json({ error: err.message });
  }
});

// turnos
app.get('/api/turnos', async (_, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id_turno, tipo, hora_inicio, hora_fin FROM turno ORDER BY id_turno'
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/turnos', err);
    res.status(500).json({ error: err.message });
  }
});

// especialidades
app.get('/api/especialidades', async (_, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id_especialidad, nombre FROM especialidad ORDER BY id_especialidad'
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/especialidades', err);
    res.status(500).json({ error: err.message });
  }
});

// colecciones (para pinturas y esculturas)
app.get('/api/colecciones', async (_, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id_coleccion, nombre FROM coleccion ORDER BY id_coleccion'
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/colecciones', err);
    res.status(500).json({ error: err.message });
  }
});

// salas
app.get('/api/salas', async (_, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id_sala, nombre FROM sala ORDER BY id_sala'
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/salas', err);
    res.status(500).json({ error: err.message });
  }
});

// artistas
// GET /api/artistas/:id — ficha de artista + obras con museo/ciudad
app.get('/api/artistas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // 1) Info básica del artista
    const { rows: [art] } = await pool.query(`
      SELECT
        primer_nombre,
        segundo_nombre,
        primer_apellido,
        segundo_apellido,
        fecha_nacimiento,
        fecha_muerte,
        apodo
      FROM artista
      WHERE id_artista = $1
    `, [id]);
    if (!art) {
      return res.status(404).json({ error: 'No existe artista ' + id });
    }

    // 2) (Opcional) Técnicas / estilos
    const { rows: tecn } = await pool.query(`
      SELECT nombre
      FROM especialidad e
      JOIN empleado_especialidad ee ON ee.id_especialidad = e.id_especialidad
      WHERE ee.expediente = $1
    `, [id]);

    // 3) Obras del artista + museo y ciudad
    const { rows: obras } = await pool.query(`
      SELECT
        o.id_obra,
        o.nombre        AS titulo,
        o.anio_creacion,
        c.nombre        AS coleccion,
        mu.nombre       AS museo,
        ciu.nombre      AS ciudad
      FROM obra_artista oa
      JOIN obra o        ON o.id_obra     = oa.id_obra
      JOIN coleccion c   ON c.id_coleccion = o.id_coleccion
      JOIN sala s        ON s.id_sala      = o.id_sala
      JOIN area a        ON a.id_area      = s.id_area
      JOIN edificio e    ON e.id_edificio  = a.id_edificio
      JOIN museo mu      ON mu.id_museo    = e.id_museo
      JOIN lugar ciu     ON ciu.id_lugar   = mu.id_lugar
      WHERE oa.id_artista = $1
      ORDER BY o.id_obra;
    `, [id]);

    // 4) Devolver todo
    res.json({
      artista: art,
      tecnicas: tecn.map(r => r.nombre),
      obras
    });

  } catch (err) {
    console.error(`GET /api/artistas/:id error:`, err);
    res.status(500).json({ error: err.message });
  }
});



// ─── EMPLEADOS ────────────────────────────────────────────────────────────────

// listado
app.get('/api/empleados', async (_, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        e.expediente,
        e.primer_nombre || ' ' || COALESCE(e.segundo_nombre||' ','')
          || e.primer_apellido || ' ' || COALESCE(e.segundo_apellido,'') 
          AS nombre_completo,
        e.fecha_nacimiento,
        e.genero,
        e.fecha_ingreso,
        e.telefono,
        e.idioma,
        e.titulo,
        d.nombre AS departamento,
        COALESCE(
          ARRAY_AGG(t.tipo ORDER BY t.hora_inicio)
            FILTER (WHERE t.tipo IS NOT NULL),
          ARRAY[]::text[]
        ) AS turnos
      FROM empleado e
      JOIN departamento d ON d.id_departamento = e.id_departamento
      LEFT JOIN empleado_turno et ON et.expediente = e.expediente
      LEFT JOIN turno t           ON t.id_turno   = et.id_turno
      GROUP BY e.expediente, d.nombre
      ORDER BY e.expediente;
    `);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/empleados', err);
    res.status(500).json({ error: err.message });
  }
});

// alta
app.post('/api/empleados', async (req, res) => {
  const {
    primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
    fecha_nacimiento, genero, fecha_ingreso,
    telefono, idioma, titulo,
    id_departamento, turnos = [], especialidades = []
  } = req.body;

  const client = await pool.connect();
  let expediente;
  try {
    await client.query('BEGIN');

    // insertar empleado
    const { rows } = await client.query(
      `INSERT INTO empleado
         (primer_nombre, segundo_nombre,
          primer_apellido, segundo_apellido,
          fecha_nacimiento, genero,
          fecha_ingreso, telefono,
          idioma, titulo,
          id_departamento)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING expediente`,
      [
        primer_nombre,
        segundo_nombre || null,
        primer_apellido,
        segundo_apellido || null,
        fecha_nacimiento,
        genero,
        fecha_ingreso,
        telefono   || null,
        idioma     || null,
        titulo     || null,
        id_departamento
      ]
    );
    expediente = rows[0].expediente;

    // turnos
    for (const t of turnos) {
      await client.query(
        `INSERT INTO empleado_turno (expediente, id_turno) VALUES ($1,$2)`,
        [expediente, t]
      );
    }
    // especialidades
    for (const s of especialidades) {
      await client.query(
        `INSERT INTO empleado_especialidad (expediente, id_especialidad) VALUES ($1,$2)`,
        [expediente, s]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /api/empleados', err);
    return res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }

  // re‐fetch para devolver al cliente
  try {
    const { rows } = await pool.query(`
      SELECT 
        e.expediente,
        e.primer_nombre || ' ' || COALESCE(e.segundo_nombre||' ','')
          || e.primer_apellido || ' ' || COALESCE(e.segundo_apellido,'') 
          AS nombre_completo,
        e.fecha_nacimiento,
        e.genero,
        e.fecha_ingreso,
        e.telefono,
        e.idioma,
        e.titulo,
        d.nombre AS departamento,
        COALESCE(
          ARRAY_AGG(t.tipo ORDER BY t.hora_inicio)
            FILTER (WHERE t.tipo IS NOT NULL),
          ARRAY[]::text[]
        ) AS turnos
      FROM empleado e
      JOIN departamento d ON d.id_departamento = e.id_departamento
      LEFT JOIN empleado_turno et ON et.expediente = e.expediente
      LEFT JOIN turno t           ON t.id_turno   = et.id_turno
      WHERE e.expediente = $1
      GROUP BY e.expediente, d.nombre;
    `, [expediente]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Re-fetch empleado', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── OBRAS (PINTURAS + ESCULTURAS + ALIASES) ────────────────────────────────

// insertar obra (tanto P como E)
app.post('/api/obras', async (req, res) => {
  const {
    nombre, anio_creacion, tipo,
    estilo, material, dimensiones,
    id_coleccion, id_sala, id_artista
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO obra
         (nombre, anio_creacion, tipo,
          estilo, material, dimensiones,
          id_coleccion, id_sala)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id_obra`,
      [nombre, anio_creacion, tipo, estilo, material, dimensiones, id_coleccion, id_sala]
    );
    const id_obra = rows[0].id_obra;

    // artista principal
    await client.query(
      `INSERT INTO obra_artista
         (id_obra, id_artista, tipo_autoria)
       VALUES ($1,$2,'Principal')`,
      [id_obra, id_artista]
    );

    await client.query('COMMIT');
    res.status(201).json({ id_obra });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /api/obras', err);
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

// listado genérico
app.get('/api/obras', async (req, res) => {
  const tipo = req.query.tipo || null;
  try {
    const { rows } = await pool.query(`
      SELECT 
        o.id_obra,
        o.nombre,
        o.anio_creacion,
        o.estilo,
        c.nombre AS coleccion,
        ARRAY_AGG(a.primer_nombre || ' ' || a.primer_apellido) AS autores
      FROM obra o
      JOIN coleccion c      ON c.id_coleccion = o.id_coleccion
      JOIN obra_artista oa  ON oa.id_obra      = o.id_obra
      JOIN artista a        ON a.id_artista    = oa.id_artista
      WHERE ($1::dom_tipo_obra IS NULL OR o.tipo = $1::dom_tipo_obra)
      GROUP BY o.id_obra, o.nombre, o.anio_creacion, o.estilo, c.nombre
      ORDER BY o.id_obra;
    `, [tipo]);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/obras', err);
    res.status(500).json({ error: err.message });
  }
});

// “raw” para debug
app.get('/api/obras/raw', async (_, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id_obra,nombre,anio_creacion,tipo,valor_monetario,
             estilo,material,dimensiones,id_coleccion,id_sala
      FROM obra
      WHERE tipo = 'P'
      ORDER BY id_obra
    `);
    console.log('GET /api/obras/raw →', rows.length, 'registros');
    res.json(rows);
  } catch (err) {
    console.error('GET /api/obras/raw', err);
    res.status(500).json({ error: err.message });
  }
});

// alias “pinturas” y “esculturas”
app.get('/api/pinturas',        (req,res) => res.redirect(307, '/api/obras?tipo=P'));
app.get('/api/esculturas',      (req,res) => res.redirect(307, '/api/obras?tipo=E'));

// ficha individual pintura
// GET /api/pinturas/:id
app.get('/api/artistas', async (_, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        id_artista,
        primer_nombre
          || ' '
          || COALESCE(segundo_nombre || ' ', '')
          || primer_apellido
          || COALESCE(' ' || segundo_apellido, '')
        AS nombre
      FROM artista
      ORDER BY primer_apellido, primer_nombre
    `);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/artistas', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/pinturas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT
         id_obra,
         titulo,
         año_creacion,
         valor,
         estilo,
         material,
         dimensiones,
         coleccion,
         museo,
         ciudad,
         artista_nombre,
         historial_movimientos
       FROM vw_ficha_pintura
      WHERE id_obra = $1`,   // tu vista ya filtra solo pinturas
      [id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'No existe pintura ' + id });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/pinturas/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});


// ficha individual escultura
// GET /api/esculturas/:id — ficha individual de escultura con historial de movimientos
app.get('/api/esculturas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT
         o.id_obra,
         o.nombre       AS titulo,
         o.anio_creacion,
         o.valor_monetario AS valor,
         o.estilo,
         o.material,
         o.dimensiones,
         col.nombre     AS coleccion,
         mu.nombre      AS museo,
         ciu.nombre     AS ciudad,
         -- artista principal
         CONCAT(ar.primer_nombre, ' ',
                COALESCE(ar.segundo_nombre||' ', ''),
                ar.primer_apellido,
                COALESCE(' '||ar.segundo_apellido, ''))
                        AS artista_nombre,
         -- array de movimientos
         ARRAY_AGG(
           CASE
             WHEN hm.fecha_fin_mov IS NULL
               THEN to_char(hm.fecha_inicio_mov,'YYYY-MM-DD') || '→HOY'
             ELSE to_char(hm.fecha_inicio_mov,'YYYY-MM-DD')
                  || '→'
                  || to_char(hm.fecha_fin_mov,'YYYY-MM-DD')
           END
           ORDER BY hm.fecha_inicio_mov
         ) FILTER (WHERE hm.fecha_inicio_mov IS NOT NULL)
           AS historial_movimientos
       FROM obra o
       JOIN coleccion col ON col.id_coleccion = o.id_coleccion
       JOIN sala     s   ON s.id_sala       = o.id_sala
       JOIN area     a   ON a.id_area       = s.id_area
       JOIN edificio e   ON e.id_edificio   = a.id_edificio
       JOIN museo    mu  ON mu.id_museo     = e.id_museo
       JOIN lugar    ciu ON ciu.id_lugar    = mu.id_lugar
       LEFT JOIN obra_artista oa ON oa.id_obra = o.id_obra AND oa.tipo_autoria = 'Principal'
       LEFT JOIN artista ar      ON ar.id_artista = oa.id_artista
       LEFT JOIN hist_obra hm    ON hm.id_obra = o.id_obra
       WHERE o.id_obra = $1
         AND o.tipo   = 'E'
       GROUP BY
         o.id_obra, o.nombre, o.anio_creacion, o.valor_monetario,
         o.estilo, o.material, o.dimensiones,
         col.nombre, mu.nombre, ciu.nombre,
         ar.primer_nombre, ar.segundo_nombre,
         ar.primer_apellido, ar.segundo_apellido
    `, [id]);

    if (!rows[0]) {
      return res.status(404).json({ error: `No existe escultura con id ${id}` });
    }
    res.json(rows[0]);

  } catch (err) {
    console.error(`GET /api/esculturas/:id error:`, err);
    res.status(500).json({ error: err.message });
  }
});


// ficha artista + técnicas + obras
app.get('/api/artistas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // info básica
    const { rows: [art] } = await pool.query(`
      SELECT primer_nombre, segundo_nombre,
             primer_apellido, segundo_apellido,
             fecha_nacimiento, fecha_muerte, apodo
        FROM artista
       WHERE id_artista = $1
    `, [id]);
    if (!art) return res.status(404).json({ error: 'No existe artista ' + id });

    // (si quisieras cargar técnicas, adapta esta consulta)
    const { rows: tecn } = await pool.query(`
      SELECT nombre
        FROM especialidad e
        JOIN empleado_especialidad ee ON ee.id_especialidad = e.id_especialidad
       WHERE ee.expediente = $1
    `, [id]);

    // sus obras con museo y ciudad
    const { rows: obras } = await pool.query(`
      SELECT o.id_obra, o.nombre AS titulo, o.anio_creacion,
             c.nombre AS coleccion,
             m.nombre AS museo,
             l.nombre AS ciudad
        FROM obra_artista oa
        JOIN obra o       ON o.id_obra = oa.id_obra
        JOIN coleccion c  ON c.id_coleccion = o.id_coleccion
        JOIN sala s       ON s.id_sala = o.id_sala
        JOIN edificio e   ON e.id_edificio = s.id_edificio
        JOIN museo m      ON m.id_museo = e.id_museo
        JOIN lugar l      ON l.id_lugar = m.id_lugar
       WHERE oa.id_artista = $1
       ORDER BY o.id_obra
    `, [id]);

    res.json({
      artista: art,
      tecnicas: tecn.map(r => r.nombre),
      obras
    });
  } catch (err) {
    console.error('GET /api/artistas/:id', err);
    res.status(500).json({ error: err.message });
  }
});


// GET /api/itinerario — colecciones + obras destacadas
app.get('/api/itinerario', async (_, res) => {
  try {
    // 1. Trae todas las colecciones
    const { rows: colecciones } = await pool.query(`
      SELECT id_coleccion, nombre AS coleccion
        FROM coleccion
       ORDER BY id_coleccion
    `);

    // 2. Para cada colección, sus N obras destacadas (aquí: las 3 últimas por año)
    const result = [];
    for (const col of colecciones) {
      const { rows: obras } = await pool.query(`
        SELECT id_obra, nombre AS titulo, anio_creacion, tipo
          FROM obra
         WHERE id_coleccion = $1
         ORDER BY anio_creacion DESC
         LIMIT 3
      `, [col.id_coleccion]);
      result.push({
        ...col,
        obras
      });
    }

    res.json(result);

  } catch (err) {
    console.error('GET /api/itinerario error:', err);
    res.status(500).json({ error: err.message });
  }
});


// ─── START ──────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`🚀 Backend listening on http://localhost:${PORT}`)
);
