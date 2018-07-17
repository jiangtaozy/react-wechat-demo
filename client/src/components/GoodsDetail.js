/*
 * Created by jemo on 2018-6-22.
 * 商品详情
 */

import React, { Component } from 'react';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import { connect } from 'react-redux'
import { css } from 'glamor';
import { configWechat } from '../reducers/jssdk/actions';


// 设置innerHTML img max-width
css.insert('img { max-width: 100%}');

class GoodsDetail extends Component {
  constructor() {
    super();
    this.state = {
      id: '',
      title: '',
      oldPrice: '',
      currentPrice: '',
      imageArray: '',
      detail: '',
    };
  }

  async componentDidMount() {
    const { match } = this.props;
    const id = match.params.id;
    try {
      const response = await axios.get(`/item/${id}`);
      if(response.data && response.data.result === 'ok') {
        const data = response.data.data;
        this.setState({
          id: data.id,
          title: data.title,
          oldPrice: data.old_price,
          currentPrice: data.current_price,
          imageArray: data.main_images.split(','),
          detail: data.details
        });

        // 配置微信分享参数,title,description,image(标题，描述，缩略图)
        let { dispatch } = this.props;
        dispatch(configWechat({
          title: data.title,
          description: data.title,
          image: data.main_images.split(',')[0],
        }));
      } else {
        console.error('error: ', response);
        toast.error('网络错误');
      }
    }
    catch(error) {
      console.error('error: ', error.message);
      toast.error('网络错误');
    }
  }

  render() {
    const { title, oldPrice, currentPrice, imageArray, detail } = this.state;
    return(
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}>
        <img
          src={imageArray[0]}
          alt=''
          style={{
            width: '100%',
            height: 300,
            objectFit: 'cover',
          }}
        />
        <div
          style={{
            display: 'flex',
            color: '#FF4500',
            fontSize: 16,
            paddingLeft: 10,
            paddingTop: 10,
          }}>
          ￥ {currentPrice}
        </div>
        <div
          style={{
            color: 'gray',
            fontSize: 12,
            paddingLeft: 10,
          }}>
          价格<span style={{textDecoration: 'line-through'}}>￥ {oldPrice}</span>
        </div>
        <div
          style={{
            padding: 10,
            fontSize: 14,
            fontWeight: 'bold',
            color: 'black',
          }}>
          {title}
        </div>
        <div
          dangerouslySetInnerHTML={{__html: detail}}
          style={{
            paddingLeft: 10,
            paddingRight: 10,
          }}
        />
      </div>
    );
  }
}

export default connect()(GoodsDetail);
