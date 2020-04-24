import { createContext, useContext } from 'react';
import { AppStore } from '../typings';

export const Store = createContext({} as AppStore);

export function useAppStore() {
	return useContext(Store);
}

export function useAppState() {
	return useAppStore().state;
}
