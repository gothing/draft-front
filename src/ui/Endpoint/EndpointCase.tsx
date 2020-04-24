import * as React from 'react';
import { Tag, Card, message, Divider } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import { Status } from '../Status/Status';
import { getCaseURL, copyToClipboard, useNav } from '../../util';
import { RPC_STATUS_TO_CODE } from '../../rpc';
import { Project, ProjectEntry, SchemeCase, ReflectItemMap, ReflectItem } from '../../typings';
import { CodeHighlight } from '../CodeHighlight/CodeHighlight';

export type EndpointCaseProps = {
	project: Project;
	entry: ProjectEntry;
	value: SchemeCase;
}

export function EndpointCase(props: EndpointCaseProps) {
	const {
		project,
		entry,
		value,
	} = props;
	const nav = useNav();
	const scheme = entry.scheme!;
	const detail = scheme.detail[value.status];
	const params = Object.entries(value.params).map(([key, value]) => {
		const ref = detail.request.params[key];
		const skey = `${key}${ref.required ? '' : '?'}`;

		return (
			<div key={key}>
				<div>/* {ref.comment}. <b>{getRefType(ref)}</b> */</div>
				<b>{skey}</b>={typeof value === 'boolean' ? JSON.stringify(value) : value}
			</div>
		);
	});
	const body = renderJSONObject(detail.response.body, value.body, '  ');
	const isOK = value.status === 'ok';
	const href = getCaseURL(project, entry, value);

	return (
		<Card
			style={isOK ? {} : {borderColor: '#ffa39e'}}
			title={<>
				<div id={href} style={{
					position: 'relative',
					top: -20,
				}}></div>
				<span
					style={{
						position: 'absolute',
						right: 20,
						cursor: 'pointer',
					}}
					onClick={() => {
						nav(href);
						copyToClipboard(window.location.toString());
						message.success('Copied', .4);
					}}
				>
					<LinkOutlined/>
				</span>
				<a href={href}>{value.name}</a><br/>
				<Status name={value.status}/>
				<Tag>{value.method}</Tag>
				<span> → &nbsp;{entry.name}</span>
			</>}
		>
			{value.description && <>
				<div>{value.description}</div>
				<Divider/>
			</>}
			<div style={{background: '#fafafa', margin: -24, padding: 24}}>
				{params}
			</div>
			<br/>
			<br/>
			<div>
				<CodeHighlight value={'{\n'
					+ `  "status": ${RPC_STATUS_TO_CODE[value.status]},\n`
					+ `  "body": ${body}\n}`
				}/>
			</div>
		</Card>
	);
}



function renderJSONObject(ref: ReflectItemMap, raw: any, ind = '') {
	if (raw == null || typeof raw !== 'object') {
		return JSON.stringify(raw);
	}
	const nind = ind + '  ';

	return `{\n${Object.entries(raw).map(([key, val]) => {
		const refVal = ref[key];
		const refNested = refVal && refVal.nested;

		if (refNested && refNested.length) {
			const nref = refNested.reduce((map, item) => {
				map[item.name] = item;
				return map;
			}, {} as ReflectItemMap);
			val = renderJSONObject(nref, val, ind + ind);
		} else {
			val = JSON.stringify(val);
		}

		return [
			`${nind}/* ${refVal.comment}. <b>${getRefType(refVal)}</b> */`,
			`${nind}"${key}": ${val}`,
		].join('\n');
	}).join(',\n')}\n${ind}}`;
}

function getRefType({type, meta_type, enum:ev}: ReflectItem) {
	switch (type) {
		case 'struct':
			return 'object';

		case 'slice':
			return `${ev ? `Enum<${ ev.join(' | ') }>` : meta_type}[]`;
	}

	return type;
}
