export const RPC_STATUS_TO_CODE: {
	[status:string]: number;
} = {
	'processing': 102,
	'ok': 200,
	'accepted': 202,
	'non_authoritative': 203,
	'partial': 206,
	'move': 301,
	'notmodified': 304,
	'invalid': 400,
	'payment_required': 402,
	'denied': 403,
	'notfound': 404,
	'unacceptable': 406,
	'timeout': 408,
	'conflict': 409,
	'expectation_failed': 417,
	'unprocessable': 422,
	'locked': 423,
	'failed_dependency': 424,
	'upgrade_required': 426,
	'many_requests': 429,
	'retry_with': 449,
	'unavailable_for_legal_reasons': 451,
	'fail': 500,
	'not_implemented': 501,
	'unavaliable': 503,
	'insufficient': 507,
};
