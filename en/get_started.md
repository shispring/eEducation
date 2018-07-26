## Trial directly
We have set up services and package electron app already, 
so you can just [Download](https://github.com/AgoraIO/ARD-eEducation-with-Electron/releases) and have a try.

## Development
Before you start, ensure you have an Agora developer account and an App ID before development, see [Agora Account](https://dashboard.agora.io/) for details.

- Clone the repo.

```bash
git clone https://github.com/AgoraIO/ARD-eEducation-with-Electron.git
```

- Install dependencies

``` bash
# go to ./client/app to install native module
cd client/app
npm install
# go back to ./client and install all dependencies
cd ..
npm install
```

- update APP_ID in ./client/app/agora.config.js

``` javascript
export const APP_ID = '<Your APP ID Here>'
```

- start developing or do package!

``` bash
# under ./client
# develop
npm run dev
# package
npm run package-mac
npm run package-win
```

## Tips

- If you are a Windows developer, remember to install a 32-bit electron

``` bash
npm install -D --arch=ia32 electron
```

- If you failed to install dependencies inside the Great Wall, try:  
- - Edit registry or mirror url for electron/node-sass
- - Use cnpm