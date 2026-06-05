# Feature Brief — intake antes de SDD

Completa esto (o pégalo en el chat) **antes** de `/sdd-start` o `/sdd-discovery`. Si faltan campos obligatorios, el agente debe preguntar con `AskQuestion` — no inventar requisitos.

## Campos obligatorios (8)

| #   | Campo                      | Ejemplo                                                               |
| --- | -------------------------- | --------------------------------------------------------------------- |
| 1   | **Nombre corto**           | Mi Día — cobertura de vencimientos                                    |
| 2   | **Problema (1–2 frases)**  | El usuario no sabe si cubre lo que vence hoy sin calcular mentalmente |
| 3   | **Persona principal**      | Empleado que revisa el teléfono en la mañana                          |
| 4   | **Horizonte**              | `today` \| `week` \| `month` \| `year`                                |
| 5   | **Tipo de feature**        | `habit` \| `decision` \| `overview` \| `input` \| `read-only`         |
| 6   | **P0 (sin scroll móvil)**  | Badge cubro / faltan $X + lista pagos hoy                             |
| 7   | **Non-goals (≥2)**         | Sin push; sin nueva ruta `/today`                                     |
| 8   | **Benchmark o referencia** | Black Control Mi Día; app actual dashboard                            |

## Campos recomendados

| Campo                          | Uso                                                 |
| ------------------------------ | --------------------------------------------------- |
| **Pregunta en una frase**      | ¿Cubro con mi liquidez lo que vence hoy?            |
| **Datos / módulos existentes** | DueDateAlerts, calcLiquidAssetsTotal                |
| **Riesgos conocidos**          | Duplicar KPIs sin loop nuevo                        |
| **Context manifest**           | Paths: `constitution.md`, `docs/PRODUCT-UX-FLOW.md` |

## Gate

- **≥6/8 obligatorios** → puede iniciar discovery/specify
- **<6/8** → `/sdd-clarify` o preguntas hasta completar

## Siguiente paso

| Tipo               | Comando                                       |
| ------------------ | --------------------------------------------- |
| User-facing        | `/sdd-discovery` → sign-off → `/sdd-specify`  |
| Solo backend / fix | `/sdd-specify` (journal: `discovery_skipped`) |
