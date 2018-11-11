import {
    ADD_TAGS_OK,
    ADD_TAGS_FAIL,
    ADD_CREATORS_OK,
    ADD_CREATORS_FAIL,
    ADD_VIEWER_LAYER_OK,
    ADD_VIEWER_LAYER_FAIL,
    REMOVE_VIEWER_LAYER,
    ADD_TO_VIEWER_LAYER,
    REMOVE_FROM_VIEWER_LAYER,
    CLEAR_VIEWER_LAYERS,
    CLEAR_VIEWER_ERROR
} from '../actions/viewerActions';

const initialState = {
    tags: [],
    creators: [],
    layers: [], // {tag, tags, creator, geometries, sources, srcInfo, color}
    error: undefined
}

const viewerReducer = (state=initialState, action) => {
    console.log(action);
    switch (action.type) {
    case ADD_TAGS_OK:
        let tags = state.tags;
        for (let i = 0; i < action.tags.length; i++) {
            if (tags.indexOf(action.tags[i]) === -1) {
                tags.push(action.tags[i]);
            }
        }
        return {
            ...state,
            tags: action.tags
        };
    case ADD_TAGS_FAIL:
        return {
            ...state,
            error: action.error
        };
    case ADD_CREATORS_OK:
        return {
            ...state,
            creators: action.creators
        };
    case ADD_CREATORS_FAIL:
        return {
            ...state,
            error: action.error
        };
    case ADD_VIEWER_LAYER_OK:
        let layers = [];
        layers.push(...state.layers);
        layers.push(action.layer);
        return {
            ...state,
            layers: layers
        };
    case ADD_VIEWER_LAYER_FAIL:
        return {
            ...state,
            error: action.error
        };
    case REMOVE_VIEWER_LAYER:
        layers = [];
        for (let i = 0; i < state.layers.length; i++) {
            if (state.layers[i].id !== action.id) {
                layers.push(state.layers[i]);
            }
        }
        return {
            ...state,
            layers: layers
        };
    case ADD_TO_VIEWER_LAYER:
        layers = [];
        layers.push(...state.layers);
        let sources = [];
        let geometries = [];
        for (let i = 0; i < action.layer.geometries.length; i++) {
            sources.push(action.layer.sources[i]);
            geometries.push(action.layer.geometries[i]);
        }
        for (let i = 0; i < action.add.geometries.length; i++) {
            sources.push(action.add._id);
            geometries.push(action.add.geometries[i]);
        }
        action.layer.sources = sources;
        action.layer.geometries = geometries;
        action.layer.srcInfo[action.add._id] = {
            tags: action.add.tags,
            creator: action.add.creator
        };
        return {
            ...state,
            layers: layers
        };
    case REMOVE_FROM_VIEWER_LAYER:
        layers = [];
        layers.push(...state.layers);
        sources = [];
        geometries = [];
        for (let i = 0; i < action.layer.geometries.length; i++) {
            if (action.layer.sources[i] !== action.remove._id) {
                sources.push(action.layer.sources[i]);
                geometries.push(action.layer.geometries[i]);
            }
        }
        action.layer.sources = sources;
        action.layer.geometries = geometries;
        return {
            ...state,
            layers: layers
        };
    case CLEAR_VIEWER_LAYERS:
        return {
            ...state,
            layers: []
        };
    case CLEAR_VIEWER_ERROR:
        return {
            ...state,
            error: undefined
        };
    default:
        return state;
    }
}

export default viewerReducer;
