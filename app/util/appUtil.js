const { ApiPromise, WsProvider } = require('@polkadot/api')
const jwksRsa = require('jwks-rsa')
const jwt = require('jsonwebtoken')

const {
  API_HOST,
  API_PORT,
  METADATA_KEY_LENGTH,
  METADATA_VALUE_LITERAL_LENGTH,
  AUTH_AUDIENCE,
  AUTH_JWKS_URI,
  AUTH_ISSUER,
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
    Output: {
      roles: 'BTreeMap<RoleKey, AccountId>',
      metadata: 'BTreeMap<TokenMetadataKey, TokenMetadataValue>',
      parent_index: 'Option<u32>',
    },
    MetadataValue: {
      _enum: {
        File: 'Hash',
        Literal: `[u8; ${METADATA_VALUE_LITERAL_LENGTH}]`,
        None: null,
      },
    },
    Role: {
      // order must match node as values are referenced by index. First entry is default.
      _enum: ['Admin', 'ManufacturingEngineer', 'ProcurementBuyer', 'ProcurementPlanner', 'Supplier'],
    },
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
    const alias = memberAliases.find(({ address }) => address === item) || null

    acc.push({ address: item, alias })

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

const client = jwksRsa({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
  jwksUri: AUTH_JWKS_URI,
})

async function getKey(header, cb) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      logger.warn(`An error occurred getting jwks key ${err}`)
      cb(err, null)
    } else if (key) {
      const signingKey = key.publicKey || key.rsaPublicKey
      cb(null, signingKey)
    }
  })
}

const verifyJwks = async (authHeader) => {
  const authToken = authHeader ? authHeader.replace('Bearer ', '') : ''

  const verifyOptions = {
    audience: AUTH_AUDIENCE,
    issuer: [AUTH_ISSUER],
    algorithms: ['RS256'],
    header: authToken,
  }

  return new Promise((resolve, reject) => {
    jwt.verify(authToken, getKey, verifyOptions, (err, decoded) => {
      if (err) {
        resolve(false)
      } else if (decoded) {
        resolve(true)
      } else {
        logger.warn(`Error verifying jwks`)
        reject({ message: 'An error occurred during jwks verification' })
      }
    })
  })
}

module.exports = {
  getMembers,
  membershipReducer,
  utf8ToUint8Array,
  verifyJwks,
}
