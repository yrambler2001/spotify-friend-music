import { gql, SchemaDirectiveVisitor, ForbiddenError, AuthenticationError } from 'apollo-server-express';
import { defaultFieldResolver } from 'graphql';
import find from 'lodash/find';
import { roles } from 'config/roles';

const priorityRoles = [
  { role: roles.VIEWER, priority: 0 },
  { role: roles.USER, priority: 1 },
  { role: roles.ADMIN, priority: 2 },
  { role: roles.ROOT_ADMIN, priority: 3 },
  { role: roles.SUPER_ADMIN, priority: 4 },
];

export default class AuthDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const requiredAuthRole = this.args.requires;
    const { resolve = defaultFieldResolver } = field;
    // eslint-disable-next-line no-param-reassign
    field.resolve = async function f(...args) {
      const requiredRole = requiredAuthRole;

      const context = args[2];
      if (!context?.user) {
        throw new AuthenticationError('Not authorized');
      }

      const priorityUser = find(priorityRoles, { role: context?.user?.role })?.priority || 0;
      const priorityRequired = find(priorityRoles, { role: requiredRole })?.priority || 0;

      if (priorityUser < priorityRequired) {
        throw new ForbiddenError(`Forbidden. ${requiredRole} permissions required`);
      }

      return resolve.apply(this, args);
    };
  }
}

export const typeDef = gql`
  directive @auth(requires: Role) on FIELD_DEFINITION
`;
