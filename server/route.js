var express = require('express')
var router = express.Router()

const HomeController = require('./controllers/HomeController')
router.use('/', HomeController)

router.get("/health", (req, res) => {
    res.send("OK");
});

module.exports = router;