// import { WhiteWebSdk } from 'white-web-sdk';
import { fetch } from 'node-fetch';
import { WHITE_BOARD_URL } from '../agora.config';


class White {
  constructor() {
    this.sdk = new WhiteWebSdk();
  }
  create(name, opts) {
    return new Promise((resolve, reject) => {
      fetch(`${WHITE_BOARD_URL}/v1/room`, {
        method: 'POST',
        body: JSON.stringify({
          name: name,
          limit: opts.limit || 5
        })
      }).then(response => {
        resolve(response);
      }).catch(e => {
        reject(e);
      });
    })
  }
}

const Whiteboard = new White();

export default Whiteboard;
