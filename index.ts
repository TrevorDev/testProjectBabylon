import { Stage } from './src/stage'
import { Texture } from 'babylonjs';
var textToWrite = "Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world"

class Text2D {
    plane: BABYLON.Mesh
    texture: BABYLON.DynamicTexture
    constructor(scene, planeWidth, planeHeight, fontSize, quality){
        var ratio = planeHeight/planeWidth;
        var heightRatio = planeHeight/fontSize
        this.plane = BABYLON.MeshBuilder.CreatePlane("", {width: planeWidth, height: planeHeight}, scene)
        var canvas = document.createElement("canvas");
        var options = {width:quality*heightRatio/ratio, height:quality*heightRatio}
        canvas.width = options.width
        canvas.height = options.height
        console.log(options)
        this.texture = new BABYLON.DynamicTexture("dynamic texture", canvas, scene, true);  
        this.texture.hasAlpha = true
        var textureContext = this.texture.getContext();
        textureContext.textBaseline = "top"

        var mat = new BABYLON.StandardMaterial("Mat", scene);    				
        mat.emissiveTexture = this.texture;
        mat.opacityTexture = this.texture;
        this.plane.material = mat;

        var font = "bold "+quality+"px Sans-serif";

        // var size = textureContext.getSize();

        // textureContext.fillText(textToWrite, 0,0);

        textureContext.fillStyle = "transparent";
        textureContext.fillRect(0, 0, options.width, options.height)

        textureContext.font = font;
        textureContext.fillStyle = "white";
        textureContext.fillText(textToWrite, 0, 0);
        this.texture.getScene().getEngine().updateDynamicTexture(this.texture.getInternalTexture(), canvas, true, false)
        //this.texture.drawText(textToWrite, 0, 0, font, "white", "black", true, true);
    }
}

var main = async ()=>{
    // Initialize full screen rendering
    var stage = new Stage()
    var scene = stage.scene
    var canvas = stage.engine.getRenderingCanvas()

    // Create basic world
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene)
    camera.setTarget(BABYLON.Vector3.Zero())
    camera.attachControl(canvas, true)
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene)
    light.intensity = 0.7
    //var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene)
    //sphere.position.y = 1
    new Text2D(scene, 10, 1, 0.5, 100)
}
main()


/*
<!DOCTYPE HTML>
<html>
  <head>
    <style>
      body {
        margin: 0px;
        padding: 0px;
      }
    </style>
  </head>
  <body>
    <canvas id="myCanvas" width="578" height="200"></canvas>
    <script>
      function wrapText(context, text, x, y, maxWidth, lineHeight) {
        var words = text.split(' ');
        var line = '';

        for(var n = 0; n < words.length; n++) {
          var testLine = line + words[n] + ' ';
          var metrics = context.measureText(testLine);
          var testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
          }
          else {
            line = testLine;
          }
        }
        context.fillText(line, x, y);
      }
      
      var canvas = document.getElementById('myCanvas');
      var context = canvas.getContext('2d');
      var maxWidth = 400;
      var lineHeight = 25;
      var x = (canvas.width - maxWidth) / 2;
      var y = 60;
      var text = 'All the world \'s a stage, and all the men and women merely players. They have their exits and their entrances; And one man in his time plays many parts.';

      context.font = '16pt Calibri';
      context.fillStyle = '#333';

      wrapText(context, text, x, y, maxWidth, lineHeight);
    </script>
  </body>
</html>      
*/