import { Controller, Res, Get, QueryParam } from 'routing-controllers'
import { Response } from 'express'
import HttpResponse from '../types/http.response'
import Translate from '../i18n/translate'
import moment from 'moment'
import { MKRep } from '../repositorys/MKRep'

@Controller('/botfy-v1-mk-auth')
export class AuthController {
  @Get('/')
  async getRoute(
    @QueryParam('f') func: string,
    @QueryParam('cpfCnpj') cpfCnpj: string,
    @Res() res: Response
  ) {
    if (func === 'heathCheck') {
      return HttpResponse.success({
        healthcheck: 'healthy',
        datetime: moment().format(),
        version: '1.0.1'
      })
    } else if (func === 'getClientByCPF') {
      if (!cpfCnpj)
        return HttpResponse.error(res, Translate.get('missing_parameters'))

      const client = await MKRep.getClientByCPFCNPJ(cpfCnpj)

      return HttpResponse.success(client)
    }

    return HttpResponse.error(res, Translate.get('missing_parameters'))
  }
}
