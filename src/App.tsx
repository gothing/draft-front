import * as React from 'react';
import { Result } from 'antd';

import { AppState, Config, GroupEntry, AppStore } from './typings';

import { AppLayout } from './ui/Layout/Layout';
import { parseHistoryParams, toMapById } from './util';
import { Store } from './store/store';

export type AppLoaderProps = {
	config?: Config;
};

const groupEntryCache = {} as {
	[url:string]: GroupEntry | null;
};

export function App({config}: AppLoaderProps) {
	const state = React.useMemo((): AppState => {
		const value: AppState = {
			loading: true,
			
			search: '',
			queryString: '',
			
			activeGroup: config?.active_group || null,
			activeGroupEntries: [],
			activeEndpoint: null,

			groups: toMapById(config?.groups || []),
			projects: toMapById(config?.projects || []),
			accessRights: toMapById(config?.rights || []),
		};

		return {
			...value,
			...parseHistoryParams(value),
		};
	}, [config]);

	if (!config || !config.groups || !config.groups.length) {
		console.warn('Brocked state:', state);
		return <Result status="error" title="Broken config (no groups)" />;
	}

	return <AppReady state={state} />;
}

function AppReady(props: {state: AppState}) {
	const [state, setState] = React.useState(props.state);
	const store: AppStore = {
		state,
		updateState: React.useCallback(function () {
			if (arguments.length === 2) {
				setState({
					...state,
					[arguments[0]]: arguments[1],
				});
			} else {
				setState({
					...state,
					...Object(arguments[0]),
				});
			}
		}, [state]),
	};

	useHistory(state);
	useHashChange(() => {
		setState({
			...state,
			...parseHistoryParams(state),
		});
	}, [state]);
	useGroupEntryAutoload(store);
	useAutoScroll(state.loading);
	
	return (
		<Store.Provider value={store}>
			<AppLayout/>
		</Store.Provider>
	);
}

function useHistory(state: AppState) {
	React.useEffect(() => {
		const {
			groups,
			activeGroup,
			activeEndpoint,
			queryString,
			search,
		} = state

		const pid = setTimeout(() => {
			let hash = activeGroup || '';
			let title = groups[activeGroup!]?.name
			
			if (activeEndpoint) {
				hash += `:${activeEndpoint}`;
				title += activeEndpoint;
			}

			if (search) {
				hash += `?search=${search}`;
			} else if (queryString && !queryString.includes('search=')) {
				hash += `?${queryString}`;
			}
			
			window.location.hash = hash;
			if (title) {
				window.document.title = title!;
			}
		}, 250);
		return () => {
			clearTimeout(pid);
		};
	}, [window.location.hash, state]);

}

function useHashChange(handle: () => void, deps: any[]) {
	React.useEffect(() => {
		window.addEventListener('hashchange', handle);
		return () => {
			window.removeEventListener('hashchange', handle);
		};
	}, deps);
}

function useAutoScroll(loading: boolean) {
	const firstScroll = React.useRef(true);
	
	React.useEffect(() => {
		if (loading) {
			return;
		}

		const elem = document.querySelector(`[id="${decodeURIComponent(window.location.hash)}"]`);
		
		requestAnimationFrame(() => {
			elem && elem.scrollIntoView({behavior: firstScroll.current ? 'auto' : 'smooth'});
			firstScroll.current = false;
		});
	}, [loading, window.location.hash]);
}

function useGroupEntryAutoload({state, updateState}: AppStore) {
	const [rev, setRev] = React.useState(0);
	const forceUpdate = React.useCallback(() => { setRev(rev + 1); }, [rev]);
	const group = state.groups[state.activeGroup!];

	if (!group) {
		return;
	}

	let loading = false;
	const entries = group.entries.map((entry) => {
		const cache = groupEntryCache[entry];
		
		if (cache === void 0) {
			loading = true;
			groupEntryCache[entry] = null;
			fetch(entry).then(r => r.json()).then(json => {
				groupEntryCache[entry] = json;
				forceUpdate();
			});
		} else if (cache === null) {
			loading = true;
		}
		
		return cache!;
	});

	if (loading !== state.loading) {
		if (loading) {
			updateState({ loading: true });
		} else {
			updateState({
				loading: false,
				activeGroupEntries: entries,
			});
		}
	}
}
