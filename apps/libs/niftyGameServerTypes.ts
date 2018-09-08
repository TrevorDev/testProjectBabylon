import NiftyGameServer from "./niftyGameServer";
import { className } from "babylonjs";

export class TrackedObject{
    static ObjectType = "None"
    id: string
    objectType?: string
    position?: {x:number,y:number,z:number}
    rotation?: {x:number,y:number,z:number,w:number}
    state?: string
    customInfo?:any
    constructor(){
        this.objectType = (<typeof TrackedObject>this.constructor).ObjectType
    }
    async addToServer(server:NiftyGameServer){
        var obj = await server.createTrackedObject(this.toRaw())
        this.id = obj.id
    }
    async updatePoseOnServer(server:NiftyGameServer){
        server.updateTrackedObject(this.toPose())
    }
    private toPose(){
        var ret = new TrackedObject()
        if(this.id){
            ret.id = this.id
        }
        if(this.position){
            ret.position = this.position
        }
        if(this.rotation){
            ret.rotation = this.rotation
        }
        return ret
    }
    copyFrom(data:TrackedObject){
        if(data.id){
            this.id = data.id
        }
        if(data.objectType){
            this.objectType = data.objectType
        }
        if(data.position){
            this.position = data.position
        }
        if(data.rotation){
            this.rotation = data.rotation
        }
        if(data.state){
            this.state = data.state
        }
        if(data.customInfo){
            this.customInfo = data.customInfo
        }
    }
    private toRaw(){
        var ret = new TrackedObject()
        if(this.id){
            ret.id = this.id
        }
        if(this.objectType){
            ret.objectType = this.objectType
        }
        if(this.position){
            ret.position = this.position
        }
        if(this.rotation){
            ret.rotation = this.rotation
        }
        if(this.state){
            ret.state = this.state
        }
        if(this.customInfo){
            ret.customInfo = this.customInfo
        }
        return ret
    }
    dispose(){
        
    }
}

export type TrackedObjects = {[id:string]:TrackedObject};
export interface JoinRoomRequest {
    roomId: string
}

export interface JoinedRoomResponse{
    trackedObjects: TrackedObjects
    customInfo?:any
}

export interface CreatedTrackedObjectResponse {
    id: string
}