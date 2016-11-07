* What do we need to do to finalize the db format enough that we can start collecting
  real issues (and not worry about having to wipe the db during development?)
  -- liking comments
  -- liking issues
* Make sure that queries are invalidated by updated.
  * Mostly this applies to plural queries.
* Get rid of typeahead
  * We'll need a slightly different autocomplete than the one we use for labels and users.
    (One which allows new items and editable suggestions).
* Adding comments in the compose page.
* A way to delete an issue
  * Individual delete - make sure to unlink related items.
  * Mass edit
* UpdateQueries
  * Issue list
  * User list (in autocomplete).
  * Filtering and sorting?
* Issue compose needs role checks on individual fields.
* Custom suggest field / enter key support.
  * Will be easier once we have some data
  * Get rid of typeahead
* return key to navigate between fields (all dialogs)
* escape to dismiss menus
* make note about #hash tags and @mentions
* Simplify rendering of suggestionsSuffix in autocomplete
* Additional roles
  * Project membership
  * Create organizations
  * Org membership
* Check roles client-side when editing / deleting labels
* option to add label to hot list when creating it
* Undo mode (set deleted flag) for issues, labels, projects.
* Show linked issues hierarchically
* Create Mongo indices programmatically. (Measure first).
* Delete project memberships when deleting projects and/or users.
* Don't allow people to be added to project if they are already members.
* User autocomplete has a bug where it gets stuck sometimes. (General ac problem).
* Limit projects query to projects the user can see.
  * Partly done.
* Make sure deleting an issue cascades to linked issues.

URLS:
  https://github.com/mlabieniec/complexity
  https://www.npmjs.com/package/email-validator
  https://github.com/gaearon/redux-thunk
  https://github.com/pauldijou/redux-act

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

client-side state:
  list of projects - for top-level menu
  list of organizations?

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
        milestone: ? (Need a way to add to milestones other than via editing template).
          -- or is it just a label?
      }
    ],
  }
]

Things to experiment with:
  -- TypeScript on the server? (Need to re-read the typescript language docs.)
    (Typescript isn't that useful for this particular server.)
  -- New React Router? (Can't because we depend on LinkContainer)

Filter rows:
  [field][op][value][x]
  Row types:
    * enum (checkboxes?)
    * set (state, type) (checkboxes?)
    * users
      * contains any of (list of users)
      * contains all of (list of users)
      * contains none of (list of users)
