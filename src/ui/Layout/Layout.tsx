import * as React from 'react';
import { Layout } from 'antd';
import { Header } from './Header';
import { LeftMenu } from './LeftMenu';
import { Endpoint } from '../Endpoint/Endpoint';
import { EndpointAll } from '../Endpoint/EndpointAll';
import { useAppStore } from '../../store/store';

export function AppLayout() {
	const {
		state: {
			search,
			activeProject,
			activeEndpoint,
		},
	} = useAppStore();

	return (
		<Layout style={{height: '100%'}}>
			<Header/>	

			<Layout>
				<Layout.Sider className="site-layout-background">
					<LeftMenu/>
				</Layout.Sider>

				<Layout.Content
					className="site-layout-background"
					style={{
						margin: 20,
						minHeight: 280,
					}}
				>
					{!search && activeEndpoint
						? <Endpoint id={activeEndpoint}/>
						: <EndpointAll />
					}
				</Layout.Content>
			</Layout>
		</Layout>
	);
}
