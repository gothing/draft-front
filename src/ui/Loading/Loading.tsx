
import * as React from 'react';
import { Spin } from 'antd';

export function Loading() {
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
