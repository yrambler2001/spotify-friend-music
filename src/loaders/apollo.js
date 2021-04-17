import apolloServer from 'apollo';

export default async ({ app }) => {
  await apolloServer.applyMiddleware({ app });
  return apolloServer;
};
