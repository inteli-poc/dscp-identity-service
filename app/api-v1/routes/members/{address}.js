const {
  memberAliasesResponses,
  validateMemberAliasesResponse,
} = require('../../validators/memberAliasesResponseValidator')
const { getDefaultSecurity } = require('../../../util/authUtil')

module.exports = function (apiService) {
  const doc = {
    PUT: async function (req, res) {
      const { address } = req.params
      const { statusCode, result } = await apiService.putMemberAlias(address, req.body)

      const validationErrors = validateMemberAliasesResponse(statusCode, result)

      if (validationErrors) {
        res.status(statusCode).json(validationErrors)
        return
      } else {
        res.status(statusCode).json(result)
        return
      }
    },
  }

  doc.PUT.apiDoc = {
    summary: 'Update member alias',
    parameters: [
      {
        description: 'Address of the member',
        in: 'path',
        required: true,
        name: 'address',
        allowEmptyValue: true,
        schema: { $ref: '#/components/schemas/Address' },
      },
    ],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              alias: {
                type: 'string',
              },
            },
            required: ['alias'],
          },
        },
      },
    },
    responses: memberAliasesResponses,
    security: getDefaultSecurity(),
    tags: ['members'],
  }

  return doc
}
