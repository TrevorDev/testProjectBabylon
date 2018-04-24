import { Mesh, Scene } from "babylonjs";

export class MapArea {
    rootMesh:Mesh
    rendering: boolean = false
    constructor(public scene:Scene){
        this.rootMesh = new Mesh("", scene);

        // var box = BABYLON.Mesh.CreateBox("box", 10.0, scene, false, Mesh.DOUBLESIDE);
        // box.position.y = 5;

        // this.rootMesh.addChild(box)
    }

    addToSceneRecursive(mesh, scene){
        this.scene.addMesh(mesh)
        mesh.getChildren().forEach((c)=>{
            this.addToSceneRecursive(c, scene)
        })
    }
    
    removeFromSceneRecursive(mesh, scene){
        scene.removeMesh(mesh)
        mesh.getChildren().forEach((c)=>{
            this.removeFromSceneRecursive(c, scene)
        })
    }
}