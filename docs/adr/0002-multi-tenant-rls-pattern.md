# ADR 0002: Patrón único de RLS multi-tenant vía función `is_family_member`

## Estado
Aceptado

## Contexto
Family Hub es multi-familia desde el día 1 y multi-módulo por diseño. Si
cada tabla nueva (de Alimentación, Vacunas, Sueño, etc.) implementa su
propia política RLS desde cero, es cuestión de tiempo que un módulo futuro
la implemente mal o se olvide, filtrando datos entre familias.

## Decisión
Se define una única función SQL `is_family_member(_family_id uuid)`
(`security definer`, `stable`) que comprueba pertenencia activa a la
familia vía `family_members`. Toda tabla con columna `family_id` aplica
exactamente la misma política:

```sql
create policy "family_isolation" on <tabla>
  for all using (is_family_member(family_id));
```

## Consecuencias
- Aislamiento entre familias garantizado por un único punto de verdad,
  no por disciplina repetida en cada migración.
- Cualquier tabla de un módulo futuro (vacunas, medicación...) solo
  necesita tener `family_id` y aplicar esta política; no se reinventa RLS.
- Si en el futuro se necesita lógica más fina (ej. Guest con acceso
  restringido a ciertas tablas), se extiende esta función o se compone
  con funciones adicionales, nunca se sustituye por políticas ad-hoc.
