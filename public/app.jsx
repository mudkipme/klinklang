import React, { Fragment } from "react";
import { Route, Switch } from "react-router-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import Header from "./components/header";
import Footer from "./components/footer";
import Replace from "./components/replace";
import Empty from "./components/empty";

const App = () => (
  <Fragment>
    <CssBaseline />
    <Header />
    <Switch>
      <Route path="/replace" component={Replace} />
      <Route path="/" exact component={Replace} />
      <Route component={Empty} />
    </Switch>
    <Footer />
  </Fragment>
);

export default App;