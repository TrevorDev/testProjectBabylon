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
    name: "videoplayer", 
    launch: async (windowAnchor:BABYLON.Mesh, vrHelper: VRExperienceHelper)=>{
        // Get scene
        var scene = windowAnchor.getScene();
        
        var videoplayerplane = BABYLON.MeshBuilder.CreatePlane("Plane1", {height: 1.0, width: 2.0}, scene);

        videoplayerplane.position.y = 2;
        videoplayerplane.position.x = -2;

        var playbutton = BABYLON.Mesh.CreatePlane("Plane1", .2, scene, true);

        playbutton.position.y = 1.3;
        playbutton.position.x = -2.9;


        var stopbutton = BABYLON.Mesh.CreatePlane("Plane1", .2, scene, true);

        stopbutton.position.y = 1.3;
        stopbutton.position.x = -2.65;


        // ecran.material.diffuseTexture = new BABYLON.VideoTexture("video",
        //     ["apps/testApp/videoplayer/mov_bbb.mp4"], scene, true);

        
    }, 
    dispose: async ()=>{

    }
})