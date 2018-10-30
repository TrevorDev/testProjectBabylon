console.log("foobar")

var videoEl = document.createElement('video');
videoEl.autoplay = true
videoEl.controls = true
videoEl.muted = true
videoEl.src = "http://localhost:1338/Playground/mov_bbb.mp4"
videoEl.crossOrigin = "Anonymous"
document.body.appendChild(videoEl)

// setTimeout(() => {
//     videoEl.muted = false
// }, 2000);

var canvas = document.createElement('canvas')
canvas.style.width="192px"
canvas.style.height="108px"
document.body.appendChild(canvas)

var canvas2 = document.createElement('canvas')
canvas2.style.width="192px"
canvas2.style.height="108px"
document.body.appendChild(canvas2)

var frame = ()=>{
    //console.log("hit")
    var ctx = canvas.getContext("2d")
    ctx.drawImage(videoEl, 0, 0, videoEl.videoWidth, videoEl.videoHeight, 0, 0, canvas.width, canvas.height)
    var data = ctx.getImageData(0,0,canvas.width, canvas.height)
    data.data.buffer
    
    // var ctx2 = canvas2.getContext("2d")
    // var img = ctx2.createImageData(canvas.width, canvas.height)
    // img.data.set(data.data);
    // ctx2.putImageData(img,0,0)
    
    window.parent.postMessage({msg:"newFrame", data:data.data.buffer},"*", [data.data.buffer])
    // var ctx2 = canvas2.getContext("2d")
    // ctx2.putImageData(data,0,0)
    setTimeout(frame, 1000/60);
}
frame();

// window.addEventListener('message', function(e) {
//     //console.log(e)
//     var ctx2 = canvas2.getContext("2d")
//     var img = ctx2.createImageData(canvas.width, canvas.height)
//     var imgData = new Uint8ClampedArray(e.data.data)
//     img.data.set(imgData);
//     ctx2.putImageData(img,0,0)
// }, false);