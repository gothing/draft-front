import * as React from 'react';
import { Menu, Divider } from 'antd';
import { SelectParam } from 'antd/lib/menu';
import { useAppStore } from '../../store/store';
import { getProjectEntryKey } from '../../util';

export function LeftMenu() {
	const {
		state: {
			activeProject,
			activeEndpoint,
		},
		updateState,
	} = useAppStore();
	const handleSelect = React.useCallback((param: SelectParam) => {
		updateState('activeEndpoint', param.key);
	}, [updateState]);

	const rootEntries = activeProject?.entries.flatMap(r => r.entries) || [];
	const openKeys = [] as string[];
	
	const menuItems = rootEntries.map(function render(e) {
		if (e.type === 'G') {
			openKeys.push(e.name);
			return (
				<Menu.SubMenu key={e.name} title={e.name}>
					{e.entries.map(render)}
				</Menu.SubMenu>
			);
		} else if (e.type === 'E') {
			return (
				<Menu.Item
					key={getProjectEntryKey(e)}
					title={e.scheme!.description || e.scheme!.name}
				>
					{e.scheme!.name}
				</Menu.Item>
			);
		} else if (e.type === 'HR') {
			return <Divider />;
		} else {
			throw `not supproted: ${e.type}`;
		}
	});

	return (
		<Menu
			mode="inline"
			defaultOpenKeys={openKeys}
			defaultSelectedKeys={[activeEndpoint]}
			style={{ height: '100%', borderRight: 0 }}
			onSelect={handleSelect}
		>
			{menuItems}
		</Menu>
	);
}
