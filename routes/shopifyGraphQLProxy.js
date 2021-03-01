const proxy = require('express-http-proxy');

const PROXY_BASE_PATH = '/graphql';

module.exports = function shopifyGraphQLProxy(shopifyConfig) {
  const {apiVersion} = shopifyConfig
  const GRAPHQL_PATH = `/admin/api/${apiVersion}/graphql.json`;

  return function shopifyGraphQLProxyMiddleware(req, res, next) {
    if (!req.session) {
      console.error("A session middleware must be installed to use ApiProxy.");
      response.status(401).send(new Error("Unauthorized"));
      return;
    }
    const { session: { shop, accessToken } } = req;

    if (req.path !== PROXY_BASE_PATH || req.method !== "POST") {
      return next();
    }

    if (!accessToken || !shop) {
      return res.status(403).send("Unauthorized");
    }

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

module.exports.PROXY_BASE_PATH = PROXY_BASE_PATH;
