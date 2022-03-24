/**
 * Oauth routers.
 *
 * @author Sanna Doolk
 * @version 1.0.0
 */

import express from 'express'
import { OauthController } from '../controllers/oauth-controller.js'

export const router = express.Router()

const oauthController = new OauthController()

router.get('/', oauthController.index)
 