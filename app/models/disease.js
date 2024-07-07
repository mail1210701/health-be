'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class disease extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.disease_restriction, {
        foreignKey: {
          name: "disease_id"
        },
      })

      this.hasMany(models.history_disease, {
        foreignKey: {
          name: "disease_id"
        },
      })
    }
  }
  disease.init({
    disease_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    disease_name: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'disease',
    tableName: 'diseases'
  });

  disease.removeAttribute("id");

  return disease;
};