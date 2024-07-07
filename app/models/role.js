'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.user, {
        foreignKey: {
          name: "role_id"
        },
      })
    }
  }
  role.init({
    role_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    role_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'role',
    tableName: 'roles'
  });

  role.removeAttribute("id");

  return role;
};