/*
 * Created by jemo on 2018-6-14.
 * 课程
 */

import React, { Component } from 'react';
import CourseItem from './CourseItem';
import axios from '../utils/axios';
import Waterfall from './Waterfall';

class Course extends Component {

  // 获取数据
  async getData(currentPage) {
    const response = await axios.get('/course', {
      params: {
        page: currentPage,
        pageSize: 10,
      },
    });
    if(!response || !response.data || response.data.result !== 'ok') {
      console.log('获取商品列表 error: ', response);
      console.log('获取商品列表 error: ' + JSON.stringify(response));
      return;
    }
    const responseData = response.data.data;
    const rows = responseData.rows;
    for(let i = 0; i < rows.length; i++) {
      const item = rows[i];
      const imgArray = item.img.split(',');
      item.img = imgArray[0];
    }
    return {
      rows: responseData.rows,
      maxPage: responseData.maxPage,
    };
  }

  // 获取单元高度
  getHeightForItem(item) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = item.img;
      img.onload = function() {
        resolve(img.height / img.width);
      };
    });
  }

  render() {
    return (
      <Waterfall
        getData={this.getData}
        getHeightForItem={this.getHeightForItem}
        style={{
          marginTop: 10,
          paddingLeft: 8,
          paddingRight: 8,
        }}
        Item={CourseItem}
      />
    );
  }
}

export default Course;
