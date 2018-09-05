import TrackedObject from "../trackedObject"
import { Mesh } from "babylonjs";
class PlayerBody extends TrackedObject{
    mesh:Mesh
    constructor(scene:BABYLON.Scene){
        super()
        this.mesh = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene)
    }
    get position(){
        return this.mesh.position
    }
}