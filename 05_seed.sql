-- 05_seed_full_fixed.sql
-- Full seed for Entrega 2: resets all tables then loads catalogs, museums, works, authorship & history

SET search_path = public;
SET client_min_messages TO warning;

-- ✂ 0. Clean slate: truncate all business & lookup tables and restart their sequences
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
