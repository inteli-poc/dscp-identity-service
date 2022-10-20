import oaValidator from 'openapi-response-validator'

import apiDocResponses from '../api-doc-responses.js'
import apiDoc from '../api-doc.js'

const OpenAPIResponseValidator = oaValidator.default

export const membersResponses = {
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

export const validateMembersResponse = (statusCode, result) => {
  const responseValidator = new OpenAPIResponseValidator({ responses: membersResponses, components: apiDoc.components })

  return responseValidator.validateResponse(statusCode, result)
}
