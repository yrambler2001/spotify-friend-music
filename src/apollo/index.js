import { ApolloServer } from 'apollo-server-express';
import { get } from 'lodash';
import config from 'config';
import { formatQueryByErrorPositions } from './helpers';
import schema from './schema';

const logError = (error, { errorType, variables, userOrigin, userLocationHref, queryString }) => {
  // eslint-disable-next-line no-param-reassign
  queryString = queryString || error?.source?.body;
  const { message, locations, path, extensions } = error;
  const lExtensions =
    extensions &&
    JSON.stringify({
      ...extensions,
      ...(extensions?.exception && { exception: { ...extensions.exception, ...(extensions.exception?.stacktrace && { stacktrace: '(below)' }) } }),
    });
  const lStacktrace = error.stack || get(extensions, 'exception.stacktrace', []).reduce((p, c, index) => (p || '').concat(index !== 0 ? '\n' : '', c), ''); // array to string
  const lVariables = JSON.stringify(variables);
  const lQuery = formatQueryByErrorPositions({ queryString, errorPositions: locations });
  const lPath = JSON.stringify(path);
  const lLocations = JSON.stringify(locations);
  const lMessage = JSON.stringify(message);
  console.error(
    [
      `[${errorType}]:`,
      lMessage && `Message: ${lMessage}`,
      lLocations && `Location: ${lLocations}`,
      lPath && `Path: ${lPath}`,
      lQuery && `Query:\n${lQuery}`,
      variables && `Variables: ${lVariables}`,
      userOrigin && `User origin: ${userOrigin}`,
      userLocationHref && `User location href: ${userLocationHref}`,
      lExtensions && `Extensions: ${lExtensions}`,
      lStacktrace && `Stacktrace: ${lStacktrace} `,
    ]
      .filter(Boolean)
      .join('\n'),
  );
};
const server = new ApolloServer({
  schema,
  introspection: true,
  playground: config.isDevelopment,
  context: async ({ req, res }) => {
    return { req, res };
  },
  formatError: (error) => {
    return error;
  },
  formatResponse: (response, requestContext) => {
    (async () => {
      requestContext.errors?.forEach((error) => {
        const doNotLogOnServer = get(error, 'extensions.exception.doNotLogOnServer'); // check if error should not be logged on server (e.g. minor error/warning)
        if (!doNotLogOnServer) {
          // if error should be logged
          logError(error, {
            errorType: error.name || error?.extensions?.code,
            variables: requestContext.request?.variables,
            userOrigin: requestContext?.context?.req?.headers?.origin,
            userLocationHref: requestContext?.context?.req?.headers?.['location-href'],
            queryString: requestContext.request.query,
          });
        }
      });
    })();
    return response;
  },
});

export default server;
