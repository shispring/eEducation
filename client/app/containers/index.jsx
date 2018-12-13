import AdapterClient from '../utils/Adapter'
import { Container } from 'unstated';
import {APP_ID} from '../agora.config'
import { message } from 'antd';

import _ from 'lodash';

export default class MainContainer extends Container {

    constructor () {
        super();
        // const client = this.createClient();
        this.state = {
            rtc: null,
            isLogining: false,
            role: 'student',
            clientConfig: {
                APP_ID: null,
                channel: null,
                username: null,
                uid: null,
                role: null,
                boardId: null
            },
            videoDevices: [],
            audioDevices: [],
            audioPlaybackDevices: []
        }
        this._client = new AdapterClient();
        this.handleRole = this.handleRole.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.destroyRTC = this.destroyRTC.bind(this);
        this.setUpRTC = this.setUpRTC.bind(this);
        this.initDeviceTesting = this.initDeviceTesting.bind(this);
        this.inputVolumeIndicate = this.inputVolumeIndicate.bind(this);
    }

    client () {
        return this._client;
    }

    createClient () {
        new AdapterClient();
    }

    handleRole (e) {
        this.setState({
            role: e.target.value
        });
    }

    handleSubmit (e) {
        e.preventDefault();

        let channel = document.querySelector('#channel').value,
            username = document.querySelector('#username').value,
            role = this.state.role;

        if (!/^[0-9a-zA-Z]+$/.test(username)) {
            return message.error('Username can only consist a-z | A-Z | 0-9!');
        }

        if (/^2$/.test(username)) {
            return message.error('Username can not be 2!');
        }

        if (!/^[0-9a-zA-Z]+$/.test(channel)) {
            return message.error('Channel can only consist a-z | A-Z | 0-9!');
        }

        if (/^null$/.test(channel)) {
            return message.error('Channel can not be "null"!');
        }

        if (username.length > 8 || channel.length > 8) {
            return message.error('The length of Channel/Username should be no longer than 8!');
        }

        // try to connect
        this.setState({
            isLogining: true
        })
        // you can do auth before init class to generate your custom uid
        const _config = {
            APP_ID,
            channel,
            uid: undefined,
            username,
            role
        }
        const client = this.client();
        client.initClass(_config.APP_ID, _config.channel, _.pick(_config, ['uid', 'username', 'role'])).then(({uid, boardId}) => {
            Object.assign(_config, {
                uid, boardId
            })
            this.setState({
                clientConfig: _config
            }, () => {
                console.log('clientConfig', this.state.clientConfig)
            })
            client.initProfile(role === 'audience')
            this.setState({
                isLogining: false
            }, () => {
                if(role === 'audience') {
                    window.location.hash = 'classroom'
                } else {
                    window.location.hash = 'device_testing';
                }
            })
        }).catch(err => {
            this.setState({
                isLogining: false
            }, () => {
                console.error(err)
                message.error('Failed to connect data provider: '+String(err))
            })
        })
    }

    destroyRTC (rtc) {
        rtc.stopPreview();
        rtc.stopAudioRecordingDeviceTest();
        rtc.removeAllListeners('audiovolumeindication');
        rtc.stopAudioPlaybackDeviceTest();
    }
    
    initDeviceTesting () {
        const rtc = this._rtc;
        this.outputVolume = rtc.getAudioPlaybackVolume();
        const state = {...this.state}
        Object.assign(state, {
            inputVolume: 0,
            videoDevices: rtc.getVideoDevices(),
            audioDevices: rtc.getAudioRecordingDevices(),
            audioPlaybackDevices: rtc.getAudioPlaybackDevices()
        })
        this.setState(state)

    // this.state = {
    //   inputVolume: 0,
    //   videoDevices: this.$rtc.getVideoDevices(),
    //   audioDevices: this.$rtc.getAudioRecordingDevices(),
    //   audioPlaybackDevices: this.$rtc.getAudioPlaybackDevices()
    // };
    }

    setUpRTC (rtc, client) {    
        console.info('videoDevices', client.videoDevices)
        console.info('audioDevices', client.audioDevices)
        console.info('audioPlaybackDevices', client.audioPlaybackDevices)
    
        rtc.setupLocalVideo(document.querySelector('.preview-window'));
        rtc.startPreview();
        rtc.startAudioRecordingDeviceTest(100);
        rtc.on('audiovolumeindication', (...args) => this.inputVolumeIndicate(...args));
        rtc.on('audiodevicestatechanged', (...args) => {
            this.setState({
                audioDevices: rtc.getAudioRecordingDevices(),
                audioPlaybackDevices: rtc.getAudioPlaybackDevices()
            });
        });
        rtc.on('videodevicestatechanged', (...args) => {
            this.setState({
                videoDevices: rtc.getVideoDevices()
            });
        });
        rtc.on('audiodevicevolumechanged', (device, volume, muted) => {
            console.log(JSON.stringify({
                device,
                volume,
                muted
            }))
        });
    }

    inputVolumeIndicate (uid, volume, speaker, totalVolume) {
        this.setState({
            inputVolume: parseInt(totalVolume / 255 * 100, 10)
        });
    }


}
