import React from 'react';
import { Form, Input, Radio, Button, Spin, message } from 'antd';

import './index.scss';
import TitleBar from '../../components/TitleBar';
import { localStorage } from '../../utils/storage';
import { APP_ID } from '../../agora.config'

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.$client = props.client;
  }

  render() {
    let loading;
    if (this.props.isLogining) {
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
              <Form onSubmit={this.props.handleSubmit}>
                <FormItem label="Classroom Name" colon={false}>
                  <Input id="channel" />
                </FormItem>
                <FormItem label="Your Name" colon={false}>
                  <Input id="username" />
                </FormItem>
                <FormItem>
                  <RadioGroup onChange={this.props.handleRole} id="role" defaultValue="student">
                    <Radio value="teacher">Teacher</Radio>
                    <Radio value="student">Student</Radio>
                    <Radio value="audience">Audience</Radio>
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

}

export default Index;
