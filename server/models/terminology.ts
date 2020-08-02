import { Model, DataTypes, Optional } from 'sequelize'
import { sequelize } from '../lib/database'

interface TerminologyAttributes {
  id: number
  textId: number
  category: string
  lang: string
  text: string
}

type TerminologyCreationAttributes = Optional<TerminologyAttributes, 'id'>

class Terminology extends Model<TerminologyAttributes, TerminologyCreationAttributes> implements TerminologyAttributes {
  public id!: number
  public textId!: number
  public category!: string
  public lang!: string
  public text!: string

  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Terminology.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  textId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: 'uniq_text_id_category_lang'
  },
  category: {
    type: new DataTypes.STRING(128),
    allowNull: false,
    unique: 'uniq_text_id_category_lang'
  },
  lang: {
    type: new DataTypes.STRING(128),
    allowNull: false,
    unique: 'uniq_text_id_category_lang'
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  sequelize
})

export default Terminology
