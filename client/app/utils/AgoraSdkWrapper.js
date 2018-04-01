/**
 * This file consists of two part. SignalingClient/RtcEngine Wrapper.
 */
// import AgoraRtcEngine from '../AgoraSdk/AgoraSdk.js' // native rtc sdk
// import '../AgoraSdk/AgoraSig-1.2.1.3' // sigal sdk
import EventEmitter from 'events';

/**
 * @description wrapper for Agora Signaling SDK
 * @description transfer some action to Promise and use Event instead of Callback
 */
class SignalingClient {
  constructor(appId, appcertificate) {
    this._appId = appId;
    this._appcert = appcertificate;
    // init signal using signal sdk
    this.signal = Signal(appId) // eslint-disable-line 
    // init event emitter for channel/session/call
  }


  /**
   * 
   */
  init() {
    this.channelEmitter = new EventEmitter();
    this.sessionEmitter = new EventEmitter();
    this.callEmitter = new EventEmitter();
  }


  /**
   * @description login agora signaling server and init 'session'
   * @description use sessionEmitter to resolve session's callback
   * @param {String} account
   * @param {*} token default to be omitted
   * @returns {Promise}
   */
  login(account, token = '_no_need_token') {
    this.init()
    return new Promise((resolve, reject) => {
      this.session = this.signal.login(account, token);
      // proxy callback on session to sessionEmitter
      [
        'onLoginSuccess', 'onError', 'onLoginFailed', 'onLogout',
        'onMessageInstantReceive', 'onInviteReceived'
      ].map(event => this.session[event] = (...args) => {
        this.sessionEmitter.emit(event, ...args);
      });
      // Promise.then
      this.sessionEmitter.on('onLoginSuccess', (...args) => {
        resolve(...args);
      });
      // Promise.catch
      this.sessionEmitter.on('onLoginFailed', (...args) => {
        reject(...args);
      });
    });
  }

  /**
   * @description logout agora signaling server
   * @returns {Promise}
   */
  logout() {
    return new Promise((resolve, reject) => {
      this.session.logout();
      this.sessionEmitter.on('onLogout', (...args) => {
        resolve(...args);
      });
    });
  }

  /**
   * @description join channel
   * @description use channelEmitter to resolve channel's callback
   * @param {String} channel
   * @returns {Promise}
   */
  join(channel) {
    return new Promise((resolve, reject) => {
      if (!this.session) {
        throw {
          Message: '"session" must be initialized before joining channel'
        };
      }
      this.channel = this.session.channelJoin(channel);
      // proxy callback on channel to channelEmitter
      [
        'onChannelJoined',
        'onChannelJoinFailed',
        'onChannelLeaved',
        'onChannelUserJoined',
        'onChannelUserLeaved',
        'onChannelUserList',
        'onChannelAttrUpdated',
        'onMessageChannelReceive'
      ].map(event => this.channel[event] = (...args) => {
        this.channelEmitter.emit(event, ...args);
      });
      // Promise.then
      this.channelEmitter.on('onChannelJoined', (...args) => {
        resolve(...args);
      });
      // Promise.catch
      this.channelEmitter.on('onChannelJoinFailed', (...args) => {
        reject(...args);
      });
    });
  }

  /**
   * @description leave channel
   * @returns {Promise}
   */
  leave() {
    return new Promise((resolve, reject) => {
      this.channel.channelLeave();
      this.channelEmitter.on('onChannelLeaved', (...args) => {
        resolve(...args);
      });
    });
  }

  /**
   * @description send p2p message
   * @description if you want to send an object, use JSON.stringify
   * @param {String} peerAccount
   * @param {String} text
   */
  sendMessage(peerAccount, text) {
    this.session && this.session.messageInstantSend(peerAccount, text);
  }

  /**
   * @description broadcast message in the channel
   * @description if you want to send an object, use JSON.stringify
   * @param { Object, String } text
   */
  broadcastMessage(content) {
    this.channel && this.channel.messageChannelSend(JSON.stringify(content));
  }
}

/**
 * @description wrapper for Agora RTC SDK, for multi-speaker situation
 */
class RtcClient {
  /**
   *
   * @param {String} appId
   * @param {Boolean} debug whether to enable logger
   * @param {*} path where logger should be placed, e.g, '/path/to/logger.log'
   */
  constructor(appId, debug = false, path = '') {
    // init rtcEngine using AgoraRTCSDK
    this.rtcEngine = new AgoraRtcEngine() // eslint-disable-line 
    this.rtcEngine.initialize(appId);
    this.rtcEngine.setChannelProfile(1);
    if (debug) {
      this.rtcEngine.setLogFile(path);
    }
  }

  /**
   *
   * @description join rtc channel
   * @param {String} channel
   * @param {Integer} uid
   * @param {token} token
   * @param {String} info
   * @returns {Promise}
   */
  join(channel, uid, token = null, info = '') {
    return new Promise((resolve, reject) => {
      this.rtcEngine.joinChannel(token, channel, info, uid);
      this.rtcEngine.on('joinedchannel', (...args) => {
        resolve(...args);
      });
    });
  }

  leave() {
    return new Promise((resolve, reject) => {
      this.rtcEngine.leaveChannel();
      this.rtcEngine.on('leavechannel', (...args) => {
        resolve(...args);
      });
    });
  }
}

export { SignalingClient, RtcClient };
