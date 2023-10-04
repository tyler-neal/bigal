import _ from 'lodash';

import type { ColumnModifierMetadata } from '../metadata';
import { ColumnTypeMetadata, getMetadataStorage } from '../metadata';
import type { ClassLike } from '../types';

import type { ColumnTypeOptions } from './ColumnTypeOptions';

type ReturnFunctionType = (object: ClassLike, propertyName: string) => void;

export function versionColumn(options?: ColumnTypeOptions): ReturnFunctionType;
export function versionColumn(dbColumnName: string, options?: ColumnTypeOptions): ReturnFunctionType;
export function versionColumn(dbColumnNameOrOptions?: ColumnTypeOptions | string, options?: ColumnTypeOptions): ReturnFunctionType {
  return function versionColumnDecorator(object: ClassLike, propertyName: string): void {
    let dbColumnName: string | undefined;
    if (typeof dbColumnNameOrOptions === 'string') {
      dbColumnName = dbColumnNameOrOptions;
    } else {
      // eslint-disable-next-line no-param-reassign
      options = dbColumnNameOrOptions;
    }

    if (dbColumnNameOrOptions) {
      if (!options) {
        // eslint-disable-next-line no-param-reassign
        options = {} as ColumnTypeOptions;
      }

      if (!dbColumnName) {
        dbColumnName = options.name ?? _.snakeCase(propertyName);
      }

      const metadataStorage = getMetadataStorage();
      metadataStorage.columns.push(
        new ColumnTypeMetadata({
          target: object.constructor.name,
          name: dbColumnName,
          propertyName,
          version: true,
          required: options.required,
          type: options.type,
        }),
      );
    } else {
      const metadataStorage = getMetadataStorage();
      metadataStorage.columnModifiers.push({
        target: object.constructor.name,
        name: dbColumnName ?? _.snakeCase(propertyName),
        propertyName,
        version: true,
        required: options ? options.required : undefined,
        type: options ? options.type : undefined,
      } as ColumnModifierMetadata);
    }
  };
}
