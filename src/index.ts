import { Pool } from 'postgres-pool';
import { Repository } from './Repository';
import { Entity } from './Entity';
import { ReadonlyRepository } from './ReadonlyRepository';
import {
  ColumnMetadata,
  getMetadataStorage,
  ModelMetadata,
} from './metadata';
import { RepositoriesByModelNameLowered } from './RepositoriesByModelNameLowered';

export * from './Entity';
export * from './ReadonlyRepository';
export * from './Repository';

export interface Connection {
  pool: Pool;
  readonlyPool?: Pool;
}

export interface InitializeOptions extends Connection {
  connections?: { [index: string]: Connection };
  expose: (repository: ReadonlyRepository<Entity> | Repository<Entity>, tableMetadata: ModelMetadata) => void;
}

/**
 * Initializes BigAl
 * @param {Object[]} modelSchemas - Model definitions
 * @param {Object} pool - Postgres Pool
 * @param {Object} [readonlyPool] - Postgres Pool for `find` and `findOne` operations. If not defined, `pool` will be used
 * @param {Object} [connections] - Key: name of the connection; Value: { pool, readonlyPool }
 * @param {function} expose - Used to expose model classes
 */
export function initialize({
                             pool,
                             readonlyPool = pool,
                             connections = {},
                             expose,
                           }: InitializeOptions) {
  const repositoriesByModelNameLowered: RepositoriesByModelNameLowered = {};

  // Assemble all metadata for complete model and column definitions
  const metadataByModelName: { [index: string]: ModelMetadata } = {};
  const metadataStorage = getMetadataStorage();

  // Add dictionary to quickly find a column by propertyName, for applying ColumnModifierMetadata records
  const columnsByModelName: { [index: string]: { columns: ColumnMetadata[], columnsByPropertyName: { [index: string]: ColumnMetadata } } } = {};
  for (const column of metadataStorage.columns) {
    columnsByModelName[column.name] = columnsByModelName[column.name] || {
      columns: [],
      columnsByPropertyName: {},
    };

    columnsByModelName[column.name].columns.push(column);
    columnsByModelName[column.name].columnsByPropertyName[column.propertyName] = column;
  }

  for (const columnModifier of metadataStorage.columnModifiers) {
    const columns = columnsByModelName[columnModifier.target];
    if (!columns) {
      throw new Error(`Please use @table() before using a column modifier like @primaryColumn, @createDateColumn, etc. Entity: ${columnModifier.target}, Column: ${columnModifier.propertyName}`);
    }

    const column = columns.columnsByPropertyName[columnModifier.propertyName];
    if (!column) {
      throw new Error(`Please use @column() before using a column modifier like @primaryColumn, @createDateColumn, etc. Entity: ${columnModifier.target}, Column: ${columnModifier.propertyName}`);
    }

    Object.assign(column, columnModifier);
  }


  for (const model of metadataStorage.models) {
    const entityColumns = columnsByModelName[model.name];
    if (!entityColumns) {
      throw new Error(`Did not find any columns decorated with @column. Entity: ${model.name}`);
    }

    model.columns = entityColumns.columns;
    metadataByModelName[model.name] = model;

    let modelPool = pool;
    let modelReadonlyPool = readonlyPool;

    if (model.connection) {
      const modelConnection = connections[model.connection];
      if (!modelConnection) {
        throw new Error(`Unable to find connection (${model.connection}) for entity: ${model.name}`);
      }

      modelPool = modelConnection.pool || pool;
      modelReadonlyPool = modelConnection.readonlyPool || modelPool;
    }

    let repository: ReadonlyRepository<Entity> | Repository<Entity>;
    if (model.readonly) {
      repository = new ReadonlyRepository({
        modelMetadata: model,
        type: model.type,
        repositoriesByModelNameLowered,
        pool: modelPool,
        readonlyPool: modelReadonlyPool,
      });

      repositoriesByModelNameLowered[model.name.toLowerCase()] = repository;
    } else {
      repository = new Repository({
        modelMetadata: model,
        type: model.type,
        repositoriesByModelNameLowered,
        pool: modelPool,
        readonlyPool: modelReadonlyPool,
      });

      repositoriesByModelNameLowered[model.name.toLowerCase()] = repository;
    }

    expose(repository, model);
  }
}
