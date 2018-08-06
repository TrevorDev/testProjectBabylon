var world = async()=>{
   return "world"; 
}
(async()=>{
    console.log("hello "+await world())
})()