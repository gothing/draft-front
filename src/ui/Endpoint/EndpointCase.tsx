import * as React from 'react';
import { Tag, Card, message, Dropdown, Menu, Tooltip, Modal, Input, Space, Checkbox, Typography } from 'antd';
import { LinkOutlined, QuestionCircleFilled, CodeOutlined } from '@ant-design/icons';
import { Status } from '../Status/Status';
import { getCaseURL, copyToClipboard, useNav, markdown } from '../../util';
import { RPC_STATUS_TO_CODE } from '../../rpc';
import { SchemeCase, ReflectItemMap, ReflectItem, GroupEntry, GroupConfig, AccessConfig, AccessExtraConfig, AccessExtraItemValue, JSONSchemeDetail } from '../../typings';
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
	const reqHeaders = renderParams(value.headers?.request, detail.request.headers, activeAccess?.headers, ': ');
	const reqCookies = renderParams(value.cookies?.request, detail.request.cookies, activeAccess?.cookies, ': ');
	const respHeaders = renderParams(value.headers?.response, detail.response.headers, undefined, ': ');
	const respCookies = renderParams(value.cookies?.response, detail.response.cookies, undefined, ': ');
	const params = renderParams(value.params, detail.request.params, activeAccess?.params);
	const body = renderJSONObject(detail.response.body, value.body, '  ');
	const isOK = value.status === 'ok';
	const href = getCaseURL(group, entry, value);
	const accessSelector = <AccessSelector
		type={value.access}
		active={activeAccess}
		onSelect={setActiveAccess}
	/>;
	const codeStatus = RPC_STATUS_TO_CODE[value.status];

	useConsoleLog('EndpointCase.in:', {value, detail, activeAccess});
	useConsoleLog('EndpointCase.out:', {reqHeaders, reqCookies, params, respHeaders, respCookies, body});

	return (
		<Card
			style={
				isOK
				? {}
				: value.status === 'found'
				? {borderColor: '#91d5ff'}
				: {borderColor: '#ffa39e'}
			}
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
				<span>
					{' → '}&nbsp;
					<EndpointURL
						entry={entry}
						scheme={value}
						access={activeAccess}
					/>
				</span>
			</>}
		>
			{value.description && <Description value={value.description}/>}

			{[
				{name: 'request → headers',  children: reqHeaders},
				{name: 'request → cookies',  children: reqCookies},
				{name: 'request → params',   children: params},
				{name: 'response → headers', children: respHeaders},
				{name: 'response → cookies', children: respCookies},
			].filter(i => !!i.children).map((props, idx) =>
				<RequestSection
					{...props}
					key={idx}
					bg={idx % 2 ? '#f5f5f5' : '#fafafa'}
					extra={!idx && accessSelector}
				/>
			)}

			{(codeStatus < 300 || codeStatus >= 400) && <RequestSection name="response">
				<CodeHighlight value={``
					+ '{\n'
					+ `  "status": ${RPC_STATUS_TO_CODE[value.status]},\n`
					+ `  "body": ${body}`
					+ `\n}`
				}/>
			</RequestSection>}
		</Card>
	);
}

type RequestSectionProps = {
	bg?: string;
	name: string;
	extra?: React.ReactNode;
	children: React.ReactNode;
};

function RequestSection(props: RequestSectionProps) {
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
		return (
			<div className="access-selector-badge">
				<Tag color="blue">{type}</Tag>
			</div>
		);
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
			{item.description && <>
				{' '}
				<Tooltip title={<span dangerouslySetInnerHTML={{__html: markdown(item.description)}}/>}>
					<QuestionCircleFilled />
				</Tooltip>
			</>}
		</div>
	)}</div>;
}

function renderJSONObject(ref: ReflectItemMap, raw: any, ind = '') {
	if (raw == null || typeof raw !== 'object') {
		return JSON.stringify(raw);
	}
	const nind = ind + '  ';

	return `{\n${Object.entries(raw).map(([key, val]) => {
		const refVal = ref && ref[key];
		const refNested = refVal && refVal.nested;

		if (refNested && refNested.length) {
			const nref = refNested.reduce((map, item) => {
				map[item.name] = item;
				return map;
			}, {} as ReflectItemMap);
			val = renderJSONObject(nref, val, nind);
		} else if (isObject(val)) {
			val = JSON
				.stringify(val, null, (nind + ind).length)
				.replace(/\}$/, `${nind}}`)
			;
		} else {
			val = JSON.stringify(val);
		}

		const prop = [`${nind}"${key}": ${val}`];
		refVal && prop.unshift( `${nind}/* ${refVal.comment}. <b>${getRefType(refVal)}</b> */`)

		return prop.join('\n');
	}).join(',\n')}\n${ind}}`;
}

function getRefType({type, meta_type, enum:ev}: ReflectItem) {
	switch (type) {
		case 'map':
			return `map[${ev ? `${ ev.join(' | ') }` : 'string'}]string`;

		case 'struct':
			return 'object';

		case 'slice':
			return `${ev ? `Enum<${ ev.join(' | ') }>` : meta_type}[]`;
	}

	return type;
}

function renderParams(
	params?: object,
	scheme?: ReflectItemMap,
	extra?: AccessExtraItemValue,
	sep?: string,
) {
	if (params == null && extra?.value == null) {
		return null;
	}

	const base = !scheme ? <></> : Object
		.entries(Object(params))
		.map(([key, val]) => renderParamsItem(key, val, scheme[key], sep))
	;

	return (extra && extra.reflect && extra.reflect.nested
		? extra.reflect.nested
			.map((item) => renderParamsItem(item.name, extra.value[item.name]!, item, sep))
			.concat(base)
		: base
	);
}

function renderParamsItem(key: string, rawVal: any, ref: ReflectItem, sep = '=') {
	const skey = `${key}${ref.required ? '' : '?'}`;
	let val: any = null;

	if (rawVal && typeof rawVal === 'string') {
		val = rawVal;
	} else if (rawVal && typeof rawVal === 'object' && ref.nested && ref.nested.length) {
		val = renderJSONObject(ref.nested.reduce((map, item) => {
			map[item.name] = item;
			return map;
		}, {} as ReflectItemMap), rawVal, '');

		return <div key={key}>
			<div>/* {ref.comment} */</div>
			<b>{skey}</b>{sep}<CodeHighlight value={val} />
		</div>;
	} else {
		val = JSON.stringify(rawVal);
	}

	return <div key={key}>
		<div>/* {ref.comment}. <b>{getRefType(ref)}</b> */</div>
		<b>{skey}</b>
		{sep}
		<span title={val} className="endpoint-param-value">{val}</span>
	</div>;
}

type EndpointURLProps = {
	entry: GroupEntry;
	scheme: SchemeCase;
	access?: AccessExtraConfig;
}

function EndpointURL({entry, scheme, access}: EndpointURLProps) {
	const {projects} = useAppState();
	const project = projects[entry.scheme?.project!];
	const hosts = [] as string[];
	let [activeHost, setActiveHost] = React.useState('');
	let host = null as JSX.Element | null;

	if (project) {
		project.host && hosts.push(project.host);
		project.host_rc && hosts.push(project.host_rc);
		project.host_dev && hosts.push(project.host_dev);

		activeHost = hosts.includes(activeHost) ? activeHost : (project.host_rc || hosts[0]);

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

	return(
		<span>
			{host}{entry.name}{' '}
			<RequestFactory
				access={access}
				project={entry.scheme!.project}
				detail={entry.scheme!.detail[scheme.status]!}
				scheme={scheme}
				host={activeHost}
				url={entry.name}
			/>
		</span>
	);
}

type RequestFactoryProps = {
	project?: string;
	access?: AccessExtraConfig;
	detail: JSONSchemeDetail;
	scheme: SchemeCase;
	host: string;
	url: string;
};

function RequestFactory(props: RequestFactoryProps) {
	const {
		project,
		access,
		detail,
		scheme,
		host,
		url,
	} = props;
	const formRef = React.useRef(null as HTMLFormElement | null)
	const [visible, setVisible] = React.useState(false);
	const handleOpen = () => {
		setVisible(true);
	};
	const handleSend = () => {
		if (formRef.current) {
			const elems = Array.from(formRef.current.elements) as HTMLInputElement[];
			const values = elems.reduce((p, el: HTMLInputElement) => {
				p[el.name] = [`${el.type === 'checkbox' ? el.checked : el.value}`];
				return p;
			}, {} as any);

			window.open(`/godraft:request/?data=${encodeURIComponent(JSON.stringify({
				project,
				access: scheme.access,
				access_extra: access?.name,
				method: scheme.method,
				host,
				path: url,
				values,
			}))}`);
		}

		setVisible(false);
	};

	const fullUrl = `https://${host}${url}`;

	return (<>
		<a onClick={handleOpen}><CodeOutlined /></a>
		<Modal
			visible={visible}
			width={Math.max(520, 150 + fullUrl.length * 7.4)}
			title={<>
				<Tag>{scheme.method}</Tag>
				{' → '}&nbsp;
				<span>{fullUrl}</span>
			</>}
			onOk={handleSend}
			onCancel={() => { setVisible(false); }}
			okText={'Execute'}
		>
			<form ref={formRef} onSubmit={(evt) => {
				evt.preventDefault();
				handleSend();
			}}>
				<RequestForm detail={detail} params={Object(scheme.params)}/>
			</form>
        </Modal>
	</>);
}

type RequestFormProps = {
	detail: JSONSchemeDetail;
	params: SchemeCase['params'];
}

function RequestForm({params, detail}: RequestFormProps) {
	const [state, setState] = React.useState({} as any);

	return <>{Object.entries(params).map(([key, value]) => {
		const param = detail.request.params[key];
		const Elem = param.type === 'bool' ? Checkbox : Input;
		const props: any = {
			name: key,
			required: param.required,
			value: void 0,
			checked: void 0,
			onChange: ({target}: React.ChangeEvent<HTMLInputElement>) => {
				setState({
					...state,
					[key]: param.type === 'bool'  ? target.checked : target.value,
				});
			},
		};

		if (state[key] === void 0) {
			state[key] = value;
		}

		if (param.type === 'bool') {
			props.checked = state[key];
			props.value = 'true';
		} else {
			props.value = state[key];
		}

		return (
			<div key={key} className={`request-form-item required-${props.required}`}>
				<div><b>{key}</b>: {param.comment}</div>
				<Elem {...props} />
			</div>
		)
	})}</>;
}


function Description({value}: {value: string}) {
	return (
		<div
			className="endpoint-case-descr"
			dangerouslySetInnerHTML={{__html: markdown(value)}}
		/>
	);
}

function isObject(val: unknown): val is object {
	return Object.prototype.toString.call(val) === '[object Object]'
}

function useConsoleLog(...args: any[]) {
	React.useEffect(() => {
		console.log(...args);
	}, args);
}
