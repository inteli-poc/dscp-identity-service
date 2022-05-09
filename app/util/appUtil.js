const { buildApi } = require('@digicatapult/dscp-node')

const {
  API_HOST,
  API_PORT,
  METADATA_KEY_LENGTH,
  METADATA_VALUE_LITERAL_LENGTH,
  PROCESS_IDENTIFIER_LENGTH,
} = require('../env')
const logger = require('../logger')
const { getMemberAliasesDb } = require('../db')

const { api } = buildApi({
  options: {
    apiHost: API_HOST,
    apiPort: API_PORT,
    metadataKeyLength: METADATA_KEY_LENGTH,
    metadataValueLiteralLength: METADATA_VALUE_LITERAL_LENGTH,
    processorIdentifierLength: PROCESS_IDENTIFIER_LENGTH,
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

const utf8ToUint8Array = (str, len) => {
  const arr = new Uint8Array(len)
  try {
    arr.set(Buffer.from(str, 'utf8'))
  } catch (err) {
    if (err instanceof RangeError) {
      throw new Error(`${str} is too long. Max length: ${len} bytes`)
    } else throw err
  }
  return arr
}

module.exports = {
  getMembers,
  membershipReducer,
  utf8ToUint8Array,
}
