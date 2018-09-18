import NiftyGameServer from "../client/niftyGameServer";
import { className } from "babylonjs";

export class TrackedObject{
    /**
     * Type of tracked object overwritten by subclasses (eg. Player, Enemy, Hand, etc.)
     */
    static ObjectType = "None"
    /**
     * Unique id of the object assigned by the server
     */
    id: string
    /**
     * Subclass of tracked object, set to Class.ObjectType on initialize (eg. Player, Enemy, Hand, etc.)
     */
    objectType?: string
    /**
     * State that can be updated by the server eg. running, animating, jumping
     */
    state?: string

    /**
     * Position of the tracked object on the client, see nextPosition for latest update from server
     */
    position?: {x:number,y:number,z:number}
    /**
     * Velocity of the tracked object on the client, see nextVelocity for latest update from server
     */
    velocity?: {x:number,y:number,z:number}
    /**
     * Rotation of the tracked object on the client, see nextRotation for latest update from server
     */
    rotation?: {x:number,y:number,z:number,w:number}


    /**
     * Latest position update from server
     */
    nextPosition?: {x:number,y:number,z:number}
    /**
     * Latest velocity update from server
     */
    nextVelocity?: {x:number,y:number,z:number}
    /**
     * Latest rotation update from server
     */
    nextRotation?: {x:number,y:number,z:number,w:number}
    
    /**
     * Custom data applications can use for any use case
     */
    customInfo?:any

    /**
     * Initializes the the object, usually overwritten by a type of tracked object (eg. Player, Enemy, Hand, etc.)
     */
    constructor(){
        this.objectType = (<typeof TrackedObject>this.constructor).ObjectType
    }
    /**
     * Starts the object being tracked by the server, assigns the object's id the the one provided by the server
     * @param server server to add object to
     */
    async addToServer(server:NiftyGameServer){
        var obj = await server.createTrackedObject(this)
        this.id = obj.id
    }
    /**
     * Updates the server with only the pose data of this object (eg. position, rotation, velocity), usually called once per server tick
     * @param server server to update the pose
     */
    async updatePoseOnServer(server:NiftyGameServer){
        server.updateTrackedObject(this.toPose())
    }
    /**
     * Converts the object to it's client pose values (eg. position, rotation, velocity)
     */
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
        if(this.velocity){
            ret.velocity = this.velocity
        }
        return ret
    }
    /**
     * Copies all values from one tracked object to another
     * 
     * WARNING: Vector values are set to reference, NOT DEEP COPIED
     * @param data to copy from
     */
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
        if(data.velocity){
            this.velocity = data.velocity
        }
        if(data.rotation){
            this.rotation = data.rotation
        }
        if(data.nextPosition){
            this.nextPosition = data.nextPosition
        }
        if(data.nextVelocity){
            this.nextVelocity = data.nextVelocity
        }
        if(data.nextRotation){
            this.nextRotation = data.nextRotation
        }
        if(data.state){
            this.state = data.state
        }
        if(data.customInfo){
            this.customInfo = data.customInfo
        }
    }
    /**
     * Copies values from server data into this object, pose fields are set into next fields to be interpolated on each new render frame
     * 
     * WARNING: Vector values are set to reference, NOT DEEP COPIED
     * @param data to update from
     */
    updateFromServerData(data:TrackedObject){
        if(data.id){
            this.id = data.id
        }
        if(data.objectType){
            this.objectType = data.objectType
        }
        if(data.position){
            this.nextPosition = data.position
        }
        if(data.velocity){
            this.nextVelocity = data.velocity
        }
        if(data.rotation){
            this.nextRotation = data.rotation
        }        
        if(data.state){
            this.state = data.state
        }
        if(data.customInfo){
            this.customInfo = data.customInfo
        }
    }
    /**
     * Converts tracked object to only values needed to create the object on the server
     */
    toRaw(){
        var ret = this.toPose()
        if(this.id){
            ret.id = this.id
        }
        if(this.objectType){
            ret.objectType = this.objectType
        }
        if(this.state){
            ret.state = this.state
        }
        if(this.customInfo){
            ret.customInfo = this.customInfo
        }
        return ret
    }
    /**
     * Disposes of the object
     */
    dispose(){
        
    }
    /**
     * Interpolates between trackedObject's pose and nextPose values, usually called before rendering
     * 
     * This can be overwritten by subclasses to have smooth interpolation
     * @param deltaTime in milliseconds
     */
    applyDeltaTime(deltaTime:number){
        if(this.nextPosition){
            if(!this.position){
                this.position = {x:0,y:0,z:0}
            }
            this.position.x = this.nextPosition.x
            this.position.y = this.nextPosition.y
            this.position.z = this.nextPosition.z
        }
        if(this.nextVelocity){
            if(!this.velocity){
                this.velocity = {x:0,y:0,z:0}
            }
            this.velocity.x = this.nextVelocity.x
            this.velocity.y = this.nextVelocity.y
            this.velocity.z = this.nextVelocity.z
        }
        if(this.nextRotation){
            if(!this.rotation){
                this.rotation = {w:1,x:0,y:0,z:0}
            }
            this.rotation.w = this.nextRotation.w
            this.rotation.x = this.nextRotation.x
            this.rotation.y = this.nextRotation.y
            this.rotation.z = this.nextRotation.z
        }
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