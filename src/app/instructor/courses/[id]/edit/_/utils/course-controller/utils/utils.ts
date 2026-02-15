import { EntityId, TempId } from '../types';

/**
 * Check if an ID is a temporary client-side ID
 */
export function isTempId(id: string): boolean {
  return id.startsWith('temp_') || id.startsWith('section_') || id.startsWith('lesson_');
}

/**
 * Check if an ID is a real server UUID
 */
export function isServerId(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Generate a temporary ID
 */
export function generateTempId(prefix: string): TempId {
  return `temp_${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Resolve ID using mapping (temp -> real)
 */
export function resolveId(id: EntityId, mapping: Map<TempId, EntityId>): EntityId {
  if (isTempId(id)) {
    return mapping.get(id) || id;
  }
  return id;
}
