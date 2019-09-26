import { ColumnBaseOptions } from './ColumnBaseOptions';
import { Entity, EntityStatic } from '../Entity';

export interface ColumnModelOptions extends ColumnBaseOptions {
  /**
   * Type of the entity represented by this column id
   */
  model: string | EntityStatic<Entity>;

  /**
   * Indicates if this column is a primary key
   */
  primary?: boolean;

  /**
   * Default database value
   */
  defaultsTo?: string | string[] | number | number[] | boolean | boolean[] | (() => string | number | boolean | Date | object) | [];

  /**
   * Array of possible enumerated values
   */
  enum?: string[];
}
