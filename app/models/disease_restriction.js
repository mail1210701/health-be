'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class disease_restriction extends Model {
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

      this.belongsTo(models.drink, {
        foreignKey: {
          name: "drink_id"
        },
      })
    }
  }
  disease_restriction.init({
    disease_restriction_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    drink_id: DataTypes.INTEGER,
    disease_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'disease_restriction',
  });

  disease_restriction.removeAttribute("id");

  return disease_restriction;
};