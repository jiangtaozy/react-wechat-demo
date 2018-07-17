import React, { Component } from 'react';
import { ConnectedRouter } from 'react-router-redux';
import { Route } from 'react-router-dom';
import { history } from '../configureStore';
import Home from './Home';
import About from './About';
import RegisterModal from './RegisterModal';
import GoodsDetail from './GoodsDetail';
import CourseDetail from './CourseDetail';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { css } from 'glamor';

class App extends Component {

  render() {
    return (
      <ConnectedRouter history={history}>
        <div>
          <Route exact path='/' component={Home} />
          <Route path='/about' component={About} />
          {/* 首页 */}
          <Route path='/home' component={Home} />
          {/* 商品详情 */}
          <Route path='/goods/:id' component={GoodsDetail} />
          {/* 课程详情 */}
          <Route path='/course/:id' component={CourseDetail} />
          {/* 绑定手机号 */}
          <RegisterModal />
          {/* Toast */}
          <ToastContainer
            autoClose={2000}
            closeButton={false}
            hideProgressBar={true}
            style={{
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              transform: 'translate(-50%, -50%)',
              width: 200,
            }}
            bodyClassName={css({
              textAlign: 'center',
            })}
            toastClassName={css({
              borderRadius: 4,
            })}
          />
        </div>
      </ConnectedRouter>
    );
  }
}

export default App;
