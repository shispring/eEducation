  - [new BaseDataProvider()](#newbasedataprovider)
  - [BaseDataProvider.connect()](#basedataproviderconnect)
  - [BaseDataProvider.disconnect()](#basedataproviderdisconnect)
  - [BaseDataProvider.dispatch()](#basedataproviderdispatchactionstringpayloadobject)
  - [BaseDataProvider.emit()](#basedataprovideremiteventstring)
  - [BaseDataProvider.on()](#basedataprovideroneventstringcallbackfunctiion)

## new BaseDataProvider()

  DataProvider is for data exchange between client and server.
  You must implement below methods by yourself according to your stack.

## BaseDataProvider.connect()

  connect - open your data tunnel to server

## BaseDataProvider.disconnect()

  disconnect - close your data tunnel to server

## BaseDataProvider.dispatch(action:string, payload:Object)

  dispatch - dispatch action with payload

## BaseDataProvider.emit(event:string)

  emit events according to status change on server

## BaseDataProvider.on(event:string, callback:functiion)

  add listener to events
