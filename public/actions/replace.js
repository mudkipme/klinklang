import _ from "lodash";
import { SELECT_ITEM, SELECT_ALL, REPLACE_TEXT, CHANGE_SOURCE_LNG, CHANGE_RESULT_LNG } from "../constants/replace";
import request from "../utils/request";

export const selectItem = id => ({
  type: SELECT_ITEM,
  payload: { id }
});

export const selectAll = () => ({
  type: SELECT_ALL,
  payload: null
});

export const changeSourceLng = (sourceLng) => ({
  type: CHANGE_SOURCE_LNG,
  payload: { sourceLng }
});

export const changeResultLng = (resultLng) => ({
  type: CHANGE_RESULT_LNG,
  payload: { resultLng }
});

export const convertText = (source) => (dispatch, getState) => {
  const state = getState().replace;
  dispatch({
    type: REPLACE_TEXT,
    payload: request("/api/replace", {
      source: source,
      texts: _.map(_.filter(state.texts, "selected"), "value"),
      sourceLng: state.sourceLng,
      resultLng: state.resultLng
    })
  });
};