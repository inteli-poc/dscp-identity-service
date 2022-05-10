const {
  memberAddressResponses,
  validateMemberAddressResponse,
} = require('../../validators/memberAddressResponseValidator')
const apiDoc = require('../../api-doc')

const addrRegex = new RegExp(apiDoc.components.schemas.Address.pattern)
const aliasRegex = new RegExp(apiDoc.components.schemas.Alias.pattern)

module.exports = function (apiService) {
  const doc = {
    GET: async function (req, res) {
      const { aliasOrAddress } = req.params
      let result = {},
        validationErrors

      if (addrRegex.test(aliasOrAddress)) {
        result = await apiService.getMembersByAddress(aliasOrAddress)
      } else if (aliasRegex.test(aliasOrAddress)) {
        result = await apiService.getMembersByAlias(aliasOrAddress)
      } else {
        res.status(400).json({ message: 'Invalid member Alias or Address' })
        return
      }

      validationErrors = validateMemberAddressResponse(400, result)
      if (validationErrors) {
        res.status(400).json(validationErrors)
        return
      } else if (result.length === 0) {
        res.status(404).json({ message: 'Member does not exist' })
        return
      } else {
        res.status(200).json(result[0])
        return
      }
    },
  }

  doc.GET.apiDoc = {
    summary: 'Get member by alias or address',
    parameters: [
      {
        description: 'Alias or address of the member',
        in: 'path',
        required: true,
        name: 'aliasOrAddress',
        allowEmptyValue: true,
        schema: { $ref: '#/components/schemas/AddressOrAlias' },
      },
    ],
    responses: memberAddressResponses,
    security: [{ bearerAuth: [] }],
    tags: ['members'],
  }

  return doc
}
