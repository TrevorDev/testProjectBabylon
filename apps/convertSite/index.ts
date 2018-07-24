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
    name: "testApp", 
    iconUrl: "public/appicons/test_app_logo.png",
    launch: async (windowAnchor:BABYLON.Mesh, vrHelper: VRExperienceHelper)=>{
        // Get scene
        var scene = windowAnchor.getScene();

        console.log("conv app")
        await $.get("/public/testSite/home.html",function(data){
            var arr = $.parseHTML(data);
            var contentArr = [];
            for(var i in arr){
                var node = arr[i];
                if(node.nodeName == 'TEXT-3D'){
                    contentArr.push({'text':node.children[0].innerText});
                }
                else if(node.nodeName == 'IMG-3D'){
                    contentArr.push({'image':node.children[0].src});
                }
                else if(node.nodeName == 'BTN-3D'){
                    contentArr.push({'href':node.children[0].href});
                }
            }
            console.log(contentArr)
        })
        
        
    }, 
    dispose: async ()=>{

    }
})