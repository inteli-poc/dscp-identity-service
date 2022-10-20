import { describe, before, it } from 'mocha'
import jsonChai from 'chai-json'
import chai from 'chai'

const { expect } = chai.use(jsonChai)

import { createHttpServer } from '../../app/server.js'
import { apiDocs } from '../helper/routeHelper.js'

describe('api-docs', function () {
  let app

  before(async function () {
    app = await createHttpServer()
  })

  it('should return 200', async function () {
    const actualResult = await apiDocs(app)

    expect(actualResult.status).to.equal(200)
    expect(actualResult.body).to.be.a.jsonObj()
    expect(JSON.stringify(actualResult.body)).to.include('openapi')
    expect(JSON.stringify(actualResult.body)).to.include('info')
  })
})
