export interface TrackedObject{
    uniqueId: string,
    objectType?: string
    position?: {x:number,y:number,z:number}
    rotation?: {x:number,y:number,z:number,w:number}
    state?: string
    customInfo?:any
}

export interface JoinRoomRequest {
    roomId: string
}

export interface JoinedRoomResponse{
    gameObjects: Map<string,TrackedObject>
    customInfo?:any
}

export interface CreatedTrackedObjectResponse {
    uniqueId: string
}