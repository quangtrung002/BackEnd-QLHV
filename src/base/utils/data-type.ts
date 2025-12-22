import { isObject, get } from 'lodash';
import { isNil } from '@nestjs/common/utils/shared.utils';

export function toObject<K>(items: K[], key: string = 'id'): Record<string, K> {
  return Object.fromEntries<K>(
    items.map<[string, K]>(item => [get(item, key), item]),
  );
}

export const mergeRegex = (...regexes) => new RegExp(regexes.map(regex => regex.source).join('|'));

export function isDict(obj: any) {
  return isObject(obj) && !Array.isArray(obj);
}

export function toBool(value: any) {
  return [true, 'true', 'True', 'TRUE'].includes(value);
}

export function safeArray<T = any>(val: T[], defaultVal: T[] = []) {
  return !isNil(val) ? val : defaultVal;
}
