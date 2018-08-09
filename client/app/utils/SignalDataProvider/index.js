import BaseDataProvider from '../BaseDataProvider';
import Signal from './AgoraSig';

/**
 * By default, we use gun (a real-time database) for data exchange
 * and EventEmitter for handling events to implement data provider
 * @class SignalDataProvider
 * @implements {BaseDataProvider}
 */
export default class SignalDataProvider extends BaseDataProvider {
  /**
   * connect to gun service and register events for data tunnel
   * also do validation and login
   * @param {string} appId - agora app id
   * @param {string} channel - channel id
   */
  connect(appId, channel) {
    // default implement for connect
    return new Promise((resolve, reject) => {
      resolve();
    });
  }

  /**
   * close data tunnel and remove listeners for server
   */
  disconnect() {
    // close all data tunnel
  }


  /**
   * log with prefix: `[Data Provider:]`
   * @param {*} args 
   */
  log(...args) {
    console.log('[Data Provider:]', ...args);
  }

  /**
   * dispatch action from client to server and return a promise
   * @param {string} action action name
   * @param {*} payload payload for the action
   * @returns {Promise<T>}
   */
  dispatch(action, payload) {
    if (action === 'initClass') {
      return this.dispatchInitClass(payload);
    } else if (action === 'leaveClass') {
      return this.dispatchLeaveClass(payload);
    } else if (action === 'startScreenShare') {
      return this.dispatchStartScreenShare(payload);
    } else if (action === 'stopScreenShare') {
      return this.dispatchStopScreenShare(payload);
    } else if (action === 'broadcastMessage') {
      return this.dispatchBroadcastMessage(payload);
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
  dispatchInitClass({ appId, channel, user }) {
    return new Promise((resolve, reject) => {
      const signal = new Signal(appId);
      const { uid } = user;
      const session = signal.login(`${uid}`, '_no_need_token');
      session.onLoginSuccess = () => {
        this.setUserAttributes(user).then(() => {
          const chan = session.channelJoin(channel);
          chan.onChannelJoined = () => {
            this.emit('user-info-updated', { uid, info: user });
            resolve();
          };
          chan.onChannelJoinFailed = () => {
            reject();
          };
          this.chan = chan;
          this.registerServerEvent();
          return true;
        }).catch(e => {
          reject(e);
        });
      };
      session.onLoginFailed = () => {
        reject();
      };

      this.session = session;
    });
  }

  /**
   * leave the class and remove info
   * @private
   * @param {Object} payload.user 
   */
  dispatchLeaveClass({ user }) {
    this.emit('user-info-removed', { uid: user.uid });
  }

  /**
   * start screen share and notify the class
   * @private
   * @param {number} payload.shareId - stream id for sharing stream
   * @param {number} payload.sharerId - the user who do the sharing
   * @returns {Promise<T>} 
   */
  dispatchStartScreenShare({ shareId, sharerId }) {
    return new Promise((resolve, reject) => {
      const { chan } = this;
      this.setUserAttribute('shareId', shareId).then(() => {
        const content = JSON.stringify({ shareId, sharerId });
        const message = JSON.stringify({ type: 'share', content });
        chan.messageChannelSend(message);
        return resolve();
      }).catch(e => {
        reject(e);
      });
    });
  }

  /**
   * stop screen share and notify the class
   * @private
   * @param {number} payload.shareId - stream id for sharing stream
   * @param {number} payload.sharerId - the user who do the sharing
   * @returns {Promise<T>} 
   */
  dispatchStopScreenShare({ shareId, sharerId }) {
    return new Promise((resolve, reject) => {
      const { chan } = this;
      this.setUserAttribute('shareId', null).then(() => {
        const message = JSON.stringify({ type: 'unshare' });
        chan.messageChannelSend(message);
        return resolve();
      }).catch(e => {
        reject(e);
      });
    });
  }

  /**
   * broadcast message in the class
   * @private
   * @param {string} payload.message 
   * @param {Object} payload.user 
   * @param {string} payload.type - whether a 'str' or a 'json'
   * @returns {Promise<T>} 
   */
  dispatchBroadcastMessage({ message, user, type }) {
    let content = message;
    const { chan } = this;
    if (type === 'json') {
      content = JSON.stringify(message);
    }
    content = JSON.stringify(JSON.parse({ type: 'generic', content }));
    chan.messageChannelSend(content);
    return Promise.resolve();
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
  registerServerEvent() {
    // sub user status changes
    const { chan } = this;
    chan.onChannelUserList = users => {
      const accounts = users.map(user => user[0]);
      this.getUsersAttributes(accounts).then(attributes => {
        attributes.forEach(attr => {
          const { json } = attr;
          const parsedAttr = JSON.parse(json);
          this.emit('user-info-updated', { uid: parsedAttr.uid, info: parsedAttr });
          if (parsedAttr.shareId) {
            this.emit('screen-share-started', { shareId: parsedAttr.shareId, sharerId: parsedAttr.uid });
          }
        });
        return true;
      }).catch(e => {
        this.log(`failed to get user attributes: ${e}`);
      });
    };

    chan.onChannelUserJoined = account => {
      this.getUserAttributes(account).then(attrs => {
        const { json } = attrs;
        const parsedAttr = JSON.parse(json);
        this.emit('user-info-updated', { uid: parsedAttr.uid, info: parsedAttr });
        return true;
      }).catch(e => {
        this.log(`failed to get user attributes: ${e}`);
      });
    };

    chan.onChannelUserLeaved = account => {
      this.getUserAttributes(account).then(attrs => {
        const { json } = attrs;
        const parsedAttr = JSON.parse(json);
        if (parsedAttr.shareId) {
          this.emit('screen-share-stopped');
        }
        return true;
      }).catch(e => {
        this.log(`failed to get user attributes: ${e}`);
      });
    };

    chan.onMessageChannelReceive = (account, suid, message) => {
      const { content } = JSON.parse(message);
      let { type } = JSON.parse(message);

      if (type === 'generic') {
        this.getUserAttributes(account).then(attrs => {
          const { json } = attrs;
          const ts = new Date().getTime();
          type = 'str';
          const parsedAttr = JSON.parse(json);
          const { uid, username, role } = parsedAttr;
          const detail = {
            message: content, ts, uid, username, role, type
          };
          this.emit('message-received', { detail });
          return true;
        }).catch(e => {
          this.log(`failed to get user attributes: ${e}`);
        });
      } else if (type === 'share') {
        const { shareId, sharerId } = JSON.parse(content);
        this.emit('screen-share-started', { shareId, sharerId });
      } else if (type === 'unshare') {
        this.emit('screen-share-stopped');
      }
    };
  }


  setUserAttribute(name, value) {
    return new Promise((resolve, reject) => {
      const { session } = this;
      session.invoke('io.agora.signal.user_set_attr', { name, value }, (err) => {
        if (err) {
          reject();
        } else {
          resolve();
        }
      });
    });
  }

  setUserAttributes(dics) {
    const keys = Object.keys(dics);
    const promises = [];
    this.log(`setting user attributes: ${JSON.stringify(dics)}`);
    keys.forEach(key => {
      promises.push(this.setUserAttribute(key, dics[key]));
    });

    return Promise.all(promises);
  }

  getUserAttributes(account) {
    return new Promise((resolve, reject) => {
      const { session } = this;
      session.invoke('io.agora.signal.user_get_attr_all', { account }, (err, attrs) => {
        if (err) {
          reject();
        } else {
          resolve(attrs);
        }
      });
    });
  }

  getUsersAttributes(users) {
    const promises = [];
    users.forEach(user => {
      promises.push(this.getUserAttributes(user));
    });

    return Promise.all(promises);
  }
}
