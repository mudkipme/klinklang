import React, { Component } from "react";
import { hydrate } from "react-dom";
import { MuiThemeProvider, createMuiTheme } from "material-ui/styles";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";
import store from "./store";
import App from "./app";

class Main extends Component {
  componentDidMount() {
    const jssStyles = document.getElementById("jss-server-side");
    if (jssStyles && jssStyles.parentNode) {
      jssStyles.parentNode.removeChild(jssStyles);
    }
  }

  render() {
    return (
      <App {...this.props} />
    );
  }
}

const theme = createMuiTheme();

hydrate((
  <MuiThemeProvider theme={theme}>
    <ReduxProvider store={store}>
      <Router>
        <Main />
      </Router>
    </ReduxProvider>
  </MuiThemeProvider>
), document.getElementById("app"));