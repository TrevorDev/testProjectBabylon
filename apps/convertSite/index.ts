import { VRExperienceHelper } from "babylonjs";
import {Stage} from "../../src/stage"
var shell:any = (<any>window).shell

var makeNotPickable = (mesh:BABYLON.AbstractMesh)=>{
    mesh.isPickable = false;
    mesh.getChildMeshes().forEach((m)=>{
        makeNotPickable(m)
    })
}

var renderSite = async function (data, windowAnchor){
    // Get scene
    var scene = windowAnchor.getScene();
    
    var planes = []
    var materials = []
    var textures = []

    var arr = $.parseHTML(data);
    var contentArr = [];

    var zpos = 0;
    var leftx = -2, midx = 0, rightx = 2;
    var lefty = 4, midy = 4, righty = 4;
    for(var i in arr){
        let node = arr[i];
        if(!node.attributes){
            continue;
        }
        console.log(node)
        if(node.attributes[0]){
            console.log(node.attributes[0].nodeValue)
        }
        
        if(node.nodeName == 'TEXT-3D'){
            var text = node.children[0].innerText, pos = node.attributes[0].nodeValue;
            contentArr.push({'text':text,'pos':pos});

            var plane = BABYLON.MeshBuilder.CreatePlane("plane", {size: 1}, scene);
            if(pos == 'left'){
                zpos = -0.5
                plane.position.x = leftx
                plane.position.y = lefty
                plane.position.z = zpos
                lefty -= 1.3
            }
            else if(pos == 'right'){
                zpos = -0.5
                plane.position.x = rightx
                plane.position.y = righty
                plane.position.z = zpos
                righty -= 1.3
            }
            else if(pos == 'mid'){
                zpos = 0
                plane.position.x = midx
                plane.position.y = midy
                plane.position.z = zpos
                midy -= 1.3
            }
            
            // GUI

            var advancedTexture = Stage.GUI.AdvancedDynamicTexture.CreateForMesh(plane);
            advancedTexture.getContext().textBaseline = "top"
            var text1 = new Stage.GUI.TextBlock();
            text1.fontFamily = "Helvetica";
            text1.textWrapping = true;
            text1.text = text
            text1.color = "white";
            text1.fontSize = "70px";

            plane.parent = windowAnchor;

            advancedTexture.addControl(text1);

            planes.push(plane);
            textures.push(advancedTexture);
        }
        else if(node.nodeName == 'IMG-3D'){
            var img = node.children[0].src, pos = node.attributes[0].nodeValue;
            contentArr.push({'image':img,'pos':pos});

            var mat = new BABYLON.StandardMaterial("mat", scene);
            var tex = new BABYLON.Texture(img, scene)
            mat.diffuseTexture = tex;
            var plane = BABYLON.MeshBuilder.CreatePlane("plane",{},scene);
            if(pos == 'left'){
                zpos = -0.5
                plane.position.x = leftx
                plane.position.y = lefty
                plane.position.z = zpos
                lefty -= 1.3
            }
            else if(pos == 'right'){
                zpos = -0.5
                plane.position.x = rightx
                plane.position.y = righty
                plane.position.z = zpos
                righty -= 1.3
            }
            else if(pos == 'mid'){
                zpos = 0
                plane.position.x = midx
                plane.position.y = midy
                plane.position.z = zpos
                midy -= 1.3
            }
            plane.material = mat;

            plane.parent = windowAnchor;

            planes.push(plane);
            materials.push(mat);
            textures.push(tex);
        }
        else if(node.nodeName == 'BTN-3D'){
            pos = node.attributes[0].nodeValue;
            contentArr.push({'href':node.children[0].pathname,'btnText':node.children[0].innerText,'pos':node.attributes[0].nodeValue});

            // Create GUI button
            var plane = BABYLON.MeshBuilder.CreatePlane("plane", {width: 1, height: 1}, scene)
            if(pos == 'left'){
                zpos = -0.5
                plane.position.x = leftx
                plane.position.y = lefty
                plane.position.z = zpos
                lefty -= 1.3
            }
            else if(pos == 'right'){
                zpos = -0.5
                plane.position.x = rightx
                plane.position.y = righty
                plane.position.z = zpos
                righty -= 1.3
            }
            else if(pos == 'mid'){
                zpos = 0
                plane.position.x = midx
                plane.position.y = midy
                plane.position.z = zpos
                midy -= 1.3
            }
            plane.parent = windowAnchor // set windowAnchor as parent
            var guiTexture = Stage.GUI.AdvancedDynamicTexture.CreateForMesh(plane)
            guiTexture
            var guiPanel = new Stage.GUI.StackPanel()  
            guiPanel.top = "0px"
            guiTexture.addControl(guiPanel)
            var button = Stage.GUI.Button.CreateSimpleButton("", node.children[0].innerText)
            
            button.fontSize = 300
            button.color = "white"
            button.background = "#4AB3F4"
            button.cornerRadius = 200
            button.thickness = 20
            button.onPointerClickObservable.add(async ()=>{
                
                //remove previous page
                for(var i in planes){
                    planes[i].dispose();
                }
                for(var i in materials){
                    materials[i].dispose();
                }
                for(var i in textures){
                    textures[i].dispose();
                }

                var newdata = await $.get("/public/testSite"+node.children[0].pathname);
                renderSite(newdata, windowAnchor);
            });
            guiPanel.addControl(button);

            planes.push(plane);
            textures.push(guiTexture);
        }else if(node.nodeName == 'MODEL-3D'){
            pos = node.attributes[0].nodeValue
            var plane = new BABYLON.Mesh("", scene);
            plane.parent = windowAnchor
            if(pos == 'left'){
                zpos = -0.5
                plane.position.x = leftx
                plane.position.y = lefty
                plane.position.z = zpos
                lefty -= 1.3
            }
            else if(pos == 'right'){
                zpos = -0.5
                plane.position.x = rightx
                plane.position.y = righty
                plane.position.z = zpos
                righty -= 1.3
            }
            else if(pos == 'mid'){
                zpos = 0
                plane.position.x = midx
                plane.position.y = midy
                plane.position.z = zpos
                midy -= 1.3
            }
            var container = await BABYLON.SceneLoader.LoadAssetContainerAsync(node.getAttribute("src"), "", scene)  
            container.addAllToScene();
            container.meshes[0].parent = plane;
            container.meshes[0].position.z = -1
            container.meshes[0].position.y = -1.5
            container.meshes[0].position.x = 0.8
            planes.push(plane);
            
        }
    }
}



shell.registerApp({
    name: "convertSite", 
    iconUrl: "public/appicons/wikipedia.png",
    launch: async (windowAnchor:BABYLON.Mesh, vrHelper: VRExperienceHelper)=>{
        var godPlane = new BABYLON.Mesh("", windowAnchor.getScene())
        godPlane.parent = windowAnchor;
        godPlane.scaling.scaleInPlace(0.3)
        var data = await $.get("/public/testSite/home.html");
        await renderSite(data, godPlane);
      
    }, 
    dispose: async ()=>{

    }
})