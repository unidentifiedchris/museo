-- ───────────────────────────────────────────────────────────────
-- 08_views.sql  –  Vistas para reportes y formularios
-- ───────────────────────────────────────────────────────────────
SET search_path = public;
SET client_min_messages TO warning;

-------------------------------------------------------------------------------
-- vw_ranking_visitas  (museo, año, visitas)
-------------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_ranking_visitas AS
SELECT t.id_museo
     , date_part('year', t.fecha_visita)::INT AS anio
     , COUNT(*) AS total_visitas
FROM ticket t
GROUP BY t.id_museo, anio
ORDER BY anio, total_visitas DESC;

-------------------------------------------------------------------------------
-- vw_sala_ocupacion  (sala, # obras, temporalidad)
-------------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_sala_ocupacion AS
SELECT s.id_sala
     , s.nombre      AS sala
     , COUNT(o.id_obra) AS obras_presentes
     , bool_or(s.temporal) AS alguna_temporal
FROM sala s
LEFT JOIN obra o ON o.id_sala = s.id_sala
GROUP BY s.id_sala, s.nombre;

-------------------------------------------------------------------------------
-- vw_empleado_turnos  (empleado ↔ turnos)
-------------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_empleado_turnos AS
SELECT e.expediente
     , e.primer_nombre || ' ' || e.primer_apellido AS empleado
     , array_agg(t.tipo ORDER BY t.hora_inicio)         AS turnos
FROM empleado e
JOIN empleado_turno et ON et.expediente = e.expediente
JOIN turno t          ON t.id_turno   = et.id_turno
GROUP BY e.expediente, empleado;

CREATE VIEW vw_pintura_movimiento AS
SELECT
  o.id_obra,
  o.nombre       AS pintura_nombre,
  o.año_creacion,
  o.valor,
  o.tipo         AS pintura_tipo,
  s.nombre       AS sala_actual,
  h.fecha_inicio AS mov_fecha_inicio,
  h.fecha_fin_mov AS mov_fecha_fin
FROM obra o
JOIN sala s
  ON o.id_sala = s.id_sala
LEFT JOIN hist_obra h
  ON o.id_obra = h.id_obra
WHERE o.tipo = 'Pintura'
ORDER BY o.id_obra, h.fecha_inicio;


CREATE VIEW vw_ficha_pintura AS
SELECT
  p.id_obra,
  p.nombre               AS titulo,
  p.año_creacion,
  p.valor,
  p.estilo,
  p.material,
  p.dimensiones,
  p.descripcion          AS obra_descripcion,
  c.nombre               AS coleccion,
  m.nombre               AS museo,
  ciu.nombre             AS ciudad,
  ar.primer_nombre || ' ' || COALESCE(ar.segundo_nombre||' ','')
    || ar.primer_apellido || ' ' || COALESCE(ar.segundo_apellido,'')
    AS artista_nombre,
  ARRAY_AGG(distinct concat(hm.mov_fecha_inicio,'→',coalesce(hm.mov_fecha_fin,'HOY')))
    FILTER (WHERE hm.mov_fecha_inicio IS NOT NULL)
    AS historial_movimientos
FROM obra p
LEFT JOIN obra_artista oa
  ON p.id_obra = oa.id_obra
LEFT JOIN artista ar
  ON oa.id_artista = ar.id_artista
LEFT JOIN coleccion col
  ON p.id_coleccion = col.id_coleccion
LEFT JOIN museo m
  ON col.id_museo = m.id_museo
LEFT JOIN lugar ciu
  ON m.id_lugar = ciu.id_lugar
LEFT JOIN (
  SELECT 
    id_obra, fecha_inicio AS mov_fecha_inicio,
    fecha_fin_mov AS mov_fecha_fin
  FROM hist_obra
) hm
  ON p.id_obra = hm.id_obra
WHERE p.tipo = 'Pintura'
GROUP BY
  p.id_obra, p.nombre, p.año_creacion, p.valor, p.estilo,
  p.material, p.dimensiones, p.descripcion,
  c.nombre, m.nombre, ciu.nombre, artista_nombre;
