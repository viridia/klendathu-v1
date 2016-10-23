export const Role = {
  NONE: 0,
  VIEWER: 10,
  REPORTER: 25,
  UPDATER: 40,
  DEVELOPER: 55,
  MANAGER: 70,
  ADMINISTRATOR: 90,
  OWNER: 100,
};

/** Given a role level, return a role name. */
export function roleName(level) {
  switch (true) {
    case (level < Role.VIEWER): return 'NONE';
    case (level < Role.REPORTER): return 'VIEWER';
    case (level < Role.UPDATER): return 'REPORTER';
    case (level < Role.DEVELOPER): return 'UPDATER';
    case (level < Role.MANAGER): return 'DEVELOPER';
    case (level < Role.ADMINISTRATOR): return 'MANAGER';
    case (level < Role.OWNER): return 'ADMINISTRATOR';
    default: return 'OWNER';
  }
}

/** Return the list of [level, name] pairs in sorted order. */
export function roles() {
  const result = Object.keys(Role).map(name => [Role[name], name]);
  result.sort();
  return result;
}
