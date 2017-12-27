import React from "react";
import { Route, Switch } from "react-router-dom";
import Header from "./components/header";
import Footer from "./components/footer";
import Replace from "./components/replace";
import Empty from "./components/empty";

const App = () => (
  <div>
    <Header />
    <Switch>
      <Route path="/replace" component={Replace} />
      <Route path="/" exact component={Replace} />
      <Route component={Empty} />
    </Switch>
    <Footer />
  </div>
);

export default App;