/*
 * Created by jemo on 2018-6-6.
 * 主页
 */

import React, { Component } from 'react';
import { connect } from 'react-redux'
import { NavLink, Route } from 'react-router-dom';
//import { configWechat } from '../reducers/jssdk/actions';

import Find from './Find';
import Course from './Course';

class Home extends Component {

  componentDidMount() {
    // 设置标题
    document.title = "艺艘航母";

    /*
    // 配置微信分享参数,title,description,image(标题，描述，缩略图)
    let { dispatch } = this.props;
    let location = window.location;
    let imgUrl = location.protocol + '//' + location.hostname + '/image/art-carrier-logo.png';
    //console.log('imgUrl: ' + imgUrl);
    dispatch(configWechat({
      title:       "艺艘航母",
      description: "艺术航母，扬帆起航",
      image:       imgUrl,
    }));
    */
  }

  render() {
    return(
      <div style={{
        display: 'flex',
        flexDirection: 'column',
      }}>
        { /* 顶部导航 */ }
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: 8,
        }}>
          { /* 发现 */ }
          <NavLink
            to='/home/find'
            style={{
              marginRight: 10,
              fontSize: 16,
              color: 'gray',
              padding: 3,
              textDecoration: 'none',
            }}
            activeStyle={{
              color: 'black',
              borderBottomWidth: 2,
              borderBottomStyle: 'solid',
              borderBottomColor: 'red',
            }}>
            发现
          </NavLink>
          { /* 课程 */ }
          <NavLink
            to='/home/course'
            style={{
              marginLeft: 10,
              fontSize: 16,
              color: 'gray',
              padding: 3,
              textDecoration: 'none',
            }}
            activeStyle={{
              color: 'black',
              borderBottomWidth: 2,
              borderBottomStyle: 'solid',
              borderBottomColor: 'red',
            }}>
            课程
          </NavLink>
        </div>
        { /* 导航内容 */ }
        <div>
          <Route
            exact
            path='/'
            component={Find} />
          <Route
            path='/home/find'
            component={Find} />
          <Route
            path='/home/course'
            component={Course} />
        </div>
      </div>
    );
  }
}

export default connect()(Home);
