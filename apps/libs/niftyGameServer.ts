import * as io from 'socket.io-client'
import * as NGSTypes from "./niftyGameServerTypes"
import TrackedObjectFactory from "./trackedObjects/trackedObjectFactory"
class NiftyGameServer {
    socket:SocketIOClient.Socket;
    // Local objects owned by the client that are tracked by the server
    localObjects:NGSTypes.TrackedObjects= {}
    // All objects state tracked by the server
    trackedObjects:NGSTypes.TrackedObjects= {}
    private addTrackedObject(object:NGSTypes.TrackedObject){
        this.trackedObjects[object.id] = this.factory.createObject(object)
    }
    constructor(serverURL:string, private factory: TrackedObjectFactory){
        this.socket = io(serverURL)
        this.socket.on("updateTrackedObjects", (objects:NGSTypes.TrackedObjects)=>{
            for(var key in objects){
                if(!this.localObjects[key] && this.trackedObjects[key]){
                    this.trackedObjects[key].copyFrom(objects[key])
                }
            }
        })
        this.socket.on("removeTrackedObject", (key:string)=>{
            this.trackedObjects[key].dispose()
            delete this.trackedObjects[key]
        })
        this.socket.on("createTrackedObject", (object:NGSTypes.TrackedObject)=>{
            this.addTrackedObject(object)
        })
    }
    joinRoom(request:NGSTypes.JoinRoomRequest){
        return new Promise((res, rej)=>{
            this.socket.emit("joinRoom", request)
            this.socket.on("joinRoomResponse", (joinResult:NGSTypes.JoinedRoomResponse)=>{
                for(var key in joinResult.trackedObjects){
                    this.addTrackedObject(joinResult.trackedObjects[key])
                }
                res(joinResult);
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