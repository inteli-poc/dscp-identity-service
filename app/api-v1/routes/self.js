const logger = require('../../logger')
const { selfResponses, validateSelfResponse } = require('../validators/selfResponseValidator')
const { SELF_ADDRESS } = require('../../env')

module.exports = function (apiService) {
  const doc = {
  
    GET: async function (req, res) {
      if (validateSelfResponse(400, SELF_ADDRESS)) {
        return res.status(400).json(validationErrors)
      }
      res.status(200).send(SELF_ADDRESS)
    },
  }

  doc.GET.apiDoc = {
    summary: 'Get self address',
    responses: selfResponses,
    security: [{ bearerAuth: [] }],
    tags: ['members'],
  }

  return doc
}
