/**
 * The routes.
 *
 * @author Sanna Doolk
 * @version 1.0.0
 */

import express from 'express'
import { router as oauthRouter } from './oauth-router.js'

export const router = express.Router()

router.use('/', oauthRouter)
