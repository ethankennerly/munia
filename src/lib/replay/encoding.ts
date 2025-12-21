/**
 * Encoding utilities for session replay actions.
 * Reduces storage and network size by using short codes for types and keys.
 */

export const TYPE_ENCODE: Record<string, string> = {
  route: 'r',
  click: 'c',
  input: 'i',
  submit: 's',
  component: 'm',
  api_call: 'a',
  error: 'e',
};

export const TYPE_DECODE: Record<string, string> = {
  r: 'route',
  c: 'click',
  i: 'input',
  s: 'submit',
  m: 'component',
  a: 'api_call',
  e: 'error',
};

export const KEY_ENCODE: Record<string, string> = {
  path: 'p',
  target: 'tg',
  selector: 's',
  component: 'c',
  field: 'f',
  value: 'v',
  name: 'n',
  props: 'pr',
  userId: 'u',
};

export const KEY_DECODE: Record<string, string> = {
  p: 'path',
  tg: 'target',
  s: 'selector',
  c: 'component',
  f: 'field',
  v: 'value',
  n: 'name',
  pr: 'props',
  u: 'userId',
};

export type Action = {
  type: string;
  timestamp: number;
  data: Record<string, unknown>;
};

export type EncodedAction = {
  t: string; // encoded type
  ts: number; // timestamp
  d: Record<string, unknown>; // encoded data
};

/**
 * Encode data object keys recursively
 */
function encodeData(data: Record<string, unknown>): Record<string, unknown> {
  const encoded: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    const shortKey = KEY_ENCODE[key] || key;
    if (value && typeof value === 'object' && !Array.isArray(value) && value.constructor === Object) {
      encoded[shortKey] = encodeData(value as Record<string, unknown>);
    } else {
      encoded[shortKey] = value;
    }
  }
  return encoded;
}

/**
 * Decode data object keys recursively
 */
function decodeData(data: Record<string, unknown>): Record<string, unknown> {
  const decoded: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    const fullKey = KEY_DECODE[key] || key;
    if (value && typeof value === 'object' && !Array.isArray(value) && value.constructor === Object) {
      decoded[fullKey] = decodeData(value as Record<string, unknown>);
    } else {
      decoded[fullKey] = value;
    }
  }
  return decoded;
}

/**
 * Encode action for storage/transmission
 */
export function encodeAction(action: Action): EncodedAction {
  return {
    t: TYPE_ENCODE[action.type] || action.type,
    ts: action.timestamp,
    d: encodeData(action.data),
  };
}

/**
 * Decode action from storage/transmission
 */
export function decodeAction(encoded: EncodedAction): Action {
  return {
    type: TYPE_DECODE[encoded.t] || encoded.t,
    timestamp: encoded.ts,
    data: decodeData(encoded.d),
  };
}
