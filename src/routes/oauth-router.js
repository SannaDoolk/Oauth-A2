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

router.get('/', (req, res, next) => oauthController.index(req, res, next))
router.get('/login', (req, res, next) => oauthController.login(req, res, next))
router.get('/callback', (req, res, next) => oauthController.redirect(req, res, next)) // redirect
router.get('/home', (req, res, next) => oauthController.getProfileInfo(req, res, next))
