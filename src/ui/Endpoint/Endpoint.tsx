import * as React from 'react';
import { Result, Breadcrumb, Typography, Space } from 'antd';
import { useAppStore } from '../../store/store';
import { GroupEntry } from '../../typings';
import { BadgeDeprecated, Status, TagDeprecated } from '../Status/Status';
import { EndpointCase } from './EndpointCase';
import { getGroupEntryKey, getCaseURL } from '../../util';
import Paragraph from 'antd/lib/typography/Paragraph';

export type Endpoint = {
	id: string;
};

export function Endpoint({id}: Endpoint) {
	const {
		state: {
			groups,
			projects,
			activeGroup,
			activeGroupEntries,
			activeEndpoint,
			fastEndpointIndex,
		},
	} = useAppStore();
	const entry = React.useMemo(() => {
		let result = null as GroupEntry | null;
		
		activeGroupEntries.some(function find(entry) {
			if (getGroupEntryKey(entry) === id) {
				result = entry;
				return true;
			}

			return entry.entries.some(find);
		});

		if (!result && activeEndpoint) {
			result = fastEndpointIndex[activeEndpoint] || null;
		}

		return result;
	}, [activeGroupEntries, id]);

	if (!entry) {
		return <Result status="error" title={<>Ошибка: «<b>{id}</b>» — не найден</>} />;
	}

	const group = groups[activeGroup!];
	if (!group) {
		return <Result
			status="error"
			title={<>Ошибка: «<b>{activeGroup || '<<undefined>>'}</b>» — группа не найдена</>}
		/>;
	}

	const scheme = entry.scheme!;
	const project = projects[scheme.project!];

	return (
		<>
			<Breadcrumb style={{marginBottom: 20}}>
				{scheme.deprecated && <Breadcrumb.Item><TagDeprecated/></Breadcrumb.Item>}
				<Breadcrumb.Item>{group.name}</Breadcrumb.Item>
				{project && <Breadcrumb.Item>{project.name}</Breadcrumb.Item>}
				<Breadcrumb.Item>{scheme.name}</Breadcrumb.Item>
			</Breadcrumb>

			{scheme.description && <Typography style={{fontSize: '120%'}}>
				<Paragraph>{scheme.description}</Paragraph>
			</Typography>}

			{scheme.cases.length > 1 && <ul>
				{scheme.cases.map((c, i) => (
					<li key={i}>
						<a href={getCaseURL(group, entry, c)}>{c.name}</a>&nbsp;
						{(scheme.deprecated || c.deprecated) && <BadgeDeprecated/>}
						<Status name={c.status} badge/> 
					</li>
				))}
			</ul>}
			
			<Space direction="vertical" style={{width: '100%'}}>
				{scheme.cases.map((c, i) => (
					<EndpointCase
						key={`${group.id}-${entry.name}-${c.name}-${i}`}
						group={group}
						entry={entry}
						value={c}
					/>
				))}
			</Space>
		</>
	);
}
