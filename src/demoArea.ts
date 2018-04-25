import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';

export abstract class DemoArea {
    root:BABYLON.AbstractMesh
    uiPanel:GUI.StackPanel
    constructor(public scene, name:string, size = 2){
        this.root = new BABYLON.AbstractMesh("", this.scene)
        this.createGUI(name, size)
    }
    async init(){
    }
    createGUI(name, size){
        var plane = BABYLON.Mesh.CreatePlane("plane", size, this.scene);
        this.root.addChild(plane)
        plane.position.y = 1
        var advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(plane);
        this.uiPanel = new BABYLON.GUI.StackPanel();
        this.uiPanel.width = "220px";
        this.uiPanel.fontSize = "14px";
        this.uiPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.uiPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        advancedTexture.addControl(this.uiPanel);

        // Sliders
        var header = new GUI.TextBlock();
        header.text = name;
        header.height = "80px";
        header.color = "white";
        header.fontSize = 50
        header.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        header.paddingTop = "10px";
        this.uiPanel.addControl(header);
    }
}