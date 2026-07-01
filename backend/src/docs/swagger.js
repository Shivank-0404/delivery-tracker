const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Delivery Tracker API',
      version: '1.0.0',
      description: 'REST API Documentation for Delivery Tracker Backend'
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5001}`
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },

  apis: [
    './src/routes/*.js',
    './src/controllers/*.js'
  ]
};

module.exports = swaggerJsdoc(options);