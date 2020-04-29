import * as React from 'react';
import { Card, Result, Tree } from 'antd';
import { useAppStore } from '../../store/store';
import { fuzzyHL, getBaseURL, useNav } from '../../util';

export function EndpointAll() {
	const {
		state: {
			search,
			groups,
			activeGroup,
			activeGroupEntries,
		},
	} = useAppStore();
	const group = groups[activeGroup!]!;
	const rootEntries = activeGroupEntries.flatMap(e => e.entries) || [];
	
	let isEmpty = true;
	const nodes = rootEntries.map(function render(e) {
		if (e.type === 'G') {
			return (
				<Tree.TreeNode key={e.name} title={e.name}>
					{e.entries.map(render)}
				</Tree.TreeNode>
			);
		} else if (e.type === 'E') {
			const name = fuzzyHL(e.name, search);
			const descr = fuzzyHL(e.scheme!.name, search);

			if (name === null && descr === null) {
				return null;
			}

			isEmpty = false;

			return (
				<Tree.TreeNode
					key={getBaseURL(group, e)}
					title={<>
						<a>{name || e.name}</a>
						<span> — {descr || e.scheme!.name}</span>
					</>}
				/>
			);
		} else {
			throw `not supproted: ${e.type}`;
		}
	});
	const nav = useNav();
	const handleSelect = React.useCallback((keys: React.ReactText[]) => {
		nav(keys.join(''));
	}, []);

	return (
		<Card title="Все методы">
			{isEmpty
				? <Result
					status="info"
					title={<>По запросу «<b>{search}</b>» ничего не найдено</>}
				/>
				: <Tree
					showLine
					onSelect={handleSelect}
					defaultExpandAll={true}
				>
					{nodes}
				</Tree>}
		</Card>
	);
}
