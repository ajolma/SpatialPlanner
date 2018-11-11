import {
    REGISTER_SUCCESS,
    REGISTER_FAILED,
    LOGIN_SUCCESS,
    LOGIN_FAILED,
    LOGOUT_SUCCESS,
    LOGOUT_FAILED
} from '../actions/loginActions';

const initialState = {
    username: '',
    token: '',
    error: ''
}

const loginReducer = (state=initialState, action) => {
    console.log(action);
    switch (action.type) {
    case REGISTER_SUCCESS:
        alert("OK");
        return state;
    case REGISTER_FAILED:
        alert(action.error);
        return state;
    case LOGIN_SUCCESS:
        return {
            ...state,
            username: action.username,
            token: action.token,
            error: ''
        };
    case LOGIN_FAILED:
        return {
            ...state,
            error: action.error
        };
    case LOGOUT_SUCCESS:
        return {
            ...state,
            username: '',
            token: '',
            error: ''
        };
    case LOGOUT_FAILED:
        return {
            ...state,
            error: action.error
        };
    default:
        return state;
    }
}

export default loginReducer;
