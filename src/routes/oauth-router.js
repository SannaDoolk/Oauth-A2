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

router.get('/login', (req, res, next) => oauthController.requestAuthorization(req, res, next))

router.get('/callback', (req, res, next) => oauthController.requestAccessToken(req, res, next))

router.get('/home', (req, res, next) => oauthController.isUserLoggedIn(req, res, next), (req, res, next) => oauthController.getProfileInfo(req, res, next))

router.get('/activities', (req, res, next) => oauthController.isUserLoggedIn(req, res, next), (req, res, next) => oauthController.getUserActivities(req, res, next))

router.get('/logout', (req, res, next) => oauthController.logout(req, res, next))
