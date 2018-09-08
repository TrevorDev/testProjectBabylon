import * as NGSTypes from "../shared/niftyGameServerTypes"
import Room from "../server/room"
import CustomSocket from "../server/customIoSocket"

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

