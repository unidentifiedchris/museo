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

