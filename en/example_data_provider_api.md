  - [SERVER_URLS](#server_urls)
  - [new ExampleDataProvider()](#newexampledataprovider)
  - [ExampleDataProvider.connect()](#exampledataproviderconnectappidstringchannelstringserverurlsarraystring)
  - [ExampleDataProvider.disconnect()](#exampledataproviderdisconnect)
  - [ExampleDataProvider.log()](#exampledataproviderlogargs)
  - [ExampleDataProvider.dispatch()](#exampledataproviderdispatchactionstringpayload)

## SERVER_URLS

  room control service urls

## new ExampleDataProvider()

  By default, we use gun (a real-time database) for data exchange
  and EventEmitter for handling events to implement data provider

## ExampleDataProvider.connect(appId:string, channel:string, serverUrls:Array.<string>)

  connect to gun service and register events for data tunnel
  also do validation and login

## ExampleDataProvider.disconnect()

  close data tunnel and remove listeners for server

## ExampleDataProvider.log(args:)

  log with prefix: `[Data Provider:]`

## ExampleDataProvider.dispatch(action:string, payload:)

  dispatch action from client to server and return a promise
