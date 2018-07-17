/*
 * Created by jemo on 2018-6-22.
 * 课程单元
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

class CourseItem extends Component {

  render() {
    const { data } = this.props;
    const innerWidth = window.innerWidth;
    return (
      <div
        onClick={() => {
          store.dispatch(push(`/course/${data.id}`));
        }}
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

export default CourseItem;
