Hot loading?

-- Permission model
  # Note that this doesn't require fetching orgs
  -- fetching projects
    or:
      project.owner == user
      project.id in user.projects
      project.owningOrg in user.orgs
  -- fetching users for project
    or:
      user == project.owner
      user.projects contains project
      user.orgs contains project.owningOrg
  -- checking permissions
    perm level:
      owner: project.owner == user
      level = user.projects[project.id].rank
      level = user.orgs[project.owningOrg].rank

question about ownership of labels: who can create them?
  -- anyone with manager access to a project
who can delete them?
  -- same.
are labels stored with the project, or are they separate?
  -- depends on how many labels we expect to have. Let's say max 1000 for now.

collections:
  issues
    -- linked issues
    -- labels
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
    - project.id
    - owner.id
    - name
    - color
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
    fields: [
      {
        name: 'due by',
        type: 'date',
      }
    ],
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
