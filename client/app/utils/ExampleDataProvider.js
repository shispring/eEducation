/**
 * By default, we use gun (a real-time database)
 * to implement data provider.
 * @module ExampleDataProvider
 */
import Gun from "gun/gun";
import BaseDataProvider from "./BaseDataProvider";

const SERVER_URLS = ["http://123.155.153.85:8888/gun"];

export default class BarrelDataProvider extends BaseDataProvider {
  /**
   * connect to gun service and register events for data tunnel
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
          this.fire('connected');
          // resolve
          resolve();
        })
        .catch(err => {
          // do nothing
          this.fire('error', err);
          // reject
          reject(err);
        });
    })

  }

  /**
   * remove listeners for server
   */
  disconnect () {
    // close all data tunnel
    this.userTunnel.off();
    this.messageTunnel.off();
    this.channelStatusTunnel.off();
  }

  /**
   * connect and get class info, do validation
   * @param {string} appId - agora app id 
   * @param {string} channel - channel id 
   * @param {Object} user - user object 
   * @param {number} user.uid - uid for user
   * @param {string} user.username - username for user
   * @param {Role} user.role - teacher | student | audience
   * @returns {Promise<T>} 
   */
  dispatchInitClass(appId, channel, user = {uid, username, role}) {
    return new Promise((resolve, reject) => {
      this.connect(appId, channel).then(() => {
        // init promises
        let promisesValidation = [];
        let promisesRegister = [];
        // do validation
        // if teacher exists
        promisesValidation.push(new Promise((resolve, reject) => {
          let hasTeacher = false
          this.channelStatusTunnel.get('teacher').once(data => {
            if(data !== null) {
              hasTeacher = true
            }
          });
          if(hasTeacher && user.role === 'teacher') {
            reject(new Error('Teacher exists!'))
          } else {
            resolve()
          }
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
   * @param {Object} user 
   * @param {number} user.uid - uid for user
   * @param {string} user.username - username for user
   * @param {Role} user.role - teacher | student | audience
   */
  dispatchLeaveClass(user = {uid, username, role}) {
    if(user.role === 'teacher') {
      this.channelStatusTunnel.get('teacher').put(null);
    }
    this.userTunnel.get(user.uid).put(null);
    this.disconnect()
  }

  /**
   * start screen share and notify the class
   * @param {number} shareId - stream id for sharing stream
   * @param {number} sharerId - the user who do the sharing
   * @returns {Promise<T>} 
   */
  dispatchStartScreenShare(shareId, sharerId) {
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
   * @param {number} shareId - stream id for sharing stream
   * @param {number} sharerId - the user who do the sharing
   * @returns {Promise<T>} 
   */
  dispatchStopScreenShare(shareId, sharerId) {
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
   * @param {string} message 
   * @param {Object} user 
   * @param {number} user.uid - uid for user
   * @param {string} user.username - username for user
   * @param {Role} user.role - teacher | student | audience
   * @param {'str'||'json'} type - whether a str or a json
   * @returns {Promise<T>} 
   */
  dispatchBroadcastMessage(message, user = {uid, username, role}, type = 'str') {
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
        this.fire('user-info-removed', {uid: Number(uid)})
      } else {
        this.fire('user-info-updated', {uid: Number(uid), info})
      }
    })
    // sub channel status changes
    this.channelStatusTunnel.map().on((value, key) => {
      this.log('channel status', key, value)
      if(key === 'sharing') {
        if(value === null) {
          this.fire('screen-share-stopped')
        } else {
          this.fire('screen-share-started', {
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
        this.fire('message-received', {id, detail})
      }
    }, {change: true})
  }
}
