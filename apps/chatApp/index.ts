import { VRExperienceHelper, ActionManager } from "babylonjs";
import {Stage} from "../../src/stage"

var shell:any = (<any>window).shell

// pop animation
var animationBox1 = new BABYLON.Animation("myAnimation", "scaling.x", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
var animationBox2 = new BABYLON.Animation("myAnimation", "scaling.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
var animationBox3 = new BABYLON.Animation("myAnimation", "scaling.z", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

var keys = [{
    frame: 0,
    value: 1},{
    frame: 5,
    value: 1.1},{
    frame: 15,
    value: 1}]; 

animationBox1.setKeys(keys);
animationBox2.setKeys(keys);
animationBox3.setKeys(keys);



shell.registerApp({
    name: "chatApp", 
    iconUrl: "public/appicons/chatApp.png",
    launch: async (windowAnchor:BABYLON.Mesh, vrHelper: VRExperienceHelper)=>{
        // Get scene
        let scene = windowAnchor.getScene();
        // Load gltf model and add to scene   
        let container = await BABYLON.SceneLoader.LoadAssetContainerAsync("https://raw.githubusercontent.com/rachyliu/assets/master/ChatApp.glb", "", scene)
        
        let loadedModel = container.createRootMesh();
        let popAnimation = new BABYLON.AnimationGroup("popGroup", scene);
        /**
         * Creates a contact list
         */
        let createContactList = function (){
            var Contacts = ["https://raw.githubusercontent.com/rachyliu/assets/master/contactPeople.png", 
            "https://raw.githubusercontent.com/rachyliu/assets/master/contactPeople1.png", 
            "https://raw.githubusercontent.com/rachyliu/assets/master/contactPeople2.png", 
            "https://raw.githubusercontent.com/rachyliu/assets/master/contactPeople3.png"];

            for (var i in Contacts){
                var myPlane = BABYLON.MeshBuilder.CreatePlane("name"+i, {width: 0.8, height: 0.25}, scene);
                //myPlane.dispose();
                myPlane.position.z = 0
                myPlane.position.x = 0
                myPlane.position.y = 0.5 +0.3*(+i);
                myPlane.parent = listMesh;
                var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
                // myMaterial.emissiveColor = new BABYLON.Color3(1, 0, 0);

                myPlane.material = myMaterial;//(+i === Contacts.length-1)? myMaterial:null;

                let texture  = new BABYLON.Texture(Contacts[i], scene);
                texture.hasAlpha = true;
                myMaterial.diffuseTexture = texture;
                myMaterial.emissiveTexture = texture;

                myPlane.visibility = 0;
            }
        }

        let createDialogBox = function() {
            var dialogBox = BABYLON.MeshBuilder.CreatePlane("dialogBox", {width: 2, height: 1.5}, scene);
            dialogBox.parent = loadedModel;
            dialogBox.position.x = 2;
            dialogBox.visibility = 0;

            var closePlane = BABYLON.MeshBuilder.CreatePlane("closePlane", {width: 0.2, height: 0.2}, scene)
            closePlane.position.x= 0.9;
            closePlane.position.y= 0.9;
            closePlane.position.z= -0.01;
            closePlane.parent = dialogBox 
            var guiTexture = Stage.GUI.AdvancedDynamicTexture.CreateForMesh(closePlane)

            var guiPanel = new Stage.GUI.StackPanel()  
            guiPanel.top = "0px"
            guiTexture.addControl(guiPanel)
            var close = Stage.GUI.Button.CreateSimpleButton("close", "X");
            close.fontSize = 300
            close.color = "white"
            close.background = "#4AB3F4"
            close.cornerRadius = 200
            close.thickness = 20
            close.onPointerClickObservable.add(()=>{
                scene.getMeshByName("dialogBox").visibility = 0;
                scene.getMeshByName("closePlane").visibility = 0;
            })
            guiPanel.addControl(close);
            closePlane.visibility = 0;

        }

        let listMesh = new BABYLON.Mesh("contactList", scene);
        listMesh.parent = loadedModel;
        
        createContactList();
        createDialogBox();

        let b = new BABYLON.PointerDragBehavior({dragPlaneNormal: new BABYLON.Vector3(0,1,0)})
        loadedModel.addBehavior(b)
        loadedModel.position.z = 0
        loadedModel.position.y = 1.5
        loadedModel.position.x = 2
  
        popAnimation.addTargetedAnimation(animationBox1, loadedModel);
        popAnimation.addTargetedAnimation(animationBox2, loadedModel);
        popAnimation.addTargetedAnimation(animationBox3, loadedModel);
        scene.addAnimationGroup(popAnimation);
        scene.addMesh(loadedModel, true)
        // Any mesh created MUST have the windowAnchor as it's parent
        windowAnchor.addChild(loadedModel);
        //var chatActions = new ActionManager(scene);

        // Create GUI button
        var plane = BABYLON.MeshBuilder.CreatePlane("plane", {width: 0.2, height: 0.2}, scene)
        plane.position.y= 1
        plane.parent = windowAnchor // set windowAnchor as parent
        var guiTexture = Stage.GUI.AdvancedDynamicTexture.CreateForMesh(plane)
        guiTexture
        var guiPanel = new Stage.GUI.StackPanel()  
        guiPanel.top = "0px"
        guiTexture.addControl(guiPanel)
        var button = Stage.GUI.Button.CreateSimpleButton("", "Click 🤣")
        button.fontSize = 300
        button.color = "white"
        button.background = "#4AB3F4"
        button.cornerRadius = 200
        button.thickness = 20
        
        button.onPointerClickObservable.add(()=>{

            // add animation
            //loadedModel.animations = [];
            //loadedModel.animations.push(animationBox1);
            //loadedModel.animations.push(animationBox2);
            //.animations.push(animationBox3);
            // start animation
            //var newAnimation = scene.beginAnimation(loadedModel, 0, 15, true);

            
            popAnimation.play(true);
            //var pickResult = scene.pick(scene.pointerX, scene.pointerY);

        })
        guiPanel.addControl(button)
        

        scene.onPointerObservable.add((evt)=> {
            // console.log(evt.pickInfo);
            if(evt.type==BABYLON.PointerEventTypes.POINTERMOVE && evt.pickInfo.pickedMesh && evt.pickInfo.pickedMesh.id == 'name3'){
                console.log("hover");
            }
            // if the click hits the ground object, we change the impact position

            if (evt.type==BABYLON.PointerEventTypes.POINTERUP && evt.pickInfo.pickedMesh && 
                (evt.pickInfo.pickedMesh.id === "name0" 
                ||evt.pickInfo.pickedMesh.id === "name1" 
                ||evt.pickInfo.pickedMesh.id === "name2" 
                ||evt.pickInfo.pickedMesh.id === "name3" )) {
                console.log("click");
                scene.getMeshByName("dialogBox").visibility = 1;
                scene.getMeshByName("closePlane").visibility = 1;
                // var advancedTexture3 = Stage.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
                // var rectangle = new Stage.GUI.Rectangle("rect");
                //     rectangle.top = "-100px";
                //     rectangle.background = "white";
                //     rectangle.color = "yellow";
                //     rectangle.width = "200px";
                //     rectangle.height = "40px";
                //     advancedTexture3.addControl(rectangle);

                //     var name = new Stage.GUI.TextBlock("name");
                //     name.fontFamily = "Helvetica";
                //     name.textWrapping = true;
                //     name.text = "name: Hello!";
                //     name.color = "black";
                //     name.fontSize = 20;
                //     rectangle.addControl(name);   
                //     rectangle.linkWithMesh(loadedModel);   
                //     rectangle.linkOffsetY = -25;
                //     rectangle.linkOffsetX = 400;

                //     var advancedTexture2 = Stage.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

                // var input = new Stage.GUI.InputText();
                // input.width = 0.2;
                // input.maxWidth = 0.2;
                // input.height = "40px";
                // input.text = "";
                // input.color = "blue";
                // input.background = "white";
                // advancedTexture2.addControl(input);  

                // input.linkWithMesh(loadedModel);   
                // input.linkOffsetY = 50;
                // input.linkOffsetX = 400
            }
            if ( evt.type==BABYLON.PointerEventTypes.POINTERUP && evt.pickInfo.pickedMesh && evt.pickInfo.pickedMesh.id === "node_id32") {
                popAnimation.stop();
                let visibility;
                listMesh.getChildMeshes().forEach(element => {
                    element.visibility = element.visibility === 1 ? 0:1;
                    visibility = element.visibility;

                });
                if (visibility === 0){
                    scene.getMeshByName("dialogBox").visibility = 0;
                    scene.getMeshByName("closePlane").visibility = 0;
                    }

            }
        });



    }, 
    dispose: async ()=>{

    }


})