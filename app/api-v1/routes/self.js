const { selfResponses, validateSelfResponse } = require('../validators/selfResponseValidator')
const { SELF_ADDRESS } = require('../../env')
const { getDefaultSecurity } = require('../../util/authUtil')

module.exports = function (apiService) {
  const doc = {
    GET: async function (req, res) {
      const [self] = await apiService.getMembersByAddress(SELF_ADDRESS)
      const response = self || { address: SELF_ADDRESS, alias: null }
      const errors = validateSelfResponse(400, response)
      if (errors) return res.status(400).send(errors)
      res.status(200).json(response)
    },
  }

  doc.GET.apiDoc = {
    summary: 'Get self address',
    responses: selfResponses,
    security: getDefaultSecurity(),
    tags: ['members'],
  }

  return doc
}
