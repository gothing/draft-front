export type Config = {
	front_url: string;
	active_group: string;
	groups: GroupConfig[];
	projects: ProjectConfig[];
	rights: AccessConfig[];
};

export type GroupConfig = {
	id: string;
	name: string;
	entries: string[];
};

export type ProjectConfig = {
	id: string;
	name: string;
	descrition: string;
	host: string;
	host_rc: string;
	host_dev: string;
};

export type AccessConfig = {
	id: string;
	name: string;
	descrition: string;
	badge: string;
	extra: AccessExtraConfig[];
};

export type AccessExtraConfig = {
	name: string;
	description: string;
	headers?: AccessExtraItemValue;
	cookies?: AccessExtraItemValue;
	params: AccessExtraItemValue;
};

export type AccessExtraItemValue = {
	value: any;
	reflect: ReflectItem;
};

export type AppState = {
	loading: boolean;

	search: string;
	queryString: string;

	groups: {
		[id:string]: GroupConfig | undefined;
	};

	projects: {
		[id:string]: ProjectConfig | undefined;
	};

	accessRights: {
		[id:string]: AccessConfig | undefined;
	};

	activeGroup: string | null;
	activeGroupEntries: GroupEntry[];
	activeEndpoint: string | null;

	fastEndpointIndex: {
		[url:string]: GroupEntry | undefined;
	};
};

export type AppStore = {
	state: Readonly<AppState>;
	updateState: AppStoreUpdateState,
};

export interface AppStoreUpdateState {
	(patch: Partial<AppState>): void;
	<K extends keyof AppState>(key: K, value: AppState[K]): void;
}

export type GroupEntry = {
	type: string;
	name: string;
	scheme: JSONScheme | null;
	entries: GroupEntry[];
};

export type JSONScheme = {
	name: string;
	project: string;
	description: string;
	deprecated: boolean;
	detail: {
		[status:string]: JSONSchemeDetail;
	};
	cases: SchemeCase[];
};

export type SchemeCase = {
	name: string;
	description: string;
	deprecated: boolean;
	access: string;
	status: string;
	method: string;
	headers?: {
		request: object;
		response: object;
	};
	cookies?: {
		request: object;
		response: object;
	};
	params: object;
	body: object;
};

export type JSONSchemeDetail = {
	access: string;
	request: JSONSchemeRequest;
	response: JSONSchemeResponse;
};

export type JSONSchemeRequest = {
	method: string;
	headers?: {
		[name:string]: ReflectItem;
	};
	cookies?: {
		[name:string]: ReflectItem;
	};
	params: {
		[name:string]: ReflectItem;
	};
};

export type JSONSchemeResponse = {
	headers?: {
		[name:string]: ReflectItem;
	};
	cookies?: {
		[name:string]: ReflectItem;
	};
	body: {
		[name:string]: ReflectItem;
	};
};

export type ReflectItem = {
	name: string;
	value: any;
	enum: any;
	type: string;
	meta_type: string;
	tags: string;
	comment: string;
	required: boolean;
	deprecated: boolean;
	nested: ReflectItem[];
};

export type ReflectItemMap = {
	[key:string]: ReflectItem;
};
