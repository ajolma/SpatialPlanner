import {
    ADD_TAGS_OK,
    ADD_TAGS_FAIL,
    ADD_CREATORS_OK,
    ADD_CREATORS_FAIL,
    ADD_LAYER_OK,
    ADD_LAYER_FAIL,
    REMOVE_LAYER,
    ADD_TO_LAYER,
    REMOVE_FROM_LAYER
} from '../actions/viewerActions';

const initialState = {
    tags: [],
    creators: [],
    layers: [] // {tag, tags, creator, geometries, sources, srcInfo, color}
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
            tags: action.tags,
            error: ''
        };
    case ADD_TAGS_FAIL:
        return {
            ...state,
            error: action.error
        };
    case ADD_CREATORS_OK:
        return {
            ...state,
            creators: action.creators,
            error: ''
        };
    case ADD_CREATORS_FAIL:
        return {
            ...state,
            error: action.error
        };
    case ADD_LAYER_OK:
        let layers = [];
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
    case REMOVE_LAYER:
        layers = layers = [];
        layers.push(...state.layers);
        layers.splice(action.index, 1);
        return {
            ...state,
            layers: layers,
            error: ''
        };
    case ADD_TO_LAYER:
        layers = layers = [];
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
            layers: layers,
            error: ''
        };
    case REMOVE_FROM_LAYER:
        layers = layers = [];
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
            layers: layers,
            error: ''
        };
    default:
        return state;
    }
}

export default viewerReducer;
