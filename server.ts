import * as express from "express"
import * as http from "http"
import * as Server from 'socket.io';
import * as NGSTypes from "./apps/libs/niftyGameServerTypes"
import Room from "./apps/libs/niftyGameServerSide/room"
import CustomSocket from "./apps/libs/niftyGameServerSide/customIoSocket"
import ClientSocket from "./apps/libs/niftyGameServerSide/clientSocket"

var ports = {webserver: 3000, gameserver: 3001}

// Webserver
var app = express()
app.set('view engine', 'pug')
app.use("/public", express.static("public"))
app.get('/', function (req, res) {
    var app = req.query.app ? req.query.app : 'testApp'
    res.render('app', { app: app })
})

var server = http.createServer(app)
server.listen(ports.webserver)

// SocketIO game server
var nextObjId = 0
var rooms:{[id:string]:Room} = {}
var tickRate = 1000/10

const io = Server(ports.gameserver);
io.on("connection", (socket:CustomSocket)=>{
    let cs = ClientSocket.CreateFromIoSocket(socket)
    socket.on("joinRoom", (req:NGSTypes.JoinRoomRequest)=>{
        var room = rooms[req.roomId]
        if(!room){
            room = new Room(req.roomId)
            rooms[req.roomId] = room
        }
        room.addSocket(cs)
        var resp:NGSTypes.JoinedRoomResponse = {gameObjects: cs.room.gameObjects}
        socket.emit("joinRoomResponse", resp)
    })
    socket.on("createTrackedObject", (req:NGSTypes.TrackedObject)=>{
        if(cs.room){
            var resp:NGSTypes.CreatedTrackedObjectResponse = {uniqueId: String(nextObjId++)}
            req.uniqueId = resp.uniqueId
            cs.room.gameObjects[resp.uniqueId] = req
            socket.emit("createTrackedObjectResponse", resp)

            cs.room.emitToAll("newTrackedObject", cs.room.gameObjects[resp.uniqueId])
        }
    })
    socket.on("updateTrackedObject", (req:NGSTypes.TrackedObject)=>{
        var obj = cs.room.gameObjects[req.uniqueId]
        if(obj){
            if(req.position){
                obj.position = req.position
            }
            if(req.rotation){
                obj.rotation = req.rotation
            }
        }
    })
    socket.on("disconnect", ()=>{
        if(cs.room){
            cs.room.removeSocket(cs)
        }
    })
})

// Every tick send all objects to clients
var tickLoop = ()=>{
    for(var roomKey in rooms){
        for(var socketKey in rooms[roomKey].sockets){
            rooms[roomKey].sockets[socketKey].socket.emit("updateTrackedObjects", rooms[roomKey].gameObjects)
        }
    }
    setTimeout(tickLoop, tickRate)
}
tickLoop()


console.log("-----------------------------------------")
console.log(`                      
_____ _ ___ _       _____ _     _   
|   | |_|  _| |_ _ _|  |  |_|___| |_ 
| | | | |  _|  _| | |    -| |  _| '_|
|_|___|_|_| |_| |_  |__|__|_|___|_,_|
                |___|                `)
console.log("started on")
console.log(ports)
console.log("-----------------------------------------")