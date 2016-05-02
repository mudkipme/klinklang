import React from 'react';
import Navigation from 'react-toolbox/lib/navigation';
import Link from 'react-toolbox/lib/link';
import AppBar from 'react-toolbox/lib/app_bar';
import style from './style';

const MainAppBar = () => (
  <AppBar className={style.appbar} flat>
    <h1 className={style.title}>神奇宝贝百科工具台</h1>
    <Navigation type="horizontal">
      <Link href='/' label='名词转换器' />
      <Link href='/scss' label='层叠样式表转换器' />
    </Navigation>
  </AppBar>
);

export default MainAppBar;