import { SELECT_ITEM, SELECT_ALL, REPLACE_TEXT, CHANGE_SOURCE_LNG, CHANGE_RESULT_LNG } from "../constants/replace";
import every from "lodash/every";

const initialState = {
  languages: [
    { value: "en", text: "English" },
    { value: "ja", text: "日本語" },
    { value: "zh", text: "简体中文" },
  ],
  texts: [
    { value: "pokemon", text: "Pokémon", selected: false },
    { value: "ability", text: "Ability", selected: false },
    { value: "move", text: "Move", selected: false },
    { value: "type", text: "Type", selected: false },
    { value: "item", text: "Item", selected: false },
    { value: "tcg", text: "TCG", selected: false },
    { value: "location", text: "Location", selected: false },
    { value: "nature", text: "Nature", selected: false },
    { value: "trainer-type", text: "Trainer Type", selected: false },
    { value: "location-type", text: "Location Type", selected: false },
    { value: "warrior", text: "Warrior", selected: false },
    { value: "role", text: "Character", selected: false },
    { value: "other", text: "Other", selected: false },
  ],
  sourceLng: "en",
  resultLng: "zh",
  result: "",
};

export default function replace(state = initialState, action) {
  switch (action.type) {
    case CHANGE_SOURCE_LNG:
      return {
        ...state,
        sourceLng: action.payload.sourceLng
      };
    case CHANGE_RESULT_LNG:
      return {
        ...state,
        resultLng: action.payload.resultLng
      };
    case SELECT_ITEM:
      return {
        ...state,
        texts: state.texts.map(item => (
          item.value === action.payload.id ? {...item, selected: !item.selected} : item
        ))
      };
    case SELECT_ALL: {
      const selectedAll = every(state.texts, "selected");
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