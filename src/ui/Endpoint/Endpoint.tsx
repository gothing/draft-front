import * as React from 'react';
import { Card, Result, Tree, Breadcrumb, Typography, Space } from 'antd';
import { useAppStore } from '../../store/store';
import { ProjectEntry } from '../../typings';
import { Status } from '../Status/Status';
import { EndpointCase } from './EndpointCase';
import { getProjectEntryKey, getCaseURL } from '../../util';
import Paragraph from 'antd/lib/typography/Paragraph';

export type Endpoint = {
	id: string;
};

export function Endpoint({id}: Endpoint) {
	const {
		state: {activeProject},
	} = useAppStore();
	const entry = React.useMemo(() => {
		let result = null as ProjectEntry | null;
		activeProject && activeProject.entries.some(function find(e) {
			if (getProjectEntryKey(e) === id) {
				result = e;
				return true;
			}

			return e.entries.some(find);
		});
		return result;
	}, [activeProject, id]);

	if (!entry) {
		return <Result
			status="error"
			title={`Ошибка: «${id}» — не найден`}
		/>;
	}

	const scheme = entry.scheme!;

	return (
		<>
			<Breadcrumb style={{marginBottom: 20}}>
				<Breadcrumb.Item>{activeProject?.name}</Breadcrumb.Item>
				{scheme.project && <Breadcrumb.Item>{scheme.project}</Breadcrumb.Item>}
				<Breadcrumb.Item>{scheme.name}</Breadcrumb.Item>
			</Breadcrumb>

			{scheme.description && <Typography style={{fontSize: '120%'}}>
				<Paragraph>{scheme.description}</Paragraph>
			</Typography>}

			{scheme.cases.length > 1 && <ul>
				{scheme.cases.map((c, i) => (
					<li key={i}>
						<a href={getCaseURL(activeProject!, entry, c)}>{c.name}</a>&nbsp;
						<Status name={c.status} badge/> 
					</li>
				))}
			</ul>}
			
			<Space direction="vertical" style={{width: '100%'}}>
				{scheme.cases.map((c, i) => (
					<EndpointCase key={i} project={activeProject!} entry={entry} value={c}/>
				))}
			</Space>
		</>
	);
}
