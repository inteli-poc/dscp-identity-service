const knex = require('knex')

const env = require('./env')

const client = knex({
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

async function getMemberAliasesDb(members) {
  return client('members AS m').select(['m.address', 'm.alias']).whereIn('address', members).orderBy('alias')
}

async function getMembersByAddressDb({ address }) {
  return client('members AS m').select(['m.address', 'm.alias']).where({ address })
}

async function getMembersByAliasDb({ alias }) {
  return client('members AS m').select(['m.address', 'm.alias']).where({ alias })
}

async function createMemberAliasDb({ address, alias }) {
  return client('members').insert({ address, alias }).returning(['address', 'alias'])
}

async function updateMemberAliasDb({ address, alias }) {
  return client('members').update({ alias }).where({ address }).returning(['address', 'alias'])
}

module.exports = {
  client,
  getMemberAliasesDb,
  getMembersByAddressDb,
  getMembersByAliasDb,
  createMemberAliasDb,
  updateMemberAliasDb,
}
