import BabylonTrackedObject from "./babylonTrackedObject"
class PlayerBody extends BabylonTrackedObject{
    static ObjectType = "PlayerBody"
    constructor(){
        super()
        this.mesh = new BABYLON.Mesh("", BABYLON.Engine.LastCreatedScene)
        this.mesh.rotationQuaternion = new BABYLON.Quaternion()
        var m = BABYLON.Mesh.CreateSphere(this.objectType, 16, 1, BABYLON.Engine.LastCreatedScene)

        var mat = new BABYLON.StandardMaterial("dog", BABYLON.Engine.LastCreatedScene);
        var tex = new BABYLON.Texture("public/face.png", BABYLON.Engine.LastCreatedScene);
        tex.vScale = -1
        mat.diffuseTexture = tex
        m.material = mat;

        this.mesh.addChild(m)
        m.position.y+=0.5
    }
}

export default PlayerBody