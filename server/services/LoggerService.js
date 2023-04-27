const { createLogger, transports, format } = require("winston");
const LokiTransport = require("winston-loki");

let env_labels = {
  host: process.env.CRMNX_LOKI_HOST,
  app: process.env.CRMNX_APP,
  product: process.env.CRMNX_PRODUCT,
  service: process.env.CRMNX_SERVICE,
  environment : process.env.CRMNX_ENV
}
// console.log(env_labels);

const options = {
  transports: [
    new LokiTransport({
      host: process.env.CRMNX_LOKI_HOST,
      labels: env_labels,
      json: true,
      format: format.json(),
      replaceTimestamp: true,
      onConnectionError: (err) => console.error(err),
    }),
    new transports.Console({
      format: format.combine(format.simple(), format.colorize()),
    }),
  ]
}

// Create a logger instance in one file and export it, creating a singleton.
module.exports = createLogger(options);
