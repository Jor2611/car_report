import { join } from "path";
import { DataSourceOptions } from "typeorm";

let dsOptions: DataSourceOptions;

switch(process.env.NODE_ENV){
  case "dev":
    dsOptions = {
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [join(__dirname,'..','**/*.entity.js')],
      migrations: [join(__dirname,'..','migrations/*.js')],
      synchronize: true
    };
    break;
  case "test":
    dsOptions = {
      type: 'sqlite',
      database: 'test.sqlite',
      entities: [join(__dirname,'..','**/*.entity.ts')],
      migrations: [join(__dirname,'..','migrations/*.js')],
      migrationsRun: true,
      synchronize: false,
    };
    break;
  case "prod":
    dsOptions = {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      migrationsRun: true,
      synchronize: false,
      entities: [join(__dirname,'..','**/*.entity.js')],
      migrations: [join(__dirname,'..','migrations/*.js')],
      ssl : {
        rejectUnauthorized: false
      }
    };
    break;
  default:
    throw new Error('Unknown environment');
}

export const dataSourceOptions = dsOptions;