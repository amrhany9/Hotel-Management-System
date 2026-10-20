export class NotFoundException extends Error {
  constructor(name: string, key: string | number) {
    super(`Entity "${name}" (${key}) was not found.`);
    this.name = 'NotFoundException';
  }
}
