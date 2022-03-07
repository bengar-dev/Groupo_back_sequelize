const { Sequelize, DataTypes, Model } = require('sequelize')
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_MDP, {
  host: process.env.DB_HOST,
  dialect: 'mysql'
})

  class User extends Model {
    static associate(models) {
      models.User.hasMany(models.Post, { foreignKey: 'id'})
      models.User.hasMany(models.Cmt, { foreignKey: 'id'})
    }
  }

  User.init({
    id: {
      type: DataTypes.BIGINT(11),
      autoIncrement: true,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull:false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull:false
    },
    lastname: {
      type: DataTypes.STRING(255),
      allowNull:false
    },
    firstname: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: 'https://www.belin.re/wp-content/uploads/2018/11/default-avatar.png'
    },
    admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'User'
  })


module.exports = sequelize.model('User')
