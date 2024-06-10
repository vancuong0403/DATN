import { createStore, combineReducers } from 'redux';
import rootReducer from './reducers/rootReducer';

const loadState = () => {
    try {
        const serializedState = localStorage.getItem('reduxStateDTUSVC');
        if (serializedState === null) {
            return undefined;
        }
        return JSON.parse(serializedState);
    } catch (err) {
        return undefined;
    }
};

const saveState = (state) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('reduxStateDTUSVC', serializedState);
    } catch (err) {
    }
};

const store = createStore(rootReducer, loadState());
store.subscribe(() => {
    saveState(store.getState());
});
export {store};