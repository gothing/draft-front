import * as React from 'react';
import { Layout, Menu, Input } from 'antd';
import { useAppStore } from '../../store/store';
import { useNav, getBaseURL } from '../../util';

export function Header() {
	const {
		state: {
			search,
			activeGroup,
			groups,
		},
		updateState,
	} = useAppStore();
	const handleSearch = React.useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
		updateState('search', evt.target.value);
	}, [updateState]);
	const nav = useNav();

	return (
		<Layout.Header className="header">
			<Layout>
				<Layout.Sider width={150}>
					<Logo/>
				</Layout.Sider>
				
				<Layout.Content>
					<Menu
						theme="dark"
						mode="horizontal"
						defaultSelectedKeys={activeGroup ? [activeGroup] : void 0}
					>{
						Object.values(groups).map((group) => (
							<Menu.Item
								key={group!.id}
								onClick={() => { nav(getBaseURL(group!)); }}
							>
								{group!.name}
							</Menu.Item>
						))
					}</Menu>
				</Layout.Content>

				<Layout.Sider width={200}>
					<Input.Search
						placeholder="Поиск по методам"
						value={search}
						onChange={handleSearch}
					/>
				</Layout.Sider>
			</Layout>
		</Layout.Header>
	);
}

function Logo() {
	return (
		<img
			height="32"
			src="https://img.imgsmail.ru/pm/1.0.3/blocks/ph-logo/img/logotype-mail.ru@2x.png"
		/>
	);
}
