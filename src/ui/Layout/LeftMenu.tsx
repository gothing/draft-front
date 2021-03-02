import * as React from 'react';
import { Menu, Divider } from 'antd';
import { SelectParam } from 'antd/lib/menu';
import { useAppStore } from '../../store/store';
import { getGroupEntryKey } from '../../util';
import { BadgeDeprecated } from '../Status/Status';

export function LeftMenu() {
	const {
		state: {
			activeGroupEntries,
			activeEndpoint,
		},
		updateState,
	} = useAppStore();
	const handleSelect = React.useCallback((param: SelectParam) => {
		updateState({
			search: '',
			queryString: '',
			activeEndpoint: param.key,
		});
	}, [updateState]);

	const rootEntries = activeGroupEntries.flatMap(r => r.entries) || [];
	const openKeys = [] as string[];
	
	const menuItems = rootEntries.map(function render(e, idx) {
		if (e.type === 'G') {
			openKeys.push(`group-${idx}`);

			return (
				<Menu.SubMenu key={`group-${idx}`} title={e.name}>
					{e.entries.map(render)}
				</Menu.SubMenu>
			);
		} else if (e.type === 'E') {
			return (
				<Menu.Item
					key={getGroupEntryKey(e)}
					title={e.scheme!.description || e.scheme!.name}
				>
					{e.scheme!.name}
					{e.scheme!.deprecated && <span> <BadgeDeprecated/></span>}
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
			defaultSelectedKeys={activeEndpoint ? [activeEndpoint] : void 0}
			style={{ height: '100%', borderRight: 0 }}
			onSelect={handleSelect}
		>
			{menuItems}
		</Menu>
	);
}
