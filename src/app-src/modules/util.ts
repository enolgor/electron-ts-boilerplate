import { process } from './window';

const version = (item: string) => process.versions[item];
//this is a test
export { version };