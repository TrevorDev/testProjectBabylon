import * as io from 'socket.io-client'
import * as NGSTypes from "./niftyGameServerTypes"
class NiftyGameServer {
    socket:SocketIOClient.Socket;
    trackedObjects:NGSTypes.TrackedObjects= {}
    constructor(serverURL:string){
        this.socket = io(serverURL)
        this.socket.on("updateTrackedObjects", (objects:NGSTypes.TrackedObjects)=>{
            for(var key in objects){
                if(this.trackedObjects[key]){
                    this.trackedObjects[key].copyFrom(objects[key])
                }
            }
        })
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
        return new Promise<{id:string}>((res, rej)=>{
            this.socket.emit("createTrackedObject", object)
            this.socket.on("createTrackedObjectResponse", (data:{id:string})=>{
                res(data);
            })
        })
    }
    updateTrackedObject(object:any){
        this.socket.emit("updateTrackedObject", object)
    }
}
export default NiftyGameServer