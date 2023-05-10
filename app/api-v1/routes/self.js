import { selfResponses, validateSelfResponse } from '../validators/selfResponseValidator.js'
import env from '../../env.js'
import { getDefaultSecurity } from '../../util/authUtil.js'

const { SELF_ADDRESS } = env

export default function (apiService) {
  const doc = {
    GET: async function (req, res) {
      const self = await apiService.getMemberByAddress(SELF_ADDRESS)
      const errors = validateSelfResponse(400, self)
      if (errors) return res.status(400).send(errors)
      res.status(200).json(self)
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
