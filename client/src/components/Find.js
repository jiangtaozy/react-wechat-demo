/*
 * Created by jemo on 2018-6-14.
 * 发现
 */

import React, { Component } from 'react';
import GoodsItem from './GoodsItem';
import axios from '../utils/axios';
import Waterfall from './Waterfall';

class Find extends Component {

  // 获取数据
  async getData(currentPage) {
    try {
      const response = await axios.get('/item', {
        params: {
          page: currentPage,
          pageSize: 10,
        },
      });
      if(!response || !response.data || response.data.result !== 'ok') {
        console.error('error: ', response);
        console.error('error: ' + JSON.stringify(response));
        return;
      }
      const responseData = response.data.data;
      const data = responseData.rows;
      for(let i = 0; i < data.length; i++) {
        const item = data[i];
        const imageArray = item.main_images.split(',');
        item.img = imageArray[0];
      }
      return {
        rows: responseData.rows,
        maxPage: responseData.maxPage,
      };
    }
    catch(error) {
      console.error('error: ', error);
      console.error('error: ' + JSON.stringify(error));
    }
  }

  // 获取单元高度
  getHeightForItem(item) {
    return new Promise((resolve, reject) => {
      let img = new Image();
      img.src = item.img;
      img.onload = function() {
        resolve(img.height / img.width);
      }
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
        Item={GoodsItem}
      />
    );
  }
}

export default Find;
