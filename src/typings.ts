export type Project = {
	id: string;
	name: string;
	entries: ProjectEntry[];
}

export type AppState = {
	search: string;
	sitemap: AppSitemap;
	activeProject?: Project;
	activeEndpoint: string;
	queryString: string;
};

export type AppSitemap = Project[];

export type AppStore = {
	state: AppState;
	updateState: <K extends keyof AppState>(key: K, value: AppState[K]) => void,
};

export type ProjectEntry = {
	type: string;
	name: string;
	scheme: JSONScheme | null;
	entries: ProjectEntry[];
};

export type JSONScheme = {
	name: string;
	project: string;
	description: string;
	detail: {[status:string]: JSONSchemeDetail};
	cases: SchemeCase[];
};

export type SchemeCase = {
	name: string;
	description: string;
	access: string;
	status: string;
	method: string;
	params: object;
	body: object;
}

export type JSONSchemeDetail = {
	access: string;
	request: JSONSchemeRequest;
	response: JSONSchemeResponse;
};

export type JSONSchemeRequest = {
	method: string;
	params: { [name:string]: ReflectItem };
};

export type JSONSchemeResponse = {
	body: { [name:string]: ReflectItem };
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
	nested: ReflectItem[];
};

export type ReflectItemMap = {[key:string]: ReflectItem};
