/**
 * The routes.
 *
 * @author Sanna Doolk
 * @version 1.0.0
 */

import express from 'express'
import createError from 'http-errors'
import { router as oauthRouter } from './oauth-router.js'

export const router = express.Router()

router.use('/oauth', oauthRouter)
router.use('*', (req, res, next) => next(createError(404)))
