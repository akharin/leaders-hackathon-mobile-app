import {combineReducers} from 'redux';
import isAuthorized from './isAuthorized';
import userId, {IAuthUserIdState} from './userId';

export interface IAuthState {
	isAuthorized?: boolean;
	userId: IAuthUserIdState;
}

export default combineReducers({
	isAuthorized,
	userId
});