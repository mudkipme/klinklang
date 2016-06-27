import _ from 'lodash';
import { SELECT_ITEM, SELECT_ALL, REPLACE_TEXT } from '../constants/replace';
import request from '../utils/request';

export const selectItem = id => ({
  type: SELECT_ITEM,
  payload: { id }
});

export const selectAll = () => ({
  type: SELECT_ALL,
  payload: null
});

export const convertText = (source) => (dispatch, getState) => {
  const state = getState();
  dispatch({
    type: REPLACE_TEXT,
    payload: request('/api/replace', {
      source: source,
      texts: _.map(_.filter(state.texts, 'selected'), 'value'),
      sourceLng: state.sourceLng,
      resultLng: state.resultLng
    })
  });
};