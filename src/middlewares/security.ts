import { RequestHandler } from 'express'
import { AuthorizedApps } from '../constants/authorized.apps'
import { HttpStatus } from '../constants/http.status'
import HttpResponse from '../types/http.response'

export class Security {
  private static isAuthorizedApp(appHash: any) {
    return Object.values(AuthorizedApps).includes(appHash)
  }

  static verifyApp: RequestHandler = async (req: any, res, next) => {
    let canPass = false

    const tokenApp = req.headers.f573853e8dfe5eb0e258afe5595deb
    if (!tokenApp) {
      canPass = false
    }

    try {
      if (Security.isAuthorizedApp(tokenApp)) {
        canPass = true
      } else {
        canPass = false
      }
    } catch (e) {
      canPass = false
    }

    if (canPass) return next()

    return HttpResponse.error(res, 'Unauthorized app.', HttpStatus.FORBIDEN)
  }
}
