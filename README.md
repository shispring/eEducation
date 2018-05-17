# Agora e-Education Demo with Electron

## Background

- Open source e-Edu sample code
- Cross-platform client by [Electron](https://electronjs.org) (Windows & Mac)
- for 1-N small classes (1 teacher and at most 16 students)
- Easy to build and extend

## Quick Start
- You can [download](https://github.com/AgoraIO/ARD-eEducation-with-Electron/releases) installation package(both mac and windows) to have a try.

## Feature 

- Two Roles and at most 17 people online at the same time
- Device and network tests before joining class
- Provide channel messages and RTC
- Screen Sharing
- Recording (need server to integrate [Agora Recording SDK](https://docs.agora.io/cn/2.1.1/addons/Recording/Quickstart%20Guides/recording_c++?platform=C%2B%2B))

## Structure
- Client  
  Client-side demo by React and Electron, dynamic import AgoraSDK for different platform.
- Server  
  Provide RESTful API such as start/stop/query recording, and socket server for heartbeat connection.
  
  
## Contact Us
- Full API document is under constructing
- You can file bugs about this demo at [issue](https://github.com/AgoraIO/ARD-eEducation-with-Electron/issues)

## License
The MIT License (MIT).

