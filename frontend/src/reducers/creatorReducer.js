import {
    colors,
    SET_MODE,
    GET_LAYERS_OK,
    GET_LAYERS_FAIL,
    CLEAR_LAYERS,
    ADD_LAYER_OK,
    ADD_LAYER_FAIL,
    DELETE_LAYER_OK,
    DELETE_LAYER_FAIL
} from '../actions/creatorActions';

const initialState = {
    mode: 'Add',
    layers: []
}

const creatorReducer = (state=initialState, action) => {
    console.log(action);
    switch (action.type) {
    case SET_MODE:
        return {
            ...state,
            mode: action.mode,
            error: ''
        };
    case GET_LAYERS_OK:
        let layers = [];
        layers.push(...state.layers);
        for (let i = 0; i < action.layers.length; i++) {
            action.layers[i].color = colors[i];
            layers.push(action.layers[i]);
        }
        return {
            ...state,
            layers: layers,
            error: ''
        };
    case GET_LAYERS_FAIL:
        return {
            ...state,
            error: action.error
        };
    case CLEAR_LAYERS:
        return {
            ...state,
            layers: [],
            error: ''
        };
    case ADD_LAYER_OK:
        action.layer.color = colors[state.layers.length];
        layers = [];
        layers.push(...state.layers);
        layers.push(action.layer);
        return {
            ...state,
            layers: layers,
            error: ''
        };
    case ADD_LAYER_FAIL:
        return {
            ...state,
            error: action.error
        };
    case DELETE_LAYER_OK:
        layers = [];
        for (let i = 0; i < state.layers.length; i++) {
            if (state.layers[i]._id !== action.id) {
                layers.push(state.layers[i]);
            }
        }
        return {
            ...state,
            layers: layers,
            error: ''
        };
    case DELETE_LAYER_FAIL:
        return {
            ...state,
            error: action.error
        };
    default:
        return state;
    }
}

export default creatorReducer;
