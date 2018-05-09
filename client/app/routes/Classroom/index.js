import React from 'react'
import { Button, Input, Tooltip, Spin, message } from 'antd'
import { inject, observer } from 'mobx-react'
import axios from 'axios'
import {
  APP_ID,
  SERVER_URL
} from '../../agora.config'
import TitleBar from '../../components/TitleBar'

const ipcRenderer = require('electron').ipcRenderer

import './index.scss'

@inject('ClientStore')
@observer
class Classroom extends React.Component {
  constructor(props) {
    super(props)
    this.$client = props.ClientStore
    this.state = {
      activated: false,
      networkQuality: 2,
      isRecording: false,
      recordBtnLoading: false,
      isFullScreen: false
    }
    this.isSharing = false
  }

  componentDidMount() {
    // join rtc and signal channel
    try {
      this.$rtc = this.$client.$rtc.rtcEngine
      this.$signal = this.$client.$signal
      this.subscribeRTCEvents()
      this.$client.join()
      let board = document.querySelector('.board')
      if (board) {
        if (this.$client.isSharingStarted) {
          if (this.$client.role === 'teacher') {
            this.$rtc.setupLocalVideoSource(board)
          } else {
            this.$rtc.subscribe(2, board)
          }
          this.$rtc.setupViewContentMode("videosource", 1);
          this.$rtc.setupViewContentMode("2", 1);
        } else {
          board.innerHTML = ''
        }
      }

    } catch (err) {
      console.log(err)
      window.location.hash = ''
    }
  }

  componentWillUnmount () {
    this.stopSharing()
    this.$rtc.videoSourceLeave()
    this.$rtc.videoSourceRelease()
  }

  componentDidCatch (err, info) {
    console.error(err)
    window.location.hash = ''
  }

  render() {
    // get network status
    const profile = {
      '0': {
        text: 'unknown', color: '#000', bgColor: '#FFF'
      },
      '1': {
        text: 'excellent', color: '', bgColor: ''
      },
      '2': {
        text: 'good', color: '#7ED321', bgColor: '#B8E986'
      },
      '3': {
        text: 'poor', color: '#F5A623', bgColor: '#F8E71C'
      },
      '4': {
        text: 'bad', color: '#FF4D89', bgColor: '#FF9EBF'
      },
      '5': {
        text: 'vbad', color: '', bgColor: ''
      },
      '6': {
        text: 'down', color: '#4A90E2', bgColor: '#86D9E9'
      }
    }

    let quality = (() => {
      switch (this.state.networkQuality) {
        default:
        case 0:
          return profile[0]
        case 1:
        case 2:
          return profile[2]
        case 3:
          return profile[3]
        case 4:
        case 5:
          return profile[4]
        case 6:
          return profile[6]
      }
    })()

    let students = [], teacher = undefined
    if (this.state.activated) {
      for (let item of this.$client.streams.values()) {
        if (item.role === 'student') {
          students.push(<Window key={item.uid} uid={item.uid} username={item.username} role={item.role}></Window>)
        } else if (item.role === 'teacher') {
          teacher = (<Window uid={item.uid} username={item.username} role={item.role}></Window>)
        } else {
          // do nothing for now
        }
      }
    }

    // recording Button
    let RecordingButton 
    if (this.$client.role === 'teacher') {
      let id, content, func
      if (this.state.isRecording) {
        id = 'recordBtn disabled'
        content = 'Stop Recording'
        func = this.handleStopRecording
      } else {
        id = 'recordBtn'
        content = 'Start Recording'
        func = this.handleStartRecording
      }
      RecordingButton = (
        <Button loading={this.state.recordBtnLoading} onClick={func} id={id} type="primary">{content}</Button>
      )
    }

    // screen share btn
    let ScreenSharingBtn
    if (this.$client.role === 'teacher') {
      ScreenSharingBtn = (
        <div onClick={this.handleShareScreen} className="btn board-bar">
          <div>
            <img src={require('../../assets/images/screen share.png')} alt="" />
          </div>
          <div>Screen Share</div>
        </div>
      )
    }

    return (
      <div className="wrapper" id="classroom">
        <header className="title">
          <div className="status-bar">
            <Tooltip title={`Network Status: ${quality.text}`}>
              <span>Network Status: {quality.text}</span>
            </Tooltip>
            <Tooltip title={`Classroom: ${this.$client.channel}`}>
              <span>Classroom: {this.$client.channel}</span>
            </Tooltip>
            <Tooltip title={`Teacher: ${this.$client.teacher}`}>
              <span>Teacher: {this.$client.teacher}</span>
            </Tooltip>
          </div>

          <TitleBar>
            {RecordingButton}
            <Button className="btn" ghost icon="logout" onClick={this.handleExit}></Button>
          </TitleBar>

        </header>
        <section className="students-container">{students}</section>
        <section className="board-container">
          <div className="board">

          </div>
          {ScreenSharingBtn}
        </section>
        <section className="teacher-container">
          {teacher}
        </section>
        <section className="channel-container">
          <div className="channel">
            <header className="channel-header">Chatroom</header>
            <MessageBox></MessageBox>
            <footer className="channel-input">

              <Input id="channelMsg" placeholder="Input messages..." onKeyPress={this.handleKeyPress}></Input>

              <Button onClick={this.handleSendMsg} type="primary" id="sendBtn">Send</Button>

            </footer>
          </div>
        </section>
      </div>

    )
  }

  handleExit = () => {
    this.$client.leave().then(() => {
      message.info('Left the classroom successfully!')
      window.location.hash = ''
    }).catch(err => {
      message.error('Left the classroom...')
      window.location.hash = ''
    })
  }

  handleKeyPress = e => {
    if (e.key === 'Enter') {
      this.handleSendMsg();
    }
  }

  handleSendInstructions = (key, value) => {
    this.$signal.channel.channelSetAttr(key, value)
  }

  subscribeRTCEvents = () => {
    this.$rtc.on('joinedchannel', (channel, uid, elapsed) => {
      this.setState({
        activated: true
      })
    })
    this.$rtc.on('rejoinchannel', (channel, uid, elapsed) => {
      this.setState({
        activated: true
      })
    })
    this.$rtc.on('leavechannel', () => {
      this.setState({
        activated: false
      })
    })
    this.$rtc.on('error', (err, msg) => {
      console.error('RtcEngine throw an error: ' + err)
    })
    this.$rtc.on('lastmilequality', (quality) => {
      // console.log(quality)
      this.setState({
        networkQuality: quality
      })
    })
    // receive instructions
    this.$signal.channelEmitter.on('onChannelAttrUpdated', (name, value, type) => {
      if (name === 'sharingEvent' && type === 'update') {
        // receive instructions from teacher
        let board = document.querySelector('.board')
        if (board) {
          switch(value) {
            case 'StartSharing':
              if (this.$client.role === 'teacher') {
                this.$rtc.setupLocalVideoSource(board)
              } else {
                this.$rtc.subscribe(2, board)
              }
              this.$rtc.setupViewContentMode("videosource", 1);
              this.$rtc.setupViewContentMode("2", 1);
              break;
            case 'StopSharing':
              board.innerHTML = ''
              break;
            default:
              break;
          }
        }
      }
    })
    this.$rtc.on('userjoined', (uid, elapsed) => {
      // only teacher should use high stream
      let teacher = this.$client.streams.get(this.$client.teacher)
      if (uid === teacher.uid) {
        this.$rtc.setRemoteVideoStreamType(uid, 0)
      } else {
        this.$rtc.setRemoteVideoStreamType(uid, 1)
      }

      // sharing stream come in
      // let board = document.querySelector('.board')
      // if (uid === 2) {
      //   if (this.$client.role === 'teacher') {
      //     this.$rtc.setupLocalVideoSource(board)
      //   } else {
      //     this.$rtc.subscribe(2, board)
      //   }
      // }
    })
  }

  handleSendMsg = () => {
    let msg = document.querySelector('#channelMsg').value
    if (!msg) {
      return;
    }
    this.$signal.broadcastMessage(msg)
    document.querySelector('#channelMsg').value = ''
  }

  handleShareScreen = () => {
    if (!this.isSharing) {
      this.prepareSharing()
    } else {
      this.stopSharing()
    }
    this.isSharing = !this.isSharing
  }

  prepareSharing = () => {
    if (!this._sharingPrepared) {
      this.$rtc.on('videosourcejoinedsuccess', uid => {
        console.log('Screen Share Source joined success')
        this.startSharing()
        this._sharingPrepared = true
      })
      this.$rtc.videoSourceInitialize(APP_ID);
      console.log(`video source appid: ${APP_ID}`);
      this.$rtc.videoSourceSetChannelProfile(1)
      this.$rtc.videoSourceSetVideoProfile(50, false)
      // to adjust render dimension to optimize performance
      this.$rtc.setVideoRenderDimension(3, 2, 1600, 900)
      this.$rtc.videoSourceJoin(null, this.$client.channel, null, 2)
    } else {
      this.startSharing()
    }

  }

  startSharing = () => {
    console.log('Start Sharing...')
    // this.$rtc.setupLocalVideoSource(document.querySelector('.board'))
    this.handleSendInstructions('sharingEvent', 'StartSharing')
    this.$rtc.startScreenCapture2(0, 15, {top:0, left:0, right: 0, bottom: 0}, 0)
    this.$rtc.startScreenCapturePreview()
  }

  stopSharing = () => {
    console.log('Stop Sharing...')
    this.handleSendInstructions('sharingEvent', 'StopSharing')
    this.$rtc.stopScreenCapture2();
    this.$rtc.stopScreenCapturePreview();
  }

  handleStartRecording = () => {
    console.log('Start Recording...')
    this.setState({
      recordBtnLoading: true
    })
    // setTimeout(() => {
    //   this.setState({
    //     recordBtnLoading: false,
    //     isRecording: true
    //   })
    // }, 1500)
    axios.post(SERVER_URL + '/v1/recording/start', {
      appid: APP_ID,
      channel: this.$client.channel,
      uid: this.$client.uid
    }).then(res => {
      this.setState({
        recordBtnLoading: false,
        isRecording: true
      })
    }).catch(err => {
      console.error(err)
      this.setState({
        recordBtnLoading: false
      })
    })
    
  }

  handleStopRecording = () => {
    console.log('Stop Recording...')
    this.setState({
      recordBtnLoading: true
    })
    // setTimeout(() => {
    //   this.setState({
    //     recordBtnLoading: false,
    //     isRecording: false
    //   })
    // }, 1500)
    axios.post(SERVER_URL + '/v1/recording/stop', {
      appid: APP_ID,
      channel: this.$client.channel,
      uid: this.$client.uid
    }).then(res => {
      this.setState({
        recordBtnLoading: false,
        isRecording: false
      })
    }).catch(err => {
      console.error(err)
      this.setState({
        recordBtnLoading: false
      })
    })
  }
}

@inject('ClientStore')
@observer
class Window extends React.Component {
  state = {
    loading: true
  }
  componentDidMount() {
    let dom = document.querySelector(`#video-${this.props.uid}`)
    if (this.props.uid === this.props.ClientStore.uid) {
      // local stream
      console.log(`Setup local: ${this.props.uid}`)
      this.props.ClientStore.$rtc.rtcEngine.setupLocalVideo(dom)
    } else {
      // remote stream
      console.log(`Setup remote: ${this.props.uid}`)
      this.props.ClientStore.$rtc.rtcEngine.subscribe(this.props.uid, dom)
    }

    let name = this.props.uid;
    name = this.props.uid === this.props.ClientStore.uid ? "local" : name;
    name = this.props.uid === 2 ? "videosource" : name;

    let render = this.props.ClientStore.$rtc.rtcEngine.streams[name];
    if(render){
      if(render.firstFrameRender){
        this.setState({loading: false});
      } else {
        render.event.on("ready", () => {
          this.setState({loading: false})
        });
      }
    }
  }

  render() {
    let loaderClass = this.state.loading ? "loader loading" : "loader";
    if (this.props.role === 'teacher') {
      return (
        <div className="teacher-window">
          <div className="teacher-video"  id={`video-${this.props.uid}`}>
            <Spin className={loaderClass}/>
          </div>
          <div className="teacher-bar">Teacher: {this.props.username}</div>
        </div>
      )
    } else if (this.props.role === 'student') {
      return (
        <div className="student-window">
          <div className="student-video"  id={`video-${this.props.uid}`}>
            <Spin className={loaderClass}/>
          </div>
          <div className="student-bar">{this.props.username}</div>
        </div>
      )
    }
  }
}

@inject('ClientStore')
@observer
class MessageBox extends React.Component {
  state = {
    messages: []
  }

  componentDidMount() {
    try {
      this.$signal = this.props.ClientStore.$signal
      this.$signal.channelEmitter.on('onMessageChannelReceive', (clientId, sid, msg) => {
        let temp = JSON.parse(msg)
        // do nothing when it was a instructions
        if (!temp.type) {
          let arr = [...this.state.messages]
          arr.push({
            clientId, content: temp, self: clientId === this.props.ClientStore.clientId
          })
          this.setState({
            messages: arr
          })
        }
      })
    } catch (err) {
      console.log(err)
      window.location.hash = ''
    }

  }

  componentDidUpdate() {
    let box = document.querySelector('.channel-box')
    box.scrollTop = box.scrollHeight - box.clientHeight
  }

  render() {
    const messages = this.state.messages.map((item, index) => (
      <MessageItem key={index} clientId={item.clientId} content={item.content} self={item.self}>
      </MessageItem>
    ))

    return (
      <section className="channel-box">
        {messages}
      </section>
    )
  }
}

function MessageItem (props) {
  let align = props.self ? 'right' : 'left'
  let info = props.clientId.split('-')
  let speaker = info[1]
  return (
    <div className={props.self?"message-item right" : "message-item left"}>
      <div className="arrow" style={{float: align}}></div>
      <div className="message-content" style={{'textAlign': align, float: align}}>
        {props.content}
      </div>
      <div className="message-sender" style={{'textAlign': align}}>{speaker}</div>
    </div>
  )
}

export default Classroom