import * as React from 'react';
import { Tag } from 'antd';

export type StatusProps = {
	name: string;
	badge?: boolean;
};

export const statusTagStyle: React.CSSProperties = {
	textTransform: 'uppercase',
}

export const statusBadgeStyle: React.CSSProperties = {
	borderRadius: 5,
	fontSize: '50%',
	padding: '0 4px',
	lineHeight: '14px',
	verticalAlign: 'super',
	textTransform: 'uppercase',
}

export function Status({name, badge}: StatusProps) {
	const color = name === 'found'
		? 'processing'
		: name === 'ok'
		? 'success'
		: 'error'
	;
	const status = name.toUpperCase();
	const style = badge ? statusBadgeStyle : statusTagStyle;

	return <Tag color={color} style={style}>{status}</Tag>;
}

export const TagDeprecated = () => <Tag color="warning" style={statusTagStyle}>deprecated</Tag>;
export const BadgeDeprecated = () => <Tag color="warning" style={statusBadgeStyle}>deprecated</Tag>;
