/**
 * The starting point of the application.
 *
 * @author Sanna Doolk
 * @version 1.0.0
 */

import express from 'express'
import hbs from 'express-hbs'
import helmet from 'helmet'
import logger from 'morgan'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { router } from './routes/router.js'
import http from 'http'

/**
 * The main function of the application.
 */
async function main () {
  const app = express()

  const directoryFullName = dirname(fileURLToPath(import.meta.url))

  const baseURL = process.env.BASE_URL || '/'

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(), 
          'default-src': ["'self'"],
          'script-src': ["'self'", 'https://gitlab.lnu.se/', 'cdn.jsdelivr.net'],
          'img-src': ["'self'", 'https://gitlab.lnu.se/', '*.gravatar.com', 'cdn.jsdelivr.net']
        }
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false
    })
  )

  app.use(logger('dev'))

  app.engine('hbs', hbs.express4({
    defaultLayout: join(directoryFullName, 'views', 'layouts', 'default'),
    partialsDir: join(directoryFullName, 'views', 'partials')
  }))
  app.set('view engine', 'hbs')
  app.set('views', join(directoryFullName, 'views'))

  app.use(express.urlencoded({ extended: false }))

  app.use(express.json())

  app.use(express.static(join(directoryFullName, '..', 'public')))

  if (app.get('env') === 'production') {
    app.set('trust proxy', 1)
  }

  const server = http.createServer(app)

  app.use((req, res, next) => {
    res.locals.baseURL = baseURL

    next()
  })

  app.use('/', router)

  app.use(function (err, req, res, next) {
    if (err.status === 404) {
      return res
        .status(404)
        .sendFile(join(directoryFullName, 'views', 'errors', '404.html'))
    }

    if (req.app.get('env') !== 'development') {
      return res
        .status(500)
        .sendFile(join(directoryFullName, 'views', 'errors', '500.html'))
    }
    res
      .status(err.status || 500)
      .render('errors/error', { error: err })
  })

  server.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`)
    console.log('Press Ctrl-C to terminate...')
  })
}

main().catch(console.error)
