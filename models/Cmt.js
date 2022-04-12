const { Sequelize, DataTypes, Model } = require('sequelize')
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_MDP, {
  host: process.env.DB_HOST,
  dialect: 'mysql'
})

  class Cmt extends Model {
    static associate(models) {
     models.Cmt.belongsTo(models.Post, { foreignKey: 'postId', onDelete: 'cascade'})
     models.Cmt.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'cascade'})
    }
  }

  Cmt.init({
    id: {
      type: DataTypes.BIGINT(11),
      autoIncrement: true,
      primaryKey: true
    },
    cmtdate: {
      type: Sequelize.DATE,
      allowNull:false,
      defaultValue: new Date()
    },
    userId: {
      type: DataTypes.BIGINT(11),
      allowNull: false
    },
    postId: {
      type: DataTypes.BIGINT(11),
      allowNull: false
    },
    msg: {
      type: DataTypes.TEXT,
      allowNull:true
    }
  }, {
    sequelize,
    modelName: 'Cmt'
  })


module.exports = sequelize.model('Cmt')
