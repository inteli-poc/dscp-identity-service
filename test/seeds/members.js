const { client } = require('../../app/db')

const cleanup = async () => {
  await client('members').del()
}

module.exports = {
  cleanup,
}
