'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.role, {
        foreignKey: {
          name: "role_id"
        },
      })

      this.hasMany(models.history_disease, {
        foreignKey: {
          name: "user_id"
        },
      })

      this.hasMany(models.allergy, {
        foreignKey: {
          name: "user_id"
        },
      })
    }
  }
  user.init({
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    is_active: DataTypes.BOOLEAN,
    role_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'user',
  });
  
  user.removeAttribute("id");

  return user;
};