import { VRExperienceHelper, ActionManager } from "babylonjs";
import {Stage} from "../../src/stage"

var shell:any = (<any>window).shell





shell.registerApp({
    name: "chatApp", 
    iconUrl: "public/appicons/test_app_logo.png",
    launch: async (windowAnchor:BABYLON.Mesh, vrHelper: VRExperienceHelper)=>{
        // Get scene
        let scene = windowAnchor.getScene();
        // Load gltf model and add to scene   
        let container = await BABYLON.SceneLoader.LoadAssetContainerAsync("https://raw.githubusercontent.com/rachyliu/assets/master/ChatApp.glb", "", scene)
        
        let loadedModel = container.createRootMesh();
        let creatPopAnimation = function (targetMesh){
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

                let popAnimation = new BABYLON.AnimationGroup("popGroup"+targetMesh.name, scene);
                popAnimation.addTargetedAnimation(animationBox1, targetMesh);
                popAnimation.addTargetedAnimation(animationBox2, targetMesh);
                popAnimation.addTargetedAnimation(animationBox3, targetMesh);
                scene.addAnimationGroup(popAnimation);
            }
        

        let hoverEffect = function(target){
            target.actionManager = new BABYLON.ActionManager(scene);

            target.actionManager.registerAction(
                new BABYLON.InterpolateValueAction(
                    {
                        trigger: BABYLON.ActionManager.OnPointerOverTrigger,
                        parameter: target
                    },
                    target,
                    "scaling",
                    new BABYLON.Vector3(1.2, 1.2, 1.2),
                    50
                )
            );
            target.actionManager.registerAction(
                new BABYLON.InterpolateValueAction(
                    {
                        trigger: BABYLON.ActionManager.OnPointerOutTrigger,
                        parameter: target
                    },
                    target,
                    "scaling",
                    new BABYLON.Vector3(1, 1, 1),
                    50
                )
            );
        }

        /**
         * Creates a contact list
         */
        let createContactList = function (){
            var Contacts = ["https://raw.githubusercontent.com/rachyliu/assets/master/contactPeople2.png", 
            "https://raw.githubusercontent.com/rachyliu/assets/master/contactPeople1.png", 
            "https://raw.githubusercontent.com/rachyliu/assets/master/contactPeople4.png", 
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

                hoverEffect(myPlane);

                creatPopAnimation(myPlane);

                createDialogBox(myPlane);

                var option1 = BABYLON.MeshBuilder.CreatePlane("listAction1." + myPlane.name, {width: 0.25, height: 0.25}, scene);
                //myPlane.dispose();
                option1.position.z = 0
                option1.position.x = 0.6
                option1.position.y = 0;
                option1.parent = myPlane;
                option1.visibility = 0;
                var guiTexture = Stage.GUI.AdvancedDynamicTexture.CreateForMesh(option1)

                var guiPanel = new Stage.GUI.StackPanel()  
                guiPanel.top = "0px"
                guiTexture.addControl(guiPanel)
                var close = Stage.GUI.Button.CreateImageOnlyButton("chat", "https://raw.githubusercontent.com/rachyliu/assets/master/chatIcon.png");
                close.fontSize = 300
                close.color = "white"
                close.cornerRadius = 500

                close.onPointerClickObservable.add(()=>{
                    console.log("1");
                })
                guiPanel.addControl(close);
                hoverEffect(option1);


                var option2 = BABYLON.MeshBuilder.CreatePlane("listAction1." + myPlane.name, {width: 0.25, height: 0.25}, scene);
                //myPlane.dispose();
                option2.position.z = 0
                option2.position.x = 0.9
                option2.position.y = 0;
                option2.parent = myPlane;
                option2.visibility = 0;
                var guiTexture = Stage.GUI.AdvancedDynamicTexture.CreateForMesh(option2)

                var guiPanel = new Stage.GUI.StackPanel()  
                guiPanel.top = "0px"
                guiTexture.addControl(guiPanel)
                var close = Stage.GUI.Button.CreateImageOnlyButton("video", "https://raw.githubusercontent.com/rachyliu/assets/master/videoIcon.png");
                close.fontSize = 300
                close.color = "white"
                close.cornerRadius = 500
                close.onPointerClickObservable.add(()=>{
                    console.log("2");
                })
                guiPanel.addControl(close);
                hoverEffect(option2);
            }
        }

        let createDialogBox = function(parentPerson) {
             console.log(parentPerson.id);
            let dialogBox = BABYLON.MeshBuilder.CreatePlane("dialogBox" + parentPerson.id, {width: 2, height: 1.5}, scene);
            dialogBox.parent = loadedModel;
            dialogBox.position.x = 2;
            dialogBox.position.y = parentPerson.position.y;
            dialogBox.visibility = 0;
            dialogBox.parent = windowAnchor;
            let drag = new BABYLON.PointerDragBehavior({dragPlaneNormal: new BABYLON.Vector3(0,1,0)})
            // drag.moveAttached = false;
            // drag.onDragObservable.add(function(evt){
            //     dialogBox.position.addInPlace(evt.delta);
            // });
            dialogBox.addBehavior(drag);

            var closePlane = BABYLON.MeshBuilder.CreatePlane("closePlane" + parentPerson.id, {width: 0.2, height: 0.2}, scene)
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
                scene.getMeshByName("dialogBox" + parentPerson.id).visibility = 0;
                scene.getMeshByName("closePlane" + parentPerson.id).visibility = 0;
            })
            guiPanel.addControl(close);
            closePlane.visibility = 0;

        }

        let listMesh = new BABYLON.Mesh("contactList", scene);
        listMesh.parent = loadedModel;
        
        createContactList();
        // createDialogBox();

        let b = new BABYLON.PointerDragBehavior({dragPlaneNormal: new BABYLON.Vector3(0,1,0)})
        loadedModel.addBehavior(b)

        loadedModel.position.z = 0
        loadedModel.position.y = 1.5
        loadedModel.position.x = 2
  
        creatPopAnimation(loadedModel);

        scene.addMesh(loadedModel, true)
        // Any mesh created MUST have the windowAnchor as it's parent
        windowAnchor.addChild(loadedModel);
        //var chatActions = new ActionManager(scene);

        scene.onPointerObservable.add((evt)=> {

            // console.log(evt.pickInfo.pickedMesh.name);
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
                scene.getAnimationGroupByName("popGroup"+evt.pickInfo.pickedMesh.id).stop();
                scene.getMeshByName("dialogBox" + evt.pickInfo.pickedMesh.id).visibility = 1;
                scene.getMeshByName("closePlane" + evt.pickInfo.pickedMesh.id).visibility = 1;
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
                scene.getAnimationGroupByName("popGroupassetContainerRootMesh").stop();
                let visibility;
                listMesh.getChildMeshes().forEach(element => {
                    element.visibility = element.visibility === 1 ? 0:1;
                    visibility = element.visibility;

                });
                if (visibility === 0){
                    scene.getMeshByName("dialogBoxname0").visibility = 0;
                    scene.getMeshByName("dialogBoxname1").visibility = 0;
                    scene.getMeshByName("dialogBoxname2").visibility = 0;
                    scene.getMeshByName("dialogBoxname3").visibility = 0;
                    scene.getMeshByName("closePlanename0").visibility = 0;
                    scene.getMeshByName("closePlanename1").visibility = 0;
                    scene.getMeshByName("closePlanename2").visibility = 0;
                    scene.getMeshByName("closePlanename3").visibility = 0;
                    }

            }
        });
        scene.actionManager = new BABYLON.ActionManager(scene);
        scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                {
                    trigger: BABYLON.ActionManager.OnKeyUpTrigger,
                    parameter: 'q'
                },
                function () { 
                    scene.getAnimationGroupByName("popGroupname0").play(true);
                    scene.getAnimationGroupByName("popGroupname1").play(true);
                    scene.getAnimationGroupByName("popGroupassetContainerRootMesh").play(true);

                }
            )
        );

    }, 
    dispose: async ()=>{

    }


})