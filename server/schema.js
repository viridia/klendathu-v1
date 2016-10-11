const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLID,
    GraphQLNonNull } = require('graphql');
const { ObjectId } = require('mongodb');
const logger = require('./common/logger');
const escapeRegExp = require('./lib/escapeRegExp');

const labelType = require('./schemas/labelType');
const userType = require('./schemas/userType');
const projectType = require('./schemas/projectType');
const templateType = require('./schemas/templateType');
const templateResolver = require('./resolvers/templateResolver');
const workflowType = require('./schemas/workflowType');
const workflowResolver = require('./resolvers/workflowResolver');

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      projects: {
        type: new GraphQLNonNull(new GraphQLList(projectType)),
        args: {
          id: { type: GraphQLID },
          name: { type: GraphQLString },
        },
        resolve({ db }, { id, name: pname }) {
          const query = {};
          if (id) {
            query._id = new ObjectId(id);
          }
          if (pname) {
            query.name = pname;
          }
          return db.collection('projects').find(query).toArray().then(projects => {
            return projects.map(proj => {
              const { _id, name } = proj;
              return { id: _id, name };
            });
          });
        },
      },
      labels: {
        type: new GraphQLNonNull(new GraphQLList(labelType)),
        args: {
          id: { type: GraphQLID },
          project: { type: GraphQLID },
          token: { type: GraphQLString },
        },
        resolve({ db }, { id, project: pid, token } /* , _context */) {
          const query = {};
          if (id) {
            query._id = new ObjectId(id);
          }
          if (pid) {
            query.project = new ObjectId(pid);
          }
          if (token) {
            const pattern = `\\b${escapeRegExp(token)}`;
            query.name = { $regex: pattern, $options: 'i' };
          }
          // logger.info('context:', context.user);
          return db.collection('labels').find(query).toArray().then(labels => {
            return labels.map(label => {
              const { _id, name, color, project, creator, created, updated } = label;
              return { id: _id, name, color, project, creator, created, updated };
            });
          });
        },
      },
      workflow: {
        type: new GraphQLNonNull(new GraphQLList(workflowType)),
        args: {
          project: { type: new GraphQLNonNull(GraphQLString) },
          name: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve({ db, user }, { project, name }) {
          return workflowResolver(db, user, { project, name });
        },
      },
      template: {
        type: new GraphQLNonNull(new GraphQLList(templateType)),
        args: {
          project: { type: new GraphQLNonNull(GraphQLString) },
          name: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve({ db, user }, { project, name }) {
          return templateResolver(db, user, { project, name });
        },
      },
      profile: {
        type: userType,
        resolve({ user }) {
          logger.info(user);
          // return null;
          // logger.info(user, context.user);
          if (!user) { return null; }
          const { _id, username, fullname, photo, verified } = user;
          return { id: _id, username, fullname, photo, verified };
        },
      },
      users: {
        type: new GraphQLNonNull(new GraphQLList(userType)),
        args: {
          id: { type: GraphQLID },
          token: { type: GraphQLString },
        },
        resolve({ db }, { id, token }) {
          const query = {};
          if (id) {
            query._id = new ObjectId(id);
          }
          if (token) {
            const pattern = `\\b${escapeRegExp(token)}`;
            query.name = { $regex: pattern, $options: 'i' };
          }
          return db.collection('users').find(query).toArray().then(users => {
            return users.map(user => {
              const { _id, username, fullname, photo, verified } = user;
              return { id: _id, username, fullname, photo, verified };
            });
          });
        },
      },
    },
  }),
});

module.exports = schema;
