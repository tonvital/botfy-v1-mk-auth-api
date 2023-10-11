/* eslint-disable react-hooks/rules-of-hooks */
import 'reflect-metadata'
import { Express } from 'express'
import { useExpressServer } from 'routing-controllers'
import { isProd, print } from './utils/functions'
import HttpResponse from './types/http.response'
import { AppDataSource } from './data-source'
import { DataSource } from 'typeorm'

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()

export var datasource: DataSource | null = null

const startAPI = async () => {
  print(`⏳ Starting server boot...`)
  let app: Express = express()

  const port = process.env.PORT

  app.use('/static', express.static(__dirname + '/public'))
  app.use(cors({ origin: '*' }))
  app.use(function (req, res, next) {
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    ) // If needed
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-Requested-With,content-type'
    ) // If needed
    res.setHeader('Access-Control-Allow-Credentials', 'true') // If needed
    next()
  })
  app.use(bodyParser.json({ limit: '100mb' }))
  app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }))

  app = useExpressServer(app, {
    controllers: [__dirname + '/routes/*{.js,.ts}'],
    defaultErrorHandler: false
  })

  app.use(function (req, res, next) {
    if (!res.writableEnded) {
      HttpResponse.error(res, `🤔 Where you go?`)
    }
    res.end()
  })

  app.listen(port, () => {
    print(
      `⚡️ [botfy-mk-auth-api]: Server is running at http://localhost:${port}.`,
      'success'
    )

    if (isProd()) print(`🐳 [botfy-mk-auth-api]: Production build (docker).`)
    else print(`💻 [botfy-mk-auth-api]: DEV build.`)
  })
}

print(`⏳ Starting database connection(${process.env.DATABASE_IP})...`)
AppDataSource.initialize()
  .then(async dts => {
    datasource = dts

    startAPI()
  })
  .catch(error => console.log(error))
