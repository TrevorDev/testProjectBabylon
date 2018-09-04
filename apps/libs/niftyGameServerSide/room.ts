import * as NGSTypes from "../../libs/niftyGameServerTypes"
import ClientSocket from "./clientSocket"
class Room {
    gameObjects = new Map<string,NGSTypes.TrackedObject>();
    sockets = new Map<string, ClientSocket>()

    addSocket(socket:ClientSocket){
        this.sockets.set(socket.id, socket)
        socket.room = this
    }
    removeSocket(socket:ClientSocket){
        this.sockets.delete(socket.id)
        socket.room = null
    }
}

export default Room