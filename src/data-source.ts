import "reflect-metadata"
import { DataSource } from "typeorm"
import config from 'config';
import { Client } from "./entity/Client";
import { ClientClaim } from "./entity/ClientClaim";
import { ClientCorsOrigin } from "./entity/ClientCorsOrigin";
import { ClientGrantType } from "./entity/ClientGrantType";
import { ClientPostLogoutRedirectUri } from "./entity/ClientPostLogoutRedirectUri";
import { ClientRedirectUri } from "./entity/ClientRedirectUri";
import { ClientScope } from "./entity/ClientScope";

// log all connection settings
console.log('DB_HOST:', config.get<string>('MySQLConfig.host'));
console.log('DB_PORT:', config.get<number>('MySQLConfig.port'));
console.log('DB_USER:', config.get<string>('MySQLConfig.username'));
console.log('DB_DATABASE', config.get<string>('MySQLConfig.database'));
console.log('DB_PASSWORD', config.get<string>('MySQLConfig.password'));

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: config.get<string>('MySQLConfig.host'),
    port: config.get<number>('MySQLConfig.port'),
    username: config.get<string>('MySQLConfig.username'),
    password: config.get<string>('MySQLConfig.password'),
    database: config.get<string>('MySQLConfig.database'),
    entities: ['src/entity/**/*.ts'],
    synchronize: true,
    logging: false,
    migrations: [],
    migrationsTableName: 'migrations',
    subscribers: [],
});
