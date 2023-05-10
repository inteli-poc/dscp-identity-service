import { getMembers as getMembersUtil } from '../../util/appUtil.js'
import { getMembersByAddressDb, createMemberAliasDb, updateMemberAliasDb, getMembersByAliasDb } from '../../db.js'
import apiDoc from '../api-doc.js'

export const addrRegex = new RegExp(apiDoc.components.schemas.Address.pattern)
export const aliasRegex = new RegExp(apiDoc.components.schemas.Alias.pattern)

export async function findMembers() {
  return getMembersUtil()
}

export async function getMemberByAlias(alias) {
  const [member] = await getMembersByAliasDb({ alias })
  return member
}

export async function getMemberByAddress(address) {
  const [member] = await getMembersByAddressDb({ address })
  if (member) return member

  // if no alias in db, check if member is on-chain
  const chainMembers = await getMembersUtil()
  const validMembers = chainMembers.toJSON()
  return validMembers.includes(address) ? { address: address, alias: address } : null
}

export async function putMemberAlias(address, { alias }) {
  const members = await getMembersByAddressDb({ address })

  if (!aliasRegex.test(alias)) {
    return { statusCode: 400, result: { message: 'invalid alias' } }
  }

  // check members by address for matching address and alias or members by alias
  if ((members.length && members[0].alias === alias) || (await getMembersByAliasDb({ alias })).length) {
    return { statusCode: 409, result: { message: 'member alias already exists' } }
  }

  // create non-existing member with address and alias
  if (members.length === 0) {
    const memberCreated = await createMemberAliasDb({ address, alias })
    const result = memberCreated.length ? memberCreated[0] : {}

    return { statusCode: 201, result }
  }

  // update existing member with new alias
  if (members.length > 0) {
    const memberUpdated = await updateMemberAliasDb({ address, alias })
    const result = memberUpdated.length ? memberUpdated[0] : {}

    return { statusCode: 200, result }
  }
}

export default {
  findMembers,
  getMemberByAlias,
  getMemberByAddress,
  putMemberAlias,
}
