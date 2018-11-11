import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {createStore, applyMiddleware, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import thunk from 'redux-thunk';
import loginReducer from './reducers/loginReducer';
import creatorReducer from './reducers/creatorReducer';
import viewerReducer from './reducers/viewerReducer';

const rootReducer = combineReducers({
    login: loginReducer,
    creator: creatorReducer,
    viewer: viewerReducer
});

const store = createStore(rootReducer, applyMiddleware(thunk));

ReactDOM.render(<Provider store={store}>
                  <App />
                </Provider>,
                document.getElementById('root'));
