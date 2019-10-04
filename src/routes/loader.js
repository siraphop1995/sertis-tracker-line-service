'use strict';

/**
 * Custom Express router subscribe wrapper
 * This exports function that receives Express router,
 * route Configuration from './index', and middlewares form '../apis'.
 * It will make router.METHOD call according to route configuration.
 */

module.exports = (router, routes, methods) => {
  const subscribeRoute = route => {
    const [httpVerb, resourceUri] = route.split(' ');
    const { middlewares = [] } = routes[route];
    const methodChain = middlewares.reduce((chain, middleware) => {
      return chain.concat([methods[middleware]]);
    }, []);

    router[httpVerb.toLowerCase()](resourceUri, methodChain);
  };

  return { subscribeRoute };
};
