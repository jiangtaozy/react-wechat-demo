/*
 * Created by jemo on 2018-6-19.
 * 瀑布流
 * props: {
 *   numColumns: 2, // 列数, 默认为2
 *   getData, // 获取数据函数，参数为 currentPage,
 *            // 返回 { rows, maxPage } 数据列表，最大页数
 *   getHeightForItem, // 获取单元高度，参数为单元数据
 *   style, // 样式
 *   Item, // 单元组件
 * }
 */

import React, { Component } from 'react';
import List from './List';

class Waterfall extends Component {
  constructor(props) {
    super(props);
    const numColumns = this.props.numColumns || 2;
    const columns = Array.from({
      length: numColumns,
    }).map((col, i) => ({
      index: i,
      totalHeight: 0,
      data: [],
      heights: [],
    }));
    this.state = {
      currentPage: 1, // 当前页，默认第一页
      maxPage: 1, // 总页数，默认一页
      columns,
    };
    this.handleScroll = this.handleScroll.bind(this);
    this.onScrollBottom = this.onScrollBottom.bind(this);
    this.getColumnsData = this.getColumnsData.bind(this);
  }

  componentDidMount() {
    this.getColumnsData();
    window.onscroll = this.handleScroll;
  }

  componentWillUnmount() {
    window.onscroll = null;
  }

  handleScroll() {
    const clientHeight = document.getElementById('root').clientHeight;
    const scrollY = window.scrollY;
    const innerHeight = window.innerHeight;
    if((scrollY + innerHeight) === clientHeight) {
      this.onScrollBottom();
    }
  }

  onScrollBottom() {
    this.getColumnsData();
  }

  // 获取瀑布流数据
  async getColumnsData() {
    let { currentPage, maxPage, columns } = this.state;
    if(currentPage > maxPage) {
      console.log('没有更多了');
      return;
    }
    try {
      const data = await this.props.getData(currentPage);
      for(let i = 0; i < data.rows.length; i++) {
        const item = data.rows[i];
        const height = await this.props.getHeightForItem(item);
        const column = columns.reduce(
          (prev, cur) => (cur.totalHeight < prev.totalHeight ? cur : prev),
          columns[0],
        );
        column.data.push(item);
        column.heights.push(height);
        column.totalHeight += height;
      }
      currentPage++;
      this.setState({
        columns,
        currentPage,
        maxPage: data.maxPage,
      });
    }
    catch(error) {
      console.error('error: ', error);
      console.error('error: ' + error.message);
    }
  }

  render() {
    const { columns } = this.state;
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          ...this.props.style,
        }}>
        { columns.map((column, index) =>
          <List
            data={column.data}
            key={index}
            Item={this.props.Item}
          />
        )}
      </div>
    );
  }
}

export default Waterfall;
