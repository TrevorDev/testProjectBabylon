import Controller from "./controller"
import PlayerBody from "./trackedObjects/playerBody";
import { Mesh, Vector3 } from "babylonjs";
import { NiftyWorldController } from "./niftyWolrdController";
class Player {
    spd = new BABYLON.Vector3()
    trackedObject:PlayerBody
    body:Mesh
    cameraRotation = new BABYLON.Quaternion()
    canJump = true
    constructor(scene:BABYLON.Scene, public controller:NiftyWorldController){
        this.trackedObject = new PlayerBody();
        this.body = this.trackedObject.mesh
    }
    bodyCenterPostion = ()=>{
        return this.body.position.add(new Vector3(0,0.5,0))
    }
}
export default Player