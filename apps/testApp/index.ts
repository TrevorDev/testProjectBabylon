import { VRExperienceHelper } from "babylonjs";

var shell:any = (<any>window).shell

var makeNotPickable = (mesh:BABYLON.AbstractMesh)=>{
    mesh.isPickable = false;
    mesh.getChildMeshes().forEach((m)=>{
        makeNotPickable(m)
    })
}

shell.registerApp({
    name: "testApp", 
    launch: async (windowAnchor:BABYLON.Mesh, vrHelper: VRExperienceHelper)=>{
        // Get scene
        var scene = windowAnchor.getScene();

        // Load gltf model and add to scene
        var container = await BABYLON.SceneLoader.LoadAssetContainerAsync("https://raw.githubusercontent.com/TrevorDev/gltfModels/master/facebook.glb", "", this.scene)
        var loadedModel = container.createRootMesh()
        makeNotPickable(loadedModel) // This needs to be done on large models to save on perf when doing ray collisions from controllers
        loadedModel.position.y = 2
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
            console.log("hit2")
            var myPlane = BABYLON.MeshBuilder.CreatePlane("myPlane", {width: 3, height: 2}, scene);
            myPlane.position.z = 5;
            var animationBox1 = new BABYLON.Animation("myAnimation", "scaling.x", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
            var animationBox2 = new BABYLON.Animation("myAnimation", "scaling.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
            var animationBox3 = new BABYLON.Animation("myAnimation", "scaling.z", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

            var keys = []; 

            //At the animation key 0, the value of scaling is "1"
            keys.push({
                frame: 0,
                value: 1
            });

            //At the animation key 20, the value of scaling is "0.2"
            keys.push({
                frame: 5,
                value: 1.1
            });

            //At the animation key 100, the value of scaling is "1"
            keys.push({
                frame: 15,
                value: 1
            });
            animationBox1.setKeys(keys);
            animationBox2.setKeys(keys);
            animationBox3.setKeys(keys);

            myPlane.animations = [];
            myPlane.animations.push(animationBox1);
            myPlane.animations.push(animationBox2);
            myPlane.animations.push(animationBox3);
            var newAnimation = scene.beginAnimation(myPlane, 0, 15, true);
            //var pickResult = scene.pick(scene.pointerX, scene.pointerY);
            scene.onPointerDown = function (evt, pickResult) {
                // if the click hits the ground object, we change the impact position

                if (pickResult.pickedMesh.id === "myPlane") {
                    newAnimation.pause();
                    myPlane.dispose();
                    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

                    var rectangle = new BABYLON.GUI.Rectangle("rect");
                    rectangle.top = "-100px";
                    rectangle.background = "black";
                    rectangle.color = "yellow";
                    rectangle.width = "200px";
                    rectangle.height = "40px";
                    advancedTexture.addControl(rectangle);

                    var text1 = new BABYLON.GUI.TextBlock("text1");
                    text1.fontFamily = "Helvetica";
                    text1.textWrapping = true;
                    text1.text = "🤣: Hello there!";
                    text1.color = "white";
                    text1.fontSize = 20;
                    rectangle.addControl(text1);    

                    var advancedTexture2 = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

                    var input = new BABYLON.GUI.InputText();
                    input.width = 0.2;
                    input.maxWidth = 0.2;
                    input.height = "40px";
                    input.text = "";
                    input.color = "blue";
                    input.background = "white";
                    advancedTexture2.addControl(input);  
                }
            };
        })
        guiPanel.addControl(button)

    }, 
    dispose: async ()=>{

    }
})