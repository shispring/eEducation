# Agora e-Education Demo with Electron

Agora e-Edu 2.0 releases! Go to [Doc Center](https://agoraio.github.io/ARD-eEducation-with-Electron/#/) for more detail.

## Background

- Open source e-Edu sample code
- Cross-platform client by [Electron](https://electronjs.org) (Windows & Mac)
- for 1-N small classes (1 teacher and at most 16 students)
- Easy to build and extend

## Quick Start

You can [download](https://github.com/AgoraIO/ARD-eEducation-with-Electron/releases) installation package(both mac and windows) to have a try.

## Development

First, create a developer account at [Agora.io](https://dashboard.agora.io/signin/), and obtain an App ID.
Update 'agora.config.js' under './app/'.  


## Feature 

- Private class which can contain 1 teacher and 16 students at most.
- No limitation for audiences!
- Device test before joining class.
- Provide channel messages and RTC.
- Screen Sharing.
- Recording (need server to integrate [Agora Recording SDK](https://docs.agora.io/cn/2.1.1/addons/Recording/Quickstart%20Guides/recording_c++?platform=C%2B%2B))

## Structure

- client  
  Client-side demo by React and Electron.
- room_control  
  Provide service for data exchange with `Data Provider`(Go to [Doc Center](https://agoraio.github.io/ARD-eEducation-with-Electron/#/) for detail) to control room status.
- recording  
  Agora Recording Service on Linux Server.

Room control and recording service are for reference only, you can integrate these services according to your own situation.
  
## Contact Us
- Full API document is under constructing
- You can file bugs about this demo at [issue](https://github.com/AgoraIO/ARD-eEducation-with-Electron/issues)

## License
The MIT License (MIT).

