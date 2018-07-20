import { resolve } from 'dns';

/**
 * DataProvider is for data exchange and you can transform
 * or realize it by yourself. By default, we use gun(a realtime
 * database) to realize it.
 */

const EventEmitter = require('events').EventEmitter;
const Gun = require('gun/gun');
const GUN_SERVICE = ['http://123.155.153.85:8888/gun']

/**
 * @constructs
 * constructor for data provider
 * @event DataProvider#connected
 * @event DataProvider#error
 * @event DataProvider#userInfoRemoved
 * @event DataProvider#userInfoAdded
 * @event DataProvider#messageAdded
 * custom event
 * @event DataProvider#connectChannelSuccess
 * @event DataProvider#connectChannelFailed
 * @event DataProvider#screenShareStart
 * @event DataProvider#screenShareStop
 */
const DataProvider = function() {
  EventEmitter.call(this)
}

DataProvider.prototype = Object.create(EventEmitter.prototype)
DataProvider.prototype.constructor = DataProvider

/**
 * @interface connect you can implement this by your self
 * 
 * usually this method is for connecting server and listen socket event
 * @param {string} agoraAppId - agora app id
 * @param {string} channelId - channel name
 * @param {string[]} serverUrl - servers url
 */
DataProvider.prototype.connect = function(agoraAppId, channelId, serverUrl = GUN_SERVICE) {
  this.gun = new Gun(serverUrl);
  let userPromise = new Promise((resolve, reject) => {
    this.userTunnel = this.gun.get(agoraAppId + '/' + channelId + '/users', ack => {
      if(ack.err){
        reject(ack.err);
      } else {
        resolve();
      }
    });
  });
  let channelStatusPromise = new Promise((resolve, reject) => {
    this.channelStatusTunnel = this.gun.get(agoraAppId + '/' + channelId + '/channelStatus', ack => {
      if(ack.err){
        reject(ack.err);
      } else {
        resolve();
      }
    });
  });
  let messagePromise = new Promise((resolve, reject) => {
    this.messageTunnel = this.gun.get(agoraAppId + '/' + channelId + '/messages', ack => {
      if(ack.err){
        reject(ack.err);
      } else {
        resolve();
      }
    });
  });
  Promise.all([userPromise, channelStatusPromise, messagePromise]).then( _ => {
    // register event
    this.userTunnel.map().on((info, uid) => {
      console.info('[Data Provider]:', '[Users]', uid, info)
      if(info === null) {
        this.emit('userInfoRemoved', {uid})
      } else {
        this.emit('userInfoAdded', {uid, info})
      }
    })
    this.channelStatusTunnel.map().on((value, key) => {
      console.info('[Data Provider]:', '[Channel Status]', key, value)
      if(key === 'sharing') {
        if(value === null) {
          this.emit('screenShareStop')
        } else {
          this.emit('screenShareStart', {
            sharer: value.sharer,
            shareId: value.shareId
          })
        }
      }
    })
    this.messageTunnel.map().on((detail, id) => {
      console.info('[Data Provider]:', '[Messages]', id, detail)
      if(detail === null) {
        // it seem it will never happen
      } else {
        this.emit('messageAdded', {id, detail})
      }
    })
    this.emit('connected')
  }).catch(err => {
    this.emit('error', err)
  })

}

/**
 * @interface disconnect you can implement this by your self
 * 
 * usually this method is for disconnecting server
 */
DataProvider.prototype.disconnect = function() {
  this.userTunnel.off()
  this.messageTunnel.off()
  this.channelStatusTunnel.off()
}

/**
 * @interface dispatch you can implement this by your self
 * 
 * Dispatch action to change data on server
 * @param {Object} action - The action will change data on server because of bussiness logic
 * @param {string} action.type - The type/name of the action
 * @param {Object} action.payload - The payload of the action that need to be submit
 */
DataProvider.prototype.dispatch = function(action) {
  // for example
  if (action.type === 'connect') {
    const {appId, channelId, user} = action.payload
    this.handleConnect(appId, channelId, user)
  } else if (action.type === 'leave') {
    const user = {...action.payload}
    this.handleLeave(user)
  } else if (action.type === 'startScreenShare') {
    const {shareId, sharer} = {...action.payload}
    this.handleStartScreenShare(shareId, sharer)
  } else if (action.type === 'stopScreenShare') {
    this.handleStopScreenShare()
  } else if (action.type === 'broadcastMessage') {
    const {message, user} = {...action.payload}
    this.handleBroadcastMessage(message, user)
  } else {
    // your can define your own action
  }
}

/**
 * @private default join handler
 * @param {string} appId 
 * @param {string} channelId 
 * @param {string[]} serverUrl 
 * @param {Object} user 
 * @param {number} user.uid
 * @param {string} user.username
 * @param {'teacher'|'student'} user.role
 */
DataProvider.prototype.handleConnect = function(appId, channelId, user = {uid, username, role}) {
  // set time out
  setTimeout(() => {
    this.emit('connectChannelFailed', 'Timeout!')
  }, 12000)
  // default validation
  this.once('connected', _ => {
    let distincted = true;
    let hasTeacher = false;
    this.channelStatusTunnel.once((v, k) => {
      if(k === 'teacher') {
        hasTeacher = (v !== null)
      }
    });
    this.userTunnel.once((v, k) => {
      if(k === String(user.uid)) {
        if(user.username === v.username && user.role === v.role) {
          distincted = false
        }
      }
    })
    if (user.role === 'teacher') {
      if(hasTeacher) {
        this.emit('connectChannelFailed', 'Teacher already exist in that class')
      } else if(!distincted) {
        this.emit('connectChannelFailed', 'Username exists')
      } else {
        this.userTunnel.get(user.uid).put({
          username: user.username,
          role: user.role
        }, ack => {
          if(ack.error) {
            this.emit('error', ack.error)
            this.emit('connectChannelFailed', ack.err)
          } else {
            this.emit('connectChannelSuccess')
          }
        })
        this.channelStatusTunnel.get('teacher').put({
          username: user.username,
          uid: user.uid
        })
      }
    } else if (user.role === 'student') {
      if(!hasTeacher) {
        this.emit('connectChannelFailed', 'Teacher for that class not ready yet')
      } else if(!distincted) {
        this.emit('connectChannelFailed', 'Username exists')
      } else {
        this.userTunnel.get(user.uid).put({
          username: user.username,
          role: user.role
        }, ack => {
          if(ack.error) {
            this.emit('error', ack.error)
            this.emit('connectChannelFailed', ack.err)
          } else {
            this.emit('connectChannelSuccess')
          }
        })
      }
    } else {
      this.emit('error', 'unknown role for uid: '+ user.uid )
    }
  })
  // do connect
  this.connect(appId, channelId)
}

/**
 * @private
 * @param {*} uid 
 * @param {*} username 
 * @param {*} role 
 */
DataProvider.prototype.handleLeave = function({uid, username, role}) {
  if(role === 'teacher') {
    this.channelStatusTunnel.get('teacher').put(null)
  }
  this.userTunnel.get(uid).put(null)
  this.disconnect()
}

/**
 * @private
 * @param {*} shareId 
 * @param {*} sharer 
 */
DataProvider.prototype.handleStartScreenShare = function(shareId, sharer) {
  this.channelStatusTunnel.get('sharing').put({
    sharer,
    shareId
  }, ack => {
    if(ack.err) {
      this.emit('error', ack.err)
    }
  })
}

/**
 * @private
 * @param {*} shareId 
 * @param {*} user 
 */
DataProvider.prototype.handleStopScreenShare = function() {
  this.channelStatusTunnel.get('sharing').put(null, ack => {
    if(ack.err) {
      this.emit('error', ack.err)
    }
  })
}

/**
 * @private
 * @param {*} message 
 * @param {*} user 
 */
DataProvider.prototype.handleBroadcastMessage = function(message, user = {
  username, role, uid
}) {
  let ts = String(new Date().getTime()).slice(7)
  this.messageTunnel.get(ts).put({
    message,
    ts,
    uid: user.uid,
    username: user.username,
    role: user.role,
  })
}


// export 
export default DataProvider