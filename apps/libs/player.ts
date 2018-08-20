import Controller from "./controller"
class Player {
    spd = new BABYLON.Vector3()
    body:BABYLON.Mesh
    constructor(scene:BABYLON.Scene, public controller:Controller){
        this.body = new BABYLON.Mesh("", scene)
        this.body.rotationQuaternion = new BABYLON.Quaternion();
        var sphere = BABYLON.Mesh.CreateBox("sphere1", 1, scene)
        sphere.position.y=0.5
        this.body.addChild(sphere);
        this.body.position.y = 2
    }
}
export default Player