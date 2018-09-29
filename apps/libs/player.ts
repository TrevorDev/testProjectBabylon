import Controller from "./controller"
import PlayerBody from "./trackedObjects/playerBody";
import { Mesh } from "babylonjs";
import { NiftyWorldController } from "./niftyWolrdController";
class Player {
    spd = new BABYLON.Vector3()
    trackedObject:PlayerBody
    body:Mesh
    canJump = true
    constructor(scene:BABYLON.Scene, public controller:NiftyWorldController){
        this.trackedObject = new PlayerBody();
        this.body = this.trackedObject.mesh
    }
}
export default Player