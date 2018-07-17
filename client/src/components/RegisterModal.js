/*
 * Created by jemo on 2018-6-20.
 * 注册弹框
 */

import React, { Component } from 'react';
import Modal from 'react-modal';
import axios from '../utils/axios';
import { toast } from 'react-toastify';

Modal.setAppElement('#root');
const phoneNumberREG = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/;
const passwordREG = /^(\w){6,16}$/;

class RegisterModal extends Component {

  constructor() {
    super();
    this.state = {
      showModal: false,
      //showModal: true,
      phone: '',
      code: '',
      password: '',
      repeatPassword: '',
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleGetCode = this.handleGetCode.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidMount() {
    /* test
    */
    try {
      const response = await axios.get('/user');
      if(!response.data || response.data.result !== 'ok') {
        console.log('error: ', response);
        console.log('error: ', JSON.stringify(response));
        return
      }
      const responseData = response.data.data;
      if(!responseData || !responseData.phone) {
        this.setState({
          showModal: true,
        });
      }
    }
    catch(error) {
      console.log('error: ', error);
      console.log('error: ' + error.message);
    }
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({
      [name]: value,
    });
  }

  async handleGetCode() {
    const { phone } = this.state;
    if(!phone) {
      toast.error('请输入手机号');
      return;
    }
    if(!phoneNumberREG.test(phone)) {
      toast.error('手机号格式不正确');
      return;
    }
    try {
      const response = await axios.post('/code', {
        phone,
      });
      if(response.data && response.data.result === 'ok') {
        toast.success('发送成功');
      } else {
        toast.error('发送失败');
        console.log('response: ', response);
      }
    }
    catch(error) {
      toast.error('网络出错啦!');
      console.log('error: ', error.message);
    }
  }

  async handleSubmit() {
    const { phone, code, password, repeatPassword } = this.state;
    if(!phone) {
      toast.error('请输入手机号');
      return;
    }
    if(!phoneNumberREG.test(phone)) {
      toast.error('手机号格式不正确');
      return;
    }
    if(!code) {
      toast.error('请输入验证码');
      return;
    }
    if(!password) {
      toast.error('请输入密码');
      return;
    }
    if(!passwordREG.test(password)) {
      toast.error('请输入6-16个字符不含空格的密码');
      return;
    }
    if(password !== repeatPassword) {
      toast.error('两次密码不一致');
      return;
    }
    try {
      const response = await axios.post('/bind', {
        phone,
        captcha: code,
        password,
      });
      if(response.data && response.data.result === 'ok') {
        toast.success('绑定成功');
        this.setState({
          showModal: false,
        });
      } else {
        console.error('response: ', response);
        toast.error('绑定失败');
      }
    }
    catch(error) {
      console.error('error: ', error.message);  
      toast.error('绑定失败');
    }
  }

  render() {
    return(
      <div>
        <Modal
          isOpen={this.state.showModal}
          style={{
            content : {
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              marginRight: '-50%',
              padding: 30,
              transform: 'translate(-50%, -50%)'
            }
          }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}>
            {/* 提示 */}
            <div
              style={{
                fontSize: 12,
                color: '#949494'
              }}>
              请先绑定手机号
            </div>
            {/* 手机号 */}
            <div
              style={styles.inputContainer}>
              <input
                name='phone'
                type='text'
                value={this.state.phone}
                onChange={this.handleInputChange}
                placeholder='手机号'
                style={{
                  border: 'none',
                }}
              />
            </div>
            {/* 验证码 */}
            <div
              style={styles.inputContainer}>
              <input
                name='code'
                type='text'
                value={this.state.code}
                onChange={this.handleInputChange}
                placeholder='验证码'
                style={{
                  border: 'none',
                }}
              />
              <div
                onClick={this.handleGetCode}
                style={{
                  color: '#a1a1a1',
                  fontSize: 14,
                  lineHeight: '50px',
                }}>
                获取验证码
              </div>
            </div>
            {/* 密码 */}
            <div
              style={styles.inputContainer}>
              <input
                name='password'
                type='password'
                value={this.state.password}
                onChange={this.handleInputChange}
                placeholder='密码(6-16个字符，不含空格)'
                style={{
                  border: 'none',
                }}
              />
            </div>
            {/* 重复密码 */}
            <div
              style={styles.inputContainer}>
              <input
                name='repeatPassword'
                type='password'
                value={this.state.repeatPassword}
                onChange={this.handleInputChange}
                placeholder='再次输入密码'
                style={{
                  border: 'none',
                }}
              />
            </div>
            {/* 立即绑定 */}
            <div
              onClick={this.handleSubmit}
              style={{
                height: 40,
                marginTop: 40,
                backgroundColor: '#00cd66',
                borderRadius: 20,
                color: 'white',
                fontSize: 14,
                lineHeight: '40px',
                textAlign: 'center',
              }}>
              立即绑定
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

const styles = {
  inputContainer: {
    display: 'flex',
    borderBottom: '1px solid #b5b5b5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
    height: 50,
  },
}

export default RegisterModal;
