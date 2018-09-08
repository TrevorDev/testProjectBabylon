import Controller from "./controller"
import PlayerBody from "./trackedObjects/playerBody";
import { Mesh } from "babylonjs";
class Player {
    spd = new BABYLON.Vector3()
    trackedObject:PlayerBody
    body:Mesh
    constructor(scene:BABYLON.Scene, public controller:Controller){
        this.trackedObject = new PlayerBody();
        this.body = this.trackedObject.mesh
    }
}
export default Player