const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Las Lindas API",
    version: "1.0.0",
    description: "API de vuelos, facturas, usuarios y autenticacion protegida con JWT."
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local"
    }
  ],
  tags: [
    { name: "Auth", description: "Autenticacion" },
    { name: "Health", description: "Estado del servicio" },
    { name: "Invoices", description: "Vuelos y facturas" },
    { name: "Users", description: "Clientes y empleados" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string" },
          message: { type: "string" }
        },
        required: ["error", "message"]
      },
      LoginRequest: {
        type: "object",
        properties: {
          email: { type: "string", example: "api@laslindas.local" },
          password: { type: "string", example: "Avior2026!" }
        },
        required: ["email", "password"]
      },
      LoginResponse: {
        type: "object",
        properties: {
          token: { type: "string" },
          user: {
            type: "object",
            properties: {
              id: { type: "string" },
              email: { type: "string" },
              role: { type: "string" },
              name: { type: "string" }
            },
            required: ["id", "email", "role", "name"]
          }
        },
        required: ["token", "user"]
      },
      Flight: {
        type: "object",
        properties: {
          FlightNumber: { type: "string", example: "1068" },
          DepartureAirport: { type: "string", example: "CCS" },
          ArrivalAirport: { type: "string", example: "MIA" },
          DepartureDateTime: { type: "string", example: "2026-03-28 08:40" },
          ArrivalDateTime: { type: "string", example: "2026-03-28 11:50" }
        },
        required: [
          "FlightNumber",
          "DepartureAirport",
          "ArrivalAirport",
          "DepartureDateTime",
          "ArrivalDateTime"
        ]
      },
      FlightListResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Flight" }
          }
        },
        required: ["data"]
      },
      Passenger: {
        type: "object",
        properties: {
          first_name: { type: "string", example: "JUAN" },
          last_name: { type: "string", example: "PEREZ" },
          document: { type: "string", example: "V12345678" },
          ticket_number: { type: "string", example: "742000001" }
        },
        required: ["first_name", "last_name", "document", "ticket_number"]
      },
      Invoice: {
        type: "object",
        properties: {
          _id: { type: "string", example: "invoice_1068_1" },
          pnr: { type: "string", example: "ABC123" },
          email: { type: "string", example: "client@mail.com" },
          phone: { type: "string", example: "04141234567" },
          passengers: {
            type: "array",
            items: { $ref: "#/components/schemas/Passenger" }
          }
        },
        required: ["_id", "pnr", "email", "phone", "passengers"]
      },
      InvoiceListResponse: {
        type: "object",
        properties: {
          docs: {
            type: "array",
            items: { $ref: "#/components/schemas/Invoice" }
          }
        },
        required: ["docs"]
      },
      Customer: {
        type: "object",
        properties: {
          id: { type: "string", example: "cust_1" },
          firstName: { type: "string", example: "Juan" },
          lastName: { type: "string", example: "Pérez" },
          email: { type: "string", example: "juan@mail.com" },
          phone: { type: "string", example: "0414..." },
          identification: { type: "string", example: "V12345678" },
          city: { type: "string", example: "Caracas" },
          nationality: { type: "string", example: "VE" },
          isAviorPlus: { type: "boolean", example: true },
          aviorPlusNumber: { type: "string", example: "AP-001" },
          sex: { type: "string", example: "M" },
          birthDate: { type: "string", example: "1990-01-01" },
          preferredRoute: { type: "string", example: "CCS-MIA" },
          preferredPaymentMethod: { type: "string", example: "card" },
          purchaseChannel: { type: "string", example: "web" },
          totalPurchasesUSD: { type: "number", example: 1234.5 },
          lastContactDate: { type: "string", example: "2026-03-28" },
          lastFlightDate: { type: "string", example: "2026-03-20" },
          lastFlightNumber: { type: "string", example: "1068" },
          status: { type: "string", example: "active" },
          segment: { type: "string", example: "frequent" },
          createdAt: { type: "string", example: "2026-01-01T00:00:00.000Z" },
          tags: {
            type: "array",
            items: { type: "string" },
            example: ["vip"]
          }
        }
      },
      CustomerListResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Customer" }
          },
          meta: {
            type: "object",
            properties: {
              page: { type: "integer", example: 1 },
              limit: { type: "integer", example: 10 },
              total: { type: "integer", example: 3 },
              totalPages: { type: "integer", example: 1 }
            },
            required: ["page", "limit", "total", "totalPages"]
          }
        },
        required: ["data", "meta"]
      },
      CreateCustomerRequest: {
        type: "object",
        properties: {
          firstName: { type: "string", example: "Ana" },
          lastName: { type: "string", example: "Torres" },
          email: { type: "string", example: "ana.torres@mail.com" },
          phone: { type: "string", example: "04141112233" },
          identification: { type: "string", example: "V20111222" },
          city: { type: "string", example: "Caracas" },
          nationality: { type: "string", example: "VE" },
          segment: { type: "string", example: "new" },
          status: { type: "string", example: "active" }
        },
        required: ["firstName", "lastName", "email"]
      },
      CustomerResponse: {
        type: "object",
        properties: {
          data: { $ref: "#/components/schemas/Customer" }
        },
        required: ["data"]
      },
      Employee: {
        type: "object",
        properties: {
          _id: { type: "string", example: "user_1" },
          email: { type: "string", example: "staff@airline.com" },
          name: { type: "string", example: "Pedro" },
          lastName: { type: "string", example: "Suarez" },
          documentType: { type: "string", example: "V" },
          cedula: { type: "string", example: "12345678" },
          tenantId: { type: "string", example: "avior-001" },
          status: { type: "string", example: "active" },
          role: { type: "string", example: "admin" },
          createdAt: { type: "string", example: "2026-03-01T00:00:00.000Z" }
        },
        required: [
          "_id",
          "email",
          "name",
          "lastName",
          "documentType",
          "cedula",
          "tenantId",
          "status",
          "role",
          "createdAt"
        ]
      },
      EmployeeListResponse: {
        type: "array",
        items: { $ref: "#/components/schemas/Employee" }
      }
    }
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          200: {
            description: "Service status",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" }
                  },
                  required: ["status"]
                }
              }
            }
          }
        }
      }
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login de usuario",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" }
            }
          }
        },
        responses: {
          200: {
            description: "Token generado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginResponse" }
              }
            }
          },
          400: {
            description: "Datos faltantes",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          401: {
            description: "Credenciales invalidas",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/invoices/flights": {
      get: {
        tags: ["Invoices"],
        summary: "Lista de vuelos por fecha",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "date",
            in: "query",
            required: true,
            schema: { type: "string", example: "2026-03-28" },
            description: "Fecha en formato YYYY-MM-DD"
          }
        ],
        responses: {
          200: {
            description: "Lista fija de 15 vuelos con la fecha solicitada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/FlightListResponse" }
              }
            }
          },
          400: {
            description: "Parametro invalido",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          401: {
            description: "No autorizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/invoices": {
      get: {
        tags: ["Invoices"],
        summary: "Facturas por vuelo y fecha",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "flightNumber",
            in: "query",
            required: true,
            schema: { type: "string", example: "1068" }
          },
          {
            name: "date",
            in: "query",
            required: true,
            schema: { type: "string", example: "2026-03-28" }
          }
        ],
        responses: {
          200: {
            description: "Facturas encontradas para el vuelo y la fecha",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/InvoiceListResponse" }
              }
            }
          },
          400: {
            description: "Parametro invalido",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          401: {
            description: "No autorizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/users": {
      get: {
        tags: ["Users"],
        summary: "Clientes o empleados segun query",
        description: "Sin query params devuelve empleados. Con page/limit/search/segment/status devuelve clientes con data + meta.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            required: false,
            schema: { type: "integer", example: 1 }
          },
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "integer", example: 10 }
          },
          {
            name: "search",
            in: "query",
            required: false,
            schema: { type: "string", example: "juan" }
          },
          {
            name: "segment",
            in: "query",
            required: false,
            schema: { type: "string", example: "frequent" }
          },
          {
            name: "status",
            in: "query",
            required: false,
            schema: { type: "string", example: "active" }
          }
        ],
        responses: {
          200: {
            description: "Clientes o empleados",
            content: {
              "application/json": {
                schema: {
                  oneOf: [
                    { $ref: "#/components/schemas/CustomerListResponse" },
                    { $ref: "#/components/schemas/EmployeeListResponse" }
                  ]
                }
              }
            }
          },
          401: {
            description: "No autorizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      },
      post: {
        tags: ["Users"],
        summary: "Crear cliente",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateCustomerRequest" }
            }
          }
        },
        responses: {
          201: {
            description: "Cliente creado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CustomerResponse" }
              }
            }
          },
          400: {
            description: "Faltan campos requeridos",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          401: {
            description: "No autorizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          409: {
            description: "El email ya existe",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Obtener cliente por id",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", example: "cust_4" }
          }
        ],
        responses: {
          200: {
            description: "Cliente encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CustomerResponse" }
              }
            }
          },
          401: {
            description: "No autorizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          404: {
            description: "Cliente no encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    }
  }
};

module.exports = {
  openApiSpec
};
