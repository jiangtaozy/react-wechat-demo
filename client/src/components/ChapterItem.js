/*
 * Created by jemo on 2018-6-25.
 * 章节单元
 * props: {
 *   data: {
 *     title, // 标题
 *     start_time, // 开课时间
 *     study_number, // 学习次数
 *   }
 * }
 */

import React, { Component } from 'react';

class ChapterItem extends Component {
  render() {
    const { data, index } = this.props;
    return(
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}>
        {/* 标题 */}
        <div
          style={{
            fontSize: 16,
            paddingBottom: 15,
          }}>
          {`${index + 1}. ${data.title}`}
        </div>
        {/* 时间 学习次数 */}
        <div
          style={{
            fontSize: 12,
            color: 'gray',
            paddingBottom: 15,
            borderBottom: '1px solid #dedede',
            marginBottom: 15,
          }}>
          {data.start_time || ''}
          <span style={{
            paddingLeft: 10,
            }}>
            {`${data.study_number || 0}次学习`}
          </span>
        </div>
      </div>
    );
  }
}

export default ChapterItem;

