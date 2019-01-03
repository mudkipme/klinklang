import Router from "koa-router";
import React from "react";
import { renderToString } from "react-dom/server";
import { SheetsRegistry } from "react-jss/lib/jss";
import JssProvider from "react-jss/lib/JssProvider";
import { create } from "jss";
import preset from "jss-preset-default";
import { MuiThemeProvider, createMuiTheme, createGenerateClassName } from "@material-ui/core/styles";
import StaticRouter from "react-router-dom/StaticRouter";
import { Provider as ReduxProvider } from "react-redux";
import { create as createStore } from "../../public/store";
import App from "../../public/app";

const stats = require("../../stats.generated.json");
const router = new Router();

router.get(/(^\/$|^\/(?!api))/, async (ctx) => {
  const sheetsRegistry = new SheetsRegistry();
  const theme = createMuiTheme({
    typography: {
      useNextVariants: true,
    },
  });
  const jss = create(preset());
  const generateClassName = createGenerateClassName();
  const context = {};
  const store = createStore();

  const html = renderToString(
    <JssProvider registry={sheetsRegistry} jss={jss} generateClassName={generateClassName}>
      <MuiThemeProvider theme={theme} sheetsManager={new Map()}>
        <ReduxProvider store={store}>
          <StaticRouter location={ctx.url} context={context}>
            <App />
          </StaticRouter>
        </ReduxProvider>
      </MuiThemeProvider>
    </JssProvider>
  );

  if (context.notFound) {
    ctx.response.status = 404;
  }

  const css = sheetsRegistry.toString();
  ctx.response.body = renderFullPage(html, css);
});

function renderFullPage(html, css) {
  return `
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>52Poké Wiki Utilities</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <meta name="format-detection" content="telephone=no">
    <meta name="HandheldFriendly" content="True">
  </head>

  <body>
    <style id="jss-server-side">${css}</style>
    <div id="app">${html}</div>
    <script src="/build/${Array.isArray(stats.main) ? stats.main[0] : stats.main}"></script>
  </body>
</html>
  `;
}

export default router;