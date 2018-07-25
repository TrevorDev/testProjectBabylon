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
    var leftx = 0, midx = 2, rightx = 4;
    var lefty = 6, midy = 6, righty = 6;
    for(var i in arr){
        var node = arr[i];
        if(node.nodeName == 'TEXT-3D'){
            var text = node.children[0].innerText, pos = node.attributes[0].nodeValue;
            contentArr.push({'text':text,'pos':pos});

            var plane = BABYLON.MeshBuilder.CreatePlane("plane", {size: 1}, scene);
            if(pos == 'left'){
                zpos = -0.5
                plane.position.x = leftx
                plane.position.y = lefty
                plane.position.z = zpos
                lefty -= 2
            }
            else if(pos == 'right'){
                zpos = -0.5
                plane.position.x = rightx
                plane.position.y = righty
                plane.position.z = zpos
                righty -= 2
            }
            else if(pos == 'mid'){
                zpos = 0
                plane.position.x = midx
                plane.position.y = midy
                plane.position.z = zpos
                midy -= 2
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
                lefty -= 2
            }
            else if(pos == 'right'){
                zpos = -0.5
                plane.position.x = rightx
                plane.position.y = righty
                plane.position.z = zpos
                righty -= 2
            }
            else if(pos == 'mid'){
                zpos = 0
                plane.position.x = midx
                plane.position.y = midy
                plane.position.z = zpos
                midy -= 2
            }
            plane.material = mat;

            plane.parent = windowAnchor;

            planes.push(plane);
            materials.push(mat);
            textures.push(tex);
        }
        else if(node.nodeName == 'BTN-3D'){
            contentArr.push({'href':node.children[0].pathname,'btnText':node.children[0].innerText,'pos':node.attributes[0].nodeValue});

            // Create GUI button
            var plane = BABYLON.MeshBuilder.CreatePlane("plane", {width: 1, height: 1}, scene)
            if(pos == 'left'){
                zpos = -0.5
                plane.position.x = leftx
                plane.position.y = lefty
                plane.position.z = zpos
                lefty -= 2
            }
            else if(pos == 'right'){
                zpos = -0.5
                plane.position.x = rightx
                plane.position.y = righty
                plane.position.z = zpos
                righty -= 2
            }
            else if(pos == 'mid'){
                zpos = 0
                plane.position.x = midx
                plane.position.y = midy
                plane.position.z = zpos
                midy -= 2
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
                console.log("hit2");

                var newdata = await $.get("/public/testSite"+node.children[0].pathname);
                console.log(newdata)
                renderSite(newdata, windowAnchor);
            });
            guiPanel.addControl(button);

            planes.push(plane);
            textures.push(guiTexture);
        }
    }
    console.log(contentArr)
}



shell.registerApp({
    name: "convertSite", 
    iconUrl: "public/appicons/wikipedia.png",
    launch: async (windowAnchor:BABYLON.Mesh, vrHelper: VRExperienceHelper)=>{

        console.log("conv app")
        var data = await $.get("/public/testSite/home.html");
        await renderSite(data, windowAnchor);
      
    }, 
    dispose: async ()=>{

    }
})