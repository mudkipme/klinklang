import { SELECT_ITEM, SELECT_ALL, REPLACE_TEXT } from '../constants/replace';

const initialState = {
  languages: [
    { value: 'en', text: '英文' },
    { value: 'ja', text: '日文' },
    { value: 'zh', text: '中文' },
  ],
  texts: [
    { value: 'pokemon', text: '宝可梦', selected: false },
    { value: 'ability', text: '特性', selected: false },
    { value: 'move', text: '招式', selected: false },
    { value: 'type', text: '属性', selected: false },
    { value: 'item', text: '道具', selected: false },
    { value: 'tcg', text: '卡片游戏', selected: false },
    { value: 'location', text: '地点', selected: false },
    { value: 'nature', text: '性格', selected: false },
    { value: 'trainer-type', text: '训练家类型', selected: false },
    { value: 'location-type', text: '地点类型', selected: false },
    { value: 'warrior', text: '武将', selected: false },
    { value: 'role', text: '人物', selected: false },
    { value: 'other', text: '其他', selected: false },
  ],
  sourceLng: 'en',
  resultLng: 'zh',
  result: '',
};

export default function replace(state = initialState, action) {
  switch (action.type) {
    case SELECT_ITEM:
      return {
        ...state,
        texts: state.texts.map(item => (
          item.value === action.payload.id ? {...item, selected: !item.selected} : item
        ))
      };
    case SELECT_ALL: {
      const selectedAll = _.every(state.texts, 'selected');
      return {
        ...state,
        texts: state.texts.map(item => ({...item, selected: !selectedAll}))
      };
    }
    case `${REPLACE_TEXT}_FULFILLED`:
      return {
        ...state,
        result: action.payload.text
      };
    default:
      return state;
  }
}