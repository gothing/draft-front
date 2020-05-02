import * as React from 'react';
import marked from 'marked';
import { Tag, Card, message, Dropdown, Menu } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import { Status } from '../Status/Status';
import { getCaseURL, copyToClipboard, useNav } from '../../util';
import { RPC_STATUS_TO_CODE } from '../../rpc';
import { SchemeCase, ReflectItemMap, ReflectItem, GroupEntry, GroupConfig, AccessConfig, AccessExtraConfig, AccessExtraItemValue } from '../../typings';
import { CodeHighlight } from '../CodeHighlight/CodeHighlight';

import './EndpointCase.css';
import { useAppState, useAppStore } from '../../store/store';

export type EndpointCaseProps = {
	group: GroupConfig;
	entry: GroupEntry;
	value: SchemeCase;
};

export function EndpointCase(props: EndpointCaseProps) {
	const {
		group,
		entry,
		value,
	} = props;
	const {
		state: {
			accessRights,
		},
	} = useAppStore();
	const scheme = entry.scheme!;
	const [activeAccess, setActiveAccess] = React.useState(accessRights[value.access]?.extra[0]);
	const nav = useNav();
	const detail = scheme.detail[value.status];
	const headers = renderHeaders(activeAccess?.headers);
	const params = renderParams(value.params, detail.request.params, activeAccess?.params);
	const body = renderJSONObject(detail.response.body, value.body, '  ');
	const isOK = value.status === 'ok';
	const href = getCaseURL(group, entry, value);

	return (
		<Card
			style={isOK ? {} : {borderColor: '#ffa39e'}}
			title={<>
				<div id={href} className="endpoint-case-hidden-anchor"/>
				<span
					className="endpoint-case-copy-to-clipboard"
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
				<span> → &nbsp;<EndpointURL value={entry} /></span>
			</>}
		>
			{value.description && <Description value={value.description}/>}

			{headers && <RequestSesion
				bg="#f5f5f5"
				name="request → headers"
				extra={<AccessSelector
					type={value.access}
					active={activeAccess}
					onSelect={setActiveAccess}
				/>}
			>
				{headers}
			</RequestSesion>}

			{params && <RequestSesion
				bg="#fafafa"
				name="request → params"
				extra={!headers && <AccessSelector
					type={value.access}
					active={activeAccess}
					onSelect={setActiveAccess}
				/>}
			>
				{params}
			</RequestSesion>}

			<RequestSesion name="response">
				<CodeHighlight value={``
					+ '{\n'
					+ `  "status": ${RPC_STATUS_TO_CODE[value.status]},\n`
					+ `  "body": ${body}`
					+ `\n}`
				}/>
			</RequestSesion>
		</Card>
	);
}

type RequestSesionProps = {
	bg?: string;
	name: string;
	extra?: React.ReactNode;
	children: React.ReactNode;
};

function RequestSesion(props: RequestSesionProps) {
	const {
		bg,
		name,
		extra,
		children,
	} = props;

	return (
		<div className="request-section" style={{background: bg}}>
			{extra && <div className="request-section-extra">{extra}</div>}
			<div className="request-section-label">{name}</div>
			<div className="request-section-body">{children}</div>
		</div>
	);
}

type AccessSelectorProps = {
	type: string;
	active: AccessExtraConfig | undefined;
	onSelect: (item: AccessExtraConfig) => void;
}

function AccessSelector({type, active, onSelect}: AccessSelectorProps) {
	const {
		accessRights,
	} = useAppState();
	const access = accessRights[type];
	
	if (!access) {
		return <>{type}</>;
	}

	return <div className="access-selector">{access.extra.map((item) => 
		<div
			className={`
				access-selector-tab
				${item === active && `access-selector-tab-active`}
			`}
			key={item.name}
			onClick={() => onSelect(item)}
		>
			{item.name}
		</div>
	)}</div>;
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

function renderHeaders(headers?: AccessExtraItemValue) {
	if (!headers || headers.value === null) {
		return null;
	}

	return headers.reflect.nested.map((item) => renderParamsItem(item.name, headers.value[item.name], item, ': '));
}

function renderParams(params: object, scheme: ReflectItemMap, extra?: AccessExtraItemValue) {
	const base = Object.entries(Object(params)).map(([key, val]) => renderParamsItem(key, val, scheme[key]));

	return (extra
		? extra.reflect.nested
			.map((item) => renderParamsItem(item.name, extra.value[item.name]!, item))
			.concat(base)
		: base
	);
}

function renderParamsItem(key: string, value: any, ref: ReflectItem, sep = '=') {
	const skey = `${key}${ref.required ? '' : '?'}`;
	
	return <div key={key}>
		<div>/* {ref.comment}. <b>{getRefType(ref)}</b> */</div>
		<b>{skey}</b>{sep}{typeof value === 'boolean' ? JSON.stringify(value) : value}
	</div>
}

function EndpointURL({value}: {value: GroupEntry}) {
	const {projects} = useAppState();
	const project = projects[value.scheme?.project!];
	const hosts = [] as string[];
	let [activeHost, setActiveHost] = React.useState('');
	let host = null as JSX.Element | null;

	if (project) {
		project.host && hosts.push(project.host);
		project.host_rc && hosts.push(project.host_rc);
		project.host_dev && hosts.push(project.host_dev);
		
		activeHost = hosts.includes(activeHost) ? activeHost : hosts[0];
	
		if (hosts.length > 1) {
			const menu = (
				<Menu onClick={({key}) => { setActiveHost(key); }}>{
					hosts.map(v => <Menu.Item key={v}>{v}</Menu.Item>)
				}</Menu>
			);
			const selector = (
				<Dropdown overlay={menu}>
					<span className="endpoint-case-host">{activeHost}</span>
				</Dropdown>
			);
			
			host = <>https://{selector}</>;
		} else if (hosts.length) {
			host = <>https://{hosts[0]}</>;
		}
	}

	return <span>{host}{value.name}</span>;
}

function Description({value}: {value: string}) {
	let indent = null as RegExp | null | false;
	const result = marked(
		value
		.replace(/^\s*\n/, '')
		.split('\n')
			.map(line => {
				if (indent === null) {
					const m = line.match(/^\s+/);
					indent = m ? new RegExp(`^${m[0]}`) : false;
				}

				return indent ? line.replace(indent!, '') : line;
			})
			.join('\n')
	);

	return <div className="endpoint-case-descr" dangerouslySetInnerHTML={{__html: result}}/>;
}
