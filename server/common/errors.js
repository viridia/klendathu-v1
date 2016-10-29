class BaseError {
  constructor(status, error) {
    this.status = status;
    this.error = error;
  }

  toString() {
    return `${this.constructor.name}: ${this.error}`;
  }
}

class BadRequest extends BaseError {
  constructor(error) {
    super(400, error);
  }
}

class Unauthorized extends BaseError {
  constructor() {
    super(401, 'unauthorized');
  }
}

class Forbidden extends BaseError {
  constructor(error) {
    super(403, error);
  }
}

class NotFound extends BaseError {
  constructor(error) {
    super(404, error);
  }
}

class InternalError extends BaseError {
  constructor() {
    super(500, 'internal');
  }
}

class NotImplemented extends BaseError {
  constructor() {
    super(501, 'not-implemmented');
  }
}

const Errors = {
  PROJECT_NOT_FOUND: 'project-not-found',
  ISSUE_NOT_FOUND: 'issue-not-found',
  LABEL_NOT_FOUND: 'label-not-found',
  MISSING_FIELD: 'missing-field',
  INSUFFICIENT_ACCESS: 'insufficient-access',
  INVALID_PREDICATE: 'invalid-predicate',
  INVALID_SORT_KEY: 'invalid-sort-key',
  NAME_TOO_SHORT: 'name-too-short',
  INVALID_NAME: 'invalid-name',
  NAME_EXISTS: 'name-exists',
};

module.exports = {
  BadRequest,
  Unauthorized,
  Forbidden,
  NotFound,
  InternalError,
  NotImplemented,
  Errors,
};
