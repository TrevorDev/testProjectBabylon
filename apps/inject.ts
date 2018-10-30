var videoEl = document.getElementsByTagName("video")[0]

var canvas = document.createElement('canvas')
canvas.style.width="300px"
canvas.style.height="152px"
canvas.width=300
canvas.height=148
canvas.style.position="absolute"
canvas.style.zIndex = 200;
canvas.style.top = "0px"
document.body.appendChild(canvas)

var frame = ()=>{
    var ctx = canvas.getContext("2d")
    ctx.drawImage(videoEl, 0, 0, videoEl.videoWidth, videoEl.videoHeight, 0, 0, canvas.width, canvas.height)
    var data = ctx.getImageData(0,0,canvas.width, canvas.height)
    window.opener.postMessage({msg:"newFrame", data:data.data.buffer},"*")
    setTimeout(frame, 1000/60);
}
frame();