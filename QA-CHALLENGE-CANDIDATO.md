# Reto técnico – QA / API Testing con Postman

Duración estimada: **60 minutos**.

## Contexto

Vas a probar una API REST real, en producción, de una aerolínea (Las Lindas Airlines).

- **Base URL**: `https://andofi-airlines.vercel.app`
- **Swagger UI**: `https://andofi-airlines.vercel.app/docs`
- **OpenAPI JSON**: `https://andofi-airlines.vercel.app/openapi.json`

Usa Postman (Desktop o Web) para todo el reto.

## Credenciales

```http
POST /auth/login
Content-Type: application/json

{
  "email": "api@laslindas.local",
  "password": "LasLindas2026!"
}
```

La respuesta trae un `token` JWT. Todos los endpoints, excepto `/health` y `/auth/login`, requieren el header:

```
Authorization: Bearer <token>
```

## Qué debes entregar

1. Un archivo `.postman_collection.json` exportado con tus requests y tests.
2. Un archivo `.postman_environment.json` exportado con tus variables (`baseUrl`, `token`, y las que necesites). No hardcodees valores sensibles dentro de los requests: usa variables.
3. (Opcional, suma puntos) Un screenshot o export del Collection Runner con los tests en verde.

## Retos a resolver

### 1. Validación de contrato

Crea un `GET` (por ejemplo a `/invoices/flights?date=2026-03-28` o a `/users`) y valida con `pm.test`:

- Que el status sea `200`.
- Que el JSON tenga los campos obligatorios de ese recurso. Revisa el Swagger para saber cuáles son.

### 2. Encadenamiento de requests (chaining)

- Haz un `POST /users` para crear un cliente nuevo. Campos obligatorios: `firstName`, `lastName`, `email`.
- Extrae el `id` de la respuesta y guárdalo en una variable de entorno.
- Usa esa variable en un `GET /users/:id` posterior para verificar que el cliente existe.

### 3. Script de pre-solicitud

En el request que crea el cliente, agrega un **Pre-request Script** que genere un email dinámico (`Math.random()`, `Date.now()`, o similar) para que el `POST` nunca falle por "email duplicado" en corridas repetidas.

### 4. Validación de tiempo de respuesta

En al menos un request, valida con `pm.test` que el tiempo de respuesta sea menor a **500ms**.

## Bonus (no obligatorio, suma puntos)

- Prueba también casos negativos: sin token (`401`), campos obligatorios faltantes (`400`), email duplicado (`409`), id inexistente (`404`).
- Deja un comentario o hallazgo sobre algo del diseño de la API que mejorarías (contrato, nombres, consistencia, lo que sea).

## Cómo se evalúa

- Los tests corren y pasan de forma consistente (no solo "a veces").
- Colección organizada: nombres claros de folders/requests, uso de variables de entorno en vez de valores fijos pegados en cada request.
- Cobertura más allá del camino feliz (negativos).
- Justificación: que sepa explicar por qué escribió cada `pm.test`, no solo copiar y pegar.
