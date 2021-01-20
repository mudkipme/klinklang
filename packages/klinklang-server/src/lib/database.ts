import { Sequelize } from 'sequelize'
import config from './config'

const { database, username, password, host } = config.get('db')

export const sequelize = new Sequelize(database, username, password, {
  dialect: 'postgres',
  host
})
