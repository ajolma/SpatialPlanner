import {backend} from '../config';
import openSocket from 'socket.io-client';

export const ADD_TAGS_OK = 'ADD_TAGS_OK';
export const ADD_TAGS_FAIL = 'ADD_TAGS_FAIL';
export const ADD_CREATORS_OK = 'ADD_CREATORS_OK';
export const ADD_CREATORS_FAIL = 'ADD_CREATORS_FAIL';
export const ADD_LAYER_OK = 'ADD_LAYERS_OK,';
export const ADD_LAYER_FAIL = 'ADD_LAYERS_FAIL';
export const REMOVE_LAYER = 'REMOVE_LAYER';
export const ADD_TO_LAYER = 'ADD_TO_LAYER';
export const REMOVE_FROM_LAYER = 'REMOVE_FROM_LAYER';

// Actions

export const addTags = () => {
    console.log("addTags");
    return dispatch => {
        let obj = {
            method:"GET",
            mode:"cors",
            credentials: 'include',
            headers:{"Content-Type":"application/json"}
        };
        return fetch(backend + "/tags", obj).then((response) => { // 200-499
            if (response.ok) {
                response.json().then((tags) => {
                    dispatch(addTagsOk(tags));
                }).catch(() => {
                    dispatch(addTagsFail("JSON parse error."));
                });
            } else {
                dispatch(addTagsFail(response.status));
            }
        }).catch((error) => { // 500-599
            dispatch(addTagsFail(error));
        });
    };
};

export const addCreators = () => {
    console.log("addCreators");
    return dispatch => {
        let obj = {
            method:"GET",
            mode:"cors",
            credentials: 'include',
            headers:{"Content-Type":"application/json"}
        };
        return fetch(backend + "/creators", obj).then((response) => { // 200-499
            if (response.ok) {
                response.json().then((creators) => {
                    dispatch(addCreatorsOk(creators));
                }).catch(() => {
                    dispatch(addCreatorsFail("JSON parse error."));
                });
            } else {
                dispatch(addCreatorsFail(response.status));
            }
        }).catch((error) => { // 500-599
            dispatch(addCreatorsFail(error));
        });
    };
};

const layerMatches = (creatorLayer, viewerLayer) => {
    console.log("layerMatches");
    // test that all tags in myLayer are in creatorLayer
    // and that creatorLayer.creator === viewerLayer.creator if viewerLayer.creator
    //   is defined
    let matches = true;
    if (creatorLayer.tags.indexOf(viewerLayer.tag) === -1) {
        matches = false;
    }
    if (matches) {
        for (let i = 0; i < viewerLayer.tags.length; i++) {
            if (creatorLayer.tags.indexOf(viewerLayer.tags[i]) === -1) {
                matches = false;
                break;
            }
        }
    }
    if (matches && viewerLayer.creator) {
        if (creatorLayer.creator !== viewerLayer.creator) {
            matches = false;
        }
    }
    console.log("matches:"+matches);
    return matches;
};

const getLayer = (id) => {
    console.log("getLayer");
    return new Promise((resolve, reject) => {
        let obj = {
            method: "GET",
            mode: "cors",
            credentials: 'include',
            headers: {"Content-Type":"application/json"}
        };
        fetch(backend + "/layers/" + id, obj).then((response) => { // 200-499
            if (response.ok) {
                response.json()
                    .then(layer => {
                        resolve(layer);
                    })
                    .catch(error => {
                        reject(error);
                    });
            } else {
                reject("Server responded with status: "+response.status);
            }
        }).catch((error) => { // 500-599
            reject(error);
        });
    });
}
                       

export const maybeAddToLayer = (viewerLayer, message) => {
    console.log("maybeAddToLayer");
    return dispatch => {
        // viewerLayer (tag, tags, creator, geometries, color)
        // args (_id, tags, creator) no geometries!
        dispatch(
            getLayer(message._id)
                .then(creatorLayer => {
                    if (layerMatches(creatorLayer, viewerLayer)) {
                        dispatch(addToLayer(viewerLayer, creatorLayer));
                    } else {
                        
                    }
                })
                .catch(error => dispatch(error))
        );
    };
}

export const maybeRemoveFromLayer = (viewerLayer, message) => {
    console.log("maybeRemoveFromLayer");
    return dispatch => {
        if (layerMatches(message, viewerLayer)) {
            dispatch(removeFromLayer(viewerLayer, message));
        } else {
        }
    };
}

export const addLayer = (layer) => {
    console.log("addLayers");
    return dispatch => {
        let obj = {
            method:"GET",
            mode:"cors",
            credentials: 'include',
            headers:{"Content-Type":"application/json"}
        };
        let url = "/layers?tag="+layer.tag;
        if (layer.tags.length > 0) {
            url += "&tags=" + layer.tags.join(",");
        }
        if (layer.creator) {
            url += "&creator=" + layer.creator;
        }
        return fetch(backend + url, obj).then((response) => { // 200-499
            if (response.ok) {
                response.json().then((layers) => {
                    layer.sources = [];
                    layer.srcInfo = [];
                    for (let i = 0; i < layers.length; i++) {
                        // add the source _ids
                        for (let j = 0; j < layers[i].geometries.length; j++) {
                            layer.sources.push(layers[i]._id);
                            layer.geometries.push(layers[i].geometries[j]);
                        }
                        layer.srcInfo[layers[i]._id] = {
                            tags: layers[i].tags,
                            creator: layers[i].creator
                        };
                    }
                    dispatch(addLayerOk(layer));

                    // TODO: remove socket when layer is removed
                    let socket = openSocket(backend);
                    let channel = layer.tag;
                    if (layer.creator) {
                        channel = layer.creator + ',' + channel;
                    }
                    socket.emit('subscribe to channel', channel);
                    socket.on("message", function(message) {
                        console.log('message from server: '+message);
                        let cmd = message.slice(0, 9);
                        if (cmd === "new layer") {
                            message = message.replace(/^new layer: /, '');
                            try {
                                message = JSON.parse(message);
                                dispatch(maybeAddToLayer(layer, message));
                            } catch(e) {
                                dispatch(addLayerFail(message));
                            }
                        }
                        if (cmd === "layer del") {
                            message = message.replace(/^layer deleted: /, '');
                            message = JSON.parse(message);
                            dispatch(maybeRemoveFromLayer(layer, message));
                        }
                    });
                    
                }).catch(() => {
                    dispatch(addLayerFail("JSON parse error."));
                });
            } else {
                dispatch(addLayerFail(response.status));
            }
        }).catch((error) => { // 500-599
            dispatch(addLayerFail(error));
        });
    };
};

// Action creators

export const addTagsOk = (tags) => {
    return {
        type: ADD_TAGS_OK,
        tags: tags
    };
}

export const addTagsFail = (error) => {
    return {
        type: ADD_TAGS_FAIL,
        error: error
    };
}

export const addCreatorsOk = (creators) => {
    return {
        type: ADD_CREATORS_OK,
        creators: creators
    };
};

export const addCreatorsFail = (error) => {
    return {
        type: ADD_CREATORS_FAIL,
        error: error
    };
};

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

export const removeViewerLayer = (index) => {
    return {
        type: REMOVE_LAYER,
        index: index
    };
}

export const addToLayer = (viewerLayer, creatorLayer) => {
    return {
        type: ADD_TO_LAYER,
        layer: viewerLayer,
        add: creatorLayer
    };
}

export const removeFromLayer = (viewerLayer, creatorLayer) => {
    return {
        type: REMOVE_FROM_LAYER,
        layer: viewerLayer,
        remove: creatorLayer
    };
}
