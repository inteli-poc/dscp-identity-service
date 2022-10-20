import { client } from '../../app/db.js'

export const cleanup = async () => {
  await client('members').del()
}
