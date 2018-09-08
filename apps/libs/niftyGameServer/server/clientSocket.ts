import * as NGSTypes from "../shared/niftyGameServerTypes"
import Room from "./room"
import CustomSocket from "./customIoSocket"

class ClientSocket {
    socket:CustomSocket
    room?:Room
    trackedObjects:NGSTypes.TrackedObjects = {}
    static CreateFromIoSocket(socket:CustomSocket){
        if(!socket.customObject){
            socket.customObject = new ClientSocket()
        }
        socket.customObject.socket = socket
        return socket.customObject
    }
    get id(){
        return this.socket.id
    }
}

export default ClientSocket;

