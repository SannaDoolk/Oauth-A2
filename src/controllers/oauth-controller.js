/**
 * Module for the oauth-controller.
 *
 * @author Sanna Doolk
 * @version 1.0.0
 */

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
}
