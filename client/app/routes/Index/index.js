import React from 'react';
import { Form, Input, Radio, Button, Spin, message } from 'antd';

import './index.scss';
import TitleBar from '../../components/TitleBar';
import { localStorage } from '../../utils/storage'

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.$client = props.barrel;
    this.state = {
      role: 'student',
      isLogining: false
    };
  }

  render() {
    let loading;
    if (this.state.isLogining) {
      loading = (
        <div className="mask">
          <Spin size="large" />
        </div>
      );
    }
    return (
      <div className="wrapper" id="index">
        {loading}
        <header className="title">
          <TitleBar />
        </header>
        <main className="main">
          <section className="content">
            <header>
              <img src={require('../../assets/images/logo.png')} alt="" />
            </header>
            <main>
              <Form onSubmit={this.handleSubmit}>
                <FormItem label="Classroom Name" colon={false}>
                  <Input id="channel" />
                </FormItem>
                <FormItem label="Your Name" colon={false}>
                  <Input id="username" />
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
          <section className="illustration" />
          <img className="bubble-1" src={require('../../assets/images/monster-blue.png')} alt="" />
          <img className="bubble-2" src={require('../../assets/images/monster-yellow.png')} alt="" />
        </main>
      </div>
    );
  }

  handleRole = (e) => {
    this.setState({
      role: e.target.value
    });
  }

  handleSubmit = (e) => {
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
    this.$client.doConnect(channel, {username, role}).then(_ => {
      this.setState({
        isLogining: false
      }, () => {
        window.location.hash = 'device_testing';
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
}

export default Index;
