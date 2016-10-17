/** Definitions for user access levels. */
module.exports = {
  // A user that is not logged in; Can only see public projects.
  NONE: 0,
  // Viewers can see issues but not mutate anything.
  VIEWER: 10,
  // Reporters can report bugs but cannot edit them (except for adding comments).
  REPORTER: 25,
  // Updaters can update bugs.
  UPDATER: 40,
  // Developers can create new labels and edit the labels they own.
  DEVELOPER: 55,
  // Managers can change the project issue template and workflow.
  MANAGER: 70,
  // Administrators can update project info and delete projects.
  ADMINISTRATOR: 90,
  // Owners have the same permissions as admins.
  OWNER: 100,
};
