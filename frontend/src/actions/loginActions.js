import {backend} from '../config';
import {setMode,
        clearLayers as clearCreatorLayers,
        getLayers as getCreatorLayers} from './creatorActions';

export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export const REGISTER_FAILED = 'REGISTER_FAILED';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILED = 'LOGIN_FAILED';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const LOGOUT_FAILED = 'LOGOUT_FAILED';
export const LOGIN_REDIRECT = 'LOGIN_REDIRECT';

export function setSessionStorage(args) {
    sessionStorage.setItem("token", args ? args.token : '');
    sessionStorage.setItem("username", args ? args.username : '');
}

// Actions

export const onRegister = (user) => {
    console.log("onRegister");
    return dispatch => {
        let obj = {
            method:"POST",
            mode:"cors",
            credentials: 'include',
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(user)
        };
        return fetch(backend + "/register", obj).then((response) => { // 200-499
            if (response.ok) {
                response.json().then((data) => {
                    dispatch(registerSuccess(user.username, data.token));
                }).catch(() => {
                    dispatch(registerFailed("JSON parse error."));
                });
            } else {
                dispatch(registerFailed("Username is taken or bad password."));
            }
        }).catch((error) => { // 500-599
            dispatch(registerFailed(error));
        });
    };
};

export const onLogin = (user) => {
    console.log("onLogin");
    setSessionStorage();
    return dispatch => {
        let obj = {
            method:"POST",
            mode:"cors",
            credentials: 'include',
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(user)
        };
        return fetch(backend + "/login", obj).then((response) => { // 200-499
            if (response.ok) {
                response.json().then((data) => {
                    dispatch(loginSuccess(user.username, data.token));
                    setSessionStorage({
                        token: data.token,
                        username: user.username
                    });
                    dispatch(getCreatorLayers(data.token));
                    this.props.dispatch(setMode('Add'));
                }).catch(() => {
                    dispatch(loginFailed("JSON parse error."));
                });
            } else {
                dispatch(loginFailed("Wrong username or password."));
            }
        }).catch((error) => { // 500-599
            dispatch(loginFailed(error));
        });
    };
};

export const onLogout = (token) => {
    console.log("onLogout");
    setSessionStorage();
    return dispatch => {
        let obj = {
            method:"POST",
            mode:"cors",
            credentials: 'include',
            headers:{
                "Content-Type":"application/json",
                token:token
            },
        };
        return fetch(backend + "/logout", obj).then((response) => { // 200-499
            if (response.ok) {
                dispatch(clearCreatorLayers());
                dispatch(logoutSuccess());
            } else {
                dispatch(logoutFailed("Can't logout."));
            }
        }).catch((error) => { // 500-599
            dispatch(logoutFailed(error));
        });
    };
}

// Action creators

export const registerSuccess = () => {
    return {
        type: REGISTER_SUCCESS
    };
}

export const registerFailed = (error) => {
    return {
        type: REGISTER_FAILED,
        error: error
    };
}

export const loginSuccess = (username, token) => {
    return {
        type: LOGIN_SUCCESS,
        username: username,
        token: token
    };
}

export const loginFailed = (error) => {
    return {
        type: LOGIN_FAILED,
        error: error
    };
}

export const logoutSuccess = (token) => {
    return {
        type: LOGOUT_SUCCESS
    };
}

export const logoutFailed = (error) => {
    return {
        type: LOGOUT_FAILED,
        error: error
    };
}
