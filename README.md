# Proyecto Museos – Entrega 2

Este repositorio contiene los scripts SQL y las instrucciones para desplegar y probar la segunda entrega del sistema de gestión de museos de arte.

## Índice

1. [Visión general](#visión-general)  
2. [Requisitos](#requisitos)  
3. [Despliegue](#despliegue)  
4. [Descripción de los scripts](#descripción-de-los-scripts)  
5. [Pruebas manuales](#pruebas-manuales)  
6. [Estructura de carpetas](#estructura-de-carpetas)  
7. [Contacto](#contacto)  

---

## Visión general

En esta entrega hemos implementado:

- **DDL** completo de la base de datos (`master.sql`).  
- **Seed mínimo** (`05_seed_delivery2.sql`), que carga solo catálogos y la estructura general necesaria.  
- **Triggers** (`06_triggers.sql`) para:
  - Validar que los menores de 12 años siempre lleven ticket de adulto  
  - Registrar automáticamente los movimientos de sala en el historial de la obra  
- **Procedimientos y funciones** (`07_functions.sql`) para:
  - Registro de empleados (`sp_alta_empleado`)  
  - Registro de pinturas / esculturas (`sp_registrar_obra`)  
  - Agregar entradas al resumen histórico del museo (`sp_agregar_historico_museo`)  
  - Calcular ingresos por rango de fechas (`fn_ingresos_por_rango`)  
  - Generar ranking de visitas por año (`fn_ranking_visitas`)  

---

## Requisitos

- PostgreSQL 17.x  
- Cliente `psql` o pgAdmin 4  
- El usuario debe tener privilegios `CREATEDB` y `CONNECT` sobre la BD `museos_dev`.  

---

## Despliegue

1. **Crear la base**  
   ```bash
   psql -U postgres \
     -c "DROP DATABASE IF EXISTS museos_dev;" \
     -c "CREATE DATABASE museos_dev OWNER your_user ENCODING 'UTF8';"
