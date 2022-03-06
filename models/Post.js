const { Sequelize, DataTypes, Model } = require('sequelize')
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_MDP, {
  host: process.env.DB_HOST,
  dialect: 'mysql'
})

  class Post extends Model {
    static associate(models) {
      models.Post.belongsTo(models.User, { foreignKey: 'userId'})
      models.Post.hasMany(models.Cmt, { foreignKey: 'postId'})
    }
  }

  Post.init({
    id: {
      type: DataTypes.BIGINT(11),
      autoIncrement: true,
      primaryKey: true
    },
    postedat: {
      type: Sequelize.DATE,
      allowNull:false,
      defaultValue: new Date()
    },
    userId: {
      type: DataTypes.BIGINT(11),
      allowNull: false
    },
    msg: {
      type: DataTypes.TEXT,
      allowNull:true
    },
    img: {
      type: DataTypes.STRING(255),
      allowNull:true
    },
    userLike: {
      type: DataTypes.STRING(255),
      allowNull:false,
      defaultValue: '[]'
    },
    countLike: {
      type: DataTypes.BIGINT(11),
      allowNull:false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Post'
  })


module.exports = sequelize.model('Post')
