import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';

export class SpaceDoor {
    root:BABYLON.AbstractMesh
    state = "closed"
    animations:any = {
        open
    }
    constructor(public scene:BABYLON.Scene){
    }
    async init(){
        this.root = new BABYLON.AbstractMesh("", this.scene)
        var doorContainer = await BABYLON.SceneLoader.LoadAssetContainerAsync("http://localhost:5000/public/", "PortalDoor_greybox.glb", this.scene)
        doorContainer.addAllToScene()

        //doorContainer.meshes[0].position.z = 15  
        doorContainer.animationGroups[0].pause()

        this.animations.open = new AnimationClip(doorContainer.animationGroups[0], (170-1)/60, (310-1)/60)
        this.root.addChild(doorContainer.meshes[0])

        this.scene.onBeforeRenderObservable.add(()=>{
            if(this.scene.activeCamera && this.scene.activeCamera.position.subtract(this.root.position).length() < 5){
                if(this.state == "closed"){
                    this.animations.open.play()
                    this.state = "open"
                }
            }
        })
    }
}

class AnimationClip {
    constructor(public group, public start, public stop){
        var animationEvent = new BABYLON.AnimationEvent(this.stop, ()=>{
            this.group.pause();
        }, false)
        this.group.targetedAnimations[0].animation.addEvent(animationEvent)
    }

    play(){
        this.group.goToFrame(this.start)
        this.group.play()
    }
}