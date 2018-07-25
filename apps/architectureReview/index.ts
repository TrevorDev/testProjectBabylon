import { VRExperienceHelper } from "babylonjs";
import {Stage} from "../../src/stage"
var shell:any = (<any>window).shell

}

//var painting:bool = false;

//var makePickable = (mesh:BABYLON.AbstractMesh, pickable:bool)=>{
//    mesh.isPickable = pickable;
//    mesh.getChildMeshes().forEach((m)=>{
//        makePickable(m)
//    })
//}

var dollhouseScale = 0.005;
var archTrueScale = 0.05;
var isDollhouseScale = true;
var architecturalModel:BABYLON.Mesh;
var cachedDollhousePosition:BABYLON.Vector3;
var archInputDownTime:Date = new Date(); 

function setDollhouseScale() {
    architecturalModel.scaling.x = dollhouseScale;
    architecturalModel.scaling.y = dollhouseScale;
    architecturalModel.scaling.z = dollhouseScale;
    architecturalModel.position = cachedDollhousePosition;
    isDollhouseScale = true;
}

function setTrueScale() {
    cachedDollhousePosition = architecturalModel.position;
    architecturalModel.scaling.x = archTrueScale;
    architecturalModel.scaling.y = archTrueScale;
    architecturalModel.scaling.z = archTrueScale;
    architecturalModel.position.y = 0;
    isDollhouseScale = false;
}

shell.registerApp({
    name: "testApp", 
    iconUrl: "public/appicons/architectureReview.png",
    launch: async (windowAnchor:BABYLON.Mesh, vrHelper: VRExperienceHelper)=>{
        // Get scene
        var scene = windowAnchor.getScene();
		
		//BABYLON.SceneLoader.Append("public/architectureReview/models", "xboxcontroller.glb", scene, function()
		//{
		//});
		let architecturalContainer = await BABYLON.SceneLoader.LoadAssetContainerAsync("public/architectureReview/models/lecce_bath.fbx", "", scene);
		architecturalModel = architecturalContainer.createRootMesh();
		
        //var sceneCam = scene.activeCamera;
        //var camPos = sceneCam.position;
        //var anchorPos = windowAnchor.position;
        //var midpoint = camPos.add(anchorPos).scale(0.5);
        architecturalModel.position.x = /*midpoint.x;*/windowAnchor.position.x;
        architecturalModel.position.y = /*midpoint.y;*/windowAnchor.position.y + 0.1;
        architecturalModel.position.z = /*midpoint.z;*/windowAnchor.position.z;
        
        cachedDollhousePosition = architecturalModel.position;
        setDollhouseScale();
		
		architecturalModel.id = "architecturalModel";
		
		let b = new BABYLON.PointerDragBehavior({dragPlaneNormal: new BABYLON.Vector3(0,1,0)})
        architecturalModel.addBehavior(b)
		
		//makePickable(architecturalModel, true);
		
		scene.addMesh(architecturalModel, true);
		//windowAnchor.addChild(architecturalModel);
		
		/*scene.onPointerObservable.add((e)=>{
            if(e.type == BABYLON.PointerEventTypes.POINTERDOWN){
				if(e.pickInfo.pickedMesh && e.pickInfo.pickedMesh.id == architecturalModel.id)
					painting = true;
            }
        });
		scene.onPointerObservable.add((e)=>{
            if(e.type == BABYLON.PointerEventTypes.POINTERUP){
                painting = false;
            }
        });*/
		
		scene.onPointerObservable.add((e)=>{
            if (e.pickInfo.pickedMesh && e.pickInfo.pickedMesh.isDescendantOf(architecturalModel)) {
                if(e.type == BABYLON.PointerEventTypes.POINTERDOWN){
                    archInputDownTime = new Date();
                }
                else if (e.type == BABYLON.PointerEventTypes.POINTERUP) {
                    var archInputUpTime = new Date();
                    if (archInputUpTime.getTime() - archInputDownTime.getTime() < 200) {
                        if (isDollhouseScale)
                            setTrueScale();
                        else
                            setDollhouseScale();
                    }
                }
            }
        });
        
        // Physics
        //scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), new BABYLON.CannonJSPlugin());
       
        //var fountain = BABYLON.Mesh.CreateBox("foutain", 0.01, scene);
        //fountain.visibility = 0.1;
		//fountain.position = new BABYLON.Vector3(1, 0, 2);
        //windowAnchor.addChild(fountain);
		
        //var materialAmiga = new BABYLON.StandardMaterial("amiga", scene);
        //materialAmiga.diffuseTexture = new BABYLON.Texture("textures/amiga.jpg", scene);
        //materialAmiga.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        //for (var index = 0; index < 10; index++) {
        //    let sphere = BABYLON.Mesh.CreateSphere("sphere", 16, 1, scene);
        //    sphere.material = materialAmiga
        //    sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, //BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1 }, scene);
        //    sphere.position = new BABYLON.Vector3(Math.random() * 20 - 10, y, Math.random() * 10 - 5);
        //    windowAnchor.addChild(sphere)
        //
        //    y += 2;
        //    spheres.push(sphere)
        //}

    }, 
    dispose: async ()=>{

    }
})


