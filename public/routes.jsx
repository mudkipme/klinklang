import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './app';
import Replace from './components/replace';

export default (
  <Route path="/" component={App}>
    <IndexRoute component={Replace} />
  </Route>
);