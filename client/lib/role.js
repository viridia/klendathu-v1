/** Given a role level, return a role name. */
export default function roleName(level) {
  switch (true) {
    case (level < 10): { return 'NONE'; }
    case (level < 25): { return 'VIEWER'; }
    case (level < 40): { return 'REPORTER'; }
    case (level < 55): { return 'UPDATER'; }
    case (level < 70): { return 'DEVELOPER'; }
    case (level < 90): { return 'MANAGER'; }
    case (level < 100): { return 'ADMINISTRATOR'; }
    default:
      return 'OWNER';
  }
}
