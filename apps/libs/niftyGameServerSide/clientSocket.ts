import * as NGSTypes from "../../libs/niftyGameServerTypes"
import Room from "./room"
import CustomSocket from "./customIoSocket"

class ClientSocket {
    socket:CustomSocket
    room?:Room
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

