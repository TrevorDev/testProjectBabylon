
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
}

export default BabylonTrackedObject