import {
  observable,
  action
} from 'mobx';
import io from 'socket.io-client';
import axios from 'axios';
import { message } from 'antd';
import {
  APP_ID,
  SIGNAL_ID,
  SERVER_URL
} from '../agora.config';
import {
  SignalingClient,
  RtcClient
} from '../utils/AgoraSdkWrapper';

const path = require('path');


/**
 * @description client for this demo
 */
class Client {
  constructor(rtcId, signalId) {
    this.$rtc = new RtcClient(rtcId);
    this.$signal = new SignalingClient(signalId);
    // init
    this.platform = this.getPlatform();
    this.appPath = process.env.APP_PATH;
  }

  init() {
    // const rtcEngine = this.$rtc.rtcEngine;
    // We have no good resolution for log path temporarily.
    // for mac
    // rtcEngine.setLogFile("/Library/Caches/log.txt");
    // for win
    // rtcEngine.setLogFile("./log.txt");

    this.$socket = {};
    this.username = '';
    this.role = '';
    this.channel = '';
    this.uid = -1;
    this.sid = -1;
    this.clientId = ''; // clientId: role+username
    // this.userList = observable(new Map()); // userlist from socket server
    this.userInfoMap = observable(new Map()); // user info hash map
    this.isSharingStarted = false;
    this.isLeaving = false;
    // set log
    if (this.platform === 'mac') {
      this.$rtc.rtcEngine.setLogFile('/Library/Caches/log-mac.txt');
    } else if (this.platform === 'win') {
      this.$rtc.rtcEngine.setLogFile('./log-win.txt');
    } else {
      console.error('Platform not supported.');
    }
  }

  // get platform
  getPlatform() {
    const platform = (function () {
      switch (process.platform) {
        case 'win32':
          return 'win';
        default:
        case 'darwin':
          return 'mac';
      }
    }());
    const result = process.env.PLATFORM || platform;
    return result;
  }

  isDev() {
    return process.env.NODE_ENV === 'development';
  }

  // logger for this store
  log(info) {
    console.log(`%c${info}`, 'color: green');
  }

  // equal
  equal(newMap, oldMap) {
    const [newJson, oldJson] = [newMap.toJSON(), oldMap.toJSON()];
    const _equal = (newObj, oldObj) => {
      if (newObj instanceof Object) {
        Object.keys(newObj).map(key => {
          if (newObj.hasOwnProperty(key)) {
            if (!oldObj.hasOwnProperty(key)) {
              return false;
            }
            return _equal(newObj[key], oldObj[key]);
          }
        });
      } else {
        return newObj === oldObj;
      }
    };

    return _equal(newJson, oldJson);
  }

  // parseInfo
  parseInfo(clientId) {
    const info = clientId.split('-');
    return {
      role: info[0],
      username: info[1],
      uid: Number(info[2])
    };
  }

  // observe streams to update layout
  @observable streams = new Map()

  // add userInfo to hashmap
  @action addUserInfo(key, value) {
    this.userInfoMap.set(key, {
      username: value.username,
      uid: value.uid,
      sid: value.sid,
      role: value.role,
    });
    this.log(`Mobx Action: Add UserInfo ${key}`);
  }
  // // remove stream from streams
  // @action removeStream(key) {
  //   this.streams.delete(key);
  //   this.log(`Mobx Action: Remove Stream ${key}`);
  // }

  /**
   *
   * @param {Integer} uid
   * @param {String} channel
   * @param {String} role can only be 'teacher'/'student' now
   */
  login(username = this.username, channel = this.channel, role = this.role) {
    return new Promise((resolve, reject) => {
      // ... validation code
      this.$signal.login(this.clientId).then(sid => {
        this.sid = sid;
        if (role === 'teacher') {
          // clear channel attr first.
          this.$signal.session.invoke('io.agora.signal.channel_clear_attr', channel);
          this.initTeacherEvents();
        } else if (role === 'student') {
          this.initStudentEvents();
        } else {
          // do nothing
        }
        this.$signal.join(channel).then(() => {
          resolve();
        }).catch(err => {
          reject(err);
        });
      }).catch(err => {
        reject(err);
      });
    });
  }

  socketJoin = (username, channel, role, token = '') => {
    // reinit
    this.username = '';
    this.role = '';
    this.channel = '';
    this.uid = -1;
    this.sid = -1;
    this.clientId = ''; // clientId: role+username
    this.userList = []; // userlist from socket server
    //
    const ts = new Date().getTime();
    // generate user id
    this.uid = Number((`${ts}`).slice(7));
    this.username = username;
    this.channel = channel;
    this.role = role;
    this.clientId = `${this.role}-${this.username}-${this.uid}`;
    let roleNo;
    if (role === 'teacher') {
      roleNo = 0;
    } else if (role === 'student') {
      roleNo = 1;
    } else {
      throw TypeError('Invaild role!');
    }
    return new Promise((resolve, reject) => {
      axios.post(`${SERVER_URL}/v1/room/join`, {
        appid: APP_ID,
        channel,
        name: username,
        token,
        role: roleNo
      }).then(res => {
        this.$socket = io(`${SERVER_URL}/?appid=${APP_ID}&channel=${channel}&name=${username}`);
        this.subscribeSocketEvents();
        resolve();
      }).catch(err => {
        reject(err);
      });
    });
  }

  /**
   * @description set Mode, set Audience or not , set Profile,
   * @param {Integer} videoProfile
   * @param {Boolean} isAudience
   */
  initProfile(videoProfile = 43, isAudience = false) {
    const rtcEngine = this.$rtc.rtcEngine;
    const audience = this.role !== 'teacher' && this.role !== 'student';
    rtcEngine.setClientRole(isAudience ? 2 : 1);
    rtcEngine.setAudioProfile(0, 1);
    rtcEngine.setParameters('{"che.audio.live_for_comm":true}');
    rtcEngine.setParameters('{"che.audio.enable.agc":false}');
    rtcEngine.setParameters('{"che.video.moreFecSchemeEnable":true}');
    rtcEngine.setParameters('{"che.video.lowBitRateStreamParameter":{"width":192,"height":108,"frameRate":15,"bitRate":100}}');
    rtcEngine.enableDualStreamMode(true);
    rtcEngine.enableVideo();
    rtcEngine.enableLocalVideo(true);
    rtcEngine.setVideoProfile(videoProfile);
  }

  /**
   * join classroom/channel
   */
  join() {
    return new Promise((resolve, reject) => {
      this.$rtc.join(this.channel, this.uid).then((...args) => {
        resolve(...args);
      }).catch(err => {
        reject(err);
      });
    });
  }

  async leave() {
    this.isLeaving = true;
    this.log('leaving channel...');
    if (this.role === 'teacher') {
      this.$signal.channel.channelClearAttr();
    }
    this.$rtc.rtcEngine.videoSourceRelease();
    this.$rtc.rtcEngine.videoSourceLeave();
    try {
      await this.$signal.leave();
      await this.$signal.logout();
      await this.$rtc.leave();
    } finally {
      this.$socket.close();
      clearInterval(this.socketTimer);
      this.userInfoMap.clear();
      this.streams.clear();
      this.isLeaving = false;
    }
  }

  /**
   * initialize channel events for teacher
   */
  initTeacherEvents() {
    this.$signal.channelEmitter.on('onChannelJoined', () => {
      this.addUserInfo(this.username, {
        uid: this.uid,
        username: this.username,
        role: this.role,
        sid: this.sid
      });
      this.$signal.channel.channelSetAttr('classInfo', JSON.stringify({
        teacher: this.username,
        users: this.userInfoMap.toJSON()
      }));
      this.teacher = this.username;
    });

    this.$signal.channelEmitter.on('onChannelUserJoined', (clientId, sid) => {
      const {
        uid,
        username,
        role
      } = this.parseInfo(clientId);
      if (role !== 'student') {
        return;
      }
      this.addUserInfo(username, {
        username,
        uid,
        role,
        sid
      });
      this.$signal.channel.channelSetAttr('classInfo', JSON.stringify({
        teacher: this.username,
        users: this.userInfoMap.toJSON()
      }));
    });

    this.$signal.channelEmitter.on('onLogout', (ecode) => {
      this.log(`Teacher leaved! ${ecode}`);
      this.$signal.channel.channelClearAttr();
    });

    // this.$signal.channelEmitter.on('onChannelUserLeaved', (clientId, sid) => {
    //   this.removeStream(clientId);
    //   this.$signal.channel.channelSetAttr('classInfo', JSON.stringify({
    //     teacher: this.username,
    //     users: this.streams.toJSON()
    //   }));
    // });
  }

  /**
   * init channel events for student
   */
  initStudentEvents() {
    this.$signal.channelEmitter.on('onChannelAttrUpdated', (name, value, type) => {
      if (type === 'clear') {
        // teacher has left
        if (this.isLeaving) {
          return;
        }
        this.leave().then(() => {
          message.info('Teacher has left the classroom!');
          window.location.hash = '';
        });
      }
      if (name === 'classInfo') {
        this.teacher = JSON.parse(value).teacher;
        this.userInfoMap.replace(JSON.parse(value).users);
      }
    });
    this.$signal.channelEmitter.once('onChannelAttrUpdated', (name, value, type) => {
      if (name === 'sharingEvent' && type === 'update') {
        switch (value) {
          case 'StartSharing':
            this.isSharingStarted = true;
            break;
          case 'StopSharing':
            this.isSharingStarted = false;
            break;
          default:
            break;
        }
      }
    });
  }

  isUserListEqual(newUserList) {
    if (this.userList.length !== newUserList.length) {
      return false;
    }
    for (const user of this.userList) {
      if (newUserList.indexOf(user) === -1) {
        return false;
      }
    }
    return true;
  }
  /**
   * subscribe events for socket to maintain classroom
   */
  subscribeSocketEvents() {
    this.$socket.on('connect', () => {
      this.log('Socket server connected...');
    });

    this.$socket.on('disconnect', () => {
      this.log('Socket server disconnected...');
      // if disconnect leave to
      if (this.isLeaving) {
        return;
      }
      this.leave().then(() => {
        message.info('Disconnect to socket server!');
        window.location.hash = '';
      });
    });

    this.socketTimer = setInterval(() => {
      this.$socket.emit('agora-ping');
    }, 3000);

    this.$socket.on('agora-pong', ({
      users
    }) => {
      this.log(`User List gotten from socket: ${JSON.stringify(users)}`);
      // fiter hashmap with userlist to generate local streams list
      const temp = observable(new Map());

      for (const username of users) {
        const value = this.userInfoMap.get(username);
        if (value) {
          temp.set(username, this.userInfoMap.get(username));
        }
      }

      if (!this.equal(temp, this.streams)) {
        this.streams.replace(temp);
      }
    });
    this.$socket.on('owner-disconnect', () => {
      if (this.isLeaving) {
        return;
      }
      this.leave().then(() => {
        message.info('Teacher has left the classroom!');
        window.location.hash = '';
      });
    });
  }
}

export default new Client(APP_ID, SIGNAL_ID);
