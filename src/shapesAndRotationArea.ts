import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import { DemoArea } from './demoArea';
export class ShapeAndRotationArea extends DemoArea {
    constructor(public scene){
        super(scene, "Shapes");
    }
    async init(){
        var sphere = BABYLON.Mesh.CreateIcoSphere("", {radius:0.2, flat:true, subdivisions: 1}, this.scene)
        sphere.position.y = 1;
        var regSphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 0.4, this.scene);
        regSphere.position.y = 1
        regSphere.position.x = -0.5
        var box = BABYLON.Mesh.CreateBox("box", 0.4, this.scene);
        box.position.y = 1
        box.position.x = 0.5
    
        this.scene.onBeforeRenderObservable.add(()=>{
            sphere.rotation.x += 0.01
            sphere.rotation.y += 0.01
        })

        this.root.addChild(sphere)
        this.root.addChild(regSphere)
        this.root.addChild(box)
    }
}