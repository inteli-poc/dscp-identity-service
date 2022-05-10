const createJWKSMock = require('mock-jwks').default
const { describe, test, before, afterEach } = require('mocha')
const { expect } = require('chai')
const nock = require('nock')

const { createHttpServer } = require('../../app/server')
const { getMembersRoute, getMemberByAliasOrAddressRoute, putMemberAliasRoute } = require('../helper/routeHelper')
const USER_ALICE_TOKEN = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
const ALICE_STASH = '5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY'
const USER_BOB_TOKEN = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty'
const BOB_STASH = '5HpG9w8EBLe5XCrbczpwq5TSXvedjrBGCwqxK1iQ7qUsSWFc'
const { AUTH_ISSUER, AUTH_AUDIENCE } = require('../../app/env')
const { cleanup } = require('../seeds/members')

describe('routes', function () {
  before(async () => {
    nock.disableNetConnect()
    nock.enableNetConnect((host) => host.includes('127.0.0.1') || host.includes('localhost'))
  })

  afterEach(() => {
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('authenticated routes', function () {
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
        { address: ALICE_STASH, alias: null },
        { address: USER_ALICE_TOKEN, alias: null },
        { address: BOB_STASH, alias: null },
      ]

      const res = await getMembersRoute(app, authToken)

      expect(res.status).to.equal(200)
      expect(res.body).deep.equal(expectedResult)
    })

    test('return membership members with aliases', async function () {
      const expectedResult = [
        { address: USER_BOB_TOKEN, alias: null },
        { address: ALICE_STASH, alias: 'ALICE_STASH' },
        { address: USER_ALICE_TOKEN, alias: null },
        { address: BOB_STASH, alias: null },
      ]

      await putMemberAliasRoute(app, authToken, ALICE_STASH, { alias: 'ALICE_STASH' })
      const res = await getMembersRoute(app, authToken)

      expect(res.status).to.equal(200)
      expect(res.body).deep.equal(expectedResult)
    })

    test('update non-existing member alias', async function () {
      const expectedResult = { address: ALICE_STASH, alias: 'ALICE_STASH' }

      const res = await putMemberAliasRoute(app, authToken, ALICE_STASH, { alias: 'ALICE_STASH' })

      expect(res.status).to.equal(201)
      expect(res.body).deep.equal(expectedResult)
    })

    test('update existing member alias', async function () {
      const expectedResult = { message: 'member alias already exists' }

      await putMemberAliasRoute(app, authToken, ALICE_STASH, { alias: 'ALICE_STASH' })
      const res = await putMemberAliasRoute(app, authToken, ALICE_STASH, { alias: 'ALICE_STASH' })

      expect(res.status).to.equal(409)
      expect(res.body).deep.equal(expectedResult)
    })

    test('update existing member alias', async function () {
      const expectedResult = { address: ALICE_STASH, alias: 'ALICE_STASH_UPDATE' }

      await putMemberAliasRoute(app, authToken, ALICE_STASH, { alias: 'ALICE_STASH' })
      const res = await putMemberAliasRoute(app, authToken, ALICE_STASH, { alias: 'ALICE_STASH_UPDATE' })

      expect(res.status).to.equal(200)
      expect(res.body).deep.equal(expectedResult)
    })

    test('update alternative non-existing member with duplicate alias', async function () {
      const expectedResult = { message: 'member alias already exists' }

      await putMemberAliasRoute(app, authToken, ALICE_STASH, { alias: 'ALICE_STASH' })
      const res = await putMemberAliasRoute(app, authToken, BOB_STASH, { alias: 'ALICE_STASH' })

      expect(res.status).to.equal(409)
      expect(res.body).deep.equal(expectedResult)
    })

    test('get member by alias', async function () {
      await putMemberAliasRoute(app, authToken, ALICE_STASH, { alias: 'ALICE_STASH' })

      const expectedResult = {
        address: '5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY',
        alias: 'ALICE_STASH',
      }

      const res = await getMemberByAliasOrAddressRoute(app, 'ALICE_STASH', authToken)

      expect(res.status).to.equal(200)
      expect(res.body).deep.equal(expectedResult)
    })

    test('get member by incorrect alias', async function () {
      await putMemberAliasRoute(app, authToken, ALICE_STASH, { alias: 'ALICE_STASH' })
      const expectedResult = { message: 'Member does not exist' }

      const res = await getMemberByAliasOrAddressRoute(app, 'ALICE_STASH_UPDATE', authToken)

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
      await putMemberAliasRoute(app, authToken, ALICE_STASH, { alias: 'ALICE_STASH' })

      const expectedResult = {
        address: '5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY',
        alias: 'ALICE_STASH',
      }

      const res = await getMemberByAliasOrAddressRoute(
        app,
        '5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY',
        authToken
      )

      expect(res.status).to.equal(200)
      expect(res.body).deep.equal(expectedResult)
    })
  })
})
