-- Trigger: fn_check_menor_edad / trg_check_menor_edad
CREATE OR REPLACE FUNCTION fn_check_menor_edad()
  RETURNS trigger AS $$
DECLARE
  v_edad INT;
BEGIN
  IF NEW.tipo_ticket = 'N' THEN
    SELECT date_part('year', age(current_date, v.fecha_nacimiento))
      INTO v_edad
      FROM visitante v
     WHERE v.id_visitante = NEW.id_visitante;

    IF v_edad IS NULL OR v_edad >= 12 OR NEW.id_ticket_adulto IS NULL THEN
      RAISE EXCEPTION
        'Regla infantil violada: visitante %, edad %, ticket adulto = %',
        NEW.id_visitante, v_edad, NEW.id_ticket_adulto;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_menor_edad ON admision;
CREATE TRIGGER trg_check_menor_edad
  BEFORE INSERT ON admision
  FOR EACH ROW
  EXECUTE FUNCTION fn_check_menor_edad();

-- Trigger: fn_hist_obra_mov / trg_hist_obra_mov
CREATE OR REPLACE FUNCTION fn_hist_obra_mov()
  RETURNS trigger AS $$
BEGIN
  UPDATE hist_obra
     SET fecha_fin_mov = CURRENT_DATE
   WHERE id_obra = NEW.id_obra
     AND fecha_fin_mov IS NULL;

  INSERT INTO hist_obra (id_obra, fecha_inicio_mov, tipo_movimiento)
  VALUES (NEW.id_obra, CURRENT_DATE, 'Movimiento de sala');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_hist_obra_mov ON obra;
CREATE TRIGGER trg_hist_obra_mov
  AFTER UPDATE OF id_sala ON obra
  FOR EACH ROW
  WHEN (OLD.id_sala IS DISTINCT FROM NEW.id_sala)
  EXECUTE FUNCTION fn_hist_obra_mov();
