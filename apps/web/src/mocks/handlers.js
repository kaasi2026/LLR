export const handlerDefinitions = [];

export const getHandlers = (rest, { mockAll } = { mockAll: true }) => {
	const fallbackMock = mockAll
		? [
				rest.get('*', (req) => {
					throw new Error(
						`Unhandled request: ${req.url}. All requests must be mocked in ${__filename}`
					);
				})
			]
		: [];

	return handlerDefinitions
		.map(({ method, url, handler, status = 200 }) =>
			rest[method](url, (req, res, ctx) => {
				return res(ctx.status(status), ctx.json(handler(req, res, ctx)));
			})
		)
		.concat(fallbackMock);
};
