import { Model, DataTypes, Optional } from 'sequelize'
import { omit } from 'lodash'
import { Token } from 'oauth-1.0a'
import { sequelize } from '../lib/database'
import MediaWikiClient from '../lib/mediawiki/client'
import { authedClient } from '../lib/wiki'

interface UserAttributes {
  id: string
  name: string
  wikiId: number
  groups: string[]
  token: Token
}

type UserCreationAttributes = Optional<UserAttributes, 'id'>

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string
  public name!: string
  public wikiId!: number
  public groups!: string[]
  public token!: Token

  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  public toJSON (): Omit<UserAttributes, 'token'> {
    return omit(this.get(), 'token')
  }

  public getWikiClient (): MediaWikiClient {
    return authedClient(this.token)
  }
}

User.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  wikiId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true
  },
  groups: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false
  },
  token: {
    type: DataTypes.JSONB,
    allowNull: false
  }
}, {
  sequelize
})

export default User
