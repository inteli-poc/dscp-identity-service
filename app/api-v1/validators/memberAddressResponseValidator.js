const OpenAPIResponseValidator = require('openapi-response-validator').default

const apiDocResponses = require('../api-doc-responses')
const apiDoc = require('../api-doc')

const memberAddressResponses = {
  200: {
    description: 'Get member address from alias',
    content: {
      'application/json': {
        schema: apiDoc.components.schemas.Member,
      },
    },
  },
  ...apiDocResponses,
}

const validateMemberAddressResponse = (statusCode, result) => {
  const responseValidator = new OpenAPIResponseValidator({
    responses: memberAddressResponses,
    components: apiDoc.components,
  })

  return responseValidator.validateResponse(statusCode, result)
}

module.exports = {
  memberAddressResponses,
  validateMemberAddressResponse,
}
