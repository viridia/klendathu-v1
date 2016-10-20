Hot loading?
New React Router?
Check out Strider? (Means we'd have to write some tests)
* A way to delete a bug
* UpdateQueries
  * Issue list
  * Label list
  * User list
  * Filtering and sorting?
* I think we're going to need tests for the graphql stuff, and the tests will probably
  need a real db.
* Flesh out issue details
* Delete labels
* Figure out how to do refetch on project creation / deletion
* Edit existing issue (with permissions for various fields).
* Should be able to comment on a bug without going to edit page.
* Show issue change log
* Custom suggest field / enter key support.
  * Will be easier once we have some data
  * Get rid of typeahead
* Search users on both username and fullname.
* Click on autocomplete menu (in addition to ENTER).
* Label view
* Editing of labels
* Deletion of labels
* Make 'back' url params invisible.
* Make next / prev issue buttons work.
* return key to navigate between fields
* escape to dismiss menus
* make note about #hash tags and @mentions
* Errors
* Simplify rendering of suggestionsSuffix in autocomplete
* Additional roles
  * Project membership
  * Create organizations
  * Org membership
* option to add label to hot list when creating it
  * Need project settings

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
  -- React hot loading
  -- Nginx config and https

Filter rows:
  [field][op][value][x]
  Row types:
    * string
      * contains [text]
      * matches [text]
      * does not contain [text]
      * does not match [text]
    * enum (checkboxes?)
    * set (state, type) (checkboxes?)
    * users
      * contains any of (list of users)
      * contains all of (list of users)
      * contains none of (list of users)
