import React from 'react';
import Header from './components/header';

export default (props) => (
  <div>
    <Header />
    {props.children}
  </div>
);