'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class recommendation_history extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.drink, {
        foreignKey: {
          name: "drink_id"
        },
      })
    }
  }
  recommendation_history.init({
    fruit_name: DataTypes.STRING, 
    user_id: DataTypes.INTEGER,
    drink_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'recommendation_history',
    tableName: 'recommendation_histories'
  });
  
  recommendation_history.removeAttribute("id");
  
  return recommendation_history;
};