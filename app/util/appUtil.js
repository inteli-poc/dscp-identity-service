import { ApiPromise, WsProvider } from '@polkadot/api'

import env from '../env.js'
import logger from '../logger.js'
import { getMemberAliasesDb } from '../db.js'

const { API_HOST, API_PORT } = env

const provider = new WsProvider(`ws://${API_HOST}:${API_PORT}`)
const api = new ApiPromise({ provider })

api.isReadyOrError.catch(() => {}) // prevent unhandled promise rejection errors

api.on('disconnected', () => {
  logger.warn(`Disconnected from substrate node at ${API_HOST}:${API_PORT}`)
})

api.on('connected', () => {
  logger.info(`Connected to substrate node at ${API_HOST}:${API_PORT}`)
})

api.on('error', (err) => {
  logger.error(`Error from substrate node connection. Error was ${err.message || JSON.stringify(err)}`)
})

export async function membershipReducer(members) {
  members = members.toJSON() || []

  const memberAliases = await getMemberAliasesDb(members)

  return members.reduce((acc, item) => {
    const memberAlias = memberAliases.find(({ address }) => address === item)

    // set alias as address if no alias found
    acc.push({ address: item, alias: memberAlias ? memberAlias.alias : item })

    return acc
  }, [])
}

export async function getMembers() {
  await api.isReady

  return api.query.membership.members()
}
