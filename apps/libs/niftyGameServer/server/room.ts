import * as NGSTypes from "../shared/niftyGameServerTypes"
import ClientSocket from "./clientSocket"
class Room {
    trackedObjects:NGSTypes.TrackedObjects = {}
    sockets:{[id:string]:ClientSocket} = {}

    constructor(public id:string){

    }

    addSocket(socket:ClientSocket){
        this.sockets[socket.id] = socket
        socket.room = this
    }

    removeTrackedObject(key:string){
        this.emitToAll("removeTrackedObject", key)
        delete this.trackedObjects[key]
    }

    removeSocket(socket:ClientSocket){
        for(var key in this.sockets[socket.id].trackedObjects){
            if(socket.room.trackedObjects[key]){
                socket.room.removeTrackedObject(key)
            }
        }
        delete this.sockets[socket.id]
        socket.room = null
    }
    emitToAll(msg:string, data:any, except?:ClientSocket){
        for(var key in this.sockets){
            if(!except || this.sockets[key] != except ){
                this.sockets[key].socket.emit(msg, data)
            }
        }
    }
}

export default Room