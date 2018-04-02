import React from 'react'
// import { Link } from 'react-router-dom'
import { Form, Input, Radio, Button, Spin, message } from 'antd'
import { inject, observer } from 'mobx-react'

import './index.scss'
import {
  APP_ID,
  SIGNAL_ID
} from '../../agora.config';
// import {sessionStorage} from '../../utils/storage'

const FormItem = Form.Item
const RadioGroup = Radio.Group

@inject('ClientStore')
@observer
class Index extends React.Component {
  constructor(props) {
    super(props)
    this.$client = props.ClientStore
    this.state = {
      role: 'student',
      isLogining: false
    }
  }

  componentDidMount() {
    this.$client.init( APP_ID, SIGNAL_ID )
  }

  render() {
    let loading
    if (this.state.isLogining) {
      loading = (
        <div className="mask">
          <Spin size="large" ></Spin>
        </div>
      )
    }
    return (
      <div className="wrapper" id="index">
        {loading}
        <main className="main">
          <section className="content">
            <header>
              <img src={require('../../assets/images/logo.png')} alt="" />
            </header>
            <main>
              <Form onSubmit={this.handleSubmit}>
                <FormItem label="Classroom Name" colon={false}>
                  <Input id="channel"></Input>
                </FormItem>
                <FormItem label="Your Name" colon={false}>
                  <Input id="username"></Input>
                </FormItem>
                <FormItem>
                  <RadioGroup onChange={this.handleRole} id="role" defaultValue="student">
                    <Radio value="teacher">Teacher</Radio>
                    <Radio value="student">Student</Radio>
                  </RadioGroup>
                </FormItem>
                <FormItem>
                  <Button size="large" id="joinBtn" type="primary" htmlType="submit">
                    Join ->
                  </Button>
                </FormItem>
              </Form>
            </main>
          </section>
          <section className="illustration"></section>
          <img className="bubble-1" src={require('../../assets/images/monster-blue.png')} alt="" />
          <img className="bubble-2" src={require('../../assets/images/monster-yellow.png')} alt="" />
        </main>
      </div>
    )
  }

  handleRole = (e) => {
    this.setState({
      'role': e.target.value
    })
  }

  handleSubmit = (e) => {
    e.preventDefault()

    let channel = document.querySelector('#channel').value,
      username = document.querySelector('#username').value,
      role = this.state.role

    if (!/^[0-9a-zA-Z]+$/.test(username)) {
      return message.error('Username can only consist a-z | A-Z | 0-9!')
    }

    if (!/^[0-9a-zA-Z]+$/.test(channel)) {
      return message.error('Channel can only consist a-z | A-Z | 0-9!')
    }

    if (username.length > 8 || channel.length > 8) {
      return message.error('The length of Channel/Username should be no longer than 8!')
    }

    this.setState({
      isLogining: true
    })

    this.$client.socketJoin(username, channel, role).then(() => {
      this.$client.login(username, channel, role).then(() => {
        window.location.hash = 'device_testing'
        this.setState({
          isLogining: false
        })
      }).catch(err => {
        message.error('Failed to login Signaling Server, Error: '+ err)
      })
    }).catch(err => {
      this.setState({
        isLogining: false
      })
      if (role === 'teacher') {
        message.error('Classroom occupied!')
      } else if (role === 'student') {
        message.error('Classroom not existed!')
      } else {
        message.error('Unknown error!')
      }
    })

    // this.$client.login(username, channel, role).then(() => {
    //   let signalClient = this.$client.$signal
    //   if (role === 'teacher') {
    //     // if teacher, query if there has already been a teacher
    //     signalClient.session.invoke('io.agora.signal.channel_query_num', { 'name': channel }, (err, val) => {
    //       this.setState({
    //         isLogining: false
    //       })
    //       // only there is another one in class, he must be teacher? 
    //       // depend on signaling client's stability
    //       if (val.num > 1) {
    //         signalClient.logout()
    //         message.error('Classroom occupied!')
    //       } else {
    //         window.location.hash = 'device_testing'
    //       }
    //     })
    //   } else {
    //     // if student, check if teacher has entered the channel
    //     signalClient.session.invoke('io.agora.signal.channel_query_num', { 'name': channel }, (err, val) => {
    //       this.setState({
    //         isLogining: false
    //       })
    //       // only the student himself
    //       if (val.num === 1) {
    //         signalClient.logout()
    //         message.error('Classroom not existed!')
    //       } else {
    //         window.location.hash = 'device_testing'
    //       }
    //     })
    //   }
    // })
  }
}

export default Index