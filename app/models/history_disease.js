'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class history_disease extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.disease, {
        foreignKey: {
          name: "disease_id"
        },
      })

      this.belongsTo(models.user, {
        foreignKey: {
          name: "user_id"
        },
      })
    }
  }
  history_disease.init({
    history_disease_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    disease_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'history_disease',
  });

  history_disease.removeAttribute("id");

  return history_disease;
};