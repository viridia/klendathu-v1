Hot loading?

collections:
  issues
    -- cc
    -- reporter
    -- owner / assigned
    -- subject
    -- description
    -- comments
    -- attachments
    -- state / status
    -- resolution
    -- public
    -- linked issues
    -- labels
    -- tags
    -- (opt) severity
    -- (opt) priority
    -- (opt) product
    -- (opt) hardware
    -- (opt) version
    -- (opt) operating system
    -- (opt) browser
    -- (opt) target milestone
    -- (opt) votes / likes
    -- (opt) fixed in version
    -- where to insert:
       -- after description
       -- after keywords
       -- after state
  workflows
  templates
  labels
    - owner
    - name
  projects
    - workflow
    - issue templates
    - members[]:
      - user
      - access
    - orgs[]:
      - organization
  project.settings:
    - user
    - labels
    - queries
  project.members - users that belong to a project
  project.orgs
  organizations
    - name
    - owner
    - members[]:
      - user
      - access

VIEWER, REPORTER, UPDATER, DEVELOPER, MANAGER and ADMINISTRATOR
10:viewer, 25:reporter, 40:updater, 55:developer, 70:manager, 90:administrator

client-side state:
  list of projects - for top-level menu
  list of organizations?
  whether we are logged in or not.
  user profile?

do we want orgs to contain users or users to contain orgs?
  -- what operations?
    -- list all projects accessible to user

workflow:

states: [
  {
    name: 'QA',
    status: 'open',
    enter: {
      owner: "{verifier||reporter}"
    }
  },
]

issues: [
  {
    id: 'issue',
    abstract: true,
    extends: 'klendathu/issue',
    fields: [
      {
        name: 'priority',
        type: enum,
        initial: 'P2',
        values: [ 'P0', 'P1', 'P2', 'P3', 'P4' ],
      },
      {
        name: 'severity',
        type: enum,
        values: [ 'S0', 'S1', 'S2', 'S3', 'S4' ],
      },
      {
        name: 'due by',
        type: 'date',
      }
    ],
  }
  {
    id: 'epic',
    name: 'Epic',
    contains: ['story', 'task'],
    extends: './issue',
  },
  {
    id: 'story',
    name: 'Story',
    contains: ['task'],
    extends: ':issue',
  },
  {
    id: 'task',
    name: 'Task',
    contains: ['subtask'],
    extends: ':issue',
  },
  {
    id: 'subtask',
    name: 'Subtask',
    contains: [],
    extends: ':issue',
  }
]

Future:
  Server needs json schemas to ensure requests are not malicious.

Things to experiment with:
  -- TypeScript
  -- Webpack 2
  -- React hot loading
  -- minimal babel conversions
  -- Nginx config and https
