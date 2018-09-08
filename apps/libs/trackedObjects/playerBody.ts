import BabylonTrackedObject from "./babylonTrackedObject"
class PlayerBody extends BabylonTrackedObject{
    static ObjectType = "PlayerBody"
    constructor(){
        super()
        this.mesh = BABYLON.Mesh.CreateSphere("sphere1", 16, 1, BABYLON.Engine.LastCreatedScene)
        this.mesh.rotationQuaternion = new BABYLON.Quaternion()
    }
}

export default PlayerBody