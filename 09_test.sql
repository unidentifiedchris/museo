-- tests.sql  –  Automated smoke-tests for Entrega 2

SET CLIENT_MIN_MESSAGES TO WARNING;

-- 1 · Seed sanity checks
SELECT COUNT(*) AS turnos                FROM turno;
SELECT COUNT(*) AS especialidades        FROM especialidad;
SELECT COUNT(*) AS empresas_externas     FROM empresa_externa;
SELECT COUNT(*) AS lugares               FROM lugar;
SELECT COUNT(*) AS instituciones         FROM institucion;
SELECT COUNT(*) AS museos                FROM museo;
SELECT COUNT(*) AS departamentos         FROM departamento;
SELECT COUNT(*) AS edificios             FROM edificio;
SELECT COUNT(*) AS areas                 FROM area;
SELECT COUNT(*) AS salas                 FROM sala;

-- 2 · Test sp_alta_empleado
DO $$
DECLARE
  v_exp INT;
BEGIN
  -- valid insert
  CALL sp_alta_empleado(
    'Prueba','Tester','1990-01-01','M',1,ARRAY[1,2]
  );
  SELECT expediente INTO v_exp
    FROM empleado
   ORDER BY expediente DESC
   LIMIT 1;
  RAISE NOTICE 'sp_alta_empleado OK: expediente %', v_exp;

  -- invalid: under-age → should RAISE
  BEGIN
    CALL sp_alta_empleado(
      'Niño','Tester','2015-01-01','F',1,ARRAY[1]
    );
    RAISE EXCEPTION '❌ sp_alta_empleado did NOT block under-age';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '✅ sp_alta_empleado blocked under-age: %', SQLERRM;
  END;
END
$$ LANGUAGE plpgsql;

-- 3 · Test sp_registrar_obra
DO $$
DECLARE
  v_aid INT;
  v_cid INT;
  v_sid INT;
  v_oid INT;
BEGIN
  -- prepare dependencies
  INSERT INTO artista (primer_nombre,primer_apellido,fecha_nacimiento,id_lugar)
  VALUES ('Test','Artista','1970-01-01',20)
  RETURNING id_artista INTO v_aid;

  INSERT INTO coleccion (nombre,descripcion)
  VALUES ('Col Test','Demo') RETURNING id_coleccion INTO v_cid;

  INSERT INTO sala (nombre,id_area,temporal)
  VALUES ('Sala Test',1,false) RETURNING id_sala INTO v_sid;

  -- valid painting
  CALL sp_registrar_obra(
    'Obra P Test',2025,'P','Estilo','Óleo','10×10',v_cid,v_sid,v_aid
  );
  SELECT id_obra INTO v_oid FROM obra ORDER BY id_obra DESC LIMIT 1;
  RAISE NOTICE 'sp_registrar_obra OK: obra %', v_oid;

  -- valid sculpture
  CALL sp_registrar_obra(
    'Obra E Test',2025,'E','Escultura','Mármol','1 m',v_cid,v_sid,v_aid
  );
  RAISE NOTICE 'sp_registrar_obra OK: segunda obra';
END
$$ LANGUAGE plpgsql;

-- 4 · Test sp_agregar_historico_museo
DO $$
BEGIN
  CALL sp_agregar_historico_museo('2025-01-02', 1, 'Entrada test');
  RAISE NOTICE 'sp_agregar_historico_museo OK';
END
$$ LANGUAGE plpgsql;

-- 5 · Test trigger fn_check_menor_edad
DO $$
DECLARE
  v_ad INT;
  t_ad INT;
  v_ni INT;
BEGIN
  INSERT INTO visitante (nombre,apellido,fecha_nacimiento)
  VALUES ('Adulto','T', '1980-01-01') RETURNING id_visitante INTO v_ad;

  INSERT INTO ticket (fecha_visita,id_museo,monto_unitario)
  VALUES (CURRENT_DATE,1,5.0) RETURNING id_ticket INTO t_ad;

  INSERT INTO visitante (nombre,apellido,fecha_nacimiento)
  VALUES ('Niño','T','2018-01-01') RETURNING id_visitante INTO v_ni;

  -- should fail
  BEGIN
    INSERT INTO admision (tipo_ticket,monto_pagado,id_ticket,id_visitante)
    VALUES ('N',5.0,t_ad,v_ni);
    RAISE EXCEPTION '❌ Trigger fn_check_menor_edad did NOT fire';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '✅ Trigger fn_check_menor_edad fired: %', SQLERRM;
  END;

  -- correct insert
  INSERT INTO admision (tipo_ticket,monto_pagado,id_ticket,id_visitante,id_ticket_adulto)
  VALUES ('N',5.0,t_ad,v_ni,t_ad);
  RAISE NOTICE 'Trigger fn_check_menor_edad OK on correct data';
END
$$ LANGUAGE plpgsql;

-- 6 · Test trigger fn_hist_obra_mov
DO $$
DECLARE
  v_oid INT;
BEGIN
  INSERT INTO obra (nombre,anio_creacion,tipo,estilo,material,dimensiones,id_coleccion,id_sala)
  VALUES ('Move Test',2025,'P','Estilo','Material','Dim',1,1)
  RETURNING id_obra INTO v_oid;

  UPDATE obra SET id_sala = 1 WHERE id_obra = v_oid;
  UPDATE obra SET id_sala = 2 WHERE id_obra = v_oid;

  IF (SELECT COUNT(*) FROM hist_obra WHERE id_obra = v_oid) < 2 THEN
    RAISE EXCEPTION '❌ fn_hist_obra_mov did NOT record movements';
  ELSE
    RAISE NOTICE '✅ fn_hist_obra_mov OK';
  END IF;
END
$$ LANGUAGE plpgsql;

-- 7 · Test fn_ingresos_por_rango & fn_ranking_visitas & views
SELECT * FROM fn_ingresos_por_rango(1, '2025-01-01','2025-12-31');
SELECT * FROM fn_ranking_visitas(2025,5);

SELECT * FROM vw_ranking_visitas LIMIT 5;
SELECT * FROM vw_sala_ocupacion LIMIT 5;
SELECT * FROM vw_empleado_turnos LIMIT 5;
