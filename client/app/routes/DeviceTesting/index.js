import React from 'react'
import { Link } from 'react-router-dom'
import { Form, Select, Button, Progress, Slider } from 'antd'
import { inject, observer } from 'mobx-react'
import path from 'path'

import TitleBar from '../../components/TitleBar'

import './index.scss'

const FormItem = Form.Item
const Option = Select.Option

@inject('ClientStore')
@observer
class DeviceTesting extends React.Component {
  constructor(props) {
    super(props)

    try {
      this.$client = props.ClientStore
      this.$rtc = props.ClientStore.$rtc.rtcEngine
    } catch (err) {
      console.error(err)
      window.location.hash = ''
    }

    this.outputVolume = this.$rtc.getAudioPlaybackVolume()
    this.state = {
      inputVolume: 0,
      videoDevices: this.$rtc.getVideoDevices(),
      audioDevices: this.$rtc.getAudioRecordingDevices(),
      audioPlaybackDevices: this.$rtc.getAudioPlaybackDevices()
    }
  }

  componentDidMount() {
    this.$client.initProfile()
    this.$rtc.setupLocalVideo(document.querySelector('.preview-window'))
    this.$rtc.startPreview()
    console.log(this.$rtc.startAudioRecordingDeviceTest(100))
    this.$rtc.on('audiovolumeindication', (...args) => this.inputVolumeIndicate(...args))
    this.$rtc.on('audiodevicestatechanged', (...args) => {
      this.setState({
        audioDevices: this.$rtc.getAudioRecordingDevices(),
        audioPlaybackDevices: this.$rtc.getAudioPlaybackDevices()
      })
    })
    this.$rtc.on('videodevicestatechanged', (...args) => {
      this.setState({
        videoDevices: this.$rtc.getVideoDevices()
      })
    })
    // this.$rtc.startEchoTest()    
  }

  inputVolumeIndicate = (uid, volume, speaker, totalVolume) => {
    this.setState({
      inputVolume: parseInt(totalVolume/255*100, 10)
    })
  }

  componentWillUnmount () {
    this.$rtc.stopPreview()
    this.$rtc.stopAudioRecordingDeviceTest()
    this.$rtc.removeAllListeners('audiovolumeindication')
    this.$rtc.stopAudioPlaybackDeviceTest()
    // this.$rtc.stopEchoTest()
  }

  componentDidCatch (err, info) {
    console.error(err)
    window.location.hash = ''
  }

  render() {
    return (
      <div className="wrapper" id="deviceTesting">
        <header className="title">
          <TitleBar></TitleBar>
        </header>
        <main className="main">
          <section className="content">
            <header>
              <img src={require('../../assets/images/logo.png')} alt="" />
            </header>
            <main>
              <Form>
                <FormItem style={{ 'marginBottom': '6px' }} label="Camera" colon={false}>
                  <Select defaultValue={0} onChange={val => this.handleVideoDeviceChange(val)}>
                    {this.state.videoDevices.map((item, index) => {
                      return (
                        <Option key={item.deviceid} value={index}>{item.devicename}</Option>
                      )
                    })}
                  </Select>
                </FormItem>
                <FormItem style={{ 'marginBottom': '6px' }} label="Microphone" colon={false}>
                  <Select defaultValue={0} onChange={val => this.handleAudioDeviceChange(val)}>
                    {this.state.audioDevices.map((item, index) => {
                      return (
                        <Option key={item.deviceid} value={index}>{item.devicename}</Option>
                      )
                    })}
                  </Select>
                </FormItem>
                <FormItem style={{ 'marginBottom': '6px' }} label={(
                  <img style={{ 'width': '13px' }} src={require('../../assets/images/microphone.png')} alt="" />
                )} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} colon={false}>
                  <Progress percent={this.state.inputVolume} showInfo={false}></Progress>
                </FormItem>
                <FormItem style={{ 'marginBottom': '6px' }} label="Speaker" colon={false}>
                  <Select defaultValue={0} onChange={val => this.handlePlaybackDeviceChange(val)}>
                    {this.state.audioPlaybackDevices.map((item, index) => {
                      return (
                        <Option key={item.deviceid} value={index}>{item.devicename}</Option>
                      )
                    })}
                  </Select>
                </FormItem>
                <FormItem style={{ 'marginBottom': '6px' }} label={(
                  <img style={{'cursor': 'pointer', 'width': '19px'}} onClick={this.playMusic} src={require('../../assets/images/sound.png')} alt="" />
                )} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} colon={false}>
                  <Slider onChange={val => this.handlePlaybackVolume(val)} min={0} max={255} defaultValue={this.outputVolume} showInfo={false}></Slider>
                </FormItem>
              </Form>
            </main>
          </section>
          <section className="illustration">
            <h3 className="title">Device Testing</h3>
            <div className="preview-window"></div>
            <div className="button-group">
              <Button size="large" id="nextBtn" type="primary">
                <Link to="/network_testing">Next Step -></Link>
              </Button>
            </div>
          </section>
        </main>
      </div>
    )
  }

  handleAudioDeviceChange = (val) => {
    this.$rtc.setAudioRecordingDevice(this.state.videoDevices[val].deviceid)
  }

  handleVideoDeviceChange = (val) => {
    this.$rtc.setVideoDevice(this.state.audioDevices[val].deviceid)
  }

  handlePlaybackDeviceChange = (val) => {
    this.$rtc.setAudioPlaybackDevice(this.state.audioPlaybackDevices[val].deviceid)
  }

  handlePlaybackVolume = (val) => {
    this.$rtc.setAudioPlaybackVolume(val)
  }

  playMusic = () => {
    if (!this._playMusic) {
      let filepath;
      if (this.$client.isDev()) {
        filepath = path.join(__dirname, 'AgoraSDK/music.mp3')
      } else {
        filepath = path.join(this.$client.appPath, '../app', 'AgoraSDK/music.mp3')
      }
      // let filepath = ''
      this.$rtc.startAudioPlaybackDeviceTest(filepath)
    } else {
      this.$rtc.stopAudioPlaybackDeviceTest()
    }
    this._playMusic = !this._playMusic
  }
}

export default DeviceTesting