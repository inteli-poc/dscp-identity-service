const { selfResponses, validateSelfResponse } = require('../validators/selfResponseValidator')
const { SELF_ADDRESS } = require('../../env')
const { getDefaultSecurity } = require('../../util/authUtil')

module.exports = function () {
  const doc = {
    GET: async function (req, res) {
      const errors = validateSelfResponse(400, SELF_ADDRESS, res)
      if (errors) return res.status(400).send(errors)
      res.status(200).send(SELF_ADDRESS)
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
