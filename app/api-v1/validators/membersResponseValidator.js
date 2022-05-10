const OpenAPIResponseValidator = require('openapi-response-validator').default

const apiDocResponses = require('../api-doc-responses')
const apiDoc = require('../api-doc')

const membersResponses = {
  200: {
    description: 'Update member alias',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: apiDoc.components.schemas.Member,
        },
      },
    },
  },
  400: apiDocResponses['400'],
  default: apiDocResponses.default,
}

const validateMembersResponse = (statusCode, result) => {
  const responseValidator = new OpenAPIResponseValidator({ responses: membersResponses, components: apiDoc.components })

  return responseValidator.validateResponse(statusCode, result)
}
module.exports = {
  membersResponses,
  validateMembersResponse,
}
