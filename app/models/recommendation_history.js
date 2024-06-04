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
    }
  }
  recommendation_history.init({
    user_id: DataTypes.INTEGER,
    drink_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'recommendation_history',
  });
  
  recommendation_history.removeAttribute("id");
  
  return recommendation_history;
};