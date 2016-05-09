import React from 'react';
import Header from './components/header';
import style from './style';

export default (props) => (
  <div>
    <Header />
    {props.children}
  </div>
);