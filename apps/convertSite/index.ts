import { VRExperienceHelper } from "babylonjs";
import {Stage} from "../../src/stage"
var shell:any = (<any>window).shell

var makeNotPickable = (mesh:BABYLON.AbstractMesh)=>{
    mesh.isPickable = false;
    mesh.getChildMeshes().forEach((m)=>{
        makeNotPickable(m)
    })
}

shell.registerApp({
    name: "convertSite", 
    iconUrl: "public/appicons/wikipedia.png",
    launch: async (windowAnchor:BABYLON.Mesh, vrHelper: VRExperienceHelper)=>{
        // Get scene
        var scene = windowAnchor.getScene();

        console.log("conv app")
        var contentArr = [];
        await $.get("/public/testSite/home.html",function(data){
            var arr = $.parseHTML(data);
            for(var i in arr){
                var node = arr[i];
                if(node.nodeName == 'TEXT-3D') {
                    contentArr.push({'text':node.children[0].innerText});
                }
                else if(node.nodeName == 'IMG-3D') {
                    contentArr.push({'image':node.children[0].src});
                }
                else if(node.nodeName == 'BTN-3D') {
                    contentArr.push({'href':node.children[0].href});
                }
            }
            console.log(contentArr)
        })
        
        // process contentArr 
        var ELEM_SIZE = 3
        var yPos = 2;
        contentArr.forEach(siteDict => {
            for (let key in siteDict)
            {
                if (key == "text")
                {
                    var plane = BABYLON.MeshBuilder.CreatePlane("plane1", {size: ELEM_SIZE}, scene);
                    plane.position.y = yPos
                    yPos += ELEM_SIZE
                    plane.parent = windowAnchor
                    var advancedTexture = Stage.GUI.AdvancedDynamicTexture.CreateForMesh(plane);
                    advancedTexture.getContext().textBaseline = "top"
                    var text1 = new Stage.GUI.TextBlock();
                    text1.fontFamily = "Helvetica";
                    text1.textWrapping = true;
                    text1.textHorizontalAlignment = Stage.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
                    text1.text = siteDict[key]
                    text1.color = "white";
                    text1.fontSize = "54px";
                    advancedTexture.addControl(text1);
                } 
                else if (key == "image")
                {
                    var imageMesh = BABYLON.Mesh.CreatePlane("sphere1", ELEM_SIZE, scene)
                    imageMesh.position.y = yPos // TODO: dynamically place below previous elements in contentArr
                    yPos += ELEM_SIZE
                    imageMesh.parent = windowAnchor
                    var mat = new BABYLON.StandardMaterial("icon", scene);
                    var imageTexture = new BABYLON.Texture(siteDict[key], scene);
                    mat.diffuseTexture = imageTexture;
                    mat.diffuseTexture.hasAlpha = true;
                    mat.backFaceCulling = false;
                    imageMesh.material = mat;
                }
                else if (key == "href")
                {
                    var nextPagePlane = BABYLON.MeshBuilder.CreatePlane("nextPagePlane", {width: 0.2, height: 0.2}, scene)
                    nextPagePlane.position.y = 0.2
                    nextPagePlane.position.x = 1
                    nextPagePlane.parent = windowAnchor
                    var nextPageTexture = Stage.GUI.AdvancedDynamicTexture.CreateForMesh(nextPagePlane)
            
                    var nextPageButton = Stage.GUI.Button.CreateSimpleButton("Next", "-->")        
                    nextPageButton.fontSize = 250
                    nextPageButton.color = "white"
                    nextPageButton.background = "#4AB3F4"
                    nextPageButton.thickness = 20
                    nextPageTexture.addControl(nextPageButton)
                }
            }
        });
        
    }, 
    dispose: async ()=>{

    }
})
