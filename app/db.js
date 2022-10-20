import knex from 'knex'

import env from './env.js'

export const client = knex({
  client: 'pg',
  migrations: {
    tableName: 'migrations',
  },
  connection: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  },
})

export async function getMemberAliasesDb(members) {
  return client('members AS m').select(['m.address', 'm.alias']).whereIn('address', members).orderBy('alias')
}

export async function getMembersByAddressDb({ address }) {
  return client('members AS m').select(['m.address', 'm.alias']).where({ address })
}

export async function getMembersByAliasDb({ alias }) {
  return client('members AS m').select(['m.address', 'm.alias']).where({ alias })
}

export async function createMemberAliasDb({ address, alias }) {
  return client('members').insert({ address, alias }).returning(['address', 'alias'])
}

export async function updateMemberAliasDb({ address, alias }) {
  return client('members').update({ alias }).where({ address }).returning(['address', 'alias'])
}
