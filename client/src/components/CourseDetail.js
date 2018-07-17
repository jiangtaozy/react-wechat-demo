/*
 * Created by jemo on 2018-6-25.
 * 课程详情
 */

import React, { Component } from 'react';
import List from './List';
import ChapterItem from './ChapterItem';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { configWechat } from '../reducers/jssdk/actions';

class CourseDetail extends Component {
  constructor() {
    super()
    this.state = {
      imgArray: [''],
      title: '',
      oldPrice: 0,
      currentPrice: 0,
      detail: '',
      totalChapterNumber: 0,
      updatedChapterNumber: 0,
      chapter: [
        {
          title: '',
          start_time: '',
          study_number: 0,
        },
      ],
    }
  }

  async componentDidMount() {
    const { match, dispatch } = this.props;
    const id = match.params.id;
    try {
      const response = await axios.get(`/course/${id}`);
      if(response.data.result === 'ok') {
        const data = response.data.data;
        this.setState({
          imgArray: data.img.split(','),
          title: data.title,
          oldPrice: data.old_price,
          currentPrice: data.current_price,
          detail: data.details,
          totalChapterNumber: data.total_chapter_number,
          updatedChapterNumber: data.updated_chapter_number,
          chapter: data.course_chapter,
        });
        // 配置微信分享参数,title,description,image(标题，描述，缩略图)
        dispatch(configWechat({
          title: data.title,
          description: data.title,
          image: data.img.split(',')[0],
        }));
      }
    }
    catch(error) {
      console.error('error: ', error.message);
      toast.error('网络错误');
    }
  }

  render() {
    const { imgArray, title, detail, totalChapterNumber, updatedChapterNumber, chapter } = this.state;
    return(
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}>
        {/* 主图 */}
        <img
          src={imgArray[0]}
          alt=''
          style={{
            width: '100%',
            height: 300,
            objectFit: 'cover',
          }}
        />
        {/* 标题 */}
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            paddingLeft: 15,
            paddingTop: 15,
            paddingRight: 15,
            paddingBottom: 10,
          }}>
          {title}
        </div>
        {/* 已开课，共开课 */}
        <div
          style={{
            fontSize: 12,
            color: 'gray',
            paddingTop: 5,
            paddingLeft: 15,
          }}>
          {`已开${updatedChapterNumber}课 | 共${totalChapterNumber}课`}
        </div>
        {/* 详情 */}
        <div
          dangerouslySetInnerHTML={{__html: detail}}
          style={{
            paddingLeft: 15,
            paddingRight: 15,
          }}
        />
        {/* 课程列表 */}
        <div
          style={{
            borderTop: '1px solid #dedede',
            marginLeft: 15,
            marginRight: 15,
          }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              marginTop: 15,
              marginBottom: 15,
              paddingLeft: 10,
              borderLeft: '3px solid red',
            }}>
            课程列表
          </div>
          <List
            data={chapter}
            Item={ChapterItem}
          />
        </div>
      </div>
    );
  }
}

export default connect()(CourseDetail);
