import React from 'react';
import { Link } from 'react-router-dom';
import { Form, Select, Button, Progress, Slider } from 'antd';
import path from 'path';

import TitleBar from '../../components/TitleBar';
import './index.scss';

const FormItem = Form.Item;
const Option = Select.Option;

class DeviceTesting extends React.Component {
  constructor(props) {
    super(props);
    this._client = props._client;
    this._rtc = this._client.rtcEngine;
    this.state = {
      inputVolume: 0,
      videoDevices: this._rtc.getVideoDevices(),
      audioDevices: this._rtc.getAudioRecordingDevices(),
      audioPlaybackDevices: this._rtc.getAudioPlaybackDevices()
    }
  }

  componentDidMount() {
    this.props.setUpRTC(this._rtc, this._client);
    // console log devices
    // this._rtc.startEchoTest()
  }

  componentWillUnmount() {
    this._rtc.stopPreview();
    this._rtc.stopAudioRecordingDeviceTest();
    this._rtc.removeAllListeners('audiovolumeindication');
    this._rtc.stopAudioPlaybackDeviceTest();
    // this._rtc.stopEchoTest()
  }

  componentDidCatch(err, info) {
    console.error(err);
    window.location.hash = '';
  }

  render() {
    return (
      <div className="wrapper" id="deviceTesting">
        <header className="title">
          <TitleBar />
        </header>
        <main className="main">
          <section className="content">
            <header>
              <img src={require('../../assets/images/logo.png')} alt="" />
            </header>
            <main>
              <Form>
                <FormItem style={{ marginBottom: '6px' }} label="Camera" colon={false}>
                  <Select defaultValue={0} onChange={val => this.handleVideoDeviceChange(val)}>
                    {this.state.videoDevices.map((item, index) => (
                      <Option key={item.deviceid} value={index}>{item.devicename}</Option>
                      ))}
                  </Select>
                </FormItem>
                <FormItem style={{ marginBottom: '6px' }} label="Microphone" colon={false}>
                  <Select defaultValue={0} onChange={val => this.handleAudioDeviceChange(val)}>
                    {this.state.audioDevices.map((item, index) => (
                      <Option key={item.deviceid} value={index}>{item.devicename}</Option>
                      ))}
                  </Select>
                </FormItem>
                <FormItem
                  style={{ marginBottom: '6px' }}
                  label={(
                    <img style={{ width: '13px' }} src={require('../../assets/images/microphone.png')} alt="" />
                )}
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 20 }}
                  colon={false}
                >
                  <Progress percent={this.state.inputVolume} showInfo={false} />
                </FormItem>
                <FormItem style={{ marginBottom: '6px' }} label="Speaker" colon={false}>
                  <Select defaultValue={0} onChange={val => this.handlePlaybackDeviceChange(val)}>
                    {this.state.audioPlaybackDevices.map((item, index) => (
                      <Option key={item.deviceid} value={index}>{item.devicename}</Option>
                      ))}
                  </Select>
                </FormItem>
                <FormItem
                  style={{ marginBottom: '6px' }}
                  label={(
                    <img style={{ cursor: 'pointer', width: '19px' }} onClick={this.playMusic} src={require('../../assets/images/sound.png')} alt="" />
                )}
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 20 }}
                  colon={false}
                >
                  <Slider onChange={val => this.handlePlaybackVolume(val)} min={0} max={255} defaultValue={this.outputVolume} showInfo={false} />
                </FormItem>
              </Form>
            </main>
          </section>
          <section className="illustration">
            <h3 className="title">Device Testing</h3>
            <div className="preview-window" />
            <div className="button-group">
              <Button size="large" id="nextBtn" type="primary">
                <Link to="/classroom">Next Step -></Link>
              </Button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  handleAudioDeviceChange = (val) => {
    console.info('setAudioRecordingDevice')
    console.info(val)
    this._rtc.setAudioRecordingDevice(this.state.audioDevices[val].deviceid);
  }

  handleVideoDeviceChange = (val) => {
    console.info('setVideoDevice')
    console.info(val)
    this._rtc.setVideoDevice(this.state.videoDevices[val].deviceid);
  }

  handlePlaybackDeviceChange = (val) => {
    console.info('setAudioPlaybackDevice')
    console.info(val)
    this._rtc.setAudioPlaybackDevice(this.state.audioPlaybackDevices[val].deviceid);
  }

  handlePlaybackVolume = (val) => {
    this._rtc.setAudioPlaybackVolume(val);
  }

  playMusic = () => {
    if (!this._playMusic) {
      let filepath;
      if (process.env.NODE_ENV === 'development') {
        filepath = path.join(__dirname, 'static/music.mp3');
      } else {
        filepath = path.join(process.env.APP_PATH, '../app', 'static/music.mp3');
      }
      this._rtc.startAudioPlaybackDeviceTest(filepath);
    } else {
      this._rtc.stopAudioPlaybackDeviceTest();
    }
    this._playMusic = !this._playMusic;
  }
}

export default DeviceTesting;
