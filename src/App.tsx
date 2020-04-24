import * as React from 'react';

import { AppSitemap, AppState, ProjectEntry, Project } from './typings';

import { Result, Spin } from 'antd';
import { AppLayout } from './ui/Layout/Layout';
import { parseHistoryParams, useNav } from './util';
import { Store } from './store/store';

export type AppLoaderProps = {
	activeProject?: string;
	sitemap?: Array<Project & {
		entries: Array<ProjectEntry | string>;
	}>;
};

const fetchedEndpoint = {} as {
	[url:string]: ProjectEntry | null;
};

export function App(props: AppLoaderProps) {
	const [rev, updateState] = React.useState(0);
	const forceUpdate = React.useCallback(() => { updateState(rev + 1); }, [rev]);

	if (!props.sitemap) {
		return <Result status="error" title="Sitemap not defined"/>;
	}

	const sitemap = fetchSitemap(props.sitemap, forceUpdate);

	return (
		<AppReady
			key={rev}
			activeProject={sitemap.find(v => v.id === props.activeProject)}
			sitemap={sitemap}
		/>
	);
}

function AppReady(props: {activeProject?: Project, sitemap: AppSitemap}) {
	const {
		sitemap,
		activeProject,
	 } = props;
	const initialState = React.useMemo((): AppState => {
		const state = {
			search: '',
			activeProject,
			activeEndpoint: '',
			sitemap,
			...parseHistoryParams(sitemap),
		};
		state.search = new URLSearchParams(state.queryString).get('search') || '';
		return state;
	}, []);
	const [state, setState] = React.useState(initialState);

	useHistory(state);
	useHashChange(() => {
		setState({
			...state,
			...parseHistoryParams(sitemap),
		});
	}, [state, sitemap]);
	useAutoScroll();
	
	return (
		<Store.Provider value={{
			state,
			updateState: (key, value) => {
				setState({
					...state,
					[key]: value,
				});
			},
		}}>
			{sitemap.length ? <AppLayout/> : <Loading/>}
		</Store.Provider>
	);
}

function Loading() {
	return (
		<div style={{
			display: 'flex',
			width: '100%',
			height: '100%',
			alignItems: 'center',
			justifyContent: 'center',
		}}>
			<Spin size="large"/>
		</div>
	);
}

function useHistory(state: AppState) {
	React.useEffect(() => {
		const {
			activeProject,
			activeEndpoint,
			queryString,
			search,
		} = state

		const pid = setTimeout(() => {
			let hash = activeProject ? activeProject.id : '';
			let title = activeProject?.name
			
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

function useAutoScroll() {
	const firstScroll = React.useRef(true);
	React.useEffect(() => {
		const elem = document.querySelector(`[id="${decodeURIComponent(window.location.hash)}"]`);
		requestAnimationFrame(() => {
			elem && elem.scrollIntoView({behavior: firstScroll.current ? 'auto' : 'smooth'});
			firstScroll.current = false;
		});
	}, [window.location.hash]);
}

function fetchSitemap(sitemap: AppSitemap, forceUpdate: () => void) {
	return sitemap.reduce((list, item) => {
		const entries = [] as ProjectEntry[];
		let loaded = true;

		item.entries.forEach((e) => {
			if (typeof e === 'string') {
				const cache = fetchedEndpoint[e];
				
				if (cache === void 0) {
					loaded = false;
					fetchedEndpoint[e] = null;
					fetch(e).then(r => r.json()).then(json => {
						fetchedEndpoint[e] = json;
						forceUpdate();
					});
				} else if (cache === null) {
					loaded = false;
				} else {
					entries.push(cache);
				}
			} else {
				entries.push(e);
			}
		});

		if (loaded) {
			list.push({
				...item,
				entries,
			});
		}

		return list;
	}, [] as Project[])
}
