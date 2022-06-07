# DSCP Identity Service

## Description

A `Node.js` API to support communication to the [Substrate-based](https://www.substrate.io/) [`dscp-node`](https://github.com/digicatapult/dscp-node) (via [`polkadot-js/api`](https://www.npmjs.com/package/@polkadot/api)) and an [`IPFS`](https://ipfs.io/) node.

## Getting started

First, ensure you're running the correct [version](.node-version) of `npm`, then install dependencies using:

```
npm install
```

The API requires instances of Postgresql and [`dscp-node`](https://github.com/digicatapult/dscp-node).
To bring this up locally:

### `dscp-node`

Clone [dscp-node](https://github.com/digicatapult/dscp-node) and follow the README to setup and build a local node. Then run the following in its root directory:

```
./target/release/dscp-node --dev
```

Or run

```
docker-compose up -d
```

and run the DB migrations

```
npx knex migrate:latest --env test
```

## Environment Variables

`dscp-identity-service` is configured primarily using environment variables as follows:

| variable          | required | default | description                                                                                  |
| :---------------- | :------: | :-----: | :------------------------------------------------------------------------------------------- |
| SERVICE_TYPE      |    N     | `info`  | Logging level. Valid values are [`trace`, `debug`, `info`, `warn`, `error`, `fatal`]         |
| PORT              |    N     | `3001`  | The port for the API to listen on                                                            |
| LOG_LEVEL         |    N     | `info`  | Logging level. Valid values are [`trace`, `debug`, `info`, `warn`, `error`, `fatal`]         |
| API_VERSION       |    N     |    -    | API version                                                                                  |
| API_MAJOR_VERSION |    N     |    -    | API major version                                                                            |
| API_HOST          |    Y     |    -    | The hostname of the `dscp-node` the API should connect to                                    |
| API_PORT          |    N     | `9944`  | The port of the `dscp-node` the API should connect to                                        |
| LOG_LEVEL         |    N     | `info`  | Logging level. Valid values are [`trace`, `debug`, `info`, `warn`, `error`, `fatal`]         |
| USER_URI          |    Y     |    -    | The Substrate `URI` representing the private key to use when making `dscp-node` transactions |
| DB_HOST           |    Y     |    -    | Hostname for the db                                                                          |
| DB_PORT           |    N     |  5432   | Port to connect to the db                                                                    |
| DB_NAME           |    N     | `dscp`  | Name of the database to connect to                                                           |
| DB_USERNAME       |    Y     |    -    | Username to connect to the database with                                                     |
| DB_PASSWORD       |    Y     |    -    | Password to connect to the database with                                                     |
| SELF_ADDRESS      |    N     |    -    | Instance wallet address that is returned by `/self` endpoint                                 |
| AUTH_TYPE         |    N     | `NONE`  | Authentication type for routes on the service. Valid values: [`NONE`, `JWT`]                 |

The following environment variables are additionally used when `AUTH_TYPE : 'JWT'`

| variable      | required |                       default                       | description                                                   |
| :------------ | :------: | :-------------------------------------------------: | :------------------------------------------------------------ |
| AUTH_JWKS_URI |    N     | `https://inteli.eu.auth0.com/.well-known/jwks.json` | JSON Web Key Set containing public keys used by the Auth0 API |
| AUTH_AUDIENCE |    N     |                    `inteli-dev`                     | Identifier of the Auth0 API                                   |
| AUTH_ISSUER   |    N     |           `https://inteli.eu.auth0.com/`            | Domain of the Auth0 API                                       |

## Running the API

Having ensured dependencies are installed and running + the relevant environment variables are set, the API can be started in production mode with:

```
npm start
```

## API specification

### Authenticated endpoints

If `AUTH_TYPE` env is set to `JWT`, the rest of the endpoints in `dscp-identity-service` require authentication in the form of a header `'Authorization: Bearer YOUR_ACCESS_TOKEN'`:

1. [GET /members/](#GET-/members)
2. [GET /members/:address](#PUT-/members/:address)

The following endpoints are maintained for backwards compatibility:

### GET /members

The `address` parameter identifies the user running this process, and the `alias` representing a more friendly name version of this. The default value of the latter is null, and is optionally set.

```json
[
  {
    "address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    "alias": "ALICE"
  }
]
```

### PUT /members/:address

The `address` parameter identifies the user running this process, and the `alias` representing a more friendly name version of this. The default value of the latter is null, and is optionally set.

```json
{
  "address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
  "alias": "ALICE_UPDATED"
}
```
