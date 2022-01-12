// const OpenAPIResponseValidator = require('openapi-response-validator').default
//
// const apiDocResponses = require('../api-responses')
//
// const membersResponses = {
//   200: apiDocResponses['200'],
//   400: apiDocResponses['400'],
//   default: apiDocResponses.default,
// }
//
// const validateMembersResponse = (statusCode, result) => {
//   const responseValidator = new OpenAPIResponseValidator({ responses: membersResponses })
//
//   return responseValidator.validateResponse(statusCode, result)
// }
//
// const memberAliasesResponses = apiDocResponses
//
// const validateMemberAliasesResponse = (statusCode, result) => {
//   const responseValidator = new OpenAPIResponseValidator({ responses: memberAliasesResponses })
//
//   return responseValidator.validateResponse(statusCode, result)
// }
//
// module.exports = {
//   membersResponses,
//   validateMembersResponse,
//   memberAliasesResponses,
//   validateMemberAliasesResponse,
// }
