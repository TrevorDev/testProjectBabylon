import BabylonTrackedObject from "./babylonTrackedObject"
class PlayerBody extends BabylonTrackedObject{
    static ObjectType = "PlayerBody"
    constructor(){
        super()
        this.mesh = new BABYLON.Mesh("", BABYLON.Engine.LastCreatedScene)
        this.mesh.rotationQuaternion = new BABYLON.Quaternion()
        var m = BABYLON.Mesh.CreateSphere(this.objectType, 8, 1, BABYLON.Engine.LastCreatedScene)
        // var m = BABYLON.Mesh.CreateIcoSphere("sphere", {radius:0.5, flat:true, subdivisions: 3}, BABYLON.Engine.LastCreatedScene); 
        //m.convertToFlatShadedMesh()

        var mat = new BABYLON.StandardMaterial("dog", BABYLON.Engine.LastCreatedScene)
        var tex = new BABYLON.Texture("public/face.png", BABYLON.Engine.LastCreatedScene)
        tex.vScale = -1

        // With lighting
        // mat.ambientTexture = tex
        // mat.specularPower = Number.MAX_VALUE
        // m.material = mat

        // Without lighting
        mat.emissiveTexture = tex
        mat.specularPower = Number.MAX_VALUE
        m.material = mat
        mat.disableLighting = true

        this.mesh.addChild(m)
        m.position.y+=0.5
    }
}

export default PlayerBody