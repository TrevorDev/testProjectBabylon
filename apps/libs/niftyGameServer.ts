import * as io from 'socket.io-client'
import * as NGSTypes from "./niftyGameServerTypes"
class NiftyGameServer {
    socket:SocketIOClient.Socket;
    constructor(serverURL:string){
        this.socket = io(serverURL)
    }
    joinRoom(request:NGSTypes.JoinRoomRequest){
        return new Promise((res, rej)=>{
            this.socket.emit("joinRoom", request)
            this.socket.on("joinRoomResponse", (data:NGSTypes.JoinedRoomResponse)=>{
                res(data);
            })
        })
    }
    createTrackedObject(object:NGSTypes.TrackedObject){
        return new Promise((res, rej)=>{
            this.socket.emit("createTrackedObject", object)
            this.socket.on("createTrackedObjectResponse", (data:any)=>{
                res(data);
            })
        })
    }
    updateTrackedObject(object:any){
        this.socket.emit("updateTrackedObject", object)
    }
}
export default NiftyGameServer