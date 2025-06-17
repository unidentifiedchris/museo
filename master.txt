/*============================================================
  MASTER – Entrega 2  
  Grupo 7B
  Christopher Acosta
============================================================*/
SET client_min_messages TO warning;
SET standard_conforming_strings = on;
SET search_path = public;

/* 1. Dominios y ENUMs */
CREATE DOMAIN dom_tipo_obra   CHAR(1)  CHECK (VALUE IN ('P','E'));
CREATE DOMAIN dom_tipo_ticket CHAR(1)  CHECK (VALUE IN ('A','E','N'));
CREATE TYPE enum_genero AS ENUM ('F','M','NB');
CREATE TYPE enum_turno  AS ENUM ('M','T','N');     -- mañana/tarde/noche

/* 2. Catálogos básicos */
CREATE TABLE institucion (
    id_institucion SERIAL,
    nombre         VARCHAR(100) NOT NULL,
    CONSTRAINT pk_institucion PRIMARY KEY (id_institucion)
);

CREATE TABLE lugar (
    id_lugar   SERIAL,
    nombre     VARCHAR(100) NOT NULL,
    tipo       VARCHAR(3)   NOT NULL,
    continente CHAR(2)      NOT NULL,
    id_padre   INTEGER,
    CONSTRAINT pk_lugar      PRIMARY KEY (id_lugar),
    CONSTRAINT fk_lugar_padre FOREIGN KEY (id_padre)
              REFERENCES lugar(id_lugar)
);

CREATE TABLE turno (
    id_turno    SERIAL,
    hora_inicio TIME        NOT NULL,
    hora_fin    TIME        NOT NULL,
    tipo        enum_turno  NOT NULL,
    CONSTRAINT pk_turno PRIMARY KEY (id_turno),
    CONSTRAINT ck_turno_horas CHECK (hora_fin > hora_inicio)
);

CREATE TABLE especialidad (
    id_especialidad SERIAL,
    nombre          VARCHAR(60) NOT NULL,
    CONSTRAINT pk_especialidad PRIMARY KEY (id_especialidad),
    CONSTRAINT uq_especialidad_nombre UNIQUE (nombre)
);

CREATE TABLE empresa_externa (
    id_empresa_ext SERIAL,
    nombre         VARCHAR(120) NOT NULL,
    descripcion    TEXT,
    CONSTRAINT pk_empresa_externa PRIMARY KEY (id_empresa_ext)
);

/* 3. Museo & estructura física / orgánica */
CREATE TABLE museo (
    id_museo        SERIAL,
    nombre          VARCHAR(50)  NOT NULL,
    tipo            VARCHAR(30)  NOT NULL,
    fecha_fundacion DATE         NOT NULL,
    mision          VARCHAR(999),
    id_lugar        INTEGER      NOT NULL,
    CONSTRAINT pk_museo        PRIMARY KEY (id_museo),
    CONSTRAINT uq_museo_nombre UNIQUE (nombre),
    CONSTRAINT fk_museo_lugar  FOREIGN KEY (id_lugar)
              REFERENCES lugar(id_lugar)
);

CREATE TABLE historico_museo (
    fecha      DATE    NOT NULL,
    id_museo   INTEGER NOT NULL,
    descripcion TEXT   NOT NULL,
    CONSTRAINT pk_historico_museo PRIMARY KEY (id_museo,fecha),
    CONSTRAINT fk_histmuseo_museo FOREIGN KEY (id_museo)
              REFERENCES museo(id_museo)
);

CREATE TABLE edificio (
    id_edificio SERIAL,
    nombre      VARCHAR(80) NOT NULL,
    id_museo    INTEGER     NOT NULL,
    CONSTRAINT pk_edificio    PRIMARY KEY (id_edificio),
    CONSTRAINT fk_edif_museo  FOREIGN KEY (id_museo)
              REFERENCES museo(id_museo)
);

CREATE TABLE departamento (
    id_departamento SERIAL,
    nombre          VARCHAR(60) NOT NULL,
    tipo            VARCHAR(30) NOT NULL,
    id_museo        INTEGER     NOT NULL,
    CONSTRAINT pk_departamento  PRIMARY KEY (id_departamento),
    CONSTRAINT fk_dep_museo     FOREIGN KEY (id_museo)
              REFERENCES museo(id_museo)
);

CREATE TABLE area (
    id_area     SERIAL,
    nombre      VARCHAR(60) NOT NULL,
    tipo        VARCHAR(30) NOT NULL,
    piso        SMALLINT    NOT NULL,
    id_edificio INTEGER     NOT NULL,
    descripcion TEXT,
    CONSTRAINT pk_area          PRIMARY KEY (id_area),
    CONSTRAINT fk_area_edif     FOREIGN KEY (id_edificio)
              REFERENCES edificio(id_edificio)
);

CREATE TABLE sala (
    id_sala  SERIAL,
    nombre   VARCHAR(60) NOT NULL,
    id_area  INTEGER     NOT NULL,
    temporal BOOLEAN     NOT NULL DEFAULT FALSE,
    descripcion TEXT,
    CONSTRAINT pk_sala       PRIMARY KEY (id_sala),
    CONSTRAINT fk_sala_area  FOREIGN KEY (id_area)
              REFERENCES area(id_area)
);

CREATE TABLE exposicion_especial (
    id_exposicion SERIAL,
    titulo        VARCHAR(120) NOT NULL,
    fecha_inicio  DATE         NOT NULL,
    fecha_fin     DATE,
    id_sala       INTEGER      NOT NULL,
    descripcion   TEXT,
    CONSTRAINT pk_exposicion   PRIMARY KEY (id_exposicion),
    CONSTRAINT fk_expo_sala    FOREIGN KEY (id_sala)
              REFERENCES sala(id_sala),
    CONSTRAINT ck_expo_fechas  CHECK (fecha_fin IS NULL OR fecha_fin > fecha_inicio)
);

/* 4. Artistas, obras y colecciones */
CREATE TABLE artista (
    id_artista          SERIAL,
    primer_nombre       VARCHAR(60) NOT NULL,
    segundo_nombre      VARCHAR(60),
    primer_apellido     VARCHAR(60) NOT NULL,
    segundo_apellido    VARCHAR(60),
    apodo               VARCHAR(60),
    fecha_nacimiento    DATE        NOT NULL,
    fecha_muerte        DATE,
    id_lugar_nacimiento INTEGER     NOT NULL,
    CONSTRAINT pk_artista        PRIMARY KEY (id_artista),
    CONSTRAINT fk_artista_lugar  FOREIGN KEY (id_lugar_nacimiento)
              REFERENCES lugar(id_lugar),
    CONSTRAINT ck_artista_vida   CHECK (fecha_muerte IS NULL OR fecha_muerte > fecha_nacimiento)
);

CREATE TABLE coleccion (
    id_coleccion SERIAL,
    nombre       VARCHAR(120) NOT NULL,
    descripcion  TEXT,
    CONSTRAINT pk_coleccion PRIMARY KEY (id_coleccion),
    CONSTRAINT uq_coleccion_nombre UNIQUE (nombre)
);

CREATE TABLE obra (
    id_obra         SERIAL,
    nombre          VARCHAR(120) NOT NULL,
    anio_creacion   SMALLINT     NOT NULL,
    tipo            dom_tipo_obra NOT NULL,
    valor_monetario NUMERIC(12,2),
    estilo          VARCHAR(60),
    material        VARCHAR(60),
    dimensiones     VARCHAR(60),
    id_coleccion    INTEGER      NOT NULL,
    id_sala         INTEGER      NOT NULL,
    descripcion     TEXT,
    CONSTRAINT pk_obra           PRIMARY KEY (id_obra),
    CONSTRAINT fk_obra_coleccion FOREIGN KEY (id_coleccion)
              REFERENCES coleccion(id_coleccion),
    CONSTRAINT fk_obra_sala      FOREIGN KEY (id_sala)
              REFERENCES sala(id_sala)
);

CREATE TABLE obra_artista (
    id_obra      INTEGER  NOT NULL,
    id_artista   INTEGER  NOT NULL,
    tipo_autoria VARCHAR(30) NOT NULL,
    CONSTRAINT pk_obra_artista PRIMARY KEY (id_obra,id_artista),
    CONSTRAINT fk_oa_obra    FOREIGN KEY (id_obra)    REFERENCES obra(id_obra),
    CONSTRAINT fk_oa_artista FOREIGN KEY (id_artista) REFERENCES artista(id_artista)
);

CREATE TABLE hist_obra (
    id_obra          INTEGER NOT NULL,
    fecha_inicio_mov DATE    NOT NULL,
    fecha_fin_mov    DATE,
    tipo_movimiento  VARCHAR(30) NOT NULL,
    CONSTRAINT pk_hist_obra      PRIMARY KEY (id_obra,fecha_inicio_mov),
    CONSTRAINT fk_histobra_obra  FOREIGN KEY (id_obra)
              REFERENCES obra(id_obra),
    CONSTRAINT ck_histobra_fechas CHECK (fecha_fin_mov IS NULL OR fecha_fin_mov > fecha_inicio_mov)
);

/* 5. Visitantes, tickets, admisión */
CREATE TABLE visitante (
    id_visitante     SERIAL,
    nombre           VARCHAR(60) NOT NULL,
    segundo_nombre   VARCHAR(60),
    apellido         VARCHAR(60) NOT NULL,
    segundo_apellido VARCHAR(60),
    fecha_nacimiento DATE        NOT NULL,
    id_institucion   INTEGER,
    CONSTRAINT pk_visitante        PRIMARY KEY (id_visitante),
    CONSTRAINT fk_visit_institucion FOREIGN KEY (id_institucion)
              REFERENCES institucion(id_institucion)
);

CREATE TABLE ticket (
    id_ticket      SERIAL,
    fecha_visita   DATE         NOT NULL,
    id_museo       INTEGER      NOT NULL,
    monto_unitario NUMERIC(12,2) NOT NULL,
    cantidad       SMALLINT     NOT NULL DEFAULT 1,
    CONSTRAINT pk_ticket       PRIMARY KEY (id_ticket),
    CONSTRAINT fk_ticket_museo FOREIGN KEY (id_museo)
              REFERENCES museo(id_museo)
);

CREATE TABLE admision (
    id_admision      SERIAL,
    tipo_ticket      dom_tipo_ticket NOT NULL,
    monto_pagado     NUMERIC(12,2)   NOT NULL,
    id_ticket        INTEGER         NOT NULL,
    id_visitante     INTEGER         NOT NULL,
    id_ticket_adulto INTEGER,
    CONSTRAINT pk_admision        PRIMARY KEY (id_admision),
    CONSTRAINT fk_adm_ticket      FOREIGN KEY (id_ticket)    REFERENCES ticket(id_ticket),
    CONSTRAINT fk_adm_visitante   FOREIGN KEY (id_visitante) REFERENCES visitante(id_visitante),
    CONSTRAINT fk_adm_ticketadulto FOREIGN KEY (id_ticket_adulto) REFERENCES ticket(id_ticket),
    CONSTRAINT ck_adm_menor CHECK (tipo_ticket <> 'N' OR id_ticket_adulto IS NOT NULL)
);

CREATE TABLE itinerario (
    id_itinerario SERIAL,
    dia          DATE NOT NULL,
    hora_inicio  TIME NOT NULL,
    hora_fin     TIME NOT NULL,
    id_visitante INTEGER NOT NULL,
    id_sala      INTEGER NOT NULL,
    CONSTRAINT pk_itinerario     PRIMARY KEY (id_itinerario),
    CONSTRAINT fk_itin_visitante FOREIGN KEY (id_visitante) REFERENCES visitante(id_visitante),
    CONSTRAINT fk_itin_sala      FOREIGN KEY (id_sala)      REFERENCES sala(id_sala),
    CONSTRAINT ck_itin_horas     CHECK (hora_fin > hora_inicio)
);

/* 6. Empleados y RRHH */
CREATE TABLE empleado (
    expediente       SERIAL,
    primer_nombre    VARCHAR(60) NOT NULL,
    segundo_nombre   VARCHAR(60),
    primer_apellido  VARCHAR(60) NOT NULL,
    segundo_apellido VARCHAR(60),
    fecha_nacimiento DATE        NOT NULL,
    genero           enum_genero NOT NULL,
    fecha_ingreso    DATE        NOT NULL,
    telefono         VARCHAR(30),
    idioma           VARCHAR(60),
    titulo           VARCHAR(60),
    id_departamento  INTEGER     NOT NULL,
    CONSTRAINT pk_empleado        PRIMARY KEY (expediente),
    CONSTRAINT fk_emp_departamento FOREIGN KEY (id_departamento)
              REFERENCES departamento(id_departamento)
);

CREATE TABLE empleado_turno (
    expediente INTEGER NOT NULL,
    id_turno  INTEGER NOT NULL,
    CONSTRAINT pk_empleado_turno PRIMARY KEY (expediente,id_turno),
    CONSTRAINT fk_et_empleado   FOREIGN KEY (expediente) REFERENCES empleado(expediente),
    CONSTRAINT fk_et_turno      FOREIGN KEY (id_turno)   REFERENCES turno(id_turno)
);

CREATE TABLE empleado_especialidad (
    expediente      INTEGER NOT NULL,
    id_especialidad INTEGER NOT NULL,
    CONSTRAINT pk_emp_especialidad PRIMARY KEY (expediente,id_especialidad),
    CONSTRAINT fk_ee_empleado       FOREIGN KEY (expediente)      REFERENCES empleado(expediente),
    CONSTRAINT fk_ee_especialidad   FOREIGN KEY (id_especialidad) REFERENCES especialidad(id_especialidad)
);

CREATE TABLE hist_trabajo (
    expediente     INTEGER NOT NULL,
    fecha_inicio   DATE    NOT NULL,
    cargo          VARCHAR(60) NOT NULL,
    fecha_fin      DATE,
    id_empresa_ext INTEGER,
    CONSTRAINT pk_hist_trabajo    PRIMARY KEY (expediente,fecha_inicio),
    CONSTRAINT fk_ht_empleado     FOREIGN KEY (expediente)    REFERENCES empleado(expediente),
    CONSTRAINT fk_ht_empresaext   FOREIGN KEY (id_empresa_ext) REFERENCES empresa_externa(id_empresa_ext),
    CONSTRAINT ck_ht_fechas       CHECK (fecha_fin IS NULL OR fecha_fin > fecha_inicio)
);

/* 7. Índices secundarios (sobre las FK fuera de la PK) */
CREATE INDEX idx_lugar_padre            ON lugar(id_padre);
CREATE INDEX idx_museo_lugar            ON museo(id_lugar);
CREATE INDEX idx_edif_museo             ON edificio(id_museo);
CREATE INDEX idx_dep_museo              ON departamento(id_museo);
CREATE INDEX idx_area_edif              ON area(id_edificio);
CREATE INDEX idx_sala_area              ON sala(id_area);
CREATE INDEX idx_expo_sala              ON exposicion_especial(id_sala);

CREATE INDEX idx_artista_lugar          ON artista(id_lugar_nacimiento);
CREATE INDEX idx_obra_coleccion         ON obra(id_coleccion);
CREATE INDEX idx_obra_sala              ON obra(id_sala);
CREATE INDEX idx_histobra_obra          ON hist_obra(id_obra);

CREATE INDEX idx_visit_institucion      ON visitante(id_institucion);
CREATE INDEX idx_ticket_museo_fecha     ON ticket(id_museo,fecha_visita);
CREATE INDEX idx_adm_visitante          ON admision(id_visitante);
CREATE INDEX idx_adm_ticket             ON admision(id_ticket);

CREATE INDEX idx_itin_visitante_dia     ON itinerario(id_visitante,dia);

CREATE INDEX idx_emp_departamento       ON empleado(id_departamento);
CREATE INDEX idx_et_turno               ON empleado_turno(id_turno);
CREATE INDEX idx_ee_especialidad        ON empleado_especialidad(id_especialidad);
CREATE INDEX idx_ht_empresaext          ON hist_trabajo(id_empresa_ext);

COMMENT ON COLUMN obra.tipo IS 'dom_tipo_obra: P=pintura, E=escultura';

COMMIT;

/*============================================================
 SEED
============================================================*/

SET search_path = public;
SET client_min_messages TO warning;

BEGIN;
TRUNCATE obra_artista,
         hist_obra,
         obra,
         artista,
         coleccion,
         sala,
         area,
         edificio,
         departamento,
         museo,
         institucion,
         lugar,
         empresa_externa,
         especialidad,
         turno
  RESTART IDENTITY CASCADE;
COMMIT;

-- 1 · CATÁLOGOS
BEGIN;
INSERT INTO turno (hora_inicio, hora_fin, tipo) VALUES
  ('08:00','14:00','M'),
  ('14:00','20:00','T'),
  ('20:00','23:59','N'),
  ('00:00','02:00','N');
INSERT INTO especialidad (nombre) VALUES
  ('Restauración'),('Iluminación'),('Curaduría'),
  ('Conservación'),('Educación'),('Seguridad'),
  ('Logística'),('Soporte TI'),('Marketing');
INSERT INTO empresa_externa (nombre, descripcion) VALUES
  ('ArtMove Logistics','Transporte especializado de obras'),
  ('Safeguard Security','Vigilancia'),
  ('GreenClean Services','Mantenimiento de instalaciones');
COMMIT;

-- 2 · LUGARES
BEGIN;
INSERT INTO lugar (id_lugar,nombre,tipo,continente) VALUES
  (1,'América','P','AM'),
  (2,'Europa','P','EU'),
  (3,'Oceanía','P','OC'),
  (4,'Asia','P','AS');
INSERT INTO lugar (id_lugar,nombre,tipo,continente,id_padre) VALUES
  (10,'New Zealand','P','OC',3),
  (11,'Czech Republic','P','EU',2),
  (12,'Indonesia','P','AS',4),
  (13,'Hungary','P','EU',2);
INSERT INTO lugar (id_lugar,nombre,tipo,continente,id_padre) VALUES
  (20,'Auckland','CIU','OC',10),
  (21,'Wellington','CIU','OC',10),
  (22,'Prague','CIU','EU',11),
  (23,'Brno','CIU','EU',11),
  (24,'Jakarta','CIU','AS',12),
  (25,'Tangerang','CIU','AS',12),
  (26,'Budapest','CIU','EU',13),
  (27,'Szeged','CIU','EU',13);
COMMIT;

-- 3 · INSTITUCIONES
BEGIN;
INSERT INTO institucion (id_institucion,nombre) VALUES
  (1,'Universidad de Auckland'),
  (2,'Charles University Prague'),
  (3,'Universitas Indonesia'),
  (4,'Eötvös Loránd University');
COMMIT;

-- 4 · MUSEOS
BEGIN;
INSERT INTO museo (id_museo,nombre,tipo,fecha_fundacion,id_lugar) VALUES
  (1,'Auckland Art Gallery Toi o Tāmaki','Nacional','1887-08-01',20),
  (2,'Museum of New Zealand Te Papa','Nacional','1992-12-20',21),
  (3,'National Gallery Prague','Nacional','1796-02-05',22),
  (4,'Moravian Gallery Brno','Regional','1961-01-01',23),
  (5,'National Gallery Indonesia','Nacional','1960-03-06',24),
  (6,'Museum MACAN','Privado','2017-11-04',25),
  (7,'Hungarian National Gallery','Nacional','1957-01-01',26),
  (8,'Museum of Fine Arts Budapest','Nacional','1906-12-01',26);
COMMIT;

-- 5 · ESTRUCTURA FÍSICA (un área + sala por museo)
BEGIN;
INSERT INTO departamento (id_departamento,nombre,tipo,id_museo) VALUES
  (1,'Administración','Operativo',1),
  (2,'Administración','Operativo',2),
  (3,'Administración','Operativo',3),
  (4,'Administración','Operativo',4),
  (5,'Administración','Operativo',5),
  (6,'Administración','Operativo',6),
  (7,'Administración','Operativo',7),
  (8,'Administración','Operativo',8);
INSERT INTO edificio (id_edificio,nombre,id_museo) VALUES
  (1,'Edificio Principal',1),
  (2,'Edificio Principal',2),
  (3,'Edificio Principal',3),
  (4,'Edificio Principal',4),
  (5,'Edificio Principal',5),
  (6,'Edificio Principal',6),
  (7,'Edificio Principal',7),
  (8,'Edificio Principal',8);
INSERT INTO area (id_area,nombre,tipo,piso,id_edificio) VALUES
  (1,'Ala Principal','Exhibición',1,1),
  (2,'Ala Principal','Exhibición',1,2),
  (3,'Ala Principal','Exhibición',1,3),
  (4,'Ala Principal','Exhibición',1,4),
  (5,'Ala Principal','Exhibición',1,5),
  (6,'Ala Principal','Exhibición',1,6),
  (7,'Ala Principal','Exhibición',1,7),
  (8,'Ala Principal','Exhibición',1,8);
INSERT INTO sala (id_sala,nombre,id_area,temporal) VALUES
  (1,'Sala 1',1,false),
  (2,'Sala 1',2,false),
  (3,'Sala 1',3,false),
  (4,'Sala 1',4,false),
  (5,'Sala 1',5,false),
  (6,'Sala 1',6,false),
  (7,'Sala 1',7,false),
  (8,'Sala 1',8,false);
COMMIT;

-- 6 · COLECCIONES
BEGIN;
INSERT INTO coleccion (id_coleccion,nombre,descripcion) VALUES
  (1,'Colección Auckland','Permanente'),
  (2,'Colección Te Papa','Permanente'),
  (3,'Colección Prague','Permanente'),
  (4,'Colección Brno','Permanente'),
  (5,'Colección Indonesia','Permanente'),
  (6,'Colección MACAN','Permanente'),
  (7,'Colección Hungary','Permanente'),
  (8,'Colección Budapest','Permanente');
COMMIT;

-- 7 · ARTISTAS  (ids 1..8 match colecciones 1..8)
BEGIN;
INSERT INTO artista (id_artista,primer_nombre,primer_apellido,fecha_nacimiento,id_lugar_nacimiento) VALUES
  (1,'Colin','McCahon','1919-08-01',20),
  (2,'Rita','Angus','1908-03-12',21),
  (3,'Alfons','Muchá','1860-07-24',22),
  (4,'Otto','Gutfreund','1889-08-03',23),
  (5,'Raden','Saleh','1811-01-01',24),
  (6,'Affandi','Affandi','1907-05-18',24),
  (7,'Mihály','Munkácsy','1844-02-20',26),
  (8,'Victor','Vasarely','1906-04-09',26);
COMMIT;

-- 8 · OBRAS  (6 por museo: 3 pinturas + 3 esculturas)
BEGIN;
INSERT INTO obra (nombre,anio_creacion,tipo,estilo,material,dimensiones,id_coleccion,id_sala) VALUES
  -- Museo 1
  ('On the Onslow',1953,'P','Modern','Óleo sobre lienzo','50×70 cm',1,1),
  ('La Cigale',1929,'P','Modern','Óleo','40×55 cm',1,1),
  ('Pare Watene',1878,'P','Realista','Óleo','60×45 cm',1,1),
  ('Standing Figure',1969,'E','Abstracto','Bronce','180 cm',1,1),
  ('Gateway Figure',1981,'E','Talla madera','Madera','250 cm',1,1),
  ('Tekoteko',1850,'E','Gótico','Madera policromada','120 cm',1,1),
  -- Museo 2
  ('Flight of Taonga',1990,'P','Contemp.','Acrílico','90×120 cm',2,2),
  ('Tinirau and Kae',1967,'P','Contemp.','Mixta','100×140 cm',2,2),
  ('Southern Alps',1936,'P','Paisaje','Óleo','70×90 cm',2,2),
  ('Raft Prow',1800,'E','Talla madera','Madera','200 cm',2,2),
  ('Tukutuku Panel',1900,'E','Fibras','Harakeke','180×120 cm',2,2),
  ('Tangaroa Figure',1850,'E','Escultura','Madera','150 cm',2,2),
  -- Museo 3
  ('Slav Epic Panel I',1920,'P','Secesión','Templo','120×160 cm',3,3),
  ('The Seasons',1896,'P','Secesión','Óleo','90×110 cm',3,3),
  ('Lady with Fan',1902,'P','Secesión','Óleo','85×70 cm',3,3),
  ('Cubist Torso',1913,'E','Cubismo','Yeso','70 cm',3,3),
  ('Horse’s Head',1925,'E','Cubismo','Bronce','65 cm',3,3),
  ('Sitting Woman',1912,'E','Cubismo','Yeso','60 cm',3,3),
  -- Museo 4
  ('View of Brno',1900,'P','Realismo','Óleo','60×80 cm',4,4),
  ('Blue Landscape',1910,'P','Fauvismo','Óleo','70×90 cm',4,4),
  ('Still Life',1912,'P','Expresionismo','Óleo','50×60 cm',4,4),
  ('Moravian Madonna',1500,'E','Gótico','Madera policromada','100 cm',4,4),
  ('Dancing Couple',1924,'E','Art Deco','Bronce','55 cm',4,4),
  ('Abstract Form',1960,'E','Abstracto','Hierro','180 cm',4,4),
  -- Museo 5
  ('Diponegoro',1857,'P','Romántico','Óleo','180×300 cm',5,5),
  ('Javanese Market',1885,'P','Costumbrista','Óleo','120×200 cm',5,5),
  ('Self-portrait',1943,'P','Expresionismo','Óleo','80×60 cm',5,5),
  ('Garuda',14,'E','Hindú','Piedra','160 cm',5,5),
  ('Boddhisattva',9,'E','Buda','Andesita','150 cm',5,5),
  ('Wayang Kulit Panel',1900,'E','Tradicional','Cuero','100 cm',5,5),
  -- Museo 6
  ('Infinity Room',2018,'P','Instalación','LED','10×10 m',6,6),
  ('Melting Memories',2017,'P','Media','Video','Loop',6,6),
  ('Spectrum of Light',2019,'P','Abstracción','Acrílico','100×150 cm',6,6),
  ('Mirror Cube',2018,'E','Instalación','Espejo','2 m',6,6),
  ('Digital Totem',2020,'E','Media','LED','3 m',6,6),
  ('Void Sculpture',2019,'E','Minimal','Acero','200 cm',6,6),
  -- Museo 7
  ('Golgotha',1884,'P','Realismo','Óleo','460×712 cm',7,7),
  ('Conquest',1893,'P','Histórico','Óleo','210×390 cm',7,7),
  ('Christ Before Pilate',1881,'P','Histórico','Óleo','245×365 cm',7,7),
  ('Woodcutter',1907,'E','Realismo','Bronce','70 cm',7,7),
  ('Hungarian Dancer',1936,'E','Art Deco','Bronce','65 cm',7,7),
  ('Abstract Column',1968,'E','Abstracto','Hierro','220 cm',7,7),
  -- Museo 8
  ('Greek Vase',500,'P','Clásico','Cerámica','40 cm',8,8),
  ('Madonna',1470,'P','Renacimiento','Tempera','80×60 cm',8,8),
  ('Landscape with Ruins',1650,'P','Barroco','Óleo','90×120 cm',8,8),
  ('Laocoon Copy',50,'E','Clásico','Mármol','180 cm',8,8),
  ('Renaissance Relief',1500,'E','Renacimiento','Mármol','70 cm',8,8),
  ('Baroque Angel',1700,'E','Barroco','Madera','120 cm',8,8);
COMMIT;

-- 9 · OBRA_ARTISTA
BEGIN;
INSERT INTO obra_artista (id_obra,id_artista,tipo_autoria)
SELECT o.id_obra, o.id_coleccion, 'Principal'
  FROM obra o;
COMMIT;

-- 10 · HIST_OBRA
BEGIN;
INSERT INTO hist_obra (id_obra,fecha_inicio_mov,tipo_movimiento)
SELECT id_obra, CURRENT_DATE, 'Ingreso colección'
  FROM obra;
COMMIT;

/*============================================================
 TRIGGERS
============================================================*/

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

/*============================================================
 FUNCTIONS
============================================================*/

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

/*============================================================
 VISTAS
============================================================*/

SET search_path = public;
SET client_min_messages TO warning;

-- vw_ranking_visitas  (museo, año, visitas)
CREATE OR REPLACE VIEW vw_ranking_visitas AS
SELECT t.id_museo
     , date_part('year', t.fecha_visita)::INT AS anio
     , COUNT(*) AS total_visitas
FROM ticket t
GROUP BY t.id_museo, anio
ORDER BY anio, total_visitas DESC;

-- vw_sala_ocupacion  (sala, # obras, temporalidad)
CREATE OR REPLACE VIEW vw_sala_ocupacion AS
SELECT s.id_sala
     , s.nombre      AS sala
     , COUNT(o.id_obra) AS obras_presentes
     , bool_or(s.temporal) AS alguna_temporal
FROM sala s
LEFT JOIN obra o ON o.id_sala = s.id_sala
GROUP BY s.id_sala, s.nombre;

-- vw_empleado_turnos  (empleado ↔ turnos)
CREATE OR REPLACE VIEW vw_empleado_turnos AS
SELECT e.expediente
     , e.primer_nombre || ' ' || e.primer_apellido AS empleado
     , array_agg(t.tipo ORDER BY t.hora_inicio)         AS turnos
FROM empleado e
JOIN empleado_turno et ON et.expediente = e.expediente
JOIN turno t          ON t.id_turno   = et.id_turno
GROUP BY e.expediente, empleado;

CREATE OR REPLACE VIEW vw_pintura_movimiento AS
SELECT
  p.id_obra,
  p.nombre                AS pintura_nombre,
  p.anio_creacion         AS año_creacion,
  p.valor_monetario       AS valor,
  p.tipo                  AS tipo_obra,
  h.fecha_inicio_mov      AS mov_fecha_inicio,
  h.fecha_fin_mov         AS mov_fecha_fin,
  h.tipo_movimiento       AS tipo_movimiento
FROM obra p
JOIN hist_obra h
  ON p.id_obra = h.id_obra
WHERE p.tipo = 'Pintura'
ORDER BY p.id_obra, h.fecha_inicio_mov;


CREATE OR REPLACE VIEW vw_ficha_pintura AS
SELECT
  p.id_obra                                        AS id_obra,
  p.nombre                                         AS titulo,
  p.anio_creacion                                  AS año_creacion,
  p.valor_monetario                                AS valor,
  p.estilo,
  p.material,
  p.dimensiones,
  p.descripcion                                    AS obra_descripcion,
  col.nombre                                       AS coleccion,
  m.nombre                                         AS museo,
  ciudad.nombre                                    AS ciudad,

  -- Nombre del artista principal
  CONCAT(
      ar.primer_nombre, ' ',
      COALESCE(ar.segundo_nombre || ' ', ''),
      ar.primer_apellido,
      COALESCE(' ' || ar.segundo_apellido, '')
  )                                                AS artista_nombre,

  -- Historial de movimientos
  ARRAY_AGG(
      CASE
        WHEN hm.fecha_fin_mov IS NULL
          THEN TO_CHAR(hm.fecha_inicio_mov, 'YYYY-MM-DD') || '→HOY'
        ELSE TO_CHAR(hm.fecha_inicio_mov, 'YYYY-MM-DD')
             || '→'
             || TO_CHAR(hm.fecha_fin_mov, 'YYYY-MM-DD')
      END
      ORDER BY hm.fecha_inicio_mov
  ) FILTER (WHERE hm.fecha_inicio_mov IS NOT NULL) AS historial_movimientos

FROM obra                AS p
JOIN coleccion           AS col ON col.id_coleccion = p.id_coleccion

-- Camino para llegar al museo de la sala donde está la obra
JOIN sala                AS s   ON s.id_sala       = p.id_sala
JOIN area                AS a   ON a.id_area       = s.id_area
JOIN edificio            AS e   ON e.id_edificio   = a.id_edificio
JOIN museo               AS m   ON m.id_museo      = e.id_museo
JOIN lugar               AS ciudad ON ciudad.id_lugar = m.id_lugar

-- Artista principal
LEFT JOIN obra_artista   AS oa  ON oa.id_obra       = p.id_obra
                                 AND oa.tipo_autoria = 'Principal'
LEFT JOIN artista        AS ar  ON ar.id_artista    = oa.id_artista

-- Historial de movimientos
LEFT JOIN hist_obra      AS hm  ON hm.id_obra       = p.id_obra

WHERE p.tipo = 'P'   -- 'P' según tu dominio dom_tipo_obra

GROUP BY
  p.id_obra, p.nombre, p.anio_creacion, p.valor_monetario,
  p.estilo, p.material, p.dimensiones, p.descripcion,
  col.nombre, m.nombre, ciudad.nombre,
  ar.primer_nombre, ar.segundo_nombre,
  ar.primer_apellido, ar.segundo_apellido;

-- ────────────────────────────────────────────────────────────────────────────
-- 11. RANKINGS
-- ────────────────────────────────────────────────────────────────────────────

-- Ranking de colecciones por # de obras o valor total en un año dado
CREATE OR REPLACE FUNCTION fn_ranking_colecciones(
  p_anio    SMALLINT,
  p_top_n   INT DEFAULT 10
) RETURNS TABLE(
  id_coleccion INT,
  total_obras  INT,
  total_valor  NUMERIC
) LANGUAGE sql AS $$
  SELECT
    c.id_coleccion,
    COUNT(o.*)                    AS total_obras,
    COALESCE(SUM(o.valor_monetario),0) AS total_valor
  FROM coleccion c
  LEFT JOIN obra o
    ON o.id_coleccion = c.id_coleccion
   AND o.anio_creacion = p_anio
  GROUP BY c.id_coleccion
  ORDER BY total_obras DESC, total_valor DESC
  LIMIT p_top_n;
$$;

-- Ranking de salas por # de visitas (si quisieras visitas por sala)
-- Aquí lo dejamos como ejemplo de ocupación (nº de obras presentes)
CREATE OR REPLACE FUNCTION fn_ranking_salas(
  p_top_n INT DEFAULT 10
) RETURNS TABLE(
  id_sala        INT,
  obras_presentes INT
) LANGUAGE sql AS $$
  SELECT
    s.id_sala,
    COUNT(o.id_obra) AS obras_presentes
  FROM sala s
  LEFT JOIN obra o ON o.id_sala = s.id_sala
  GROUP BY s.id_sala
  ORDER BY obras_presentes DESC
  LIMIT p_top_n;
$$;


-- ────────────────────────────────────────────────────────────────────────────
-- 12. EXPOSICIONES ESPECIALES
-- ────────────────────────────────────────────────────────────────────────────

-- Crear exposición especial
CREATE OR REPLACE PROCEDURE sp_crear_exposicion(
  p_titulo        TEXT,
  p_fecha_inicio  DATE,
  p_fecha_fin     DATE,
  p_id_sala       INT,
  p_descripcion   TEXT DEFAULT NULL
)
LANGUAGE plpgsql AS $$
DECLARE
  v_expo INT;
BEGIN
  INSERT INTO exposicion_especial
    (titulo, fecha_inicio, fecha_fin, id_sala, descripcion)
  VALUES
    (p_titulo, p_fecha_inicio, p_fecha_fin, p_id_sala, p_descripcion)
  RETURNING id_exposicion INTO v_expo;

  RAISE NOTICE 'Exposición creada: % (id %)', p_titulo, v_expo;
END;
$$;

-- Evitar solapamiento de fechas en la misma sala
CREATE OR REPLACE FUNCTION fn_check_expo_overlap()
  RETURNS trigger AS $$
BEGIN
  IF EXISTS (
    SELECT 1
      FROM exposicion_especial e
     WHERE e.id_sala = NEW.id_sala
       AND e.id_exposicion <> COALESCE(NEW.id_exposicion,-1)
       AND (NEW.fecha_inicio, COALESCE(NEW.fecha_fin, NEW.fecha_inicio))
           OVERLAPS (e.fecha_inicio, COALESCE(e.fecha_fin, e.fecha_inicio))
  ) THEN
    RAISE EXCEPTION 'Solapamiento en sala % fechas %–%', NEW.id_sala, NEW.fecha_inicio, NEW.fecha_fin;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_expo_overlap ON exposicion_especial;
CREATE TRIGGER trg_expo_overlap
  BEFORE INSERT OR UPDATE ON exposicion_especial
  FOR EACH ROW EXECUTE FUNCTION fn_check_expo_overlap();


-- ────────────────────────────────────────────────────────────────────────────
-- 13. TICKETING AVANZADO
-- ────────────────────────────────────────────────────────────────────────────

-- Calcula precio base y descuentos
CREATE OR REPLACE FUNCTION fn_calcular_precio(
  p_tipo_ticket    dom_tipo_ticket,
  p_es_menor       BOOLEAN,
  p_es_estudiante  BOOLEAN
) RETURNS NUMERIC AS $$
DECLARE
  v_base NUMERIC := CASE p_tipo_ticket
    WHEN 'A' THEN 20
    WHEN 'E' THEN 15
    WHEN 'N' THEN 10
    ELSE 0
  END;
BEGIN
  IF p_es_menor THEN
    RETURN v_base * 0.5;
  ELSIF p_es_estudiante THEN
    RETURN v_base * 0.9;
  ELSE
    RETURN v_base;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Genera ticket + admisión
CREATE OR REPLACE PROCEDURE sp_generar_ticket(
  p_id_museo       INT,
  p_fecha_visita   DATE,
  p_tipo_ticket    dom_tipo_ticket,
  p_id_visitante   INT,
  p_es_estudiante  BOOLEAN DEFAULT FALSE
)
LANGUAGE plpgsql AS $$
DECLARE
  v_menor BOOLEAN;
  v_precio NUMERIC;
  v_ticket INT;
BEGIN
  -- ¿es menor de 12?
  SELECT date_part('year', age(p_fecha_visita, fecha_nacimiento)) < 12
    INTO v_menor
    FROM visitante
   WHERE id_visitante = p_id_visitante;

  IF v_menor AND p_tipo_ticket <> 'N' THEN
    RAISE EXCEPTION 'Menor requiere ticket tipo N';
  END IF;

  v_precio := fn_calcular_precio(p_tipo_ticket, v_menor, p_es_estudiante);

  INSERT INTO ticket(fecha_visita, id_museo, monto_unitario, cantidad)
  VALUES(p_fecha_visita, p_id_museo, v_precio, 1)
  RETURNING id_ticket INTO v_ticket;

  INSERT INTO admision(tipo_ticket, monto_pagado, id_ticket, id_visitante)
  VALUES(p_tipo_ticket, v_precio, v_ticket, p_id_visitante);

  RAISE NOTICE 'Generado ticket % por %', v_ticket, v_precio;
END;
$$;


-- ────────────────────────────────────────────────────────────────────────────
-- 14. TRIGGERS ADICIONALES DE INTEGRIDAD
-- ────────────────────────────────────────────────────────────────────────────

-- No reusar ticket en el mismo día
CREATE OR REPLACE FUNCTION fn_check_reuse_ticket()
  RETURNS trigger AS $$
BEGIN
  IF EXISTS (
    SELECT 1
      FROM admision a
      JOIN ticket t ON t.id_ticket = a.id_ticket
     WHERE a.id_visitante = NEW.id_visitante
       AND t.fecha_visita = (SELECT fecha_visita FROM ticket WHERE id_ticket = NEW.id_ticket)
       AND a.id_admision <> NEW.id_admision
  ) THEN
    RAISE EXCEPTION 'Ya hay admisión para este visitante esa fecha';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reuse_ticket ON admision;
CREATE TRIGGER trg_reuse_ticket
  BEFORE INSERT ON admision
  FOR EACH ROW EXECUTE FUNCTION fn_check_reuse_ticket();
