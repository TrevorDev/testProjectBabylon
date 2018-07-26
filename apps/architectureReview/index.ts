import { VRExperienceHelper } from "babylonjs";
import {Stage} from "../../src/stage"
var shell:any = (<any>window).shell

}

var dollhouseScale = 0.005;
var archTrueScale = 0.025;
var isDollhouseScale = true;
var architecturalModel:BABYLON.Mesh;
var dollhousingSphere:BABYLON.Mesh;
var cachedDollhousePosition:BABYLON.Vector3;
var archInputDownTime:Date = new Date();
var dollhousingInputDownTime:Date = new Date();

var archSubmeshColorIndex = new Object();

function setDollhouseScale() {
    //architecturalModel.position = cachedDollhousePosition;
    architecturalModel.position.y = 0.5;

    var tempParent = architecturalModel.parent;
    architecturalModel.parent = null;

    architecturalModel.scaling.x = dollhouseScale;
    architecturalModel.scaling.y = dollhouseScale;
    architecturalModel.scaling.z = dollhouseScale;

    architecturalModel.parent = tempParent;

    dollhousingSphere.position.y = 20;
    dollhousingSphere.scaling = new BABYLON.Vector3(1, 1, 1);
    
    isDollhouseScale = true;
}

function setTrueScale() {
    //cachedDollhousePosition = architecturalModel.position;
    architecturalModel.position.y = -0.7;

    var tempParent = architecturalModel.parent;
    architecturalModel.parent = null;

    //architecturalModel.position.y = -0.4;
    architecturalModel.scaling.x = archTrueScale;
    architecturalModel.scaling.y = archTrueScale;
    architecturalModel.scaling.z = archTrueScale;

    architecturalModel.parent = tempParent;

    dollhousingSphere.position.y = 40;
    dollhousingSphere.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);
    
    isDollhouseScale = false;
}

shell.registerApp({
    name: "testApp", 
    iconUrl: "public/appicons/architectureReview.png",
    launch: async (windowAnchor:BABYLON.Mesh, vrHelper: VRExperienceHelper)=>{

        var scene = windowAnchor.getScene();
		
		let architecturalContainer = await BABYLON.SceneLoader.LoadAssetContainerAsync("public/architectureReview/models/lecce_bath.glb", "", scene);
		architecturalModel = architecturalContainer.createRootMesh();
		
        architecturalModel.position.x = windowAnchor.position.x;
        architecturalModel.position.y = windowAnchor.position.y + 0.5;
        architecturalModel.position.z = windowAnchor.position.z;
		
		architecturalModel.id = "architecturalModel";
		
		//let b = new BABYLON.PointerDragBehavior({dragPlaneNormal: new BABYLON.Vector3(0,1,0)})
        //architecturalModel.addBehavior(b)

        dollhousingSphere = BABYLON.Mesh.CreateSphere("dollhousingSphere", 16, 20, scene);
        dollhousingSphere.parent = architecturalModel;

        var dollhousingMat = new BABYLON.StandardMaterial("dollhousingMat", scene);
        dollhousingMat.diffuseColor = new BABYLON.Color3(0.9, 0.6, 0.6);
        dollhousingSphere.material = dollhousingMat;
		
        scene.addMesh(architecturalModel, true);
        architecturalModel.parent = windowAnchor;
        
        cachedDollhousePosition = architecturalModel.position;
        setDollhouseScale();

        var archPickerColors = [
            new BABYLON.Color3(0.5, 0.5, 0.5),
            new BABYLON.Color3(1, 1, 1),
            new BABYLON.Color3(0.2, 0.2, 0.2),
            new BABYLON.Color3(0.5, 0.5, 0.8),
            new BABYLON.Color3(1, 1, 1),
            new BABYLON.Color3(0.4, 0.3, 0.05)
        ];
        var colorPickerMaterials = new Array();
        for (var i = 0; i < archPickerColors.length; i++) {
            var colorMat = new BABYLON.StandardMaterial("surfaceMat " + i.toString(), scene);
            colorMat.diffuseColor = archPickerColors[i];
            colorMat.backFaceCulling = false;
            colorPickerMaterials.push(colorMat);
        }
		
		scene.onPointerObservable.add((e)=>{
            if (e.type != BABYLON.PointerEventTypes.POINTERDOWN && e.type != BABYLON.PointerEventTypes.POINTERUP) {
                return;
            }
            if (e.pickInfo.pickedMesh == null) {
                return;
            }
            if (e.pickInfo.pickedMesh == dollhousingSphere || e.pickInfo.pickedMesh.isDescendantOf(dollhousingSphere)) {
                if(e.type == BABYLON.PointerEventTypes.POINTERDOWN){
                    dollhousingInputDownTime = new Date();
                }
                else if (e.type == BABYLON.PointerEventTypes.POINTERUP) {
                    var dollhousingInputDownTime = new Date();
                    if (dollhousingInputDownTime.getTime() - dollhousingInputDownTime.getTime() < 300) {
                        if (isDollhouseScale)
                            setTrueScale();
                        else
                            setDollhouseScale();
                    }
                }
            }
            else if (e.pickInfo.pickedMesh.isDescendantOf(architecturalModel)) {
                if(e.type == BABYLON.PointerEventTypes.POINTERDOWN){
                    archInputDownTime = new Date();
                }
                else if (e.type == BABYLON.PointerEventTypes.POINTERUP) {
                    var archInputUpTime = new Date();
                    if (archInputUpTime.getTime() - archInputDownTime.getTime() < 300) {
                        
                        var currentColorIndex = 0;
                        if (archSubmeshColorIndex.hasOwnProperty(e.pickInfo.pickedMesh.id)) {
                            currentColorIndex = archSubmeshColorIndex[e.pickInfo.pickedMesh.id];
                        }
                        
                        currentColorIndex = (currentColorIndex + 1) % archPickerColors.length;
                        archSubmeshColorIndex[e.pickInfo.pickedMesh.id] = currentColorIndex;

                        var matToUse = colorPickerMaterials[currentColorIndex];

                        var surfMultiMat = new BABYLON.MultiMaterial("surfMultiMat", scene);
                        var pickedMesh = e.pickInfo.pickedMesh;
                        for(var i = 0; i < pickedMesh.subMeshes.length; i++) {
                            surfMultiMat.subMaterials.push(matToUse);
                        }
                        pickedMesh.material = surfMultiMat;
                    }
                }
            }
        });

    }, 
    dispose: async ()=>{
    }
})


