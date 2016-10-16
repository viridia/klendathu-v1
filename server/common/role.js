/** Definitions for user access levels. */
module.exports = {
  // A user that is not logged in; Can only see public projects.
  NONE: { rank: 'NONE', level: 0 },
  // Viewers can see issues but not mutate anything.
  VIEWER: { rank: 'VIEWER', level: 10 },
  // Reporters can report bugs but cannot edit them.
  REPORTER: { rank: 'REPORTER', level: 25 },
  // Updaters can update bugs.
  UPDATER: { rank: 'UPDATER', level: 40 },
  // Developers can create new labels and edit the labels they own.
  DEVELOPER: { rank: 'DEVELOPER', level: 55 },
  // Managers can change the project issue template and workflow.
  MANAGER: { rank: 'MANAGER', level: 70 },
  // Administrators can update project info and delete projects.
  ADMINISTRATOR: { rank: 'ADMINISTRATOR', level: 90 },
  // Owners have the same permissions as admins.
  OWNER: { rank: 'OWNER', level: 100 },
};
