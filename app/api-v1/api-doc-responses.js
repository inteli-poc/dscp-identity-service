import apiDoc from './api-doc.js'

export default {
  400: {
    description: 'Invalid request',
    content: {
      'application/json': {
        schema: apiDoc.components.responses.BadRequestError,
      },
    },
  },
  401: {
    description: 'An unauthorized error occurred',
    content: {
      'application/json': {
        schema: apiDoc.components.responses.UnauthorizedError,
      },
    },
  },
  404: {
    description: 'Resource does not exist',
    content: {
      'application/json': {
        schema: apiDoc.components.responses.NotFoundError,
      },
    },
  },
  409: {
    description: 'Resource already exists',
    content: {
      'application/json': {
        schema: apiDoc.components.responses.ConflictError,
      },
    },
  },
  default: {
    description: 'An error occurred',
    content: {
      'application/json': {
        schema: apiDoc.components.responses.Error,
      },
    },
  },
}
