
import * as NGSTypes from "../niftyGameServerTypes"
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
}

export default BabylonTrackedObject