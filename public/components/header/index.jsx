import React from 'react';
import Navigation from 'react-toolbox/lib/navigation';
import { IndexLink, Link } from 'react-router';
import AppBar from 'react-toolbox/lib/app_bar';
import style from './style';

const MainAppBar = () => (
  <AppBar className={style.appbar} flat>
    <h1 className={style.title}>神奇宝贝百科工具台</h1>
    <nav className={style.navigation}>
      <ul>
        <li><IndexLink activeClassName={style.active} to='/'>名词转换器</IndexLink></li>
        <li><Link activeClassName={style.active} to='/scss'>层叠样式表转换器</Link></li>
      </ul>
    </nav>
  </AppBar>
);

export default MainAppBar;