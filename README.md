# API de vuelos (LASLINDAS)

API REST con autenticacion JWT y rutas protegidas.

## Requisitos

- Node.js 18+

## Instalacion

```bash
npm install
```

## Ejecucion

```bash
npm run dev
```

o en modo normal:

```bash
npm start
```

Servidor por defecto: `http://localhost:3000`

Documentacion interactiva:

- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/openapi.json`
- Postman collection: `postman/LasLindas.postman_collection.json`
- Postman environment: `postman/LasLindas.postman_environment.json`

## Credenciales de login

- email: `api@laslindas.local`
- password: `Avior2026!`

## Flujo de uso

1. Obtener token:

```http
POST /auth/login
Content-Type: application/json

{
  "email": "api@laslindas.local",
  "password": "Avior2026!"
}
```

2. Consumir endpoints protegidos con header:

```http
Authorization: Bearer <token>
```

## Endpoints

### 1) Vuelos por fecha

`GET /invoices/flights?date=YYYY-MM-DD`

Respuesta:

```json
{
  "data": [
    {
      "FlightNumber": "1068",
      "DepartureAirport": "CCS",
      "ArrivalAirport": "MIA",
      "DepartureDateTime": "2026-03-28 08:40",
      "ArrivalDateTime": "2026-03-28 11:50"
    }
  ]
}
```

Nota: siempre se usa el mismo catalogo de 15 vuelos; solo cambia la fecha solicitada.

### 2) Facturas por vuelo y fecha

`GET /invoices?flightNumber=1068&date=2026-03-28`

Respuesta:

```json
{
  "docs": [
    {
      "_id": "invoice_1068_1",
      "pnr": "ABC123",
      "email": "client@mail.com",
      "phone": "04141234567",
      "passengers": [
        {
          "first_name": "JUAN",
          "last_name": "PEREZ",
          "document": "V12345678",
          "ticket_number": "742000001"
        }
      ]
    }
  ]
}
```

### 3) Usuarios clientes (CRM)

`GET /users?page=1&limit=10&search=&segment=&status=`

Respuesta devuelta por esta API:

```json
{
  "data": [
    {
      "id": "cust_1",
      "firstName": "Juan"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

El frontend que acepta A/B/C seguira funcionando porque esta API usa la estructura C (`data`).

### 4) Crear cliente

`POST /users`

Body:

```json
{
  "firstName": "Ana",
  "lastName": "Torres",
  "email": "ana.torres@mail.com"
}
```

Respuestas: `201` con `{ "data": { ...cliente creado } }`, `400` si faltan `firstName`/`lastName`/`email`, `409` si el email ya existe.

### 5) Obtener cliente por id

`GET /users/:id`

Respuestas: `200` con `{ "data": { ...cliente } }`, `404` si no existe.

### 6) Empleados (MASTER_API)

`GET /users`

Sin query params, devuelve arreglo de empleados:

```json
[
  {
    "_id": "user_1",
    "email": "staff@airline.com",
    "name": "Pedro",
    "lastName": "Suarez",
    "documentType": "V",
    "cedula": "12345678",
    "tenantId": "avior-001",
    "status": "active",
    "role": "admin",
    "createdAt": "2026-03-01T00:00:00.000Z"
  }
]
```

## Salud de API

`GET /health` (sin auth)
