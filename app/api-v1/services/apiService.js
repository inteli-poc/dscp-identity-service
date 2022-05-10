const { getMembers: getMembersUtil } = require('../../util/appUtil')
const { getMembersByAddressDb, createMemberAliasDb, updateMemberAliasDb, getMembersByAliasDb } = require('../../db')

async function findMembers() {
  return getMembersUtil()
}

async function getMembersByAlias(alias) {
  return await getMembersByAliasDb({ alias })
}

async function getMembersByAddress(address) {
  return await getMembersByAddressDb({ address })
}

async function putMemberAlias(address, { alias }) {
  const members = await getMembersByAddressDb({ address })

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

module.exports = {
  findMembers,
  getMembersByAlias,
  getMembersByAddress,
  putMemberAlias,
}
