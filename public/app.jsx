import React from "react";
import { Route, Switch } from "react-router-dom";
import Header from "./components/header";
import Replace from "./components/replace";

const App = () => (
  <div>
    <Header />
    <Switch>
      <Route path="/replace" component={Replace} />
      <Route path="/" exact component={Replace} />
    </Switch>
  </div>
);

export default App;