"use strict";
const { Sequelize, DataTypes, Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Domain extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Domain.init(
    {
      domain: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Domain",
    }
  );
  return Domain;
};
