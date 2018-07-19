/**
 * Barrel is not another sdk, but a flexible, light-weight 
 * encapsulation for Agora Electron sdk for E-edu. 
 * Easier to use and extend.
 */
import AgoraRtcEngine from 'agora-electron-sdk';
import DefaultDataProvider from './BarrelDataProvider';

const SHARE_ID = 2

/**
 * BarrelClient
 */
export default class BarrelClient {
  /**
   * 
   * @param {string} appId Agora Appid
   * @param {Object} config constructor config
   * @param {boolean} config.defaultProfile whehter to use default profile
   */
  constructor(appId, {
    defaultProfile = true
  }) {
    this.rtcEngine = new AgoraRtcEngine()
    this.rtcEngine.initialize(appId)
    // init user map
    this.userList = {}
    // utils
    this.appId = appId
    // init profile
    if(defaultProfile) {
      this.initProfile()
    }
  }

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
    rtcEngine.enableDualStreamMode(true);
    rtcEngine.enableVideo();
    rtcEngine.enableLocalVideo(true);
    rtcEngine.setVideoProfile(videoProfile, swapWidthAndHeight);
  }

  /**
   * connect to server through data provider
   * 
   * @param {string} config.channel channel
   * @param {Object} config.user username, role, uid
   */
  connect(channel, user = {uid, username, role}) {
    // init local user info
    if(user.uid) {
      user.uid = Number(String(new Date().getTime()).slice(7))
    }
    // local info
    this.channel = channel
    this.user = user
    return new Promise((resolve, reject) => {
      // init data provider
      this.DataProvider = new DefaultDataProvider();
      this.subDataProviderEvents();

      this.DataProvider.dispatch({
        type: 'connect',
        payload: {
          appId: this.appId, 
          channelId: this.channel, 
          user: this.user
        }
      });
      this.once('connect-success', _ => {
        resolve()
      });
      this.once('connect-failed', err => {
        reject(err)
      })
    })


  }

  /**
   * join media channel
   * @param {*} token 
   * @param {*} info 
   */
  join(token = null, info = '') {
    this.subRtcEvents()
    this.rtcEngine.joinChannel(token, this.channel, info, this.user.uid);
  }

  /**
   * leave the media channel
   */
  leave() {
    this.rtcEngine.leaveChannel();
    this.DataProvider.dispatch({
      type: 'leave',
      payload: this.user
    });
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
  startScreenShare = () => {
    if(!this.sharingPrepared) {
      console.error('Sharing not prepared yet.')
      return false
    }
    this.DataProvider.dispatch({
      type: 'startScreenShare',
      payload: {
        shareId: SHARE_ID,
        sharer: this.user
      }
    })

    this.rtcEngine.startScreenCapture2(0, 15, {
      top: 0, left: 0, right: 0, bottom: 0
    }, 0);
    this.rtcEngine.startScreenCapturePreview();
  }

  /**
   * stop screen share
   */
  stopScreenShare() {
    this.DataProvider.dispatch({
      type: 'stopScreenShare',
      payload: {
        shareId: SHARE_ID,
        sharer: this.user
      }
    })
    this.rtcEngine.stopScreenCapture2();
    this.rtcEngine.stopScreenCapturePreview();
  }

  /**
   * broadcast message in channel
   * @param {string} message 
   */
  broadcastMessage(message = '') {
    if(!message) {
      return
    }
    let ts = Number(String(new Date().getTime()).slice(7))
    this.DataProvider.dispatch({
      type: 'broadcastMessage',
      payload: {
        message,
        user: this.user
      }
    })
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
   */
  handleUserAdded = (uid, info, stream) => {
    if (info.role === 'teacher') {
      this.rtcEngine.setRemoteVideoStreamType(uid, 0)
      this.emit('teacher-added', uid, info, stream)
    } else if (info.role === 'student') {
      this.rtcEngine.setRemoteVideoStreamType(uid, 1)
      this.emit('student-added', uid, info, stream)
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
      } else {
        throw new Error('Unknow role for user: ' + uid)
      }
    }
  }


  /**
   * @private
   */
  subRtcEvents() {
    this.rtcEngine.on('useroffline', (uid, reason) => {
      this.dispatch({
        type: 'leave',
        payload: {
          uid
        }
      })
      this.removeUser(uid)
    });
    this.rtcEngine.on('userjoined', (uid, elpased) => {
      this.addUser(uid, null, uid)
    });
    this.rtcEngine.on('joinedchannel', (channel, uid, elpased) => {
      this.addUser(uid, null, uid)
    });
    this.rtcEngine.on('rejoinedchannel', (channel, uid, elpased) => {
      this.addUser(uid, null, uid)
    });
  }

  /**
   * @private
   * sub event of data provider (which you can customize)
   */
  subDataProviderEvents() {
    this.DataProvider.on('error', err => {
      console.error(err)
    });
    this.DataProvider.on('userInfoRemoved', {uid} => {
      this.removeUser(uid)
    });
    this.DataProvider.on('userInfoAdded', {uid, info} => {
      this.addUser(uid, info, null)
    });
    this.DataProvider.on('connectChannelFailed', err => {
      this.emit('connect-failed', err)
    });
    this.DataProvider.on('connectChannelSuccess', _ => {
      this.emit('connect-success')
    });
    this.DataProvider.on('screenShareStart', {sharer, shareId} => {
      this.rtcEngine.setupViewContentMode('videosource', 1);
      this.rtcEngine.setupViewContentMode(String(shareId), 1);
      this.emit('screen-share-start', {sharer, shareId})
    });
    this.DataProvider.on('screenShareStop', _ => {
      this.emit('screen-share-stop')
    })
    this.DataProvider.on('messageAdded', {id, detail = {
      message, ts, uid, username, role
    }} => {
      this.emit('channel-message', {id, detail})
    })
  }

}