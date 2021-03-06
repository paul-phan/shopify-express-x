export default function getCookieOptions(ctx) {
	const {header} = ctx;
	const userAgent = header['user-agent'];
	const isChrome = userAgent && userAgent.match(/chrome|crios/i);
	let cookieOptions = {};
	if (isChrome) {
		cookieOptions = {
			sameSite: 'none',
			secure: true,
		};
	}
	return cookieOptions;
}
