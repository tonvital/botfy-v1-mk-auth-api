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
  let formatted = 'NOT-VALID'

  if (cpf.isValid(cpfCnpj)) {
    formatted = cpf.format(cpfCnpj)
  } else if (cnpj.isValid(cpfCnpj)) {
    formatted = cnpj.format(cpfCnpj)
  }

  return formatted
}

export const getOnlyNumber = (value: string) => {
  return value.replace(/\D/g, '')
}

export const print = (
  message: any,
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
