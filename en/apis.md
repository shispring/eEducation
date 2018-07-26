## Adapter

- [Adapter](#module_Adapter)
  - _instance_
    - [.initProfile(audience, videoProfile, swapWidthAndHeight)](#initProfile)
    - [.initClass()](#initClass)
    - [.enterClass(token, info)](#enterClass)
    - [.leaveClass()](#leaveClass)
    - [.prepareScreenShare(token, info, timeout)](#prepareScreenShare)
    - [.destructScreenShare()](#destructScreenShare)
    - [.startScreenShare()](#startScreenShare)
    - [.stopScreenShare()](#stopScreenShare)
    - [.muteVideo(uids)](#muteVideo)
    - [.unmuteVideo(uids)](#unmuteVideo)
    - [.muteAudio(uids)](#muteAudio)
    - [.unmuteAudio(uids)](#unmuteAudio)
    - [.broadcastMessage(message)](#broadcastMessage)
    - [.getUser()](#getUser)
    - [.subRtcEvents()](#subRtcEvents)
    - [.subDataProviderEvents()](#subDataProviderEvents)
  - _inner_
    - [~SHARE_ID](#SHARE_ID)

### initProfile

Encapsulation regular profile you need to set

| Param              | Type                 | Default            | Description              |
| ------------------ | -------------------- | ------------------ | ------------------------ |
| audience           | <code>boolean</code> | <code>false</code> | if user is an audience   |
| videoProfile       | <code>number</code>  | <code>43</code>    | videoProfile             |
| swapWidthAndHeight | <code>boolean</code> | <code>false</code> | if swap width and height |

### initClass

connect to server and init class through data provider

| Param          | Type                | Description         |
| -------------- | ------------------- | ------------------- |
| config.channel | <code>string</code> | channel             |
| config.user    | <code>Object</code> | username, role, uid |

### enterClass

actually join media channel to make stream ready

| Param | Type                | Default           | Description                                     |
| ----- | ------------------- | ----------------- | ----------------------------------------------- |
| token | <code>string</code> | <code>null</code> | token calculated by app id & app cert           |
| info  | <code>string</code> |                   | extra info to be broadcast when joinned channel |

### leaveClass

leave the media channel

### prepareScreenShare

prepare screen share: initialize and join

| Param   | Type                | Default            |
| ------- | ------------------- | ------------------ |
| token   | <code>string</code> | <code>null</code>  |
| info    | <code>string</code> |                    |
| timeout | <code>number</code> | <code>30000</code> |

### destructScreenShare

when you no longer need to do screen sharing, release it

### startScreenShare

start screen share

### stopScreenShare

stop screen share

### muteVideo

uid is undefined => mute self
uid is number => mute target uid
uid is Array => mute target uids

| Param | Type                                                                               |
| ----- | ---------------------------------------------------------------------------------- |
| uids  | <code>number</code>, <code>Array&lt;number&gt;</code> |

### unmuteVideo

uid is undefined => unmute self
uid is number => unmute target uid
uid is Array => unmute target uids

| Param | Type                                                                               |
| ----- | ---------------------------------------------------------------------------------- |
| uids  | <code>number</code>, <code>Array&lt;number&gt;</code> |

### muteAudio

uid is undefined => mute self
uid is number => mute target uid
uid is Array => mute target uids

| Param | Type                                                                               |
| ----- | ---------------------------------------------------------------------------------- |
| uids  | <code>number</code>, <code>Array&lt;number&gt;</code> |

### unmuteAudio

uid is undefined => unmute self
uid is number => unmute target uid
uid is Array => unmute target uids

| Param | Type                                                                               |
| ----- | ---------------------------------------------------------------------------------- |
| uids  | <code>number</code>, <code>Array&lt;number&gt;</code> |

### broadcastMessage

broadcast message in channel

| Param   | Type                |
| ------- | ------------------- |
| message | <code>string</code> |

### getUser

get user by uid from userlist

### subRtcEvents

subscribe rtc engine events

### subDataProviderEvents

subscribe event of data provider

### SHARE_ID

Stream id for sharing stream, default to be `2`



## BaseDataProvider

* [](#module_)
    * [.connect()](#connect)
    * [.disconnect()](#disconnect)
    * [.dispatchInitClass()](#dispatchInitClass)
    * [.dispatchLeaveClass()](#dispatchLeaveClass)
    * [.dispatchStartScreenShare()](#dispatchStartScreenShare)
    * [.dispatchStopScreenShare()](#dispatchStopScreenShare)
    * [.dispatchBroadcastMessage()](#dispatchBroadcastMessage)
    * [.fire(eventType, eventPayload)](#fire)
    * [.log()](#log)



### connect
connect - open your data tunnel to server




### disconnect
disconnect - close your data tunnel to server




### dispatchInitClass
dispatchInitClass - add user info in the class on server




### dispatchLeaveClass
dispatchLeaveClass - remove user info in the class on server




### dispatchStartScreenShare
dispatchStartScreenShare - update sharing status in the class on server




### dispatchStopScreenShare
dispatchStopScreenShare - remove sharing status in the class on server




### dispatchBroadcastMessage
dispatchBroadcastMessage - broadcast message in the class on server




### fire
fire - emit events on client according to status change on server

<code>connected</code>  
<code>disconnected</code>  
<code>user-info-updated - this.emit(&#x27;user-info-updated&#x27;, {uid,event: info})</code>  
<code>user-info-removed - this.emit(&#x27;user-info-removed&#x27;,event: {uid})</code>  
<code>error - this.emit(&#x27;error&#x27;,event: error)</code>  
<code>message-received - this.emit(&#x27;message-received&#x27;, {id,event: detail})</code>  
<code>screen-share-started - this.emit(&#x27;screen-share-started&#x27;, {sharerId,event: shareId})</code>  
<code>screen-share-stopped - this.emit(&#x27;screen-share-stopped&#x27;)</code>

| Param | Type | Description |
| --- | --- | --- |
| eventType | <code>string</code> | event type/name, for example, user-added |
| eventPayload | <code>any</code> | event payload, params client will get |



### log
log with prefix: `[Data Provider:]`

