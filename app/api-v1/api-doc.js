import env from '../env.js'

const { PORT, API_VERSION, API_MAJOR_VERSION, EXTERNAL_ORIGIN, EXTERNAL_PATH_PREFIX } = env

let url = EXTERNAL_ORIGIN || `http://localhost:${PORT}`
url = EXTERNAL_PATH_PREFIX ? `${url}/${EXTERNAL_PATH_PREFIX}` : url

const apiDoc = {
  openapi: '3.0.3',
  info: {
    title: 'IdentityService',
    version: API_VERSION,
  },
  servers: [
    {
      url: `${url}/${API_MAJOR_VERSION}`,
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
        maxLength: 50,
        pattern: '(?!^[1-9A-HJ-NP-Za-km-z]{48}$)^.{1,50}$',
      },
      AddressOrAlias: {
        oneOf: [{ $ref: '#/components/schemas/Alias' }, { $ref: '#/components/schemas/Address' }],
      },
    },
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {},
}

export default apiDoc
