import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';

enum DoorState {
    Closed,
    Hydrated,
    Open,
    Busy
}

export class SpaceDoor {
    root:BABYLON.AbstractMesh
    state:DoorState = DoorState.Closed
    animations:any = {
        open:null,
        hydrate:null,
        close:null
    }
    constructor(public scene:BABYLON.Scene){
    }
    async init(){
        this.root = new BABYLON.AbstractMesh("", this.scene)
        var doorContainer = await BABYLON.SceneLoader.LoadAssetContainerAsync("http://localhost:5000/public/", "PortalDoor_greybox.glb", this.scene)
        doorContainer.addAllToScene()
        doorContainer.animationGroups[0].pause()

        var alphaMeshes = []
        var alphaLevel = null
        doorContainer.meshes.forEach((m)=>{
            if(m.name == "DoorTouch1" || m.name == "DoorTouch2"){
                alphaMeshes.push(m)
            }

            if(m.name == "ScreenWipe"){
                console.log("hit")
                alphaLevel = m
            }
            console.log(m.name)
        })

        this.animations.hydrate = new AnimationClip(doorContainer.animationGroups[0], (20-1)/60, (80-1)/60, ()=>{this.state = DoorState.Hydrated; alphaMeshes.forEach((m)=>{m.material.alpha = 0.5})})
        this.animations.open = new AnimationClip(doorContainer.animationGroups[0], (170-1)/60, (310-1)/60, ()=>{this.state = DoorState.Open})
        this.animations.close = new AnimationClip(doorContainer.animationGroups[0], (340-1)/60, (480-1)/60, ()=>{this.state = DoorState.Closed})
        this.root.addChild(doorContainer.meshes[0])

        this.scene.onBeforeRenderObservable.add(()=>{
            if(this.state == DoorState.Closed){
                if(this.scene.activeCamera && this.scene.activeCamera.position.subtract(this.root.position).length() < 5){
                    this.state = DoorState.Busy
                    this.animations.hydrate.play()
                }
            }else if(this.state == DoorState.Hydrated){
                if(this.scene.activeCamera && this.scene.activeCamera.position.subtract(this.root.position).length() < 5){
                    this.state = DoorState.Busy
                    this.animations.open.play()
                }
            }else if(this.state == DoorState.Open){
                if(this.scene.activeCamera && this.scene.activeCamera.position.subtract(this.root.position).length() >= 5){
                    this.state = DoorState.Busy
                    this.animations.close.play()
                }
            }else if(this.state == DoorState.Busy){

            }
            
        })
    }
}

class AnimationClip {
    constructor(public group, public start, public stop, fn){
        var animationEvent = new BABYLON.AnimationEvent(this.stop, ()=>{
            this.group.pause();
            fn()
        }, false)
        this.group.targetedAnimations[0].animation.addEvent(animationEvent)
    }

    play(){
        this.group.goToFrame(this.start)
        this.group.play()
    }
}