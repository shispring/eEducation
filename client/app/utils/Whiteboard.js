import { WhiteWebSdk } from 'white-web-sdk';
import axios from 'axios';
import { EventEmitter } from 'events';
import { WHITEBOARD_URL } from '../agora.config';

console.log(`whiteboard server url: ${WHITEBOARD_URL}`);

const Ajax = axios.create({
  baseURL: WHITEBOARD_URL
});

class White extends EventEmitter {
  constructor() {
    super();
    this.sdk = new WhiteWebSdk();
    this.roomInfo = null;
    this.roomToken = null;
    this.room = null;
    this.uuid = '';
  }

  initialize(name, opts) {
    return new Promise((resolve, reject) => {
      const { uuid } = opts;
      if (!uuid) {
        Ajax.post('/v1/room', {
          name,
          limit: opts.limit || 5
        }).then(response => {
          const { data } = response;
          const { code, msg } = data;
          if (code === 200) {
            this.roomInfo = msg.room;
            this.roomToken = msg.roomToken;
            return resolve(msg);
          }
          throw new Error(msg);
        }).catch(e => {
          reject(e);
        });
      } else {
        Ajax.post('/v1/room/join', {
          uuid
        }).then(response => {
          const { data } = response;
          const { code, msg } = data;
          if (code === 200) {
            this.room = msg.room;
            this.roomToken = msg.roomToken;
            return resolve(msg);
          }
          throw new Error(msg);
        }).catch(e => {
          reject(e);
        });
      }
    });
  }

  join(uuid, token) {
    return new Promise((resolve, reject) => {
      this.sdk.joinRoom({
        uuid, roomToken: token
      }, {
        onRoomStateChanged: modifyState => {
          this.emit('roomStateChanged', modifyState);
        }
      }).then(room => {
        this.room = room;
        return resolve();
      }).catch(e => {
        reject(e);
      });
    });
  }

  leave() {
    return new Promise((resolve, reject) => {
      this.room.leaveRoom().then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      })
    })
  }
}

const Whiteboard = new White();

export default Whiteboard;
