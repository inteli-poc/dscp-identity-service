const OpenAPIResponseValidator = require('openapi-response-validator').default

const apiDocResponses = require('../api-doc-responses')
const apiDoc = require('../api-doc')

const memberAliasesResponses = {
  200: {
    description: 'Update member alias',
    content: {
      'application/json': {
        schema: apiDoc.components.schemas.Member,
      },
    },
  },
  201: {
    description: 'Create member alias',
    content: {
      'application/json': {
        schema: apiDoc.components.schemas.Member,
      },
    },
  },
  ...apiDocResponses,
}

const validateMemberAliasesResponse = (statusCode, result) => {
  const responseValidator = new OpenAPIResponseValidator({ responses: memberAliasesResponses })

  return responseValidator.validateResponse(statusCode, result)
}

module.exports = {
  memberAliasesResponses,
  validateMemberAliasesResponse,
}
