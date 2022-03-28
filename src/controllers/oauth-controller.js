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
      const stateString = this.generateRandomString(15)
      const authorizeLink = `https://gitlab.lnu.se/oauth/authorize?client_id=${process.env.APP_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&state=${stateString}&scope=read_user`

    // https://gitlab.example.com/oauth/authorize?client_id=APP_ID&redirect_uri=REDIRECT_URI&response_type=code&state=STATE&scope=REQUESTED_SCOPES


    /*const response = await fetch(authorizeLink, {
      method: 'POST'
    })*/
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
    console.log('redirected')
    // GET /oauth/callback?code=3876a0f7fa45655dd50a1f82365dce95cd515803d96f7fd62cdcfb1b276e7d76&state=jC3QKJPzFhpjvJi 200 58.398 ms - 345

    // "https://gitlab.lnu.se/oauth/token/client_id=${process.env.app_id}&client_secret=${p[…]pe=authorization_code&redirect_uri=${process.env.redirect_url}
    
    // `https://gitlab.lnu.se/oauth/token?client_id=${process.env.APP_ID}&client_secret=${process.env.SECRET}&code=${req.query.code}&redirect_uri=${process.env.REDIRECT_URI}` 

    // parameters = 'client_id=APP_ID&client_secret=APP_SECRET&code=RETURNED_CODE&grant_type=authorization_code&redirect_uri=REDIRECT_URI'

    console.log(req.query.code)
    res.render('home/callback')
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
