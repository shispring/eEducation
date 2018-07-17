/**
 * Barrel is not another sdk, but a flexible, light-weight 
 * encapsulation for Agora Electron sdk for E-edu. 
 * Easier to use and extend since `Serverless` & `NoDB`
 */
import Gun from 'gun/gun';
import AgoraRtcEngine from 'agora-electron-sdk';
import {
  EventEmitter
} from 'events';

const sharingStreamId = 2

export default class BarrelClient extends EventEmitter {
  /**
   * @description constructor for client
   * @param {string} appId App ID get from agora.io
   * @param {array} serverUrl Target servers you use to sync data with
   * @param {object} config some extra config
   */
  constructor(appId, serverUrl = ['http://localhost:8888/gun'], config = {
    defaultProfile: true
  }) {
    super()
    if (!appId || !serverUrl.length) {
      throw new Error('Required App ID and at least one server url!')
    }
    // initialize gun for dataTunnel and rtcEngine for rtcTunnel
    this.gun = new Gun(serverUrl)
    this.rtcEngine = new AgoraRtcEngine()
    this.rtcEngine.initialize(appId)
    // init user map
    this.userList = {}
    // utils 
    this.appId = appId
    this.serverUrl = serverUrl
    this.sharingPrepared = false
    this.uid = undefined
    this.info = undefined
    this.channel = undefined
    // declare data tunnels
    this.ChannelStatus = undefined
    this.Users = undefined
    this.Messages = undefined
    // init profile
    if(config.defaultProfile) {
      this.initProfile()
    }
  }

  /**
   * @description Encapsulation regular profile you need to set
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
    rtcEngine.enableDualStreamMode(true);
    rtcEngine.enableVideo();
    rtcEngine.enableLocalVideo(true);
    rtcEngine.setVideoProfile(videoProfile, swapWidthAndHeight);
  }

  /**
   * @description login and open data tunnel with validation
   * @param {object} info in temp role and username
   * @param {string} channel channel name
   * @param {function} validation custom validation, will use default validation if not set
   */
  login(info = {
    username,
    role
  }, channel, validation) {
    // init local user info
    this.uid = Number(String(new Date().getTime()).slice(7))
    this.info = info
    this.channel = channel
    // init data channel
    this.ChannelStatus = this.gun.get(this.appId + '/' + channel + '/status')
    this.Users = this.gun.get(this.appId + '/' + channel + '/users')
    this.Messages = this.gun.get(this.appId + '/' + channel + '/messages')
    // do validate
    if (validation) {
      return validation(this.uid, info, this.Users, this.ChannelStatus)
    } else {
      return this.defaultValidation(this.uid, info, this.Users, this.ChannelStatus)
    }
  }

  /**
   * @description default validation for login
   * @param {number} uid 
   * @param {object} info 
   * @param {DataTunnel} Users 
   * @param {DataTunnel} ChannelStatus 
   */
  defaultValidation(uid, info, Users, ChannelStatus) {
    let distincted = true
    let hasTeacher = false
    ChannelStatus.once((v, k) => {
      if (k === 'teacher') {
        hasTeacher = (v !== null)
      }
    })
    Users.once((v, k) => {
      if (k === String(uid)) {
        if (info.username === v.username && info.role === v.role) {
          distincted = false
        }
      }
    })
    if (info.role === 'teacher') {
      if(hasTeacher) {
        return {result: false, message: 'Teacher already exist in that class'}
      }
      if(!distincted) {
        return {result: false, message: 'Username exists'}
      }
      return {result: true, message:''}
    } else if (info.role === 'student') {
      // if(!hasTeacher) {
      //   return {result: false, message: 'Teacher for that class not ready yet'}
      // }
      if(!distincted) {
        return {result: false, message: 'Username exists'}
      }
      return {result: true, message:''}
    } else {
      throw new Error('Unknow role for user: ' + uid)
    }
  }

  /**
   * Channel Related
   */

  handleUserAdded = (uid, info, stream) => {
    if (info.role === 'teacher') {
      this.emit('teacher-added', uid, info, stream)
    } else if (info.role === 'student') {
      this.emit('student-added', uid, info, stream)
    } else {
      throw new Error('Unknow role for user: ' + uid)
    }
  }

  /**
   * @description add user to userlist
   * @param {number} uid 
   * @param {object} info 
   * @param {object} stream 
   */
  addUser = (uid, info, stream) => {
    // if not exist, create one
    if (!this.userList.hasOwnProperty(uid)) {
      this.userList[uid] = this.newUser(uid, this.handleUserAdded)
    }
    // if exist
    let target = this.userList[uid]
    if (info) {
      target.info = info
    }
    if (stream) {
      target.stream = stream
    }
  }

  /**
   * @description new a object only when both info and stream are set will callback be emit
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
   * @description remove user from userList and trigger related event
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
      } else {
        throw new Error('Unknow role for user: ' + uid)
      }
    }
  }

  initDataTunnel() {
    this.Users.map().on((info, uid) => {
      console.info('User', uid, info)
      if(info === null) {
        // remove user
        this.removeUser(uid)
      } else {
        this.addUser(uid, info, undefined)
      }
    })
    this.ChannelStatus.map().on((v, k) => {
      console.info('ChannelStatus:', k, v)
      if(k === 'sharing') {
        if(v !== null) {
          this.rtcEngine.setupViewContentMode('videosource', 1);
          this.rtcEngine.setupViewContentMode(String(sharingStreamId), 1);
          if(v.sharer !== this.uid) {
            this.emit('sharing-start', sharingStreamId, v.sharer)
          }
        } else {
          this.emit('sharing-ended', sharingStreamId)
        }
      }
    })
    this.Messages.map().on((v, k) => {
      console.info('Messages', k, v)
      if(v === null) {
        // In temp will never happen
      } else {
        this.emit('channel-message', v.message, v.uid, v.info, v.ts)
      }
    })
  }

  closeDataTunnel() {
    this.Users.off()
    this.ChannelStatus.off()
    this.Messages.off()
  }

  subRtcEvents() {
    this.rtcEngine.on('useroffline', (uid, reason) => {
      this.Users.get(uid).put(null)
    });
    this.rtcEngine.on('userjoined', (uid, elpased) => {
      this.addUser(uid, undefined, uid)
      if (uid === this.ChannelStatus.get('teacher')) {
        this.rtcEngine.setRemoteVideoStreamType(uid, 0);
      } else {
        this.rtcEngine.setRemoteVideoStreamType(uid, 1);
      }
    });
    this.rtcEngine.on('rejoinedchannel', (channel, uid, elpased) => {
      this.Users.get(this.uid).put({
        ...this.info
      })
      if(this.info.role === 'teacher') {
        this.ChannelStatus.get('teacher').put(this.uid)
      }
    })
  }

  /**
   * 
   * @param {string} channel Channel Name
   * @param {number} uid user id
   * @param {string} token auth token
   * @param {number} timeout duration before timeout
   * @param {object} extraInfo any extra info
   */
  join(token = null, info = '', timeout = 10000) {
    if (!this.channel || !this.uid) {
      throw new Error('params required!')
    }
    return new Promise((resolve, reject) => {
      let timer = setTimeout(() => {
        reject(new Error('Timeout'))
      }, timeout)
      try {
        this.rtcEngine.joinChannel(token, this.channel, info, this.uid);
      } catch (err) {
        clearTimeout(timer)
        reject(err)
      }
      this.rtcEngine.on('joinedchannel', (channel, uid, elpased) => {
        this.subRtcEvents()
        clearTimeout(timer)
        this.initDataTunnel()
        this.Users.get(this.uid).put({
          ...this.info
        })
        this.addUser(this.uid, undefined, uid)
        if(this.info.role === 'teacher') {
          this.ChannelStatus.get('teacher').put(this.uid)
        }
        resolve(channel, uid, elpased);
      });
    });
  }

  /**
   * 
   * @param {number} timeout duration before timeout
   */
  leave(timeout = 10000) {
    return new Promise((resolve, reject) => {
      if(this.userList.length === 1) {
        this.gun.get('channels').get(this.channel).put(null)
      }
      this.closeDataTunnel()
      this.Users.get(this.uid).put(null);
      if(this.info.role === 'teacher') {
        this.ChannelStatus.get('teacher').put(null)
      }
      let timer = setTimeout(() => {
        reject(new Error('Timeout'))
      }, timeout)
      try {
        this.rtcEngine.leaveChannel();
      } catch (err) {
        clearTimeout(timer);
        reject(err);
      }
      this.rtcEngine.on('leavechannel', (...args) => {
        clearTimeout(timer);
        this.rtcEngine.removeAllListeners();
        resolve(...args);
      });
    });
  }


  /**
   * Sharing Related
   * @method prepareSharing the first time you try to share sth, you need to use preparesharing
   * @method startSharing start sharing
   * @method stopSharing stop sharing
   * @method destructSharing when you will no longer use sharing anymore
   */

  prepareSharing(token = null, info = '', timeout = 10000) {
    return new Promise((resolve, reject) => {
      let timer = setTimeout(() => {
        reject(new Error('Timeout'))
      }, timeout)
      this.rtcEngine.on('videosourcejoinedsuccess', uid => {
        clearTimeout(timer)
        this.sharingPrepared = true
        resolve()
      });
      try {
        this.rtcEngine.videoSourceInitialize(this.appId);
        this.rtcEngine.videoSourceSetChannelProfile(1);
        this.rtcEngine.videoSourceEnableWebSdkInteroperability(true)
        this.rtcEngine.videoSourceSetVideoProfile(50, false);
        // to adjust render dimension to optimize performance
        this.rtcEngine.setVideoRenderDimension(3, sharingStreamId, 1600, 900);
        this.rtcEngine.videoSourceJoin(token, this.channel, info, sharingStreamId);
      } catch(err) {
        clearTimeout(timer)
        reject(err)
      }
    })
  }

  startSharing = () => {
    if(!this.sharingPrepared) {
      console.error('Sharing not prepared yet.')
      return false
    }
    this.ChannelStatus.get('sharing').put({
      sharer: this.uid
    }, (ack) => {
      if(ack.err){
        throw new Error(ack.err)
      }
      this.rtcEngine.startScreenCapture2(0, 15, {
        top: 0, left: 0, right: 0, bottom: 0
      }, 0);
      this.rtcEngine.startScreenCapturePreview();
      this.emit('sharing-start', sharingStreamId, this.uid)
    })
  }

  stopSharing() {
    this.ChannelStatus.get('sharing').put(null)
    this.rtcEngine.stopScreenCapture2();
    this.rtcEngine.stopScreenCapturePreview();
  }

  destructSharing() {
    this.rtcEngine.videoSourceLeave();
    this.rtcEngine.videoSourceRelease();
  }


  /**
   * message related
   */

  broadcastMessage(message = '') {
    if(!message) {
      return
    }
    let ts = Number(String(new Date().getTime()).slice(7))
    this.Messages.get(ts).put({
      message,
      ts,
      uid: this.uid,
      info: this.info
    })
  }
}