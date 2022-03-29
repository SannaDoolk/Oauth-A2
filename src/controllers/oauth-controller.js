/**
 * Module for the oauth-controller.
 *
 * @author Sanna Doolk
 * @version 1.0.0
 */

import fetch from 'node-fetch'
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
    console.log('checked if user is logged in')
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
      const stateString = this.generateRandomString(15)
      req.session.state = stateString

      const authorizeLink = `https://gitlab.lnu.se/oauth/authorize?client_id=${process.env.APP_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&state=${stateString}&scope=read_user+profile+email`

      res.redirect(authorizeLink)
    } catch (error) {
      console.log(error)
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

          res.redirect('home')
        })
      } else {
        res.redirect('/oauth')
      }
    } catch (error) {
      console.log(error)
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
    console.log(req.session.access_token)
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
  }

  /**
   * Fetches the users latest activities on the service provider.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express request object.
   * @param {object} next - Express next middleware function.
   */
  async getUserActivities (req, res, next) {
    const activitiesRequest = await fetch(`https://gitlab.lnu.se/api/v4/users/${req.session.userID}/events?per_page=100&page=1&page=1&access_token=${req.session.access_token}`, {
      method: 'GET'
    })
    const activitiesResponse = await activitiesRequest.json()
    // BÄTTRE LÖSNING??
    const activitiesRequestPage2 = await fetch(`https://gitlab.lnu.se/api/v4/users/${req.session.userID}/events?per_page=100&page=2&access_token=${req.session.access_token}`, {
      method: 'GET'
    })

    const activitiesResponsePage2 = await activitiesRequestPage2.json()

    const viewData = {
      activities: activitiesResponse.map(activity => ({
        actionName: activity.action_name,
        createdAt: activity.created_at,
        targetTitle: activity.target_title,
        targetType: activity.target_type
      }))
    }
    const pageTwo = {
      activities: activitiesResponsePage2.map(activity => ({
        actionName: activity.action_name,
        createdAt: activity.created_at,
        targetTitle: activity.target_title,
        targetType: activity.target_type
      }))
    }

    viewData.activities.push(pageTwo.activities[0])
    console.log(viewData.activities.length)

    res.render('home/activities', { viewData })
  }

  async logout (req, res, next) {
    req.session.destroy()
    res.redirect('/oauth')
  }

  /**
   * Generates a random string to be used for state in request.
   *
   * @param {string} stringLength - The length of the random string.
   * @returns {string} - The random string.
   */
  generateRandomString (stringLength) {
    // Inspired from https://www.programiz.com/javascript/examples/generate-random-strings

    const validCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < stringLength; i++) {
      result += validCharacters.charAt(Math.floor(Math.random() * validCharacters.length))
    }
    return result
  }
}
