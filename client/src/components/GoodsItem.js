/*
 * Created by jemo on 2018-6-14.
 * 商品单元
 * props: {
 *   data: {
 *     img,
 *     title,
 *   },
 * }
 */

import React, { Component } from 'react';
import { store } from '../configureStore';
import { push } from 'react-router-redux';

class GoodsItem extends Component {

  render() {
    const { data } = this.props;
    const innerWidth = window.innerWidth;
    return (
      <div
        onClick={() => { store.dispatch(push(`/goods/${data.id}`)); }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: innerWidth / 2 - 12,
        }}>
        <img
          style={{
            width: innerWidth / 2 - 12,
            borderRadius: 4,
          }}
          src={data.img}
          alt={''}
        />
        <div
          style={{
            fontSize: 12,
            margin: 5,
            overflow: 'hidden',
            lineHeight: '20px',
            height: 40,
          }}>
          {data.title}
        </div>
      </div>
    );
  }
}

export default GoodsItem;
