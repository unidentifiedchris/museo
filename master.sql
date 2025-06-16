/*============================================================
  MASTER SCRIPT – Entrega 2  (grupo 7, estilo Cardoso adaptado a PG)
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

/* Comentarios (opcional) */
COMMENT ON COLUMN obra.tipo IS 'dom_tipo_obra: P=pintura, E=escultura';

COMMIT;
