const { buildApi } = require('@digicatapult/dscp-node')

const { API_HOST, API_PORT } = require('../env')
const logger = require('../logger')
const { getMemberAliasesDb } = require('../db')

const { api } = buildApi({
  options: {
    apiHost: API_HOST,
    apiPort: API_PORT,
  },
})

api.on('disconnected', () => {
  logger.warn(`Disconnected from substrate node at ${API_HOST}:${API_PORT}`)
})

api.on('connected', () => {
  logger.info(`Connected to substrate node at ${API_HOST}:${API_PORT}`)
})

api.on('error', (err) => {
  logger.error(`Error from substrate node connection. Error was ${err.message || JSON.stringify(err)}`)
})

async function membershipReducer(members) {
  members = members.toJSON() || []

  const memberAliases = await getMemberAliasesDb(members)

  return members.reduce((acc, item) => {
    const memberAlias = memberAliases.find(({ address }) => address === item) || null

    acc.push({ address: item, alias: memberAlias ? memberAlias.alias : memberAlias })

    return acc
  }, [])
}

async function getMembers() {
  await api.isReady

  return api.query.membership.members()
}

module.exports = {
  getMembers,
  membershipReducer,
}
