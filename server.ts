import * as express from "express"
import * as http from "http"
import * as Server from 'socket.io';
import * as NGSTypes from "./apps/libs/niftyGameServerTypes"

var app = express()
app.set('view engine', 'pug')
app.use("/public", express.static("public"))
app.get('/', function (req, res) {
    var app = req.query.app ? req.query.app : 'testApp'
    res.render('app', { app: app })
})

var server = http.createServer(app)
server.listen(3000)



// SocketIO
interface CustomSocket extends Server.Socket{
    customData:{room?:Room}
}

class Room {
    gameObjects = new Map<string,NGSTypes.TrackedObject>();
    sockets = new Map<string, CustomSocket>()
}
var rooms:Map<string,Room> = new Map<string,Room>()

const io = Server(3001);
io.on("connection", (socket:CustomSocket)=>{
    if(!socket.customData){
        socket.customData = {}
    }
    socket.on("joinRoom", (req:NGSTypes.JoinRoomRequest)=>{
        var room = rooms.get(req.roomId)
        if(!room){
            room = new Room()
        }
        socket.customData.room = room;
        var resp:NGSTypes.JoinedRoomResponse = {gameObjects: new Map<string,NGSTypes.TrackedObject>()}
        socket.emit("joinRoomResponse", resp)
    })
})
console.log("start")