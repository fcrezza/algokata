const errors = {
  BAD_REQUEST: {
    status: "BAD_REQUEST",
    code: 400
  },
  UNAUTHORIZED: {
    status: "UNAUTHORIZED",
    code: 401
  },
  FORBIDDEN: {
    status: "FORBIDDEN",
    code: 403
  },
  NOT_FOUND: {
    status: "NOT_FOUND",
    code: 404
  },
  METHOD_NOT_ALLOWED: {
    status: "METHOD_NOT_ALLOWED",
    code: 405
  },
  INTERNAL_SERVER_ERROR: {
    status: "INTERNAL_SERVER_ERROR",
    code: 500
  }
};

export class HTTPBaseError extends Error {
  constructor(message) {
    super(message);
  }
}

export class HTTPNotFoundError extends HTTPBaseError {
  constructor(message) {
    super(message);
    this.code = errors.NOT_FOUND.code;
    this.status = errors.NOT_FOUND.status;
  }
}

export class HTTPBadRequestError extends HTTPBaseError {
  constructor(message) {
    super(message);
    this.code = errors.BAD_REQUEST.code;
    this.status = errors.BAD_REQUEST.status;
  }
}

export class HTTPForbiddenError extends HTTPBaseError {
  constructor(message) {
    super(message);
    this.code = errors.FORBIDDEN.code;
    this.status = errors.FORBIDDEN.status;
  }
}

export class HTTPUnauthorizedError extends HTTPBaseError {
  constructor(message) {
    super(message);
    this.code = errors.UNAUTHORIZED.code;
    this.status = errors.UNAUTHORIZED.status;
  }
}

export class HTTPMethodNotAllowedError extends HTTPBaseError {
  constructor(message) {
    super(message);
    this.code = errors.METHOD_NOT_ALLOWED.code;
    this.status = errors.METHOD_NOT_ALLOWED.status;
  }
}

export class HTTPInternalServerError extends HTTPBaseError {
  constructor(message) {
    super(message);
    this.code = errors.INTERNAL_SERVER_ERROR.code;
    this.status = errors.INTERNAL_SERVER_ERROR.status;
  }
}
