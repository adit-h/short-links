module.exports = {
    development: {
      username: process.env.FE_DB_USER,
      password: process.env.FE_DB_PASS,
      database: process.env.FE_DB_NAME,
      host: process.env.FE_DB_HOST,
      port: process.env.FE_DB_PORT,
      dialect: "mysql",
      use_env_variable: false,
      define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_bin'
      },
    },
    // local: {
    //   username: "root",
    //   password: null,
    //   database: "database_test",
    //   host: "127.0.0.1",
    //   dialect: "mysql",
    //   use_env_variable: false
    // },
    // production: {
    //   username: "root",
    //   password: null,
    //   database: "database_production",
    //   host: "127.0.0.1",
    //   dialect: "mysql",
    //   use_env_variable: false
    // },
  };
  