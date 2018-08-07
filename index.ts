import {createCanvas} from './src/canvasTools'
import * as Shaders from './src/shaders'
import { Mesh } from './src/mesh'
import * as twgl from "twgl.js"




class MagicWindowManger {
  private _xrDevice:any;
  private _xrSession:any;
  private _gl:any;
  constructor(public xgl:any, public render:any){  
  }
  init(){
      var xrNavigator:any = navigator;
      if(!xrNavigator.xr){
          console.log("xr not found");
          return Promise.reject("xr not found");
      }
      var started = false;
      return xrNavigator.xr.requestDevice()
      .then((device:any)=>{
          this._xrDevice = device;
          document.onclick = ()=>{
              if(started){
                  // console.log(camera.position)
                  // console.log(camera.rotationQuaternion)
                  return
              }
              started = true
              this.enterXR();
              
          }
      })
  }
  enterXR(){
      var outputCanvas = document.createElement('canvas');
      outputCanvas.style.cssText = "position:absolute; top:0px;left:0px;z-index:10;width:100%;height:100%"
      var ctx = outputCanvas.getContext('xrpresent');
      console.log("enterXR")
      this._xrDevice.requestSession({
          outputContext: ctx,
          environmentIntegration: true,
      }).then((session:any)=>{
          this._xrSession = session;
          document.body.appendChild(outputCanvas);
          console.log("got sesssion")
          this._gl = this.xgl;
          return this._gl.setCompatibleXRDevice(this._xrSession.device)
      }).then(()=>{
          this._xrSession.baseLayer = new XRWebGLLayer(this._xrSession, this._gl);
          console.log("created XR layer")
          return this._xrSession.requestFrameOfReference('eye-level')
      }).then((frameOfRef:any)=>{
          
          var rendLoop = (time:any, frame:any)=>{
              this._xrSession.requestAnimationFrame(rendLoop)
              var renderInfo = {time: time, frame: frame};
              if(!renderInfo.frame){
                  return;
              }
              var pose = renderInfo.frame.getDevicePose(frameOfRef);
              
              if(pose){
                  renderInfo.frame.views.forEach((view:any, i:number)=> {

                      var viewport  = this._xrSession.baseLayer.getViewport(renderInfo.frame.views[i])
                      this.xgl.bindFramebuffer(this.xgl.FRAMEBUFFER, this._xrSession.baseLayer.framebuffer);
                      this.xgl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
                 
                      this.render(pose.getViewMatrix(renderInfo.frame.views[i]), renderInfo.frame.views[i].projectionMatrix);
                  })
              }
              
              
          }
          this._xrSession.requestAnimationFrame(rendLoop)
      });
  }
}

var main = async ()=>{
    var canvas = createCanvas();

    var gl = canvas.getContext("webgl", {
      alpha: true,
      preserveDrawingBuffer: true,
    });
    var m4 = twgl.m4;
    var programInfo = twgl.createProgramInfo(gl, [Shaders.DEFAULT_VERTEX, Shaders.DEFAULT_FRAGMENT]);

    var mesh = new Mesh();
    mesh.buffers = {
      position: [0.1, 0.1, -0.1, 0.1, 0.1, 0.1, 0.1, -0.1, 0.1, 0.1, -0.1, -0.1, -0.1, 0.1, 0.1, -0.1, 0.1, -0.1, -0.1, -0.1, -0.1, -0.1, -0.1, 0.1, -0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, -0.1, -0.1, 0.1, -0.1, -0.1, -0.1, -0.1, 0.1, -0.1, -0.1, 0.1, -0.1, 0.1, -0.1, -0.1, 0.1, 0.1, 0.1, 0.1, -0.1, 0.1, 0.1, -0.1, -0.1, 0.1, 0.1, -0.1, 0.1, -0.1, 0.1, -0.1, 0.1, 0.1, -0.1, 0.1, -0.1, -0.1, -0.1, -0.1, -0.1],
      normal:   [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1],
      texcoord: [1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
      indices:  [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23],
    };
    var bufferInfo = twgl.createBufferInfoFromArrays(gl, mesh.buffers);

    var tex = twgl.createTexture(gl, {
      min: gl.NEAREST,
      mag: gl.NEAREST,
      src: [
        255, 255, 255, 255,
        192, 192, 192, 255,
        192, 192, 192, 255,
        255, 255, 255, 255,
      ],
    });

    var uniforms:any = {
      u_lightWorldPos: [1, 8, -10],
      u_lightColor: [1, 0.8, 0.8, 1],
      u_ambient: [0, 0, 0, 1],
      u_specular: [1, 1, 1, 1],
      u_shininess: 50,
      u_specularFactor: 1,
      u_diffuse: tex,
    };

    var mw = new MagicWindowManger(gl, (pview, pprojection)=>{
      var time = 0;
      twgl.resizeCanvasToDisplaySize(gl.canvas);
      //gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);
      //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      
      var fov = 30 * Math.PI / 180;
      var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
      var zNear = 0.5;
      var zFar = 1000;
      var projection = pprojection//m4.perspective(fov, aspect, zNear, zFar);
      var eye = [1, 4, -10];
      var target = [0, 0, 0];
      var up = [0, 1, 0];

      var view = pview//m4.lookAt(eye, target, up);
      var camera = m4.inverse(view);
      var viewProjection = m4.multiply(projection, view);
      var world = m4.translation([0,0,-1]);

      uniforms.u_viewInverse = camera;
      uniforms.u_world = world;
      uniforms.u_worldInverseTranspose = m4.transpose(m4.inverse(world));
      uniforms.u_worldViewProjection = m4.multiply(viewProjection, world);

      gl.useProgram(programInfo.program);
      twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
      twgl.setUniforms(programInfo, uniforms);
      gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
    })
    mw.init()

    // function render(time) {
    //   time *= 0.001;
    //   twgl.resizeCanvasToDisplaySize(gl.canvas);
    //   gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    //   gl.enable(gl.DEPTH_TEST);
    //   gl.enable(gl.CULL_FACE);
    //   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //   var fov = 30 * Math.PI / 180;
    //   var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    //   var zNear = 0.5;
    //   var zFar = 1000;
    //   var projection = m4.perspective(fov, aspect, zNear, zFar);
    //   var eye = [1, 4, -10];
    //   var target = [0, 0, 0];
    //   var up = [0, 1, 0];

    //   var camera = m4.lookAt(eye, target, up);
    //   var view = m4.inverse(camera);
    //   var viewProjection = m4.multiply(projection, view);
    //   var world = m4.rotationY(time);

    //   uniforms.u_viewInverse = camera;
    //   uniforms.u_world = world;
    //   uniforms.u_worldInverseTranspose = m4.transpose(m4.inverse(world));
    //   uniforms.u_worldViewProjection = m4.multiply(viewProjection, world);

    //   gl.useProgram(programInfo.program);
    //   twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    //   twgl.setUniforms(programInfo, uniforms);
    //   gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);

    //   requestAnimationFrame(render);
    // }
    // requestAnimationFrame(render);

  
}
main()