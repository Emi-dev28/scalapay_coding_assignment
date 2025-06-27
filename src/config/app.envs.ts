import * as dotenv from 'dotenv';

dotenv.config();
interface EnvironmentVariables {
  serverHttpPort: number;
  dbPort: number;
  dbHost: string;
  dbRootPassword: string;
  dbName: string;
  dbUsername: string;
  dbPassword: string;
}
function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const envs: EnvironmentVariables = {
  serverHttpPort: +getEnv('SERVER_PORT'),
  dbPort: +getEnv('DB_PORT'),
  dbHost: getEnv('DB_HOST'),
  dbRootPassword: getEnv('DB_ROOT_PASSWORD'),
  dbName: getEnv('DB_NAME'),
  dbUsername: getEnv('DB_USERNAME'),
  dbPassword: getEnv('DB_PASSWORD'),
};
