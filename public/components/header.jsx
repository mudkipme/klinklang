import React from 'react';
import Navigation from 'react-toolbox/lib/navigation';
import { Link } from 'react-router';
import AppBar from 'react-toolbox/lib/app_bar';
import style from './style';

const MainAppBar = () => (
  <AppBar className={style.appbar} flat>
    <h1 className={style.title}>神奇宝贝百科工具台</h1>
    <Navigation type="horizontal">
      <ul>
        <li><Link to='/replace'>名词转换器</Link></li>
        <li><Link to='/scss'>层叠样式表转换器</Link></li>
      </ul>
    </Navigation>
  </AppBar>
);

export default MainAppBar;