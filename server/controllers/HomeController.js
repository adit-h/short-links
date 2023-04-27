var express = require("express");
var router = express.Router();

//const logger = require("../services/LoggerService");
const db = require("../services/DatabaseService");
//const validator = require ('../services/ValidatorService')
const linkify = require("linkifyjs");
const Hashids = require("hashids/cjs");
const isValidDomain = require("is-valid-domain");
//const salty = "this is my salt"
const salty = process.env.salt;

router.get("/shorten", function (req, res) {
  console.log("HomeController: GET /shorten");
  res.json({ message: "Hello from GET shorten" });
});

router.post("/test", function (req, res) {
  var resCode;
  var resMessage;
  var resDebug;

  try {
    const params = req.body;
    console.log("Got Body : ", params);
    //console.log(salty)

    let msg = params.message;
    let domain = params.domain;

    let raw_links = linkify.find(msg);
    if (raw_links.length > 0) {
      raw_links.forEach(function (data) {
        console.log(data.value);
        let newlink = "";

        // TODO : hash the value
        let hashme = new Hashids(data.value, 7); // pad to length 7
        //console.log(hashme)
        let me = hashme.encode(salty);
        console.log(me);
        // TODO : replace url with hashed shortened
        newlink = "https://" + domain + "/" + me;
        console.log(newlink);
        msg = msg.replace(data.value, newlink);
      });
      console.log("Content URL updated");
    } else {
      console.log("No valid URLs found");
    }

    resCode = 200;
    resMessage = "Shorten test success";
    resDebug = msg;
  } catch (e) {
    console.log(e);
    resCode = 500;
    resMessage = "Error";
    resDebug = e;
  }

  res.status(resCode).json({
    code: resCode,
    message: resMessage,
    result: resDebug,
  });
});

router.post("/shorten-v1", async function (req, res) {
  console.debug("HomeController: /shorten");
  var resCode;
  var resMessage;
  var resDebug;

  try {
    const params = req.body;
    console.log("Got Body : ", params);

    let msg = params.message;
    let domain = params.domain;
    let domainId = 0;

    if (domain) {
      let isExist = await db.checkDomain(domain);
      //console.log(isExist)
      if (!isExist) {
        console.log("New domain found");
        await db.insertDomain(domain);
        //console.log(test1)
        console.log("New domain insert success");
      } else {
        console.log("Domain already exists");
        let domainData = await db.getDomain(domain);
        if (domainData) {
          domainId = domainData.id;
          console.log("Debug domain value after query", domainId);
        } else {
          console.log("Sorry, something wrong. Domain not found after query");
        }
      }
    }

    // lets find and get any urls inside the body
    let raw_links = linkify.find(msg);
    let ar_links = [];
    if (raw_links.length > 0) {
      raw_links.forEach(function (data) {
        console.log(data.value);
        let newlink = "";

        // TODO : check DB for exisintg URL
        let checkUrl = db.checkUrl(data.value);
        if (!checkUrl) {
          // Insert new URL
          let newUrl = db.insertUrl(domainId, data.value);
          console.log(newUrl);
          /*
            // TODO : hash the value
            let hashme = new Hashids(data.value, 7)  // pad to length 7
            console.log(hashme)
            let me = hashme.encode(salty)
            console.log(me)
            // TODO : replace url with hashed shortened
            newlink = 'https://'+ params.domain +'/'+ me
            */
        } else {
          console.log("found existing URL");
          let dataUrl = db.getUrl(data.value);
          console.log(dataUrl);
          newlink = "https://" + domain + "/" + dataUrl.hash;
        }

        console.log(newlink);
        msg = msg.replace(data.value, newlink);
        //console.log(result)

        // store all links
        //let ars = { "did":domainId, "hash":me, "link":data.value }
        //ar_links.push(ars)
      });

      // lets go, lets insert the url to DB
      /*
        ar_links.forEach(function(datas){
          //console.log(datas)
          db.insertMultiUrl(datas)
        }) */

      resMessage = "Shorten completed";
      resDebug = msg;
      //logger.log("info", msg);
    } else {
      resMessage = "Sorry no valid URL found to shorten";
    }

    let test = await db.convert(data);
    //console.log(ar_links)

    resCode = 200;
    //logger.log("info", "lets shorten the urls");
  } catch (e) {
    if (e.status) {
      resCode = e.status;

      if (e.data) {
        resMessage = e.data.message;
      }
    } else if (e.response) {
      resCode = e.response.status;

      if (e.response.data) {
        resMessage = e.response.data.message;
      }
    } else if (e.request) {
      resCode = 504;
      resMessage = "Request timeout. Please try again later.";
      resDebug = JSON.stringify(e);
      //logger.log("error", resMessage);
    } else {
      resCode = 500;
      resMessage = "Unhandled exception.";
      resDebug = JSON.stringify(e);
      //logger.log("error", resMessage);
    }
  }

  res.status(resCode).json({
    code: resCode,
    message: resMessage,
    result: resDebug,
  });
});


router.post("/shorten", async function (req, res) {
  console.debug("HomeController: /shorten");
  var resCode;
  var resMessage;
  var resDebug;

  const params = req.body;
  console.log("Got Body : ", params);

  let msg = params.message;
  let domain = params.domain;
  let domainId = 0;

  // TODO : need to check valid domain here
  try {
    if (isValidDomain(domain)) {
      if (domain) {
        let isExist = await db.checkDomain(domain);
        //console.log(isExist)
        if (!isExist) {
          console.log("New domain found");
          await db.insertDomain(domain);
          //console.log(test1)
          console.log("New domain insert success");
        } else {
          console.log("Domain already exists");
          let domainData = await db.getDomain(domain);
          if (domainData) {
            domainId = domainData.id;
            console.log("Debug domain value after query", domainId);
          } else {
            console.log("Sorry, something wrong. Domain not found after query");
          }
        }
      }

      // lets find and get any urls inside the body
      let raw_links = linkify.find(msg);
      let ar_links = [];
      if (raw_links.length > 0) {
        // wrap all url into array
        raw_links.forEach(function (data) {
          // store all links
          ar_links.push(data.value);
        });
        // lets check
        //console.log(msg)
        //console.log(ar_links)
        // lets process, lets insert the url to DB
        let result = await db.convert(msg, domain, ar_links);
        console.log("final result");
        console.log(result);
        
        resMessage = "Shorten completed";
        resDebug = result;
        //logger.log("info", result);
      } else {
        resMessage = "Sorry no valid URL found to shorten";
        resDebug = ''
      }
      resCode = 200;
    } else {
      resCode = 301;
      resMessage = "Sorry. Invalid domain";
      resDebug = "";
      //logger.log("info", resMessage);
    }
  } catch (e) {
    console.log("error, something wrong happend");
    console.log(e);

    if (e.status) {
      resCode = e.status;

      if (e.data) {
        resMessage = e.data.message;
      }
    } else if (e.response) {
      resCode = e.response.status;

      if (e.response.data) {
        resMessage = e.response.data.message;
      }
    } else if (e.request) {
      resCode = 504;
      resMessage = "Request timeout. Please try again later.";
      resDebug = JSON.stringify(e);
      //logger.log("error", resMessage);
    } else {
      resCode = 500;
      resMessage = "Unhandled exception.";
      resDebug = JSON.stringify(e);
      //logger.log("error", resMessage);
    }
  }

  res.status(resCode).json({
    code: resCode,
    message: resMessage,
    result: resDebug,
  })

  return res
});

module.exports = router;
