/* eslint no-console: "off" */
const request = require('supertest')

const { API_MAJOR_VERSION } = require('../../app/env')

async function apiDocs({ app }) {
  return request(app)
    .get(`/${API_MAJOR_VERSION}/api-docs`)
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .then((response) => {
      return response
    })
    .catch((err) => {
      console.error(`healthCheckErr ${err}`)
      return err
    })
}

async function healthCheck({ app }) {
  return request(app)
    .get('/health')
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .then((response) => {
      return response
    })
    .catch((err) => {
      console.error(`healthCheckErr ${err}`)
      return err
    })
}

async function getMembersRoute({ app }, authToken) {
  return request(app)
    .get(`/${API_MAJOR_VERSION}/members`)
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${authToken}`)
    .then((response) => {
      return response
    })
    .catch((err) => {
      console.error(`getMembersErr ${err}`)
      return err
    })
}

async function getMemberByAliasOrAddressRoute({ app }, aliasOrAddress, authToken) {
  return request(app)
    .get(`/${API_MAJOR_VERSION}/members/${aliasOrAddress}`)
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${authToken}`)
    .then((response) => {
      return response
    })
    .catch((err) => {
      console.error(`getMembersErr ${err}`)
      return err
    })
}

async function putMemberAliasRoute({ app }, authToken, address, { alias }) {
  return request(app)
    .put(`/${API_MAJOR_VERSION}/members/${address}`)
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ alias })
    .then((response) => {
      return response
    })
    .catch((err) => {
      console.error(`putMemberErr ${err}`)
      return err
    })
}

module.exports = {
  apiDocs,
  healthCheck,
  getMembersRoute,
  getMemberByAliasOrAddressRoute,
  putMemberAliasRoute,
}
