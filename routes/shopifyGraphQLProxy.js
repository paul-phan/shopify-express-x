const proxy = require('express-http-proxy');


module.exports = function shopifyGraphQLProxy(configs) {
  const {apiVersion} = configs
  return function shopifyGraphQLProxyMiddleware(req, res, next) {
    const { session: { shop, accessToken } } = req;
    if (!accessToken || !shop) {
      return res.status(403).json({success: false, message: 'Unauthorized'});
    }
    const GRAPHQL_PATH = `https://${shop}/admin/api/${apiVersion}/graphql.json`;

    proxy(shop, {
      https: true,
      parseReqBody: false,
      proxyReqOptDecorator(proxyReqOpts, srcReq) {
        proxyReqOpts.headers['content-type'] = 'application/json';
        proxyReqOpts.headers['x-shopify-access-token'] = accessToken;
        return proxyReqOpts;
      },
      proxyReqPathResolver(req) {
        return GRAPHQL_PATH;
      }
    })(req, res, next);
  }
};
