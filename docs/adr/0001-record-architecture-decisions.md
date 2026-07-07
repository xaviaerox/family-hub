# ADR 0001: Registrar las decisiones arquitectónicas mediante ADRs

## Estado
Aceptado

## Contexto
Family Hub crecerá durante años y por múltiples módulos (Alimentación,
Vacunas, Sueño, Medicación, Diario, Desarrollo, IA, Biblioteca...). Sin un
registro explícito, las razones detrás de decisiones importantes se pierden
y se repiten discusiones o, peor, se contradicen decisiones anteriores.

## Decisión
Cada decisión arquitectónica con impacto significativo (elección de patrón,
esquema de datos transversal, proveedor externo, convención de seguridad)
se documenta como un ADR numerado en `docs/adr/`, con formato:
Estado / Contexto / Decisión / Consecuencias.

## Consecuencias
- Cualquier colaborador nuevo (humano o IA) puede entender el "por qué"
  sin tener que releer todo el historial de conversación.
- Las decisiones se pueden revisar y revertir explícitamente, nunca por
  omisión.
