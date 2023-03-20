import createJWKSMock from 'mock-jwks'
import { describe, test, before, afterEach } from 'mocha'
import { expect } from 'chai'
import nock from 'nock'

import { createHttpServer } from '../../app/server.js'
import {
  getMembersRoute,
  getMemberByAliasOrAddressRoute,
  putMemberAliasRoute,
  getSelfAddress,
} from '../helper/routeHelper.js'
import env from '../../app/env.js'
import { cleanup } from '../seeds/members.js'

const { AUTH_ISSUER, AUTH_AUDIENCE, AUTH_TYPE } = env

const USER_ALICE_TOKEN = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
const USER_CHARLIE_TOKEN = '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y'
const USER_BOB_TOKEN = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty'

const describeAuthOnly = AUTH_TYPE === 'JWT' ? describe : describe.skip
const describeNoAuthOnly = AUTH_TYPE === 'NONE' ? describe : describe.skip

describe('routes', function () {
  this.timeout(3000)
  before(async () => {
    nock.disableNetConnect()
    nock.enableNetConnect((host) => host.includes('127.0.0.1') || host.includes('localhost'))
  })

  afterEach(() => {
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describeAuthOnly('authenticated', function () {
    let app
    let jwksMock
    let authToken

    before(async function () {
      await cleanup()

      app = await createHttpServer()

      jwksMock = createJWKSMock(AUTH_ISSUER)
      jwksMock.start()
      authToken = jwksMock.token({
        aud: AUTH_AUDIENCE,
        iss: AUTH_ISSUER,
      })
    })

    after(async function () {
      await jwksMock.stop()
    })

    afterEach(async function () {
      await cleanup()
    })

    test('return membership members', async function () {
      const expectedResult = [
        { address: USER_BOB_TOKEN, alias: null },
        { address: USER_CHARLIE_TOKEN, alias: null },
        { address: USER_ALICE_TOKEN, alias: null },
      ]

      const res = await getMembersRoute(app, authToken)

      expect(res.status).to.equal(200)
      expect(res.body).deep.equal(expectedResult)
    })

    test('return membership members with aliases', async function () {
      const expectedResult = [
        { address: USER_BOB_TOKEN, alias: null },
        { address: USER_CHARLIE_TOKEN, alias: 'CHARLIE' },
        { address: USER_ALICE_TOKEN, alias: null },
      ]

      await putMemberAliasRoute(app, authToken, USER_CHARLIE_TOKEN, { alias: 'CHARLIE' })
      const res = await getMembersRoute(app, authToken)

      expect(res.status).to.equal(200)
      expect(res.body).deep.equal(expectedResult)
    })

    test('update non-existing member alias', async function () {
      const expectedResult = { address: USER_CHARLIE_TOKEN, alias: 'CHARLIE' }

      const res = await putMemberAliasRoute(app, authToken, USER_CHARLIE_TOKEN, { alias: 'CHARLIE' })

      expect(res.status).to.equal(201)
      expect(res.body).deep.equal(expectedResult)
    })

    test('update existing member alias', async function () {
      const expectedResult = { message: 'member alias already exists' }

      await putMemberAliasRoute(app, authToken, USER_CHARLIE_TOKEN, { alias: 'CHARLIE' })
      const res = await putMemberAliasRoute(app, authToken, USER_CHARLIE_TOKEN, { alias: 'CHARLIE' })

      expect(res.status).to.equal(409)
      expect(res.body).deep.equal(expectedResult)
    })

    test('update existing member alias', async function () {
      const expectedResult = { address: USER_CHARLIE_TOKEN, alias: 'CHARLIE_UPDATE' }

      await putMemberAliasRoute(app, authToken, USER_CHARLIE_TOKEN, { alias: 'CHARLIE' })
      const res = await putMemberAliasRoute(app, authToken, USER_CHARLIE_TOKEN, { alias: 'CHARLIE_UPDATE' })

      expect(res.status).to.equal(200)
      expect(res.body).deep.equal(expectedResult)
    })

    test('update alternative non-existing member with duplicate alias', async function () {
      const expectedResult = { message: 'member alias already exists' }

      await putMemberAliasRoute(app, authToken, USER_CHARLIE_TOKEN, { alias: 'CHARLIE' })
      const res = await putMemberAliasRoute(app, authToken, USER_BOB_TOKEN, { alias: 'CHARLIE' })

      expect(res.status).to.equal(409)
      expect(res.body).deep.equal(expectedResult)
    })

    test('get member by alias', async function () {
      await putMemberAliasRoute(app, authToken, USER_CHARLIE_TOKEN, { alias: 'CHARLIE' })

      const expectedResult = {
        address: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
        alias: 'CHARLIE',
      }

      const res = await getMemberByAliasOrAddressRoute(app, 'CHARLIE', authToken)

      expect(res.status).to.equal(200)
      expect(res.body).deep.equal(expectedResult)
    })

    test('get member by incorrect alias', async function () {
      await putMemberAliasRoute(app, authToken, USER_CHARLIE_TOKEN, { alias: 'CHARLIE' })
      const expectedResult = { message: 'Member does not exist' }

      const res = await getMemberByAliasOrAddressRoute(app, 'CHARLIE_UPDATE', authToken)

      expect(res.status).to.equal(404)
      expect(res.body).deep.equal(expectedResult)
    })

    test('get member by invalid alias', async function () {
      const invalidAlias = Array(256).fill('a').join('')
      const expectedResult = { message: 'Invalid member Alias or Address' }

      const res = await getMemberByAliasOrAddressRoute(app, invalidAlias, authToken)

      expect(res.status).to.equal(400)
      expect(res.body).deep.equal(expectedResult)
    })

    test('get member by address', async function () {
      await putMemberAliasRoute(app, authToken, USER_CHARLIE_TOKEN, { alias: 'CHARLIE' })

      const expectedResult = {
        address: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
        alias: 'CHARLIE',
      }

      const res = await getMemberByAliasOrAddressRoute(
        app,
        '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
        authToken
      )

      expect(res.status).to.equal(200)
      expect(res.body).deep.equal(expectedResult)
    })

    test('get self address or return default', async function () {
      const { status, body } = await getSelfAddress(app, authToken)
      expect(status).to.equal(200)
      expect(body).to.deep.equal({
        address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
        alias: null,
      })
    })

    test('get self address with alias', async function () {
      await putMemberAliasRoute(app, authToken, '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty', { alias: 'TEST' })
      const { status, body } = await getSelfAddress(app, authToken)
      expect(status).to.equal(200)
      expect(body).to.deep.equal({
        address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
        alias: 'TEST',
      })
    })
  })

  describeNoAuthOnly('no auth', function () {
    let app

    before(async function () {
      await cleanup()

      app = await createHttpServer()
    })

    afterEach(async function () {
      await cleanup()
    })

    test('return membership members', async function () {
      const expectedResult = [
        { address: USER_BOB_TOKEN, alias: null },
        { address: USER_CHARLIE_TOKEN, alias: null },
        { address: USER_ALICE_TOKEN, alias: null },
      ]

      const res = await getMembersRoute(app, null)

      expect(res.status).to.equal(200)
      expect(res.body).deep.equal(expectedResult)
    })

    test('return membership members with aliases', async function () {
      const expectedResult = [
        { address: USER_BOB_TOKEN, alias: null },
        { address: USER_CHARLIE_TOKEN, alias: 'CHARLIE' },
        { address: USER_ALICE_TOKEN, alias: null },
      ]

      await putMemberAliasRoute(app, null, USER_CHARLIE_TOKEN, { alias: 'CHARLIE' })
      const res = await getMembersRoute(app, null)

      expect(res.status).to.equal(200)
      expect(res.body).deep.equal(expectedResult)
    })

    test('get member by alias', async function () {
      await putMemberAliasRoute(app, null, USER_CHARLIE_TOKEN, { alias: 'CHARLIE' })

      const expectedResult = {
        address: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
        alias: 'CHARLIE',
      }

      const res = await getMemberByAliasOrAddressRoute(app, 'CHARLIE', null)

      expect(res.status).to.equal(200)
      expect(res.body).deep.equal(expectedResult)
    })

    test('get member by address', async function () {
      await putMemberAliasRoute(app, null, USER_CHARLIE_TOKEN, { alias: 'CHARLIE' })

      const expectedResult = {
        address: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
        alias: 'CHARLIE',
      }

      const res = await getMemberByAliasOrAddressRoute(app, '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y', null)

      expect(res.status).to.equal(200)
      expect(res.body).deep.equal(expectedResult)
    })

    test('get self address or return default', async function () {
      const { status, body } = await getSelfAddress(app, null)
      expect(status).to.equal(200)
      expect(body).to.deep.equal({
        address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
        alias: null,
      })
    })

    test('get self address with alias', async function () {
      await putMemberAliasRoute(app, null, '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty', { alias: 'TEST' })
      const { status, body } = await getSelfAddress(app, null)
      expect(status).to.equal(200)
      expect(body).to.deep.equal({
        address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
        alias: 'TEST',
      })
    })
  })
})
