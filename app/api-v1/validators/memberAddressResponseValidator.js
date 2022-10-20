import oaValidator from 'openapi-response-validator'

import apiDocResponses from '../api-doc-responses.js'
import apiDoc from '../api-doc.js'

const OpenAPIResponseValidator = oaValidator.default

export const memberAddressResponses = {
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

export const validateMemberAddressResponse = (statusCode, result) => {
  const responseValidator = new OpenAPIResponseValidator({
    responses: memberAddressResponses,
    components: apiDoc.components,
  })

  return responseValidator.validateResponse(statusCode, result)
}
