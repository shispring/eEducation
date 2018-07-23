## Background
Mainly based on this boilerplate: [electron-react-boilerplate](https://github.com/chentsulin/electron-react-boilerplate).

## Development

First, create a developer account at [Agora.io](https://dashboard.agora.io/signin/), and obtain an App ID.
Update 'agora.config.js' under './app/'.  
**Recommend to use yarn!**

```bash
# native modules should be installed under ./app
cd ./app && npm install
# install dependency
cd .. && npm install
# run development mode with hot-reload
npm run dev
# build for different platform
# for mac
npm run package-mac 
# for win
npm run package-win
```

## Warning
1. Before customizing configuration for this project, you can find more info from [electron-react-boilerplate](https://github.com/chentsulin/electron-react-boilerplate) and [electron-builder](https://github.com/electron-userland/electron-builder).

2. *Most of your development should be under /app*  

3. ***If you are a Windows developer, remember to install a 32-bit electron***

```bash
  npm install -D --arch=ia32 electron
```

4. If you have trouble during install npm dependencies, go to [Installation Debugging Solutions](https://github.com/chentsulin/electron-react-boilerplate/issues/400) for information.

## Feature
- Use Sass and disable css-modules
- Use mobx to maintain data flow
- Two package.json structure


