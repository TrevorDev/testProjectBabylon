import * as NGSTypes from "../shared/niftyGameServerTypes"
class TrackedObjectFactory {
    constructor(public types:Array<{new():NGSTypes.TrackedObject, ObjectType:string}>){
        
    }
    createObject(data:NGSTypes.TrackedObject):NGSTypes.TrackedObject{
        for(var i=0;i<this.types.length;i++){
            if(data.objectType == this.types[i].ObjectType){
                var newObj = new this.types[i]()
                newObj.copyFrom(data)
                return newObj
            }
        }
        console.log("TrackedObjectFactory.createObject failed to create object of type: "+data.objectType)
        return new NGSTypes.TrackedObject()
    }
}

export default TrackedObjectFactory