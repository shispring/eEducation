import Gun from "gun/gun";
import EventEmitter from 'events';

/**
 * room control service urls
 * @constant SERVER_URLS
 */
const SERVER_URLS = ["http://123.155.153.85:8888/gun"];

/**
 * By default, we use gun (a real-time database) for data exchange
 * and EventEmitter for handling events to implement data provider
 * @class ExampleDataProvider
 * @implements {BaseDataProvider}
 */
export default class ExampleDataProvider extends EventEmitter {
  /**
   * connect to gun service and register events for data tunnel
   * also do validation and login
   * @param {string} appId - agora app id
   * @param {string} channel - channel id 
   * @param {string[]} serverUrls - gun service urls 
   */
  connect (appId, channel, serverUrls = SERVER_URLS) {
    // default implement for connect
    return new Promise((resolve, reject) => {
      this.gun = new Gun(serverUrls);
      const prefix = `${appId}/${channel}`;
      const userPromise = new Promise((resolve, reject) => {
        this.userTunnel = this.gun.get(prefix + "/users", ack => {
          if (ack.err) {
            reject(ack.err);
          } else {
            resolve();
          }
        });
      });
      const channelStatusPromise = new Promise((resolve, reject) => {
        this.channelStatusTunnel = this.gun.get(
          prefix + "/channelStatus",
          ack => {
            if (ack.err) {
              reject(ack.err);
            } else {
              resolve();
            }
          }
        );
      });
      const messagePromise = new Promise((resolve, reject) => {
        this.messageTunnel = this.gun.get(prefix + "/messages", ack => {
          if (ack.err) {
            reject(ack.err);
          } else {
            resolve();
          }
        });
      });
  
      Promise.all([userPromise, channelStatusPromise, messagePromise])
        .then(() => {
          // register event
          this.registerServerEvent();
          // connected
          this.emit('connected');
          // resolve
          resolve();
        })
        .catch(err => {
          // do nothing
          this.emit('error', err);
          // reject
          reject(err);
        });
    })

  }

  /**
   * close data tunnel and remove listeners for server
   */
  disconnect () {
    // close all data tunnel
    this.userTunnel.off();
    this.messageTunnel.off();
    this.channelStatusTunnel.off();
    this.removeAllListeners();
  }


  /**
   * log with prefix: `[Data Provider:]`
   * @param {*} args 
   */
  log (...args) {
    console.log('[Data Provider:]', ...args)
  }

  /**
   * dispatch action from client to server and return a promise
   * @param {string} action action name
   * @param {*} payload payload for the action
   * @returns {Promise<T>}
   */
  dispatch (action, payload) {
    if(action === 'initClass') {
      return this.dispatchInitClass(payload)
    } else if (action === 'leaveClass') {
      return this.dispatchLeaveClass(payload)
    } else if (action === 'startScreenShare') {
      return this.dispatchStartScreenShare(payload)
    } else if (action === 'stopScreenShare') {
      return this.dispatchStopScreenShare(payload)
    } else if (action === 'broadcastMessage') {
      return this.dispatchBroadcastMessage(payload)
    } else {
      // your custom events
    }
  }

  /**
   * connect and get class info, do validation
   * @private
   * @param {string} payload.appId - agora app id 
   * @param {string} payload.channel - channel id 
   * @param {Object} payload.user - user object 
   * @returns {Promise<T>} 
   */
  dispatchInitClass({appId, channel, user}) {
    return new Promise((resolve, reject) => {
      this.connect(appId, channel).then(() => {
        // init promises
        let promisesValidation = [];
        let promisesRegister = [];
        // do validation
        // if teacher exists
        promisesValidation.push(new Promise((resolve, reject) => {
          this.channelStatusTunnel.get('teacher').once(data => {
            if(data && user.role === 'teacher') {
              reject(new Error('Teacher exists!'));
            } else {
              resolve();
            }
          });
        }));
        // if username unique
        promisesValidation.push(new Promise((resolve, reject) => {
          let unique = true
          this.userTunnel.once((info, uid) => {
            if(uid === user.uid) {
              if(info.role === user.role) {
                unique = false
              }
            }
          });
          if(!unique) {
            reject(new Error('Username exists!'))
          } else {
            resolve()
          }
        }));
        // promise for add user
        promisesRegister.push(new Promise((resolve, reject) => {
          this.userTunnel.get(user.uid).put({
            username: user.username,
            role: user.role
          }, ack => {
            if(ack.err) {
              reject(ack.err);
            } else {
              resolve();
            }
          })
        }));
        // promise for add teacher
        if (user.role === 'teacher') {
          promisesRegister.push(new Promise((resolve, reject) => {
            this.channelStatusTunnel.get('teacher').put({
              username: user.username,
              uid: user.uid
            }, ack => {
              if(ack.err) {
                reject(ack.err);
              } else {
                resolve();
              }
            })
          }));
        }
        // do promises
        Promise.all(promisesValidation).then(() => {
          Promise.all(promisesRegister).then(() => {
            resolve();
          }).catch(err => {
            reject(err);
          });
        }).catch(err => {
          reject(err)
        });
      }).catch(err => {
        reject(err);
      })
    })
  }

  /**
   * leave the class and remove info
   * @private
   * @param {Object} payload.user 
   */
  dispatchLeaveClass({user}) {
    if(user) {
      if(user.role === 'teacher') {
        this.channelStatusTunnel.get('teacher').put(null);
      }
      this.userTunnel.get(user.uid).put(null);
    }
    this.disconnect()
  }

  /**
   * start screen share and notify the class
   * @private
   * @param {number} payload.shareId - stream id for sharing stream
   * @param {number} payload.sharerId - the user who do the sharing
   * @returns {Promise<T>} 
   */
  dispatchStartScreenShare({shareId, sharerId}) {
    return new Promise((resolve, reject) => {
      this.channelStatusTunnel.get('sharing').put({
        sharerId, shareId
      }, ack => {
        if (ack.err) {
          reject(ack.err);
        } else {
          resolve();
        }
      })
    })
  }

  /**
   * stop screen share and notify the class
   * @private
   * @param {number} payload.shareId - stream id for sharing stream
   * @param {number} payload.sharerId - the user who do the sharing
   * @returns {Promise<T>} 
   */
  dispatchStopScreenShare({shareId, sharerId}) {
    return new Promise((resolve, reject) => {
      this.channelStatusTunnel.get('sharing').put(null, ack => {
        if (ack.err) {
          reject(ack.err);
        } else {
          resolve();
        }
      })
    })
  }

  /**
   * broadcast message in the class
   * @private
   * @param {string} payload.message 
   * @param {Object} payload.user 
   * @param {string} payload.type - whether a 'str' or a 'json'
   * @returns {Promise<T>} 
   */
  dispatchBroadcastMessage({message, user, type}) {
    return new Promise((resolve, reject) => {
      // use ts as uid
      let ts = String(new Date().getTime()).slice(7)
      this.messageTunnel.get(ts).put({
        ts, message, type,
        uid: user.uid,
        username: user.username,
        role: user.role,
      }, ack => {
        if (ack.err) {
          reject(ack.err);
        } else {
          resolve();
        }
      })
    })
  }

  /**
   * add listener for server and fire client events
   * @private
   * @fires user-info-removed {uid}
   * @fires user-info-updated {uid, info}
   * @fires screen-share-stopped null
   * @fires screen-share-started {sharerId, shareId}
   * @fires message-received {id, detail}
   */
  registerServerEvent () {
    // sub user status changes
    this.userTunnel.map().on((info, uid) => {
      this.log('user info', uid, info)
      if(info === null) {
        this.emit('user-info-removed', {uid: Number(uid)})
      } else {
        this.emit('user-info-updated', {uid: Number(uid), info})
      }
    })
    // sub channel status changes
    this.channelStatusTunnel.map().on((value, key) => {
      this.log('channel status', key, value)
      if(key === 'sharing') {
        if(value === null) {
          this.emit('screen-share-stopped')
        } else {
          this.emit('screen-share-started', {
            sharerId: value.sharerId,
            shareId: value.shareId
          })
        }
      }
    })
    // sub message changes
    this.messageTunnel.map().on((detail, id) => {
      this.log('messages', id, detail)
      if(detail === null) {
        // it seem it will never happen
      } else {
        this.emit('message-received', {id, detail})
      }
    }, {change: true})
  }
}
