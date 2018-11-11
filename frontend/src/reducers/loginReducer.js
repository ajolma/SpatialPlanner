import {
    REGISTER_SUCCESS,
    REGISTER_FAILED,
    LOGIN_SUCCESS,
    LOGIN_FAILED,
    LOGOUT_SUCCESS,
    LOGOUT_FAILED,
    CLEAR_LOGIN_ERROR
} from '../actions/loginActions';

const initialState = {
    username: '',
    token: '',
    error: undefined
}

const loginReducer = (state=initialState, action) => {
    console.log(action);
    switch (action.type) {
    case REGISTER_SUCCESS:
        return {
            ...state,
            error: 'OK'
        };
    case REGISTER_FAILED:
        return {
            ...state,
            error: action.error
        };
    case LOGIN_SUCCESS:
        return {
            ...state,
            username: action.username,
            token: action.token
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
            token: ''
        };
    case LOGOUT_FAILED:
        return {
            ...state,
            error: action.error
        };
    case CLEAR_LOGIN_ERROR:
        return {
            ...state,
            error: undefined
        };
    default:
        return state;
    }
}

export default loginReducer;
