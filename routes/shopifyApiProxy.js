const querystring = require('querystring');
const fetch = require('node-fetch');

const DISALLOWED_URLS = [
  '/application_charges',
  '/application_credits',
  '/carrier_services',
  '/fulfillment_services',
  '/recurring_application_charges',
  '/script_tags',
  '/storefront_access_token',
  '/webhooks',
  '/oauth',
];
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2020-07';

module.exports = async function shopifyApiProxy(incomingRequest, response, next) {
  const { query, method, path: pathname, body, session } = incomingRequest;

  if (session == null) {
    console.error('A session middleware must be installed to use ApiProxy.')
    response.status(401).send(new Error('Unauthorized'));
    return;
  }

  const { shop, accessToken } = session;

  if (shop == null || accessToken == null) {
    response.status(401).send(new Error('Unauthorized'));
    return;
  }

  if (!validRequest(pathname)) {
    response.status(403).send('Endpoint not in whitelist');
    return;
  }

  try {
    const searchParams = querystring.stringify(query);
    const searchString = searchParams.length > 0
      ? `?${searchParams}`
      : '';

    const url = `https://${shop}/admin/api/${SHOPIFY_API_VERSION}${pathname}${searchString}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
    }
    if (method !== 'GET' && method !== 'HEAD') {
      options.body = body
    }
    const result = await fetch(url, options);

    const data = await result.json();
    response.status(result.status).json(data);
  } catch (error) {
    console.log(error);
    response.status(500).json(error);
  }
};

module.exports.DISALLOWED_URLS = DISALLOWED_URLS;

function validRequest(path) {
  const strippedPath = path.split('?')[0].split('.json')[0];

  return DISALLOWED_URLS.every(resource => {
    return strippedPath.indexOf(resource) === -1;
  });
}
