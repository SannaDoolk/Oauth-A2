/**
 * Module for the oauth-controller.
 *
 * @author Sanna Doolk
 * @version 1.0.0
 */

import fetch from 'node-fetch'

/**
 * Encapsulates a controller.
 */
export class OauthController {
  /**
   * 
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
   * .
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express request object.
   * @param {object} next - Express next middleware function.
   */
  async login (req, res, next) {
    try {
      console.log('login')
      const stateString = this.generateRandomString(15)
      const authorizeLink = `https://gitlab.lnu.se/oauth/authorize?client_id=${process.env.APP_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&state=${stateString}&scope=read_user+profile+email`

      console.log(authorizeLink)
      res.redirect(authorizeLink)
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * .
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express request object.
   * @param {object} next - Express next middleware function.
   */
  async redirect (req, res, next) {
    const getAccessTokenUrl = `https://gitlab.lnu.se/oauth/token?client_id=${process.env.APP_ID}&client_secret=${process.env.SECRET}&code=${req.query.code}&grant_type=authorization_code&redirect_uri=${process.env.REDIRECT_URI}`

    const request = await fetch(getAccessTokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const response = await request.json()
    this.getProfileInfo(response.access_token)

    res.render('home/callback')
  }

  async getProfileInfo (token) {
    const request = await fetch(`https://gitlab.lnu.se/api/v4/user?access_token=${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const userInfoResponse = await request.json()

    const userInfo = {
      name: userInfoResponse.name,
      username: userInfoResponse.username,
      userId: userInfoResponse.id,
      userAvatar: userInfoResponse.avatar_url,
      lastActivity: userInfoResponse.last_activity_on
    }

    // DELA UPP
    const request2 = await fetch(`https://gitlab.lnu.se/api/v4/users/${userInfo.userId}/events?per_page=100&page=1&page=1&access_token=${token}`, {
      method: 'GET'
    })
    const response2 = await request2.json()

    // GER BARA 100 HÄNDELSER

    /*const request3 = await fetch(`https://gitlab.lnu.se/api/v4/users/${userInfo.userId}/events?per_page=100&page=2&access_token=${token}`, {
      method: 'GET',
      headers: {
        //headers: { 'PRIVATE-TOKEN': token }
      }
    })
    const response3 = await request3.json()
    console.log(response3)*/
  }

  /**
   * .
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

// https://gitlab.example.com/oauth/authorize?client_id=APP_ID&redirect_uri=REDIRECT_URI&response_type=code&state=STATE&scope=REQUESTED_SCOPES

// https://gitlab.lnu.se/oauth/authorize?client_id=0137c54dbf8b51b8f623f155a118a098a16b9773e304141a3ebf87da10a0ea06&redirect_uri=http://localhost:8080/oauth/callback&response_type=code&state=dupTtqYI1KF2rAY&scope=read_user
/*

      const response = await fetch(`${process.env.API_LINK}${req.params.id}`, {
        method: 'GET',
        headers: { 'PRIVATE-TOKEN': process.env.ACCESS_TOKEN }
      }) 
*/      
