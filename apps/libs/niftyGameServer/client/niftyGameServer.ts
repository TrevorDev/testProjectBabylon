import * as io from 'socket.io-client'
import * as NGSTypes from "../shared/niftyGameServerTypes"
import TrackedObjectFactory from "./trackedObjectFactory"
class NiftyGameServer {
    socket:SocketIOClient.Socket;
    // Local objects owned by the client that are tracked by the server
    localObjects:NGSTypes.TrackedObjects= {}
    // All objects state tracked by the server
    trackedObjects:NGSTypes.TrackedObjects= {}
    factory:TrackedObjectFactory
    constructor(serverURL:string, types:Array<{new():NGSTypes.TrackedObject, ObjectType:string}>){
        this.factory = new TrackedObjectFactory(types)
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
            if(!this.localObjects[object.id]){
                this.addTrackedObject(object)
            }
        })
    }
    private addTrackedObject(object:NGSTypes.TrackedObject){
        this.trackedObjects[object.id] = this.factory.createObject(object)
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
    // Creates a tracked object owned by this client
    createTrackedObject(object:NGSTypes.TrackedObject){
        return new Promise<{id:string}>((res, rej)=>{
            this.socket.emit("createTrackedObject", object)
            this.socket.on("createTrackedObjectResponse", (data:{id:string})=>{
                this.localObjects[data.id] = object
                res(data);
            })
        })
    }
    updateTrackedObject(object:any){
        this.socket.emit("updateTrackedObject", object)
    }
}
export default NiftyGameServer