-- Procedure: sp_alta_empleado
CREATE OR REPLACE PROCEDURE sp_alta_empleado
( p_primer_nombre    TEXT
, p_primer_apellido  TEXT
, p_fecha_nacimiento DATE
, p_genero           enum_genero
, p_id_departamento  INT
, p_turnos           INT[]
, p_segundo_nombre   TEXT    DEFAULT NULL
, p_segundo_apellido TEXT    DEFAULT NULL
, p_fecha_ingreso    DATE    DEFAULT CURRENT_DATE
, p_telefono         TEXT    DEFAULT NULL
, p_idioma           TEXT    DEFAULT NULL
, p_titulo           TEXT    DEFAULT NULL
, p_especialidades   INT[]   DEFAULT '{}'::INT[]
)
LANGUAGE plpgsql AS $$
DECLARE
  v_exp INT;
  i     INT;
BEGIN
  INSERT INTO empleado
    (primer_nombre, segundo_nombre, primer_apellido,
     segundo_apellido, fecha_nacimiento, genero,
     fecha_ingreso, telefono, idioma, titulo, id_departamento)
  VALUES
    (p_primer_nombre, p_segundo_nombre, p_primer_apellido,
     p_segundo_apellido, p_fecha_nacimiento, p_genero,
     p_fecha_ingreso, p_telefono, p_idioma, p_titulo,
     p_id_departamento)
  RETURNING expediente INTO v_exp;

  FOREACH i IN ARRAY p_turnos LOOP
    INSERT INTO empleado_turno (expediente, id_turno)
    VALUES (v_exp, i);
  END LOOP;

  IF array_length(p_especialidades,1) IS NOT NULL THEN
    FOREACH i IN ARRAY p_especialidades LOOP
      INSERT INTO empleado_especialidad (expediente, id_especialidad)
      VALUES (v_exp, i);
    END LOOP;
  END IF;

  INSERT INTO hist_trabajo (expediente, fecha_inicio, cargo)
  VALUES (v_exp, p_fecha_ingreso, 'Ingreso');

  RAISE NOTICE 'Empleado creado: expediente %', v_exp;
END;
$$;

-- Procedure: sp_registrar_obra
CREATE OR REPLACE PROCEDURE sp_registrar_obra
( p_nombre        TEXT
, p_anio_creacion INT
, p_tipo          dom_tipo_obra
, p_estilo        TEXT
, p_material      TEXT
, p_dimensiones   TEXT
, p_id_coleccion  INT
, p_id_sala       INT
, p_principal     INT
)
LANGUAGE plpgsql AS $$
DECLARE
  v_obra INT;
BEGIN
  INSERT INTO obra
    (nombre, anio_creacion, tipo, estilo,
     material, dimensiones, id_coleccion, id_sala)
  VALUES
    (p_nombre, p_anio_creacion, p_tipo, p_estilo,
     p_material, p_dimensiones, p_id_coleccion, p_id_sala)
  RETURNING id_obra INTO v_obra;

  INSERT INTO obra_artista (id_obra, id_artista, tipo_autoria)
  VALUES (v_obra, p_principal, 'Principal');

  INSERT INTO hist_obra (id_obra, fecha_inicio_mov, tipo_movimiento)
  VALUES (v_obra, CURRENT_DATE, 'Ingreso colección');

  RAISE NOTICE 'Obra registrada: % (id %)', p_nombre, v_obra;
END;
$$;

-- Procedure: sp_agregar_historico_museo
CREATE OR REPLACE PROCEDURE sp_agregar_historico_museo
( p_fecha       DATE
, p_id_museo    INT
, p_descripcion TEXT
)
LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO historico_museo (fecha, id_museo, descripcion)
  VALUES (p_fecha, p_id_museo, p_descripcion);
  RAISE NOTICE 'Histórico agregado: museo % fecha %', p_id_museo, p_fecha;
END;
$$;

-- Function: fn_ingresos_por_rango
CREATE OR REPLACE FUNCTION fn_ingresos_por_rango
( p_id_museo     INT
, p_fecha_inicio DATE
, p_fecha_fin    DATE
) RETURNS TABLE(total_admisiones INT, total_monto NUMERIC)
LANGUAGE sql AS $$
  SELECT COUNT(*) AS total_admisiones,
         COALESCE(SUM(a.monto_pagado),0) AS total_monto
    FROM admision a
    JOIN ticket t ON t.id_ticket = a.id_ticket
   WHERE t.id_museo = p_id_museo
     AND t.fecha_visita BETWEEN p_fecha_inicio AND p_fecha_fin;
$$;

-- Function: fn_ranking_visitas
CREATE OR REPLACE FUNCTION fn_ranking_visitas
( p_anio  INT
, p_top_n INT DEFAULT 10
) RETURNS TABLE(id_museo INT, total_visitas INT)
LANGUAGE sql AS $$
  SELECT t.id_museo, COUNT(*) AS total_visitas
    FROM ticket t
   WHERE date_part('year', t.fecha_visita) = p_anio
   GROUP BY t.id_museo
   ORDER BY total_visitas DESC
   LIMIT p_top_n;
$$;
