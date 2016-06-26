import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import theme from './theme/theme';

import App from './app';
import Replace from './components/replace';
import SCSS from './components/scss';

render((
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <Route path="scss" component={SCSS} />
      <IndexRoute component={Replace} />
    </Route>
  </Router>
), document.getElementById('app'));