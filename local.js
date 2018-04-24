document.documentElement.style["overflow"]="hidden"
document.documentElement.style.overflow ="hidden"
document.documentElement.style.width ="100%"
document.documentElement.style.height ="100%"
document.documentElement.style.margin ="0"
document.documentElement.style.padding ="0"
document.body.style.overflow ="hidden"
document.body.style.width ="100%"
document.body.style.height ="100%"
document.body.style.margin ="0"
document.body.style.padding ="0"

// Create canvas html element on webpage
this.canvas = document.createElement('canvas');
this.canvas.style.width="100%"
this.canvas.style.height="100%"
document.body.appendChild(this.canvas);

// Initialize Babylon scene and engine
this.engine = new BABYLON.Engine(this.canvas, true);
this.scene = new BABYLON.Scene(this.engine);
this.engine.runRenderLoop(()=>{
    this.scene.render();
});

var helper = this.scene.createDefaultVRExperience()

BABYLON.SceneLoader.ImportMesh("", "", "DemoRoom_greybox.gltf", this.scene, (c)=>{
    console.log("hit2")    
console.log(c)
})