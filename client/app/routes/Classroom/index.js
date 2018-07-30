import React from 'react';
import { Button, Icon, Input, Spin, Tooltip, message } from 'antd';
import { List } from 'immutable';
import { isEqual } from 'lodash';
import axios from 'axios'
import ipcRenderer from 'electron';

import {
  APP_ID
} from '../../agora.config';
import TitleBar from '../../components/TitleBar';
import { localStorage } from '../../utils/storage'
import './index.scss';

class Classroom extends React.Component {
  constructor(props) {
    super(props);
    this.$client = props.barrel;
    this.$rtc = this.$client.rtcEngine;
    this.subscribeRTCEvents();
    this.state = {
      teacher: '',
      networkQuality: 2,
      isRecording: false,
      recordBtnLoading: false,
      teacherList: List(),
      studentList: List(),
      messageList: List(),
      isSharing: false,
      enableVideo: true,
      enableAudio: true,
      waitSharing: false,
    };
  }

  componentDidMount() {
    this.$client.enterClass()
    if(this.$client.user.role === 'teacher') {
      this.$client.prepareScreenShare()
    }
    this.subscribeClientEvents()
  }

  componentWillUnmount() {
    this.$client.stopScreenShare()
    this.$client.destructScreenShare()
  }

  subscribeClientEvents = () => {
    this.$client.on('teacher-added', (uid, info, streamId) => {
      this.setState({
        teacherList: this.state.teacherList.push({
          uid, info, streamId
        }),
        teacher: info.username
      })
    });
    this.$client.on('student-added', (uid, info, streamId) => {
      this.setState({
        studentList: this.state.studentList.push({
          uid, info, streamId
        })
      })
    });
    this.$client.on('teacher-removed', (uid) => {
      let index = this.state.teacherList.findKey((value, key) => value.uid === uid);
      if(index !== undefined) {
        this.setState({
          teacherList: this.state.teacherList.splice(index, 1)
        })
      }
    });
    this.$client.on('student-removed', (uid) => {
      let index = this.state.studentList.findKey((value, key) => value.uid === uid);
      if(index !== undefined) {
        this.setState({
          studentList: this.state.studentList.splice(index, 1)
        })
      };
    });
    this.$client.on('screen-share-started', evt => {
      let board = document.querySelector('.board');
      if (board) {
        // check if presenter is your self
        if(evt.sharerId === this.$client.user.uid) {
          this.$rtc.setupLocalVideoSource(board);
        } else {
          this.$rtc.subscribe(evt.shareId, board);
        }
        // transfer to fit mode
        this.$rtc.setupViewContentMode('videosource', 1);
        this.$rtc.setupViewContentMode(String(evt.shareId), 1);
      };
    })
    this.$client.on('screen-share-stopped', () => {
      let board = document.querySelector('.board');
      if(board) {
        board.innerHTML = '';
      };
    })
    this.$client.on('message-received', evt => {
      this.setState({
        messageList: this.state.messageList.push({
          message: evt.detail.message,
          uid: evt.detail.uid, 
          role: evt.detail.role, 
          username: evt.detail.username,
          ts: evt.detail.ts,
          local: evt.detail.uid === this.$client.user.uid
        })
      })
    });
  }

  handleExit = () => {
    this.$client.leaveClass()
    message.info('Left the classroom...');
    window.location.hash = ''
  }

  handleKeyPress = e => {
    if (e.key === 'Enter') {
      this.handleSendMsg();
    }
  }

  subscribeRTCEvents = () => {
    this.$rtc.on('error', (err, msg) => {
      console.error(`RtcEngine throw an error: ${err}`);
    });
    this.$rtc.on('lastmilequality', (quality) => {
      this.setState({
        networkQuality: quality
      });
    });
  }

  handleSendMsg = () => {
    const msg = document.querySelector('#channelMsg').value;
    if (!msg) {
      return;
    }
    this.$client.broadcastMessage(msg);
    document.querySelector('#channelMsg').value = '';
  }

  handleShareScreen = () => {
    if (!this.state.isSharing) {
      this.$client.startScreenShare();
    } else {
      this.$client.stopScreenShare();
    }
    this.setState({
      waitSharing: true,
      isSharing: !this.state.isSharing
    })
    setTimeout(() => {
      this.setState({
        waitSharing: false
      })
    }, 300)
  }


  handleStartRecording = () => {
    console.log('Start Recording...');
    this.setState({
      recordBtnLoading: true
    });
    axios.post(`${SERVER_URL}/v1/recording/start`, {
      appid: APP_ID,
      channel: this.$client.channel,
      uid: this.$client.user.uid
    }).then(res => {
      this.setState({
        recordBtnLoading: false,
        isRecording: true
      });
    }).catch(err => {
      console.error(err);
      this.setState({
        recordBtnLoading: false
      });
    });
  }

  handleStopRecording = () => {
    console.log('Stop Recording...');
    this.setState({
      recordBtnLoading: true
    });
    axios.post(`${SERVER_URL}/v1/recording/stop`, {
      appid: APP_ID,
      channel: this.$client.channel,
      uid: this.$client.user.uid
    }).then(res => {
      this.setState({
        recordBtnLoading: false,
        isRecording: false
      });
    }).catch(err => {
      console.error(err);
      this.setState({
        recordBtnLoading: false
      });
    });
  }

  handleToggleVideo = () => {
    this.setState({
      enableVideo: !this.state.enableVideo
    }, () => {
      if(this.state.enableVideo) {
        this.$client.muteVideo()
      } else {
        this.$client.unmuteVideo()
      }
    })
  }

  handleToggleAudio = () => {
    this.setState({
      enableAudio: !this.state.enableAudio
    }, () => {
      if(this.state.enableAudio) {
        this.$client.muteAudio()
      } else {
        this.$client.unmuteAudio()
      }
    })
  }

  render() {
    // get network status
    const profile = {
      0: {
        text: 'unknown', color: '#000', bgColor: '#FFF'
      },
      1: {
        text: 'excellent', color: '', bgColor: ''
      },
      2: {
        text: 'good', color: '#7ED321', bgColor: '#B8E986'
      },
      3: {
        text: 'poor', color: '#F5A623', bgColor: '#F8E71C'
      },
      4: {
        text: 'bad', color: '#FF4D89', bgColor: '#FF9EBF'
      },
      5: {
        text: 'vbad', color: '', bgColor: ''
      },
      6: {
        text: 'down', color: '#4A90E2', bgColor: '#86D9E9'
      }
    };

    const quality = (() => {
      switch (this.state.networkQuality) {
        default:
        case 0:
          return profile[0];
        case 1:
        case 2:
          return profile[2];
        case 3:
          return profile[3];
        case 4:
        case 5:
          return profile[4];
        case 6:
          return profile[6];
      }
    })();

    const teacher = (() => {
      let result = []
      this.state.teacherList.map(item => {
        result.push((
          <Window 
            key={item.uid} 
            uid={item.uid}
            isLocal={item.uid === this.$client.user.uid}
            barrel={this.props.barrel}
            username={item.info.username} 
            role={item.info.role} />
        ))
      })
      return result
    })();

    const students = (() => {
      let result = []
      this.state.studentList.map(item => {
        result.push((
          <Window 
            key={item.uid} 
            uid={item.uid}
            isLocal={item.uid === this.$client.user.uid}
            barrel={this.props.barrel}
            username={item.info.username} 
            role={item.info.role} />
        ))
      })
      return result
    })();

    // recording Button
    let RecordingButton;
    if (this.$client.user.role === 'teacher') {
      let id,
        content,
        func;
      if (this.state.isRecording) {
        id = 'recordBtn disabled';
        content = 'Stop Recording';
        func = this.handleStopRecording;
      } else {
        id = 'recordBtn';
        content = 'Start Recording';
        func = this.handleStartRecording;
      }
      RecordingButton = (
        <Button loading={this.state.recordBtnLoading} onClick={func} id={id} type="primary">{content}</Button>
      );
    }

    let Toolbar = (
      <div className="board-bar">
        <Button loading={this.state.waitSharing} onClick={this.handleShareScreen} type={this.state.isSharing ? "primary" : "default"} style={{margin: '0 8px'}} icon="laptop">Share Screen</Button>
        <div className="board-bar--toolbar">
          <Button onClick={this.handleToggleVideo} style={{margin: '0 8px'}} type={this.state.enableVideo?'primary':'default'} shape="circle" icon="video-camera"></Button>
          <Button onClick={this.handleToggleAudio} style={{margin: '0 8px'}} type={this.state.enableAudio?'primary':'default'} shape="circle" icon="sound"></Button>
        </div>
      </div>
    )

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
            <Tooltip title={
              `Teacher: ${this.state.teacher}`
            }>
              <span>
                Teacher: {
                  this.state.teacher
                }
              </span>
            </Tooltip>
          </div>

          <TitleBar>
            {RecordingButton}
            <Button className="btn" ghost icon="logout" onClick={this.handleExit} />
          </TitleBar>

        </header>
        <section className="students-container">{students}</section>
        <section className="board-container">
          <div className="board" />
          {Toolbar}
        </section>
        <section className="teacher-container">
          {teacher}
        </section>
        <section className="channel-container">
          <div className="channel">
            <header className="channel-header">Chatroom</header>
            <MessageBox messageList={this.state.messageList} />
            <footer className="channel-input">

              <Input id="channelMsg" placeholder="Input messages..." onKeyPress={this.handleKeyPress} />

              <Button onClick={this.handleSendMsg} type="primary" id="sendBtn">Send</Button>

            </footer>
          </div>
        </section>
      </div>

    );
  }
}

class Window extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
    this.$rtc = props.barrel.rtcEngine
  }

  shouldComponentUpdate(nextProps, nextState) {
    // always return false in temp
    if(this.state.loading = nextState.loading) {
      return false
    }
    return true
  }

  componentDidMount() {
    const dom = document.querySelector(`#video-${this.props.uid}`);
    if (this.props.isLocal) {
      // local stream
      console.log(`Setup local: ${this.props.uid}`);
      this.$rtc.setupLocalVideo(dom);
    } else {
      // remote stream
      console.log(`Setup remote: ${this.props.uid}`);
      this.$rtc.subscribe(this.props.uid, dom);
    }

    let name = this.props.uid;
    name = this.props.isLocal ? 'local' : name;

    const render = this.$rtc.streams[name];
    if (render) {
      if (render.firstFrameRender) {
        this.setState({ loading: false });
      } else {
        render.event.on('ready', () => {
          this.setState({ loading: false });
        });
      }
    }
  }

  render() {
    const loaderClass = this.state.loading ? 'loader loading' : 'loader';
    if (this.props.role === 'teacher') {
      return (
        <div className="teacher-window">
          <div className="teacher-video" id={`video-${this.props.uid}`}>
            <Spin className={loaderClass} />
          </div>
          <div className="teacher-bar">Teacher: {this.props.username}</div>
        </div>
      );
    } else if (this.props.role === 'student') {
      return (
        <div className="student-window">
          <div className="student-video" id={`video-${this.props.uid}`}>
            <Spin className={loaderClass} />
          </div>
          <div className="student-bar">{this.props.username}</div>
        </div>
      );
    }
  }
}


class MessageBox extends React.Component {
  componentDidUpdate() {
    const box = document.querySelector('.channel-box');
    box.scrollTop = box.scrollHeight - box.clientHeight;
  }

  render() {
    const messages = this.props.messageList.map(item => (
      <MessageItem 
        key={item.ts} 
        message={item.message}
        username={item.username}
        role={item.role}
        ts={item.ts}
        local={item.local} />
    ));

    return (
      <section className="channel-box">
        {messages}
      </section>
    );
  }
}

function MessageItem(props) {
  const align = props.local ? 'right' : 'left';
  return (
    <div className={`message-item ${align}`}>
      <div className="arrow" style={{ float: align }} />
      <div className="message-content" style={{ textAlign: align, float: align }}>
        {props.message}
      </div>
      <div className="message-sender" style={{ textAlign: align }}>{props.username}</div>
    </div>
  );
}

export default Classroom;
