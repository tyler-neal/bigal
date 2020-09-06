import { ModelMetadata } from './ModelMetadata';
import { ColumnModifierMetadata } from './ColumnModifierMetadata';
import { ColumnMetadata } from './ColumnMetadata';
import { Entity } from '../Entity';

/**
 * This represents an object to store all of the decorator data. Since there can be multiple decorators per
 * class/property, things will be reconciled when entities are initialized
 */
export class MetadataStorage<T extends Entity> {
  public readonly models: ModelMetadata<T>[] = [];

  // All columns for all models. This data only represents @column specifics, not additional column modifiers
  public readonly columns: ColumnMetadata[] = [];

  // This represents additional column behavior separate from the main @column decorator. For example, @primaryColumn, @versionColumn, etc
  // This behavior will be merged over defaults from @column()
  public readonly columnModifiers: ColumnModifierMetadata[] = [];
}
