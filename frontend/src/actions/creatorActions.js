import {backend} from '../config';
import {addTagsOk} from '../actions/viewerActions';

export const colors = ["Aqua","Blue","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod","DarkGray","DarkGrey","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","DarkOrange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGrey","DodgerBlue","FireBrick","ForestGreen","Fuchsia","Gainsboro","Gold","GoldenRod","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","LawnGreen","LightBlue","LightCoral","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSteelBlue","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MistyRose","Moccasin","Navy","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGreen","PaleTurquoise","PaleVioletRed","Peru","Pink","Plum","PowderBlue","Purple","RebeccaPurple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","Sienna","Silver","SkyBlue","SlateBlue","SpringGreen","SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise","Violet","Yellow","YellowGreen"];

export const SET_MODE = 'SET_MODE';
export const GET_LAYERS_OK = 'GET_LAYERS_OK';
export const GET_LAYERS_FAIL = 'GET_LAYERS_FAIL';
export const CLEAR_LAYERS = 'CLEAR_LAYERS';
export const ADD_LAYER_OK = 'ADD_LAYER_OK';
export const ADD_LAYER_FAIL = 'ADD_LAYER_FAIL';
export const DELETE_LAYER_OK = 'DELETE_LAYER_OK';
export const DELETE_LAYER_FAIL = 'DELETE_LAYER_FAIL';

// Actions

export const getLayers = (token) => {
    console.log("onGetLayers");
    return dispatch => {
        let obj = {
            method:"GET",
            mode:"cors",
            credentials: 'include',
            headers:{
                "Content-Type":"application/json",
                token: token
            },
        };
        return fetch(backend + "/api/layers", obj).then((response) => { // 200-499
            if (response.ok) {
                response.json().then((layers) => {
                    dispatch(getLayersOk(layers));
                });
            } else {
                dispatch(getLayersFail(response.status));
            }
        }).catch((error) => { // 500-599
            dispatch(getLayersFail(error));
        });
    };
}

export const addLayer = (token, layer) => {
    console.log("addLayer");
    console.log(layer);
    return dispatch => {
        let obj = {
            method:"POST",
            mode:"cors",
            credentials: 'include',
            headers:{
                "Content-Type": "application/json",
                token: token
            },
            body:JSON.stringify(layer)
        };
        fetch(backend + "/api/layers", obj).then((response) => { // 200-499
            if (response.ok) {
                response.json().then((data) => {
                    console.log(data);
                    layer._id = data._id;
                    dispatch(addTagsOk(layer.tags));
                    dispatch(addLayerOk(layer));
                });
            } else {
                response.json().then((data) => {
                    dispatch(addLayerFail(data.message));
                });
                dispatch(addLayerFail(response.status));
            }
        }).catch((error) => { // 500-599
            dispatch(addLayerFail(error));
        });
    };
}

export const deleteLayer = (token, id) => {
    console.log("deleteLayer");
    return dispatch => {
        let obj = {
            method:"DELETE",
            mode:"cors",
            credentials: 'include',
            headers:{
                "Content-Type": "application/json",
                token: this.props.token
            }
        };
        fetch(backend + "/api/layers/" + id, obj).then((response) => { // 200-499
            if (response.ok) {
                dispatch(deleteLayerOk(id));
            } else {
                response.json().then((data) => {
                    dispatch(deleteLayerFail(data.message));
                });
                dispatch(deleteLayerFail(response.status));
            }
        }).catch((error) => { // 500-599
            dispatch(deleteLayerFail(error));
        });
    };
}

// Action creators

export const setMode = (mode) => {
    return {
        type: SET_MODE,
        mode: mode
    };
}

export const clearLayers = () => {
    return {
        type: CLEAR_LAYERS,
        layers: []
    };
}

export const getLayersOk = (Layers) => {
    return {
        type: GET_LAYERS_OK,
        layers: Layers
    };
}

export const getLayersFail = (error) => {
    return {
        type: GET_LAYERS_OK,
        error: error
    };
}

export const addLayerOk = (layer) => {
    return {
        type: ADD_LAYER_OK,
        layer: layer
    };
}

export const addLayerFail = (error) => {
    return {
        type: ADD_LAYER_FAIL,
        error: error
    };
}

export const deleteLayerOk = (layer) => {
    return {
        type: DELETE_LAYER_OK,
        layer: layer
    };
}

export const deleteLayerFail = (error) => {
    return {
        type: DELETE_LAYER_FAIL,
        error: error
    };
}
