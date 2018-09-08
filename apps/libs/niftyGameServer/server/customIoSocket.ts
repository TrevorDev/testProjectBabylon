import * as NGSTypes from "../shared/niftyGameServerTypes"
import * as Server from 'socket.io';
import Room from "./room"
import ClientSocket from "./clientSocket"

interface CustomSocket extends Server.Socket{
    customObject:ClientSocket
}

export default CustomSocket;