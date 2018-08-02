  - [SHARE_ID](#share_id)
  - [new Adapter()](#newadapter)
  - [Adapter.initProfile()](#adapterinitprofileaudiencebooleanvideoprofilenumberswapwidthandheightboolean)
  - [Adapter.initClass()](#adapterinitclassappidstringchannelstringuserobject)
  - [Adapter.enterClass()](#adapterenterclasstokenstringinfostring)
  - [Adapter.leaveClass()](#adapterleaveclass)
  - [Adapter.prepareScreenShare()](#adapterpreparescreensharetokenstringinfostringtimeoutnumber)
  - [Adapter.destroyScreenShare()](#adapterdestroyscreenshare)
  - [Adapter.startScreenShare()](#adapterstartscreenshare)
  - [Adapter.stopScreenShare()](#adapterstopscreenshare)
  - [Adapter.muteVideo()](#adaptermutevideouidsnumberarraynumber)
  - [Adapter.unmuteVideo()](#adapterunmutevideouidsnumberarraynumber)
  - [Adapter.muteAudio()](#adaptermuteaudiouidsnumberarraynumber)
  - [Adapter.unmuteAudio()](#adapterunmuteaudiouidsnumberarraynumber)
  - [Adapter.broadcastMessage()](#adapterbroadcastmessagemessagestringtypestring)
  - [Adapter.getUser()](#adaptergetuseruidnumber)

## SHARE_ID

  Default screen-share stream's id

## new Adapter()

  A class representing Adapter.
  Adapter is not another sdk, but a flexible, light-weight 
  encapsulation for Agora Electron sdk for E-edu,
  easier to use and extend.

## Adapter.initProfile(audience:boolean, videoProfile:number, swapWidthAndHeight:boolean)

  Encapsulation regular profile you need to set

## Adapter.initClass(appId:string, channel:string, user:Object)

  connect to server and init class through data provider

## Adapter.enterClass(token:string, info:string)

  actually join media channel to make stream ready

## Adapter.leaveClass()

  leave the media channel

## Adapter.prepareScreenShare(token:string, info:string, timeout:number)

  prepare screen share: initialize and join

## Adapter.destroyScreenShare()

  when you no longer need to do screen sharing, release it

## Adapter.startScreenShare()

  start screen share

## Adapter.stopScreenShare()

  stop screen share

## Adapter.muteVideo(uids:number|Array.<number>)

  uid is undefined => mute self
  uid is number => mute target uid
  uid is Array => mute target uids

## Adapter.unmuteVideo(uids:number|Array.<number>)

  uid is undefined => unmute self
  uid is number => unmute target uid
  uid is Array => unmute target uids

## Adapter.muteAudio(uids:number|Array.<number>)

  uid is undefined => mute self
  uid is number => mute target uid
  uid is Array => mute target uids

## Adapter.unmuteAudio(uids:number|Array.<number>)

  uid is undefined => unmute self
  uid is number => unmute target uid
  uid is Array => unmute target uids

## Adapter.broadcastMessage(message:string, type:string)

  broadcast message in channel

## Adapter.getUser(uid:number)

  get user by uid from userlist


