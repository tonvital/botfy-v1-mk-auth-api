import {
  Controller,
  Res,
  Get,
  QueryParam,
  Post,
  Body
} from 'routing-controllers'
import { Response } from 'express'
import HttpResponse from '../types/http.response'
import Translate from '../i18n/translate'
import moment from 'moment'
import { MKRep } from '../repositorys/MKRep'

@Controller('/botfy-v1-mk-auth')
export class AuthController {
  @Get('/')
  async getRouteGet(
    @QueryParam('f') func: string,
    @QueryParam('cpfCnpj') cpfCnpj: string,
    @QueryParam('billId') billId: string,
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
    } else if (func === 'getBillById') {
      if (!billId)
        return HttpResponse.error(res, Translate.get('missing_parameters'))

      const bill = await MKRep.getClientBillById(billId)

      return HttpResponse.success(bill)
    } else if (func === 'getInstalacoesByClientCPF') {
      if (!cpfCnpj)
        return HttpResponse.error(res, Translate.get('missing_parameters'))

      const installations = await MKRep.getInstalacoesByClientCPF(cpfCnpj)

      return HttpResponse.success(installations)
    } else if (func === 'getAllPlans') {
      const plans = await MKRep.getAllPlans()

      return HttpResponse.success(plans)
    } else if (func === 'getBotfyAttendant') {
      const plans = await MKRep.getBotfyAttendant()

      return HttpResponse.success(plans)
    }

    return HttpResponse.error(res, `Which function do you want?`, 404)
  }

  @Post('/')
  async getRoutePost(
    @QueryParam('f') func: string,
    @Body() body: any,
    @Res() res: Response
  ) {
    if (func === 'createInstallByCPF') {
      const {
        uuid_solic,
        phoneNumber,
        nome,
        email,
        cpfCnpj,
        numeroRes,
        rua,
        bairro,
        complemento,
        cep,
        cidade,
        estado,
        planName,
        obs,
        loginAttendant,
        daysToSendTecSupport,
        dataSolic,
        login,
        senha
      } = body
      if (
        !uuid_solic ||
        !phoneNumber ||
        !nome ||
        !email ||
        !cpfCnpj ||
        !numeroRes ||
        !rua ||
        !bairro ||
        !complemento ||
        !cep ||
        !cidade ||
        !estado ||
        !planName ||
        !obs ||
        !loginAttendant ||
        !daysToSendTecSupport ||
        !dataSolic ||
        !login ||
        !senha
      )
        return HttpResponse.error(res, Translate.get('missing_parameters'))

      const installation = await MKRep.handleCreateInstallation(
        uuid_solic,
        phoneNumber,
        nome,
        email,
        cpfCnpj,
        numeroRes,
        rua,
        bairro,
        complemento,
        cep,
        cidade,
        estado,
        planName,
        obs,
        loginAttendant,
        daysToSendTecSupport,
        dataSolic,
        login,
        senha
      )

      return HttpResponse.success(installation)
    } else if (func === 'handleCreateOS') {
      const {
        chamado,
        nome,
        login,
        email,
        assunto,
        atendente,
        login_atend,
        daysToSendTecSupport
      } = body
      if (
        !chamado ||
        !nome ||
        !login ||
        !email ||
        !assunto ||
        !atendente ||
        !login_atend ||
        !daysToSendTecSupport
      )
        return HttpResponse.error(res, Translate.get('missing_parameters'))

      const support = await MKRep.handleCreateOS(
        chamado,
        nome,
        login,
        email,
        assunto,
        atendente,
        login_atend,
        daysToSendTecSupport
      )

      return HttpResponse.success(support)
    } else if (func === 'createLog') {
      const { login, date, message } = body
      if (!login || !date || !message)
        return HttpResponse.error(res, Translate.get('missing_parameters'))

      const log = await MKRep.createLog(login, date, message)

      return HttpResponse.success(log)
    } else if (func === 'createMessageInOS') {
      const { osId, login, name, message, date } = body
      if (!osId || !login || !name || !message || !date)
        return HttpResponse.error(res, Translate.get('missing_parameters'))

      const createdMessage = await MKRep.createMessageInOS(
        osId,
        login,
        name,
        message,
        date
      )

      return HttpResponse.success(createdMessage)
    } else if (func === 'handleUnlockClientByCPF') {
      const { daysToGiveUnlock, login } = body
      if (!daysToGiveUnlock || !login)
        return HttpResponse.error(res, Translate.get('missing_parameters'))

      const createdMessage = await MKRep.handleUnlockClientByCPF(
        login,
        daysToGiveUnlock
      )

      return HttpResponse.success(createdMessage)
    }

    return HttpResponse.error(res, `Which function do you want?`, 404)
  }
}
