import * as React from 'react';
import { ProjectEntry, Project, SchemeCase } from './typings';
import { MatchResult, match as fuzzyMatch } from 'fuzzy';
import { useAppStore } from './store/store';

export function getProjectEntryKey(entry: ProjectEntry) {
	let key = entry.name;
	
	if (entry.scheme && entry.scheme.project) {
		key = `${entry.scheme.project}${key}`;
	}

	return key;
}

export function copyToClipboard(val: string) {
	const el = document.createElement('textarea');
	el.value = val;
	el.setAttribute('readonly', '');
	el.style.position = 'absolute';
	el.style.left = '-9999px';
	
	document.body.appendChild(el);

	const selection = document.getSelection()
	const currentRanges = [] as Range[];

	if (selection) {
		for (let i = 0; i < (selection.rangeCount || 0); i++) {
			currentRanges.push(selection.getRangeAt(i));
		}
	}

	el.select();
	document.execCommand('copy');
	document.body.removeChild(el);
	
	if (currentRanges.length) { 
		const selection = document.getSelection()
		if (selection) {
			selection.removeAllRanges();
			currentRanges.forEach(range => {
				selection.addRange(range);
			});
		}
	}
}

export function useNav() {
	const { updateState } = useAppStore();
	const nav = React.useCallback((val) => {
		updateState('search', '');
		window.location.hash = val;
	}, [updateState]);
	
	return nav;
}

const fuzzyMemo = {} as {
	[value:string]: {
		[pattern:string]: MatchResult;
	}
};

export function fuzzyHL(value: string, pattern: string) {
	if (fuzzyMemo[value] === void 0) {
		fuzzyMemo[value] = {};
	}

	if (fuzzyMemo[value][pattern] === void 0) {
		fuzzyMemo[value][pattern] = fuzzyMatch(pattern, value, {
			pre: '<span style="background: yellow;">',
			post: '</span>',
		});
	}

	const result = fuzzyMemo[value][pattern];
	return result ? <span dangerouslySetInnerHTML={{__html: result.rendered}}/> : null;
}

export function getBaseURL(project: Project, entry?: ProjectEntry) {
	return `#${project.id}${entry ? `:${entry.scheme?.project || ''}${entry.name}` : ``}`;
}

export function getCaseURL(project: Project, entry: ProjectEntry, c: SchemeCase) {
	return `${getBaseURL(project, entry)}?case=${c.name}`;
}

export function parseHistoryParams(sitemap: Project[]) {
	const [
		_,
		id,
		endpoint,
		queryString,
	] = window.location.hash.match(/^#?([\w-]+)(?::([^?]+))?(?:\?(.*))?/i) || [];

	return {
		activeProject: sitemap.find((p) => p.id === id) || sitemap[0],
		activeEndpoint: endpoint || '',
		queryString: queryString || '',
	};
}
