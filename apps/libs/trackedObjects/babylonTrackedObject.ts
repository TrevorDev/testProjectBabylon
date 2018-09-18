
import * as NGSTypes from "../niftyGameServer/shared/niftyGameServerTypes"
import { Mesh } from "babylonjs";
class BabylonTrackedObject extends NGSTypes.TrackedObject{
    mesh:Mesh
    constructor(){
        super()
    }
    get position(){
        return this.mesh.position
    }
    set position(pos){
        this.mesh.position.copyFrom(pos)
    }
    get rotation(){
        return this.mesh.rotationQuaternion
    }
    set rotation(rot){
        this.mesh.rotationQuaternion.copyFrom(rot)
    }
    dispose(){
        this.mesh.dispose()
    }
    /**
     * Interpolates between trackedObject's pose and nextPose values, usually called before rendering
     * @param deltaTime in milliseconds
     */
    applyDeltaTime(deltaTime:number){
        if(this.nextPosition){
            // Move 0.1 the distance every frame
            var dist = this.position.subtract(<any>this.nextPosition).scaleInPlace(-0.1*(deltaTime/(1000/60)))
            this.position.addInPlace(dist)
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
            this.rotation.w = this.nextRotation.w
            this.rotation.x = this.nextRotation.x
            this.rotation.y = this.nextRotation.y
            this.rotation.z = this.nextRotation.z
        }
    }
}

export default BabylonTrackedObject