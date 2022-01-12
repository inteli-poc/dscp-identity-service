const { getMembers: getMembersUtil } = require('../../util/appUtil')
const { getMembersByAliasDb, createMemberAliasDb, updateMemberAliasDb } = require('../../db')

async function findMembers() {
  return getMembersUtil()
}

async function putMemberAlias(address, { alias }) {
  const members = await getMembersByAliasDb({ address, alias })

  if (members.length && members.find((item) => item.alias === alias)) {
    return { statusCode: 409, result: { message: 'member alias already exists' } }
  } else if (members.length && members.find((item) => item.address === address)) {
    const memberUpdated = await updateMemberAliasDb({ address, alias })
    const result = memberUpdated.length ? memberUpdated[0] : {}

    return { statusCode: 200, result }
  } else {
    const memberCreated = await createMemberAliasDb({ address, alias })
    const result = memberCreated.length ? memberCreated[0] : {}

    return { statusCode: 201, result }
  }
}

module.exports = {
  findMembers,
  putMemberAlias,
}
