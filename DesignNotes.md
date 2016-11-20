* User autocomplete has a bug where it gets stuck sometimes. (General ac problem).
* UpdateQueries
  * User list (in autocomplete).
* return key to navigate between fields (all dialogs)
* add support for #hash tags and @mentions
* Additional roles
  * Create organizations
  * Org membership
* Check roles client-side when editing / deleting labels
* Undo mode (set deleted flag) for issues, labels, projects.
* Create Mongo indices programmatically. (Measure first).
* Limit projects query to projects the user can see.
  * Partly done.

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

collections:
  issues
    -- linked issues
    -- labels
    -- (opt) browser
    -- (opt) votes / likes
    -- (opt) fixed in version
    -- where to insert:
       -- after description
       -- after keywords
       -- after state
  organizations
    - name
    - owner
    - members[]:
      - user
      - access

do we want orgs to contain users or users to contain orgs?
  -- what operations?
    -- list all projects accessible to user

Things to experiment with:
  -- TypeScript on the server? (Need to re-read the typescript language docs.)
    (Typescript isn't that useful for this particular server.)
  -- New React Router? (Can't because we depend on LinkContainer)

Filter rows:
  Row types:
    * enum (checkboxes?)
    * set (state, type) (checkboxes?)
    * users
      * contains any of (list of users)
      * contains all of (list of users)
      * contains none of (list of users)
