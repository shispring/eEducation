import React from 'react'
import { Link } from 'react-router-dom'
import { Form, Select, Button, Progress, Slider } from 'antd'
import { inject, observer } from 'mobx-react'
import path from 'path'

import './index.scss'

const FormItem = Form.Item
const Option = Select.Option

@inject('ClientStore')
@observer
class DeviceTesting extends React.Component {
  constructor(props) {
    super(props)
    if (this.props.ClientStore.uid === -1) {
      window.location.hash = ''
    }
    this.$client = props.ClientStore
    this.$rtc = props.ClientStore.$rtc.rtcEngine
    this.videoDevices = this.$rtc.getVideoDevices()
    this.audioDevices = this.$rtc.getAudioRecordingDevices()
    this.audioPlaybackDevices = this.$rtc.getAudioPlaybackDevices()
    this.outputVolume = this.$rtc.getAudioPlaybackVolume()
    this.state = {
      inputVolume: 0
    }
  }

  componentDidMount() {
    this.$client.initProfile()
    this.$rtc.setupLocalVideo(document.querySelector('.preview-window'))
    this.$rtc.startPreview()
    console.log(this.$rtc.startAudioRecordingDeviceTest(100))
    this.$rtc.on('audiovolumeindication', (...args) => this.inputVolumeIndicate(...args))
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

  render() {
    return (
      <div className="wrapper" id="deviceTesting">
        <main className="main">
          <section className="content">
            <header>
              <img src={require('../../assets/images/logo.png')} alt="" />
            </header>
            <main>
              <Form>
                <FormItem style={{ 'marginBottom': '6px' }} label="Camera" colon={false}>
                  <Select defaultValue={0} onChange={val => this.handleVideoDeviceChange(val)}>
                    {this.videoDevices.map((item, index) => {
                      return (
                        <Option key={item.deviceid} value={index}>{item.devicename}</Option>
                      )
                    })}
                  </Select>
                </FormItem>
                <FormItem style={{ 'marginBottom': '6px' }} label="Microphone" colon={false}>
                  <Select defaultValue={0} onChange={val => this.handleAudioDeviceChange(val)}>
                    {this.audioDevices.map((item, index) => {
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
                    {this.audioPlaybackDevices.map((item, index) => {
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
    this.$rtc.setAudioRecordingDevice(this.videoDevices[val].deviceid)
  }

  handleVideoDeviceChange = (val) => {
    this.$rtc.setVideoDevice(this.audioDevices[val].deviceid)
  }

  handlePlaybackDeviceChange = (val) => {
    this.$rtc.setAudioPlaybackDevice(this.audioPlaybackDevices[val].deviceid)
  }

  handlePlaybackVolume = (val) => {
    this.$rtc.setAudioPlaybackVolume(val)
  }

  playMusic = () => {
    if (!this._playMusic) {
      let filepath = path.resolve(__dirname, './AgoraSDK/music.mp3')
      // let filepath = '../AgoraSDK/music.mp3'
      this.$rtc.startAudioPlaybackDeviceTest(filepath)
    } else {
      this.$rtc.stopAudioPlaybackDeviceTest()
    }
    this._playMusic = !this._playMusic
  }
}

export default DeviceTesting