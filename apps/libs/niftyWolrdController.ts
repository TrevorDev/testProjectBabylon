import { Vector3 } from "babylonjs";

enum CONTROLLER_MODES {
    KEYBOARD_MOUSE,
    TOUCHSCREEN
}

export class NiftyWorldController {
    static MODES = CONTROLLER_MODES
    leftJoystick = new BABYLON.Vector3()
    rightJoystick = new BABYLON.Vector3()
    jump = false
    restart = false

    keyMap:{[key:string]:boolean} = {}
    constructor(mode:CONTROLLER_MODES){
        var canvas: HTMLCanvasElement = document.querySelector('canvas');
        //if(mode == CONTROLLER_MODES.KEYBOARD_MOUSE){
            var setterFunc = (hit: boolean) => {
                return (e: any) => {
                    // Chrome vs Firefox keycodes                    
                    var key = e.keyCode ? String.fromCharCode(e.keyCode).toLowerCase() : String(e.key).toLowerCase()
                    
                    if(key == " "){
                        this.jump = hit;
                    }

                    if(key == "r"){
                        this.restart = hit;
                    }
                    
                    this.keyMap[key] = hit;
                    this.leftJoystick.set(0,0,0)
                    if(this.keyMap["w"]){
                        this.leftJoystick.z++;
                    }
                    if(this.keyMap["s"]){
                        this.leftJoystick.z--;
                    }  
                    if(this.keyMap["d"]){
                        this.leftJoystick.x++;
                    }                 
                    if(this.keyMap["a"]){
                        this.leftJoystick.x--;
                    }
                    this.leftJoystick.normalize()
                }
            }
            document.addEventListener('keyup', setterFunc(false));
            document.addEventListener('keypress', setterFunc(true));

            // lock mouse
            canvas.onclick = function() {
                canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
                canvas.requestPointerLock();
            }

            document.addEventListener('mousemove', (event: any) => {
                var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
                var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
                this.rightJoystick.y = movementY/1000
                this.rightJoystick.x = movementX/1000
            }, false);
        //}else{
            var touches:any = {left:null, right:null}
            canvas.addEventListener('touchstart', (e)=>{
                for(var i = 0;i<e.changedTouches.length;i++){
                    var side = e.changedTouches[i].clientX < canvas.width/2 ? "left" : "right"

                    if(e.changedTouches[i].clientY < canvas.height/2){
                        if(side == "left"){
                            this.restart = true
                        }{
                            this.jump = true
                        }
                    }else{
                        touches[side] = {}
                        touches[side].id = e.changedTouches[i].identifier
                        touches[side].start = new BABYLON.Vector2(e.changedTouches[i].clientX, e.changedTouches[i].clientY)
                        touches[side].value = new BABYLON.Vector2(0,0)
                    }
                }
                e.preventDefault()
            })
            canvas.addEventListener('touchmove', (e)=>{
                for(var i = 0;i<e.changedTouches.length;i++){
                    ["left", "right"].forEach((side)=>{
                        if(touches[side] && touches[side].id == e.changedTouches[i].identifier){
                            var pos  = new BABYLON.Vector2(e.changedTouches[i].clientX, e.changedTouches[i].clientY)
                            if(side == "left"){
                                touches[side].value = pos.subtract(touches[side].start).normalize()
                                this.leftJoystick.set(touches[side].value.x,0,-touches[side].value.y)
                                this.leftJoystick.normalize
                            }else{
                                touches[side].value = pos.subtract(touches[side].start)

                                this.rightJoystick.x = touches[side].value.x/100
                                this.rightJoystick.y = touches[side].value.y/100
                                touches[side].start.copyFrom(pos)
                            }
                        }
                    })
                }
                e.preventDefault()
            })
            canvas.addEventListener('touchend', (e)=>{
                for(var i = 0;i<e.changedTouches.length;i++){
                    var side = e.changedTouches[i].clientX < canvas.width/2 ? "left" : "right"
                    touches[side] = null
                    if(side == "left"){
                        this.leftJoystick.set(0,0,0)
                    }
                }
                var doc = window.document;
                var docEl = doc.documentElement;

                var requestFullScreen = docEl.requestFullscreen || (<any>docEl).mozRequestFullScreen || docEl.webkitRequestFullScreen || (<any>docEl).msRequestFullscreen;
                var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || (<any>doc).msExitFullscreen;

                if(!doc.fullscreenElement && !(<any>doc).mozFullScreenElement && !doc.webkitFullscreenElement && !(<any>doc).msFullscreenElement) {
                    requestFullScreen.call(docEl);
                }
                else {
                    //cancelFullScreen.call(doc);
                }
                e.preventDefault()
            })
        //}
    }
}