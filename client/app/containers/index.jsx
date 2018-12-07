import AdapterClient from '../../utils/Adapter'
import PropTypes from 'prop-types';
import { Container } from 'unstated';

export default class SDKContainer extends Container {

    constructor () {
        const client = this.createClient();
        this.state = {
            rtc: null,
            client,
            isLogining: false,
            role: 'student'
        }
    }

    createClient () {
        new AdapterClient();
    }

    createRTC ({APP_ID, channel, uid, username, role}) {
        const { client } = this.state;
        const rtc = client.initClass(APP_ID, channel, { uid, username, role }).then(({uid, boardId}) => {
            client.initWhiteboard(channel, boardId);
            client.initProfile(role === 'audience')
            this.setState({
                isLogining: false
            }, () => {
                if (role === 'audience') {
                    window.location.hash = 'classroom'
                } else {
                    window.location.hash = 'device_testing'
                }
            })
        }).catch(err => {
            this.setState({
                isLogining: false
            })
        }, () => {
            console.error(err)
            message.error(`Failed to connect data provider: ${err}`)
        });

        this.setState({
            rtc
        });

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
        })
    }

    destroyRTC () {
        const { rtc } = this.state;
        rtc.stopPreview();
        rtc.stopAudioRecordingDeviceTest();
        rtc.removeAllListeners('audiovolumeindication');
        rtc.stopAudioPlaybackDeviceTest();
    }

}
