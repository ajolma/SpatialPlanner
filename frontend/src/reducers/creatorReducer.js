import {
    colors,
    SET_MODE,
    GET_CREATOR_LAYERS_OK,
    GET_CREATOR_LAYERS_FAIL,
    CLEAR_CREATOR_LAYERS,
    ADD_CREATOR_LAYER_OK,
    ADD_CREATOR_LAYER_FAIL,
    DELETE_CREATOR_LAYER_OK,
    DELETE_CREATOR_LAYER_FAIL,
    CLEAR_CREATOR_ERROR
} from '../actions/creatorActions';

const initialState = {
    mode: 'Add',
    layers: [],
    error: undefined
}

const creatorReducer = (state=initialState, action) => {
    console.log(action);
    switch (action.type) {
    case SET_MODE:
        return {
            ...state,
            mode: action.mode
        };
    case GET_CREATOR_LAYERS_OK:
        let layers = [];
        layers.push(...state.layers);
        for (let i = 0; i < action.layers.length; i++) {
            action.layers[i].color = colors[i];
            layers.push(action.layers[i]);
        }
        return {
            ...state,
            layers: layers
        };
    case GET_CREATOR_LAYERS_FAIL:
        return {
            ...state,
            error: action.error
        };
    case CLEAR_CREATOR_LAYERS:
        return {
            ...state,
            layers: []
        };
    case ADD_CREATOR_LAYER_OK:
        action.layer.color = colors[state.layers.length];
        layers = [];
        layers.push(...state.layers);
        layers.push(action.layer);
        return {
            ...state,
            layers: layers
        };
    case ADD_CREATOR_LAYER_FAIL:
        return {
            ...state,
            error: action.error
        };
    case DELETE_CREATOR_LAYER_OK:
        layers = [];
        for (let i = 0; i < state.layers.length; i++) {
            if (state.layers[i]._id !== action.id) {
                layers.push(state.layers[i]);
            }
        }
        return {
            ...state,
            layers: layers
        };
    case DELETE_CREATOR_LAYER_FAIL:
        return {
            ...state,
            error: action.error
        };
    case CLEAR_CREATOR_ERROR:
        return {
            ...state,
            error: undefined
        };
    default:
        return state;
    }
}

export default creatorReducer;
