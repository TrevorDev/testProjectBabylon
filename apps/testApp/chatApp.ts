import { VRExperienceHelper } from "babylonjs";

var shell:any = (<any>window).shell

var makeNotPickable = (mesh:BABYLON.AbstractMesh)=>{
    mesh.isPickable = false;
    mesh.getChildMeshes().forEach((m)=>{
        makeNotPickable(m)
    })
}
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

var popAniamtion = new BABYLON.AnimationGroup("popGroup");


shell.registerApp({
    name: "chatApp", 
    launch: async (windowAnchor:BABYLON.Mesh, vrHelper: VRExperienceHelper)=>{
        // Get scene
        var scene = windowAnchor.getScene();
        // Load gltf model and add to scene
        scene.addAnimationGroup(popAniamtion);
        var container = await BABYLON.SceneLoader.LoadAssetContainerAsync("https://raw.githubusercontent.com/rachyliu/assets/master/ChatApp.glb", "", this.scene)
        
        var loadedModel = container.createRootMesh()

        var b= new BABYLON.PointerDragBehavior({dragPlaneNormal: new BABYLON.Vector3(0,1,0)})
        loadedModel.addBehavior(b)
        //makeNotPickable(loadedModel) // This needs to be done on large models to save on perf when doing ray collisions from controllers
        loadedModel.position.z = 2
        loadedModel.position.y = 2
        loadedModel.position.x = - 2

        popAniamtion.addTargetedAnimation(animationBox1, loadedModel);
        popAniamtion.addTargetedAnimation(animationBox2, loadedModel);
        popAniamtion.addTargetedAnimation(animationBox3, loadedModel);
        
        scene.addMesh(loadedModel, true)
        // Any mesh created MUST have the windowAnchor as it's parent
        loadedModel.parent = windowAnchor

        // Create GUI button
        var plane = BABYLON.MeshBuilder.CreatePlane("plane", {width: 0.2, height: 0.2}, this.scene)
        plane.position.y= 1
        plane.parent = windowAnchor // set windowAnchor as parent
        var guiTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane)
        guiTexture
        var guiPanel = new BABYLON.GUI.StackPanel()  
        guiPanel.top = "0px"
        guiTexture.addControl(guiPanel)
        var button = BABYLON.GUI.Button.CreateSimpleButton("", "Click 🤣")
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

            
            popAniamtion.play(true);
            //var pickResult = scene.pick(scene.pointerX, scene.pointerY);

        })
        guiPanel.addControl(button)
        scene.onPointerDown = function (evt, pickResult) {
            console.log(pickResult.pickedMesh.id);
            // if the click hits the ground object, we change the impact position
            if (pickResult.pickedMesh.id === "name3") {
                var advancedTexture3 = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
                var rectangle = new BABYLON.GUI.Rectangle("rect");
                    rectangle.top = "-100px";
                    rectangle.background = "white";
                    rectangle.color = "yellow";
                    rectangle.width = "200px";
                    rectangle.height = "40px";
                    advancedTexture3.addControl(rectangle);

                    var name = new BABYLON.GUI.TextBlock("name");
                    name.fontFamily = "Helvetica";
                    name.textWrapping = true;
                    name.text = "name: Hello!";
                    name.color = "black";
                    name.fontSize = 20;
                    rectangle.addControl(name);   
                    rectangle.linkWithMesh(loadedModel);   
                    rectangle.linkOffsetY = -25;
                    rectangle.linkOffsetX = 400;

                    var advancedTexture2 = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

                var input = new BABYLON.GUI.InputText();
                input.width = 0.2;
                input.maxWidth = 0.2;
                input.height = "40px";
                input.text = "";
                input.color = "blue";
                input.background = "white";
                advancedTexture2.addControl(input);  

                input.linkWithMesh(loadedModel);   
                input.linkOffsetY = 50;
                input.linkOffsetX = 400
            }
            if (pickResult.pickedMesh.id === "node_id32") {
                popAniamtion.stop();

                var Contacts = ["https://raw.githubusercontent.com/rachyliu/assets/master/contactPeople.png", 
                    "https://raw.githubusercontent.com/rachyliu/assets/master/contactPeople1.png", 
                    "https://raw.githubusercontent.com/rachyliu/assets/master/contactPeople2.png", 
                    "https://raw.githubusercontent.com/rachyliu/assets/master/contactPeople3.png"];
                var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

                for (var i in Contacts){
                    var myPlane = BABYLON.MeshBuilder.CreatePlane("name"+i, {width: 0.8, height: 0.25}, scene);
                    //myPlane.dispose();
                    myPlane.position.z = 0
                    myPlane.position.x = 0
                    myPlane.position.y = 0.5 +0.3*(+i);
                    myPlane.parent = loadedModel;
                    var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
                    // myMaterial.emissiveColor = new BABYLON.Color3(1, 0, 0);

                    myPlane.material = myMaterial;//(+i === Contacts.length-1)? myMaterial:null;
                    console.log(i);
                    /*var rectangle = new BABYLON.GUI.Rectangle("rect");
                    rectangle.top = "-100px";
                    rectangle.background = (+i === Contacts.length-1)? "red":"black";
                    rectangle.color = "yellow";
                    rectangle.width = "200px";
                    rectangle.height = "40px";
                    advancedTexture.addControl(rectangle);*/
                    // var textureGround = new BABYLON.DynamicTexture("dynamic texture", {width:512, height:256}, scene, false);
                    let texture  = new BABYLON.Texture(Contacts[i], scene);
                    texture.hasAlpha = true;
                    myMaterial.diffuseTexture = texture;
                    myMaterial.emissiveTexture = texture;


                    /*var name = new BABYLON.GUI.TextBlock("name");
                    name.fontFamily = "Helvetica";
                    name.textWrapping = true;
                    name.text = Contacts[i];
                    name.color = "white";
                    name.fontSize = 20;
                    rectangle.addControl(name);   
                    rectangle.linkWithMesh(loadedModel);   
                    rectangle.linkOffsetY = -100-50*(+i);
                    rectangle.linkOffsetX = -200 */

                }

                
            }
        };
    }, 
    dispose: async ()=>{

    }
})