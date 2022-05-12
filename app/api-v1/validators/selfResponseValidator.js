const OpenAPIResponseValidator = require('openapi-response-validator').default

const apiDocResponses = require('../api-doc-responses')
const apiDoc = require('../api-doc')

const selfResponses = {
  200: {
    description: 'Return self address',
    content: {
      content: {
        'application/json': {
          schema: apiDoc.components.schemas.Address,
        },
      },
    },
  },
  400: apiDocResponses['400'],
  default: apiDocResponses.default,
}

const validateSelfResponse = (statusCode, result) => {
  const responseValidator = new OpenAPIResponseValidator({ responses: selfResponses, components: apiDoc.components })

  return responseValidator.validateResponse(statusCode, result)
}
module.exports = {
  selfResponses,
  validateSelfResponse,
}
