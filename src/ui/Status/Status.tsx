import * as React from 'react';
import { Tag } from 'antd';

export type StatusProps = {
	name: string;
	badge?: boolean;
};

export function Status({name, badge}: StatusProps) {
	const color = name === 'ok' ? 'success' : 'error';
	const status = name.toUpperCase();
	const style = badge ? {
		borderRadius: 5,
		fontSize: '50%',
		padding: '0 4px',
    	lineHeight: '14px',
    	verticalAlign: 'super',
	} : void 0;

	return <Tag color={color} style={style}>{status}</Tag>;
}
