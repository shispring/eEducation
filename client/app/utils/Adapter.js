/**
 * Barrel is not another sdk, but a flexible, light-weight 
 * encapsulation for Agora Electron sdk for E-edu. 
 * Easier to use and extend.
 * @module Adapter
 */
import AgoraRtcEngine from 'agora-electron-sdk';
import DataProvider from './ExampleDataProvider';
import EventEmitter from 'events';

/**
 * Default stream id for sharing stream
 */
const SHARE_ID = 2

export default class Adapter extends EventEmitter {
  /**
   * Encapsulation regular profile you need to set
   * @param {boolean} audience if user is an audience
   * @param {number} videoProfile videoProfile 
   * @param {boolean} swapWidthAndHeight if swap width and height
   */
  initProfile(audience = false, videoProfile = 43, swapWidthAndHeight = false) {
    let rtcEngine = this.rtcEngine
    rtcEngine.setChannelProfile(1)
    rtcEngine.setClientRole((audience ? 2 : 1));
    rtcEngine.setAudioProfile(0, 1);
    rtcEngine.enableWebSdkInteroperability(true)
    rtcEngine.setParameters('{"che.audio.live_for_comm":true}');
    rtcEngine.setParameters('{"che.audio.enable.agc":false}');
    rtcEngine.setParameters('{"che.video.moreFecSchemeEnable":true}');
    rtcEngine.setParameters('{"che.video.lowBitRateStreamParameter":{"width":192,"height":108,"frameRate":15,"bitRate":100}}');
    if(!audience) {
      // audience do not publish stream
      rtcEngine.enableDualStreamMode(true);
      rtcEngine.enableVideo();
      rtcEngine.enableLocalVideo(true);
      rtcEngine.setVideoProfile(videoProfile, swapWidthAndHeight);
    }
  }

  /**
   * connect to server and init class through data provider
   * @param {string} config.channel channel
   * @param {Object} config.user username, role, uid
   */
  initClass(appId, channel, user = {uid, username, role}) {

    // this.appId = appId
    // this.channel = channel
    return new Promise((resolve, reject) => {
      // init local user info
      if(!user.uid) {
        // if no uid, use ts instead
        user.uid = Number(String(new Date().getTime()).slice(7));
      }
      this.user = user;
      this.channel = channel;
      this.appId = appId;
      // init rtc engine
      this.rtcEngine = new AgoraRtcEngine()
      this.rtcEngine.initialize(appId)
      // init data provider
      this.dataProvider = new DataProvider();
      // init userlist
      this.userList = {};
      // subscribe data provider event
      this.subDataProviderEvents();
      // dispatch action
      this.dataProvider.dispatchInitClass(appId, channel, user).then(() => {
        resolve({uid: user.uid})
      }).catch(err => {
        reject(err)
      })
    })
  }

  /**
   * actually join media channel to make stream ready
   * @param {string} token - token calculated by app id & app cert
   * @param {string} info - extra info to be broadcast when joinned channel
   */
  enterClass(token = null, info = '') {
    this.subRtcEvents()
    this.rtcEngine.joinChannel(token, this.channel, info, this.user.uid);
  }

  /**
   * leave the media channel
   */
  leaveClass() {
    this.rtcEngine.leaveChannel();
    this.dataProvider.dispatchLeaveClass({
      uid: this.user.uid,
      username: this.user.username,
      role: this.user.role
    });
    // return new Promise((resolve, reject) => {
    //   this.dataProvider.dispatchLeaveClass({
    //     uid: this.user.uid,
    //     username: this.user.username,
    //     role: this.user.role
    //   }).then(() => {
    //     resolve()
    //   }).catch(err => {
    //     reject(err)
    //   });
    // });
  }

  /**
   * prepare screen share: initialize and join
   * @param {string} token 
   * @param {string} info 
   * @param {number} timeout 
   */
  prepareScreenShare(token = null, info = '', timeout = 30000) {
    return new Promise((resolve, reject) => {
      let timer = setTimeout(() => {
        reject(new Error('Timeout'))
      }, timeout)
      this.rtcEngine.once('videosourcejoinedsuccess', uid => {
        clearTimeout(timer)
        this.sharingPrepared = true
        resolve(uid)
      });
      try {
        this.rtcEngine.videoSourceInitialize(this.appId);
        this.rtcEngine.videoSourceSetChannelProfile(1);
        this.rtcEngine.videoSourceEnableWebSdkInteroperability(true)
        this.rtcEngine.videoSourceSetVideoProfile(50, false);
        // to adjust render dimension to optimize performance
        this.rtcEngine.setVideoRenderDimension(3, SHARE_ID, 1600, 900);
        this.rtcEngine.videoSourceJoin(token, this.channel, info, SHARE_ID);
      } catch(err) {
        clearTimeout(timer)
        reject(err)
      }
    })
  }

  /**
   * when you no longer need to do screen sharing, release it
   */
  destructScreenShare() {
    this.rtcEngine.videoSourceLeave();
    this.rtcEngine.videoSourceRelease();
  }

  /**
   * start screen share
   */
  startScreenShare() {
    if(!this.sharingPrepared) {
      console.error('Sharing not prepared yet.')
      return false
    };
    return new Promise((resolve, reject) => {
      this.rtcEngine.startScreenCapture2(0, 15, {
        top: 0, left: 0, right: 0, bottom: 0
      }, 0);
      this.rtcEngine.startScreenCapturePreview();
      this.dataProvider.dispatchStartScreenShare(SHARE_ID, this.user.uid).then(() => {
        resolve(SHARE_ID, this.user.uid)
      }).catch(err => {
        reject(err)
      });
    });
  }

  /**
   * stop screen share
   */
  stopScreenShare() {
    return new Promise((resolve, reject) => {
      this.dataProvider.dispatchStopScreenShare(SHARE_ID, this.user.uid).then(() => {
        this.rtcEngine.stopScreenCapture2();
        this.rtcEngine.stopScreenCapturePreview();
        resolve(SHARE_ID, this.user.uid)
      }).catch(err => {
        reject(err)
      })
    })
  }

  /**
   * uid is undefined => mute self
   * uid is number => mute target uid
   * uid is Array => mute target uids
   * @param {number|number[]} uids 
   */
  muteVideo(uids) {
    if (uids === undefined) {
      return this.rtcEngine.muteLocalVideoStream(true)
    }
    if(typeof(uids) === 'number') {
      if(uids === this.user.uid) {
        return this.rtcEngine.muteLocalVideoStream(true)
      } else {
        return this.rtcEngine.muteRemoteVideoStream(uids, true)
      }
    }
    if(uids instanceof Array) {
      for(let uid of uids) {
        return this.rtcEngine.muteRemoteVideoStream(uid, true)
      }
    }
  }

  /**
   * uid is undefined => unmute self
   * uid is number => unmute target uid
   * uid is Array => unmute target uids
   * @param {number|number[]} uids 
   */
  unmuteVideo(uids) {
    if (uids === undefined) {
      return this.rtcEngine.muteLocalVideoStream(false)
    }
    if(typeof(uids) === 'number') {
      if(uids === this.user.uid) {
        return this.rtcEngine.muteLocalVideoStream(false)
      } else {
        return this.rtcEngine.muteRemoteVideoStream(uids, false)
      }
    }
    if(uids instanceof Array) {
      for(let uid of uids) {
        return this.rtcEngine.muteRemoteVideoStream(uid, false)
      }
    }
  }

  /**
   * uid is undefined => mute self
   * uid is number => mute target uid
   * uid is Array => mute target uids
   * @param {number|number[]} uids 
   */
  muteAudio(uids) {
    if (uids === undefined) {
      return this.rtcEngine.muteLocalAudioStream(true)
    }
    if(typeof(uids) === 'number') {
      if(uids === this.user.uid) {
        return this.rtcEngine.muteLocalAudioStream(true)
      } else {
        return this.rtcEngine.muteRemoteAudioStream(uids, true)
      }
    }
    if(uids instanceof Array) {
      for(let uid of uids) {
        return this.rtcEngine.muteRemoteAudioStream(uid, true)
      }
    }
  }

  /**
   * uid is undefined => unmute self
   * uid is number => unmute target uid
   * uid is Array => unmute target uids
   * @param {number|number[]} uids 
   */
  unmuteAudio(uids) {
    if (uids === undefined) {
      return this.rtcEngine.muteLocalAudioStream(false)
    }
    if(typeof(uids) === 'number') {
      if(uids === this.user.uid) {
        return this.rtcEngine.muteLocalAudioStream(false)
      } else {
        return this.rtcEngine.muteRemoteAudioStream(uids, false)
      }
    }
    if(uids instanceof Array) {
      for(let uid of uids) {
        return this.rtcEngine.muteRemoteAudioStream(uid, false)
      }
    }
  }

  /**
   * broadcast message in channel
   * @param {string} message 
   */
  broadcastMessage(message = '') {
    if(!message) {
      return
    }
    this.dataProvider.dispatchBroadcastMessage(message, this.user)
  }

  /**
   * @private
   * new a object only when both info and stream are set will callback be emit
   * @param {number} uid 
   * @param {function} callback 
   */
  newUser(uid, callback) {
    let target = {
      uid,
      hasInfo: false,
      hasStream: false
    }
    Object.defineProperties(target, {
      info: {
        set: function (val) {
          this.accessInfo = val
          if (val) {
            this.hasInfo = true
            if (val.role === 'audience') {
              callback(this.uid, this.info, this.stream)
            }
            if (this.hasStream) {
              callback(this.uid, this.info, this.stream)
            }
          }
        },
        get: function () {
          return this.accessInfo
        }
      },
      stream: {
        set: function (val) {
          this.accessStream = val
          if (val) {
            this.hasStream = true
            if (this.hasInfo) {
              callback(this.uid, this.info, this.stream)
            }
          }
        },
        get: function () {
          return this.accessStream
        }
      }
    })
    return target
  }

  /**
   * @private
   * callback for user info and stream both ready
   */
  handleUserAdded = (uid, info, stream) => {
    if (info.role === 'teacher') {
      this.rtcEngine.setRemoteVideoStreamType(uid, 0)
      this.emit('teacher-added', uid, info, stream)
    } else if (info.role === 'student') {
      this.rtcEngine.setRemoteVideoStreamType(uid, 1)
      this.emit('student-added', uid, info, stream)
    } else if (info.role === 'audience') {
      this.emit('audience-added', uid, info, stream)
    } else {
      throw new Error('Unknow role for user: ' + uid)
    }
  }

  /**
   * @private
   * add user to userlist
   * @param {number} uid 
   * @param {object} info 
   * @param {object} stream 
   */
  addUser = (uid, info, stream) => {
    // if not exist, create one
    if (!this.userList.hasOwnProperty(uid)) {
      this.userList[uid] = this.newUser(uid, this.handleUserAdded)
    }
    let target = this.userList[uid]
    if (info && !target.info) {
      target.info = info
    }
    if (stream && !target.stream) {
      target.stream = stream
    }
  }

  /**
   * @private
   * remove user from userList and trigger related event
   * @param {number} uid 
   */
  removeUser(uid) {
    if(this.userList.hasOwnProperty(uid)) {
      let role = this.userList[uid].info.role
      delete this.userList[uid]
      if(role === 'teacher') {
        this.emit('teacher-removed', uid)
      } else if(role === 'student') {
        this.emit('student-removed', uid)
      } else if (info.role === 'audience') {
        this.emit('audience-removed', uid)
      } else {
        throw new Error('Unknow role for user: ' + uid)
      }
    }
  }


  /**
   * get user by uid from userlist
   */
  getUser(uid) {
    let temp = this.userList[uid]
    return {
      username: temp.info.username,
      role: temp.info.role,
      uid: uid
    }
  }

  /**
   * subscribe rtc engine events
   */
  subRtcEvents() {
    this.rtcEngine.on('useroffline', (uid, reason) => {
      let user = this.getUser(uid)
      this.dataProvider.dispatchLeaveClass(user)
      this.removeUser(uid)
    });
    this.rtcEngine.on('userjoined', (uid, elpased) => {
      // add stream info for a user
      this.addUser(uid, null, uid)
    });
    this.rtcEngine.on('joinedchannel', (channel, uid, elpased) => {
      this.addUser(uid, null, uid)
    });
    this.rtcEngine.on('rejoinedchannel', (channel, uid, elpased) => {
      this.addUser(uid, null, uid)
    });
    this.rtcEngine.on('error', (err, message) => {
      console.error(err, message)
    });
  }

  /**
   * subscribe event of data provider
   */
  subDataProviderEvents() {
    this.dataProvider.on('user-info-removed', ({uid}) => {
      this.removeUser(Number(uid))
    });
    this.dataProvider.on('user-info-updated', ({uid, info}) => {
      this.addUser(Number(uid), info, null)
    });
    this.dataProvider.on('screen-share-started', ({sharerId, shareId}) => {
      this.emit('screen-share-started', {sharerId, shareId})
    });
    this.dataProvider.on('screen-share-stopped', () => {
      this.emit('screen-share-stopped')
    })
    this.dataProvider.on('message-received', ({id, detail = {
      message, ts, uid, username, role
    }}) => {
      this.emit('message-received', {id, detail})
    })
  }

}