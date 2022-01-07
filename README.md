# vitalam-identity-service

Identity service for `VITALam`. Provides API functionality for on-chain identities. 

## Environment Variables

`vitalam-identity-service` is configured primarily using environment variables as follows:

| variable                      | required | default | description                                                                                     |
| :---------------------------- | :------: | :-----: | :---------------------------------------------------------------------------------------------- |
| SERVICE_TYPE                  |    N     | `info`  | Logging level. Valid values are [`trace`, `debug`, `info`, `warn`, `error`, `fatal`]            |
| PORT                          |    N     | `3001`  | The port for the API to listen on                                                               |
| LOG_LEVEL                     |    N     | `info`  | Logging level. Valid values are [`trace`, `debug`, `info`, `warn`, `error`, `fatal`]            |
| API_VERSION                   |    N     |    -    | API version                                                                                     |
| API_MAJOR_VERSION             |    N     |    -    | API major version                                                                               |
