/*
 * Created by jemo on 2018-6-14.
 * 列表
 */

import React, { Component } from 'react';

class List extends Component {
  render() {
    const { data, Item } = this.props;
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}>
        { data.map((itemData, index) =>
          <Item
            data={itemData}
            index={index}
            key={index}
          />
        )}
      </div>
    );
  }
}

export default List;
