"use strict";

//const fs = require("fs");
//const path = require("path");
// const Sequelize = require('sequelize');
const { Sequelize, QueryTypes } = require("sequelize");
//const config_db = require(__dirname + '/../../config/database.js');
//console.log(config_db)

const config = {
  host: process.env.FE_DB_HOST,
  port: process.env.FE_DB_PORT,
  username: process.env.FE_DB_USER,
  password: process.env.FE_DB_PASS,
  database: process.env.FE_DB_NAME,
  dialect: "mysql",
  use_env_variable: false,
  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_bin",
  },
};
//console.log(config);

const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host || "localhost",
    port: config.port,
    // pool: config.mysql.pool,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialect: "mysql",
    // dialectOptions: {
    //   dateStrings: true
    // },
    define: config.define,
    transactionType: Sequelize.Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
  }
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.QueryTypes = QueryTypes;

module.exports = db;
