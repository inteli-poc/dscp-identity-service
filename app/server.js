import express from 'express'
import cors from 'cors'
import pinoHttp from 'pino-http'
import { initialize } from 'express-openapi'
import swaggerUi from 'swagger-ui-express'
import path from 'path'
import bodyParser from 'body-parser'
import compression from 'compression'

import env from './env.js'
import logger from './logger.js'
import v1ApiDoc from './api-v1/api-doc.js'
import v1ApiService from './api-v1/services/apiService.js'
import { verifyJwks } from './util/authUtil.js'

const { PORT, API_VERSION, API_MAJOR_VERSION, AUTH_TYPE, EXTERNAL_PATH_PREFIX } = env

import url from 'url'
const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function createHttpServer() {
  const app = express()
  const requestLogger = pinoHttp({ logger })

  app.use(cors())
  app.use(compression())
  app.use(bodyParser.json())

  app.get('/health', async (req, res) => {
    res.status(200).send({ version: API_VERSION, status: 'ok' })
    return
  })

  app.use((req, res, next) => {
    if (req.path !== '/health') requestLogger(req, res)
    next()
  })

  const securityHandlers =
    AUTH_TYPE === 'JWT'
      ? {
          bearerAuth: (req) => {
            return verifyJwks(req.headers['authorization'])
          },
        }
      : {}

  await initialize({
    app,
    apiDoc: v1ApiDoc,
    securityHandlers: securityHandlers,
    dependencies: {
      apiService: v1ApiService,
    },
    paths: [path.resolve(__dirname, `api-${API_MAJOR_VERSION}/routes`)],
  })

  const options = {
    swaggerOptions: {
      urls: [
        {
          url: `${v1ApiDoc.servers[0].url}/api-docs`,
          name: 'IdentityService',
        },
      ],
    },
  }

  app.use(
    EXTERNAL_PATH_PREFIX ? `/${EXTERNAL_PATH_PREFIX}/${API_MAJOR_VERSION}/swagger` : `/${API_MAJOR_VERSION}/swagger`,
    swaggerUi.serve,
    swaggerUi.setup(null, options)
  )

  // Sorry - app.use checks arity
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.status) {
      res.status(err.status).send({ error: err.status === 401 ? 'Unauthorised' : err.message })
    } else {
      logger.error('Fallback Error %j', err.stack)
      res.status(500).send('Fatal error!')
    }
  })

  logger.trace('Registered Express routes: %s', {
    toString: () => {
      return JSON.stringify(app._router.stack.map(({ route }) => route && route.path).filter((p) => !!p))
    },
  })

  return { app }
}

/* istanbul ignore next */
export async function startServer() {
  try {
    const { app } = await createHttpServer()

    const setupGracefulExit = ({ sigName, server, exitCode }) => {
      process.on(sigName, async () => {
        server.close(() => {
          process.exit(exitCode)
        })
      })
    }

    const server = await new Promise((resolve, reject) => {
      let resolved = false
      const server = app.listen(PORT, (err) => {
        if (err) {
          if (!resolved) {
            resolved = true
            reject(err)
          }
        }
        logger.info(`Listening on port ${PORT} `)
        if (!resolved) {
          resolved = true
          resolve(server)
        }
      })
      server.on('error', (err) => {
        if (!resolved) {
          resolved = true
          reject(err)
        }
      })
    })

    setupGracefulExit({ sigName: 'SIGINT', server, exitCode: 0 })
    setupGracefulExit({ sigName: 'SIGTERM', server, exitCode: 143 })
  } catch (err) {
    logger.fatal('Fatal error during initialisation: %j', err.message || err)
    logger.fatal('callstack: %j', err.stack || null)
    process.exit(1)
  }
}
