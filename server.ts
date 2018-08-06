import * as express from "express"
import * as http from "http"

var app = express()
app.set('view engine', 'pug')
app.use("/public", express.static("public"))
app.get('/', function (req, res) {
    var app = req.query.app ? req.query.app : 'testApp'
    res.render('app', { app: app })
})

var server = http.createServer(app)
server.listen(3000)