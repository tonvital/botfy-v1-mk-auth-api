import 'reflect-metadata'
import { DataSource } from 'typeorm'

const dotenv = require('dotenv')
dotenv.config()

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DATABASE_IP,
  port: 3306,
  username: 'root',
  password: process.env.DATABASE_PASSWORD,
  database: 'mkradius',
  synchronize: true,
  logging: false,
  entities: [],
  migrations: [],
  subscribers: []
})
