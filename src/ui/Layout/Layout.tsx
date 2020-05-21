import * as React from 'react';
import { Layout } from 'antd';
import { Header } from './Header';
import { LeftMenu } from './LeftMenu';
import { Loading } from '../Loading/Loading';
import { Endpoint } from '../Endpoint/Endpoint';
import { EndpointAll } from '../Endpoint/EndpointAll';
import { useAppStore } from '../../store/store';

export function AppLayout() {
	const {
		state: {
			loading,
			search,
			activeEndpoint,
		},
	} = useAppStore();
	let content = loading ? <Loading/> : null;

	if (content === null) {
		content = !search && activeEndpoint
			? <Endpoint id={activeEndpoint}/>
			: <EndpointAll />
		;
	}

	return (
		<Layout style={{height: '100%'}}>
			<Header/>	

			<Layout>
				<Layout.Sider width={250} className="site-layout-background">
					<LeftMenu/>
				</Layout.Sider>

				<Layout.Content
					key={activeEndpoint || search}
					className="site-layout-background"
					style={{
						margin: 20,
						minHeight: 280,
					}}
				>
					{content}
				</Layout.Content>
			</Layout>
		</Layout>
	);
}
