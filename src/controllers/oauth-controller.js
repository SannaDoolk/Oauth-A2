/**
 * Module for the oauth-controller.
 *
 * @author Sanna Doolk
 * @version 1.0.0
 */

import fetch from 'node-fetch'
import cryptoRandomString from 'crypto-random-string'
import createError from 'http-errors'

/**
 * Encapsulates a controller.
 */
export class OauthController {
  /**
   * Renders the index page.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express request object.
   * @param {object} next - Express next middleware function.
   */
  async index (req, res, next) {
    try {
      res.render('home/index')
    } catch (error) {
      next(error)
    }
  }

  /**
   * Checks if a user is logged in.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express request object.
   * @param {Function} next - Express next middleware function.
   * @returns {Error} 404 error.
   */
  async isUserLoggedIn (req, res, next) {
    if (!req.session.access_token) {
      return next(createError(404), 'Page not found')
    }
    next()
  }

  /**
   * Requests an authorization from the service provider.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express request object.
   * @param {object} next - Express next middleware function.
   */
  async requestAuthorization (req, res, next) {
    try {
      const stateString = this.generateRandomStateString()
      req.session.state = stateString

      const authorizeLink = `https://gitlab.lnu.se/oauth/authorize?client_id=${process.env.APP_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&state=${stateString}&scope=read_user`

      res.redirect(authorizeLink)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Requests accesstoken from service provider and generates session with it.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express request object.
   * @param {object} next - Express next middleware function.
   */
  async requestAccessToken (req, res, next) {
    try {
      if (req.query.state === req.session.state) {
        const getAccessTokenUrl = `https://gitlab.lnu.se/oauth/token?client_id=${process.env.APP_ID}&client_secret=${process.env.SECRET}&code=${req.query.code}&grant_type=authorization_code&redirect_uri=${process.env.REDIRECT_URI}`

        const request = await fetch(getAccessTokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        const response = await request.json()

        req.session.regenerate(() => {
          req.session.access_token = response.access_token
          req.session.loggedIn = true

          res.redirect('home')
        })
      } else {
        res.redirect('/oauth')
      }
    } catch (error) {
      next(error)
    }
  }

  /**
   * Fetches information about the user from the service provider and renders it.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express request object.
   * @param {object} next - Express next middleware function.
   */
  async getProfileInfo (req, res, next) {
    try {
      const token = req.session.access_token
      const request = await fetch(`https://gitlab.lnu.se/api/v4/user?access_token=${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const userInfoResponse = await request.json()

      req.session.userID = userInfoResponse.id

      const viewData = {
        name: userInfoResponse.name,
        username: userInfoResponse.username,
        userId: userInfoResponse.id,
        userEmail: userInfoResponse.email,
        userAvatar: userInfoResponse.avatar_url,
        lastActivity: userInfoResponse.last_activity_on
      }
      res.render('home/home', { viewData })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Fetches the users latest activities on the service provider.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express request object.
   * @param {object} next - Express next middleware function.
   */
  async getUserActivities (req, res, next) {
    try {
      const activitiesRequestPage1 = await fetch(`https://gitlab.lnu.se/api/v4/users/${req.session.userID}/events?per_page=100&page=1&page=1&access_token=${req.session.access_token}`, {
        method: 'GET'
      })
      const activitiesResponsePage1 = await activitiesRequestPage1.json()

      // Gör ett andra anrop här eftersom gitlab genererar max 100 activities, känns som det borde finnas ett bättre sätt att lösa detta men har inte fått något annat att fungera.

      const activitiesRequestPage2 = await fetch(`https://gitlab.lnu.se/api/v4/users/${req.session.userID}/events?per_page=100&page=2&access_token=${req.session.access_token}`, {
        method: 'GET'
      })

      const activitiesResponsePage2 = await activitiesRequestPage2.json()

      const viewData = {
        activities: activitiesResponsePage1.map(activity => ({
          actionName: activity.action_name,
          createdAt: activity.created_at,
          targetTitle: activity.target_title,
          targetType: activity.target_type
        }))
      }

      // Plockar ut activity 101 från page 2
      const oneHundredOneActivity = {
        actionName: activitiesResponsePage2[0].action_name,
        createdAt: activitiesResponsePage2[0].created_at,
        targetTitle: activitiesResponsePage2[0].target_title,
        targetType: activitiesResponsePage2[0].target_type
      }

      // Lägger till activity 101 till arrayen med dom 100 första.
      viewData.activities.push(oneHundredOneActivity)

      res.render('home/activities', { viewData })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Destroys the session and logs out the user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express request object.
   * @param {object} next - Express next middleware function.
   */
  async logout (req, res, next) {
    req.session.destroy()
    res.redirect('/oauth')
  }

  /**
   * Generates a random string to be used for state in request.
   *
   * @returns {string} - The random string.
   */
  generateRandomStateString () {
    const state = cryptoRandomString({ length: 25, type: 'url-safe' })
    console.log(state)
    return state
  }
}
