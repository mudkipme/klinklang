import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './app';
import Replace from './components/replace';
import SCSS from './components/scss';

export default (
  <Route path="/" component={App}>
    <Route path="scss" component={SCSS} />
    <IndexRoute component={Replace} />
  </Route>
);