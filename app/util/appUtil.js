const { ApiPromise, WsProvider } = require('@polkadot/api')

const {
  API_HOST,
  API_PORT,
  METADATA_KEY_LENGTH,
  METADATA_VALUE_LITERAL_LENGTH,
  PROCESS_IDENTIFIER_LENGTH,
} = require('../env')
const logger = require('../logger')
const { getMemberAliasesDb } = require('../db')

const provider = new WsProvider(`ws://${API_HOST}:${API_PORT}`)
const apiOptions = {
  provider,
  types: {
    Address: 'MultiAddress',
    LookupSource: 'MultiAddress',
    PeerId: 'Vec<u8>',
    Key: 'Vec<u8>',
    TokenId: 'u128',
    RoleKey: 'Role',
    TokenMetadataKey: `[u8; ${METADATA_KEY_LENGTH}]`,
    TokenMetadataValue: 'MetadataValue',
    Token: {
      id: 'TokenId',
      original_id: 'TokenId',
      roles: 'BTreeMap<RoleKey, AccountId>',
      creator: 'AccountId',
      created_at: 'BlockNumber',
      destroyed_at: 'Option<BlockNumber>',
      metadata: 'BTreeMap<TokenMetadataKey, TokenMetadataValue>',
      parents: 'Vec<TokenId>',
      children: 'Option<Vec<TokenId>>',
    },
    ProcessIO: {
      roles: 'BTreeMap<RoleKey, AccountId>',
      metadata: 'BTreeMap<TokenMetadataKey, TokenMetadataValue>',
      parent_index: 'Option<u32>',
    },
    MetadataValue: {
      _enum: {
        File: 'Hash',
        Literal: `[u8; ${METADATA_VALUE_LITERAL_LENGTH}]`,
        TokenId: 'TokenId',
        None: null,
      },
    },
    Role: {
      _enum: ['Owner', 'Customer', 'AdditiveManufacturer', 'Laboratory', 'Buyer', 'Supplier', 'Reviewer'],
    },
    ProcessIdentifier: `[u8; ${PROCESS_IDENTIFIER_LENGTH}]`,
    ProcessVersion: 'u32',
    ProcessId: {
      id: 'ProcessIdentifier',
      version: 'ProcessVersion',
    },
    Process: {
      status: 'ProcessStatus',
      restrictions: 'Vec<Restriction>',
    },
    ProcessStatus: {
      _enum: ['Disabled', 'Enabled'],
    },
    Restriction: {
      _enum: {
        None: '()',
        SenderOwnsAllInputs: '()',
        FixedNumberOfInputs: 'FixedNumberOfInputsRestriction',
        FixedNumberOfOutputs: 'FixedNumberOfOutputsRestriction',
      },
    },
    FixedNumberOfInputsRestriction: {
      num_inputs: 'u32',
    },
    FixedNumberOfOutputsRestriction: {
      num_outputs: 'u32',
    },
    IsNew: 'bool',
    Restrictions: 'Vec<Restriction>',
  },
}

const api = new ApiPromise(apiOptions)

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

    acc.push({ address: item, alias: memberAlias ? memberAlias[0].alias : memberAlias })

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
