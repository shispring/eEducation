import React from 'react';
import { Button, Icon, Input, Spin, Tooltip, message } from 'antd';
import { List } from 'immutable';
import { isEqual } from 'lodash';
import axios from 'axios'
import ipcRenderer from 'electron';

import {
  APP_ID
} from '../../agora.config';
import ClassControl from '../../components/ClassControl'
import TitleBar from '../../components/TitleBar';
import { localStorage } from '../../utils/storage'
import './index.scss';

class Classroom extends React.Component {
  constructor(props) {
    super(props);
    this.$client = props.adapter;
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
    this.enableChat = true;
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
          uid, streamId,
          username: info.username,
          role: info.role
        }),
        teacher: info.username
      })
    });
    this.$client.on('student-added', (uid, info, streamId) => {
      this.setState({
        studentList: this.state.studentList.push({
          uid, streamId,
          username: info.username,
          role: info.role
        })
      })
    });
    this.$client.on('teacher-removed', (uid) => {
      let index = this.state.teacherList.findIndex((value, key) => value.uid === uid);
      if(index !== undefined) {
        this.setState({
          teacherList: this.state.teacherList.splice(index, 1)
        })
      }
    });
    this.$client.on('student-removed', (uid) => {
      let index = this.state.studentList.findIndex((value, key) => value.uid === uid);
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
      if (evt.detail.type === 'str') {
        this.setState({
          messageList: this.state.messageList.push({
            content: evt.detail.message,
            username: evt.detail.username,
            local: evt.detail.uid === this.$client.user.uid
          })
        });
      } else {
        // type === 'json'
        let {type, action, uid} = JSON.parse(evt.detail.message);
        let from = evt.detail.uid
        this.handleRemoteControl(type, action, uid, from);
      }
    });
  }

  handleRemoteControl = (type, action, uid, from) => {
    let isLocal = (uid === this.$client.user.uid)
    if (type === 'chat') {
      if(isLocal) {
        this.enableChat = (action === 'enable')
      }
    } else if (type === 'video') {
      if (action === 'enable') {
        if(!isLocal) {
          this.$client.unmuteVideo(uid)
        }
      } else {
        if(!isLocal) {
          this.$client.muteVideo(uid)
        }
      }
    } else if (type === 'audio') {
      if (action === 'enable') {
        if(!isLocal) {
          this.$client.unmuteAudio(uid)
        }
      } else {
        if(!isLocal) {
          this.$client.muteAudio(uid)
        }
      }
    } else if (type === 'ring') {
      if(from !== this.$client.user.uid) {
        let username = this.$client.getUser(from).username
        message.info(`Student ${username} is ringing the bell!`)
      }
    } else {
      // can be extended by your situation
    }
  }

  handleExit = () => {
    this.$client.leaveClass()
    message.info('Left the classroom...');
    window.location.hash = ''
  }

  handleSendMsg = msg => {
    if(this.enableChat) {
      this.$client.broadcastMessage(msg)
    } else {
      message.warn('You are banned to send messages!')
    }
  }

  handleClassCtrlAction = (type, action, uid) => {
    this.$client.broadcastMessage(JSON.stringify({
      type,
      action,
      uid
    }), 'json')
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
        this.$client.unmuteVideo()
      } else {
        this.$client.muteVideo()
      }
    })
  }

  handleToggleAudio = () => {
    this.setState({
      enableAudio: !this.state.enableAudio
    }, () => {
      if(this.state.enableAudio) {
        this.$client.unmuteAudio()
      } else {
        this.$client.muteAudio()
      }
    })
  }

  handleRing = () => {
    this.$client.broadcastMessage(JSON.stringify({
      type: 'ring'
    }), 'json')
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
            adapter={this.props.adapter}
            username={item.username} 
            role={item.role} />
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
            adapter={this.props.adapter}
            username={item.username} 
            role={item.role} />
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

    // Toolbar
    let ButtonGroup = [
      (
        <Button key={0} onClick={this.handleToggleVideo} style={{margin: '0 8px'}} type={this.state.enableVideo?'primary':'default'} shape="circle" icon="video-camera" />
      ),
      (
        <Button key={1} onClick={this.handleToggleAudio} style={{margin: '0 8px'}} type={this.state.enableAudio?'primary':'default'} shape="circle" icon="sound" />
      )
    ]
    if (this.$client.user.role === 'student') {
      ButtonGroup.push((<Button key={2} onClick={this.handleRing} style={{margin: '0 8px'}} type="primary" shape="circle" icon="bell" />))
    }
    let Toolbar = (
      <div className="board-bar">
        {
          this.$client.user.role === 'teacher' ? (
            <Button loading={this.state.waitSharing} 
            onClick={this.handleShareScreen} 
            type={this.state.isSharing ? "primary" : "default"} 
            style={{margin: '0 8px'}} 
            icon="laptop">Share Screen</Button>
          ) : (<div></div>)
        }
        <div className="board-bar--toolbar">
          {
            this.$client.user.role === 'audience' ? '' : ButtonGroup
          }
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

        <ClassControl
          className="channel-container"
          controllable={this.$client.user.username === this.state.teacher}
          onSendMessage={this.handleSendMsg} 
          onAction={this.handleClassCtrlAction}
          messages={this.state.messageList.toArray()} 
          users={this.state.studentList.toArray()} 
        />

        {/* <section className="channel-container">
          <div className="channel">
            <header className="channel-header">Chatroom</header>
            <MessageBox messageList={this.state.messageList} />
            <footer className="channel-input">

              <Input id="channelMsg" placeholder="Input messages..." onKeyPress={this.handleKeyPress} />

              <Button onClick={this.handleSendMsg} type="primary" id="sendBtn">Send</Button>

            </footer>
          </div>
        </section> */}
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
    this.$rtc = props.adapter.rtcEngine
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

export default Classroom;
