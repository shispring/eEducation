const fs = require('fs');
const path = require('path');
const process = require('process');

const filepath = path.resolve(__dirname, '../../app/agora.config.js');
const string = `export const APP_ID = '${process.env.AGORA_APP_ID || ''}'; // appid obtained from https://dashboard.agora.io/signin/`
fs.writeFile(filepath, string, err => {
  if(err) {
    throw err;
  }
});