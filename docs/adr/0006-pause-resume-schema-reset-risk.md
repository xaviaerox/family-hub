# ADR 0006: Riesgo de falsos positivos de "esquema perdido" al reanudar `family-hub`

## Estado
Aceptado (revisado — ver actualización más abajo)

## Contexto
Siguiendo la instrucción permanente del usuario de pausar `family-hub`
entre tareas, se observó en dos ocasiones (inicio de Tarea 3 y de Tarea 4)
que, justo tras reanudar, una consulta a `pg_tables`/`pg_type` devolvía
vacío, sugiriendo que el esquema se había borrado.

**Actualización (Tarea 5):** en un tercer incidente, se investigó a fondo
antes de reaplicar migraciones a ciegas. Resultado: los datos y el esquema
completo (incluidas las 12 policies RLS, sin duplicados) seguían
perfectamente intactos. La lectura "vacía" fue, de nuevo, un **falso
positivo de lectura obsoleta justo tras la reanudación** (el pool de
conexión / réplica de lectura tarda unos segundos en sincronizarse), no
una pérdida real. Es decir: de los tres incidentes observados, al menos
dos (el primero y este tercero) se han confirmado como falsos positivos;
no hay evidencia confirmada de una pérdida real de esquema.

Esto es relevante porque en este tercer incidente, al reaplicar
migraciones (incluida una re-inserción de catálogo) asumiendo que todo se
había perdido, se produjo un conflicto real (`duplicate key`) al chocar
con datos que en realidad seguían presentes — la migración fallida revirtió
por completo (transaccional), sin daño, pero confirma que **reaplicar a
ciegas sin verificar antes es en sí mismo un riesgo**, no solo una
pérdida de tiempo.

## Decisión
1. Ante cualquier lectura "vacía" tras reanudar `family-hub`, **no asumir
   pérdida de esquema**: repetir la consulta tras una breve espera y/o
   comprobar con más de una fuente (`pg_tables`, `pg_type`, `pg_policies`,
   conteo de filas de una tabla con datos conocidos) antes de concluir
   nada.
2. Nunca reaplicar migraciones de esquema/seed "por si acaso" sin
   verificar primero el estado real — usar sentencias idempotentes
   (`if not exists`, `where not exists (...)`) incluso en reaplicaciones
   de emergencia, como red de seguridad adicional.
3. Mantener igualmente `supabase/migrations/` como fuente de verdad
   reproducible, por si alguna vez se confirma una pérdida real.

## Consecuencias
- Se rebaja la severidad de este riesgo: no hay evidencia confirmada de
  pérdida real de datos en ningún incidente hasta ahora, solo de lecturas
  obsoletas mal interpretadas.
- El procedimiento correcto ante una lectura sospechosa es **verificar
  con calma**, no reaccionar reaplicando esquema de inmediato.

