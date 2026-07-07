# RULES.md — Reglas innegociables de Family Hub

Estas reglas no se negocian por rapidez, por conveniencia puntual, ni porque
"solo es un prototipo". Todo colaborador (humano o IA) debe cumplirlas.

1. **Mobile First siempre.** Todo se diseña primero para una mano y una
   pantalla pequeña. El desktop es una adaptación, no al revés.

2. **Cero lógica de negocio en componentes React.** Los componentes de
   `presentation/` solo orquestan UI. Las reglas viven en `domain/` y
   `application/`.

3. **Componentes pequeños, con una sola responsabilidad**, reutilizables
   entre módulos (Alimentación, Vacunas, Sueño, etc.).

4. **No duplicar código.** Si una pieza de lógica se repite dos veces, se
   extrae a una función/hook/componente compartido.

5. **TypeScript estricto en todo el proyecto.** Sin `any` salvo excepción
   documentada explícitamente en el propio código con un comentario que
   justifique por qué.

6. **Toda entrada de datos se valida con Zod**, en el borde: formulario y
   API. Ningún dato no validado llega a `application/`.

7. **Ningún secreto en el repositorio.** Solo variables de entorno
   (`.env.local`, nunca commiteado). El repo incluye `.env.example`.

8. **RLS obligatorio en toda tabla de Supabase**, sin excepción, desde el
   momento en que se crea la tabla — no "se añade después".

9. **Toda decisión arquitectónica relevante se documenta como ADR** en
   `/docs/adr/`, siguiendo el formato numerado.

10. **Todo cambio funcional actualiza la documentación correspondiente**
    (`PROJECT.md`, `ARCHITECTURE.md`, `DATABASE.md`, `CHANGELOG.md`,
    `ROADMAP.md`, `TASKS.md`) en la misma tarea, nunca después.

11. **Todo contenido médico se basa exclusivamente en fuentes oficiales**
    (OMS, AEP, Ministerio de Sanidad, EFSA) **y se cita**, referenciando la
    entrada correspondiente en `knowledge/medical-sources/`.

12. **Ningún módulo depende obligatoriamente de la IA para funcionar.** La
    IA es siempre un complemento opcional y desactivable.

13. **Antes de crear cualquier funcionalidad nueva**, responder por escrito:
    - ¿Qué problema real resuelve?
    - ¿Puede hacerse más simple?
    - ¿Es coherente con el resto de la experiencia?
    - ¿Puede reutilizar componentes existentes?
    - ¿Es consistente con la experiencia móvil?

    Si alguna respuesta es insatisfactoria, la funcionalidad no se
    construye tal como está planteada.
