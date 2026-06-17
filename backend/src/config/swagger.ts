import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "WeBee API",
      version: "1.0.0"
    },
    servers: [
      {
        url: "/api",
        description: "API base path"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },
  apis: ["src/modules/**/*.routes.ts", "src/routes/**/*.ts"]
});
