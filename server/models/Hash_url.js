"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Hash_url extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.`
     */
    static associate(models) {
      // define association here
    }
  }
  Hash_url.init(
    {
      domainId: DataTypes.INTEGER,
      hash: DataTypes.STRING,
      url: DataTypes.STRING,
      expiry: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Hash_url",
    }
  );
  return Hash_url;
};
