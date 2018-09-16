import BabylonTrackedObject from "./babylonTrackedObject"
class PlayerBody extends BabylonTrackedObject{
    static ObjectType = "PlayerBody"
    constructor(){
        super()
        this.mesh = new BABYLON.Mesh("", BABYLON.Engine.LastCreatedScene)
        this.mesh.rotationQuaternion = new BABYLON.Quaternion()
        var m = BABYLON.Mesh.CreateSphere(this.objectType, 16, 1, BABYLON.Engine.LastCreatedScene)
        this.mesh.addChild(m)
        m.position.y+=0.5
    }
}

export default PlayerBody