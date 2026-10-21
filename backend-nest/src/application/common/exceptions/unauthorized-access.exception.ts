export class UnauthorizedAccessException extends Error {
  constructor(message = 'User is not authenticated.') {
    super(message);
    this.name = 'UnauthorizedAccessException';
  }
}
