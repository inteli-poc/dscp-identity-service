import {
  memberAddressResponses,
  validateMemberAddressResponse,
} from '../../validators/memberAddressResponseValidator.js'

import { getDefaultSecurity } from '../../../util/authUtil.js'
import { addrRegex, aliasRegex } from '../../services/apiService.js'

export default function (apiService) {
  const doc = {
    GET: async function (req, res) {
      const { aliasOrAddress } = req.params
      let member = {},
        validationErrors

      if (addrRegex.test(aliasOrAddress)) {
        member = await apiService.getMemberByAddress(aliasOrAddress)
      } else if (aliasRegex.test(aliasOrAddress)) {
        member = await apiService.getMemberByAlias(aliasOrAddress)
      } else {
        res.status(400).json({ message: 'Invalid member Alias or Address' })
        return
      }

      validationErrors = validateMemberAddressResponse(400, member)
      if (validationErrors) {
        res.status(400).json(validationErrors)
        return
      } else if (!member) {
        res.status(404).json({ message: 'Member does not exist' })
        return
      } else {
        res.status(200).json(member)
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
    security: getDefaultSecurity(),
    tags: ['members'],
  }

  return doc
}
