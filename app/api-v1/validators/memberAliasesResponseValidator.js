import oaValidator from 'openapi-response-validator'

import apiDocResponses from '../api-doc-responses.js'
import apiDoc from '../api-doc.js'

const OpenAPIResponseValidator = oaValidator.default

export const memberAliasesResponses = {
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

export const validateMemberAliasesResponse = (statusCode, result) => {
  const responseValidator = new OpenAPIResponseValidator({
    responses: memberAliasesResponses,
    components: apiDoc.components,
  })

  return responseValidator.validateResponse(statusCode, result)
}
