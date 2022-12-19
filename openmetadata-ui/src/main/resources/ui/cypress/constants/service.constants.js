import { uuid } from './constants';
const uniqueID = uuid();

export const REDSHIFT = {
  serviceType: 'Redshift',
  serviceName: `redshift-ct-test-${uniqueID}`,
  tableName: 'boolean_test',
  DBTTable: 'customers',
  description: `This is Redshift-ct-test-${uniqueID} description`,
};

export const MYSQL = {
  serviceType: 'Mysql',
  serviceName: `mysql-ct-test-${uniqueID}`,
  tableName: 'team_entity',
  description: `This is Mysql-ct-test-${uniqueID} description`,
  database: 'Database',
};
