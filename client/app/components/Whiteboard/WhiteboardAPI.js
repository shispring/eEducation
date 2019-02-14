import { WhiteWebSdk } from 'white-web-sdk';
import axios from 'axios';
import { EventEmitter } from 'events';

const WHITEBOARD_URL = 'http://123.155.153.85:3785';

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
    this.readyState = false;
  }

  initialize(name, opts = {
    limit: 100
  }) {
    return new Promise((resolve, reject) => {
      const { uuid } = opts ;
      if (!uuid) {
        Ajax.post('/v1/room', {
          name,
          limit: opts.limit
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
      console.log('join in... [uuid: %s, token: %s]', uuid, token)
      this.sdk.joinRoom({
        uuid, roomToken: token
      }, {
        onRoomStateChanged: modifyState => {
          this.emit('roomStateChanged', modifyState);
        }
      }).then(room => {
        this.room = room;
        this.readyState = true
        this.emit('whiteStateChanged', this);
        return resolve();
      }).catch(e => {
        return reject(e)
      })
    })
  }
}

const Whiteboard = new White();

export default Whiteboard;
