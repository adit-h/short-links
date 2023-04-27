const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const next = require("next");

const db = require("./server/models");
db.sequelize.sync();
const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
});
const handle = app.getRequestHandler();
const dbService = require("./server/services/DatabaseService");

//const logger = require('./server/services/LoggerService');
//const { default: axios } = require("axios");

app.prepare().then(() => {
  //const csrf = require("csurf");
  const server = express();
  const cacheControl = require("express-cache-controller");

  server.set("etag", false); // turn off
  server.disable("x-powered-by");
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));

  const rateLimit = require("express-rate-limit");
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  });
  // server.use('/api', limiter)
  server.use(
    cacheControl({
      noCache: true,
    })
  );

  const router = require("./server/route");
  server.use("/api", router);

  server.get("/:id", async (req, res) => {
    //console.log("This is a middleware layer!", req.url); // Log req.url
    //req.connection.setTimeout(60*1000)  // set to 1 min

    try {
      let hash = req.params.id;
      var resCode;
      var resMessage;
      var resDebug;

      if (hash.length > 0) {
        resMessage = "lets process the hash";
        resDebug = hash;

        let resUrl = await dbService.getUrlbyHash(hash);
        //console.log(resUrl)
        if (resUrl !== false) {
          resMessage = "Congratulations. Please remain on your seat while we redirect to your URL";
          let realUrl = resUrl.url;
          //console.log(realUrl)
          resDebug += " will redirect to " + realUrl;

          // redirect to external
          res.status(301).redirect(realUrl);
        } else {
          resMessage = "Sorry. Can not process your current url request";
          resCode = 404;
          res.status(resCode).json({
            code: resCode,
            message: resMessage,
            result: resDebug,
          });
        }
      } else {
        resMessage = "Sorry. Can not proceed with empty hash";
        resCode = 404;
        res.status(resCode).json({
          code: resCode,
          message: resMessage,
          result: resDebug,
        });
      }
    } catch (error) {
      console.log(error);
    }
  });

  //server.use(csrf())
  server.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;

    db.sequelize
      .authenticate()
      .then(() => {
        console.log("connection to mysqldb success");
        //logger.log('info', "connection to mysqldb success");
      })
      .catch((error) => {
        console.error("failed to connect to mysqldb:", error.message);
        //logger.log('error', "failed to connect to mysqldb : " + JSON.stringify(error.message));
      });
    console.log(`> Ready on http://localhost:${port}`);

    //logger.log('info', "Starting App.");
  });
});
