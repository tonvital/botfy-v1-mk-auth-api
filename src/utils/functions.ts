import moment from 'moment'
import fs from 'fs'
import { cpf, cnpj } from 'cpf-cnpj-validator'

export const isDocker = () => process.env.IS_DOCKER === '1'

export const isWindows = () => {
  let ret = false

  let opsys = process.platform
  if (opsys === 'win32') ret = true

  return ret
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const chalk = require('chalk')

export const getFormattedCPFCNPJ = (cpfCnpj: string) => {
  return cpf.isValid(cpfCnpj) ? cpf.format(cpfCnpj) : cnpj.format(cpfCnpj)
}

export const print = (
  message: string,
  type: 'success' | 'info' | 'warning' | 'error' = 'info',
  showHour: boolean = true
) => {
  if (showHour) message = `${moment().format(`HH:mm:ss`)} ${message}`

  const messagesTypes = {
    success: chalk.green(message),
    info: chalk.blue(message),
    warning: chalk.yellow(message),
    error: chalk.red(message)
  }

  return console.log(messagesTypes[type])
}

export const isProd = () => process.env.IS_DOCKER === '1'
