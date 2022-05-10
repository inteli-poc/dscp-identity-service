const { PORT, API_VERSION, API_MAJOR_VERSION } = require('../env')

const apiDoc = {
  openapi: '3.0.3',
  info: {
    title: 'IdentityService',
    version: API_VERSION,
  },
  servers: [
    {
      url: `http://localhost:${PORT}/${API_MAJOR_VERSION}`,
    },
  ],
  components: {
    responses: {
      NotFoundError: {
        description: 'This resource cannot be found',
      },
      BadRequestError: {
        description: 'The request is invalid',
      },
      ConflictError: {
        description: 'This resource already exists',
      },
      UnauthorizedError: {
        description: 'Access token is missing or invalid',
      },
      Error: {
        description: 'An error occurred',
      },
    },
    schemas: {
      Member: {
        type: 'object',
        properties: {
          address: {
            description: 'token of the member',
            allOf: [{ $ref: '#/components/schemas/Address' }],
          },
          alias: {
            description: 'alias of the member',
            allOf: [{ $ref: '#/components/schemas/Alias' }],
          },
        },
        required: ['address', 'alias'],
      },
      Address: {
        type: 'string',
        minLength: 48,
        maxLength: 48,
        pattern: '^[1-9A-HJ-NP-Za-km-z]{48}$',
      },
      Alias: {
        type: 'string',
        minLength: 1,
        maxLength: 255,
        pattern: '(?!^[1-9A-HJ-NP-Za-km-z]{48}$)^.{1,255}$',
      },
      AddressOrAlias: {
        oneOf: [{ $ref: '#/components/schemas/Alias' }, { $ref: '#/components/schemas/Address' }],
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {},
}

module.exports = apiDoc
