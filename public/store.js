import { createStore, applyMiddleware } from "redux";
import reducers from "./reducers";
import promiseMiddleware from "redux-promise-middleware";
import thunkMiddleware from "redux-thunk";

export const create = () => createStore(reducers, {}, applyMiddleware(
  thunkMiddleware,
  promiseMiddleware()
));
export default create();