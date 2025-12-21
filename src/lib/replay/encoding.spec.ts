import { describe, it, expect } from 'vitest';
import { encodeAction, decodeAction } from './encoding';

describe('replay encoding', () => {
  it('encodes route action with short type and keys', () => {
    const action = {
      type: 'route',
      timestamp: 1234567890,
      data: { path: '/feed' },
    };

    const encoded = encodeAction(action);

    expect(encoded.t).toBe('r'); // route → r
    expect(encoded.ts).toBe(1234567890);
    expect(encoded.d).toEqual({ p: '/feed' }); // path → p
  });

  it('encodes click action with selector and target', () => {
    const action = {
      type: 'click',
      timestamp: 1234567891,
      data: {
        selector: '[data-testid="like-button"]',
        target: '/profile',
      },
    };

    const encoded = encodeAction(action);

    expect(encoded.t).toBe('c'); // click → c
    expect(encoded.ts).toBe(1234567891);
    expect(encoded.d).toEqual({
      s: '[data-testid="like-button"]', // selector → s
      tg: '/profile', // target → tg
    });
  });

  it('encodes scroll action with normalized positions', () => {
    const action = {
      type: 'scroll',
      timestamp: 1234567892,
      data: {
        scrollY: 0.25,
        scrollX: 0,
      },
    };

    const encoded = encodeAction(action);

    expect(encoded.t).toBe('sc'); // scroll → sc
    expect(encoded.ts).toBe(1234567892);
    expect(encoded.d).toEqual({
      sy: 0.25, // scrollY → sy
      sx: 0, // scrollX → sx
    });
  });

  it('decodes route action correctly', () => {
    const encoded = {
      t: 'r',
      ts: 1234567890,
      d: { p: '/feed' },
    };

    const decoded = decodeAction(encoded);

    expect(decoded.type).toBe('route');
    expect(decoded.timestamp).toBe(1234567890);
    expect(decoded.data).toEqual({ path: '/feed' });
  });

  it('decodes click action correctly', () => {
    const encoded = {
      t: 'c',
      ts: 1234567891,
      d: {
        s: '[data-testid="like-button"]',
        tg: '/profile',
      },
    };

    const decoded = decodeAction(encoded);

    expect(decoded.type).toBe('click');
    expect(decoded.timestamp).toBe(1234567891);
    expect(decoded.data).toEqual({
      selector: '[data-testid="like-button"]',
      target: '/profile',
    });
  });

  it('decodes scroll action correctly', () => {
    const encoded = {
      t: 'sc',
      ts: 1234567892,
      d: {
        sy: 0.25,
        sx: 0,
      },
    };

    const decoded = decodeAction(encoded);

    expect(decoded.type).toBe('scroll');
    expect(decoded.timestamp).toBe(1234567892);
    expect(decoded.data).toEqual({
      scrollY: 0.25,
      scrollX: 0,
    });
  });

  it('round-trips: encode then decode preserves original', () => {
    const original = {
      type: 'route',
      timestamp: 1234567890,
      data: { path: '/feed' },
    };

    const encoded = encodeAction(original);
    const decoded = decodeAction(encoded);

    expect(decoded).toEqual(original);
  });

  it('round-trips: click action', () => {
    const original = {
      type: 'click',
      timestamp: 1234567891,
      data: {
        selector: '[data-testid="submit"]',
        target: 'button',
      },
    };

    const encoded = encodeAction(original);
    const decoded = decodeAction(encoded);

    expect(decoded).toEqual(original);
  });

  it('round-trips: scroll action', () => {
    const original = {
      type: 'scroll',
      timestamp: 1234567892,
      data: {
        scrollY: 0.75,
        scrollX: 0.1,
      },
    };

    const encoded = encodeAction(original);
    const decoded = decodeAction(encoded);

    expect(decoded).toEqual(original);
  });

  it('handles unknown types by passing through', () => {
    const action = {
      type: 'unknown_type',
      timestamp: 1234567893,
      data: { someKey: 'someValue' },
    };

    const encoded = encodeAction(action);
    const decoded = decodeAction(encoded);

    expect(decoded.type).toBe('unknown_type');
    expect(decoded.data).toEqual({ someKey: 'someValue' });
  });

  it('handles unknown keys by passing through', () => {
    const action = {
      type: 'route',
      timestamp: 1234567894,
      data: { path: '/feed', unknownKey: 'value' },
    };

    const encoded = encodeAction(action);
    const decoded = decodeAction(encoded);

    expect(decoded.data.path).toBe('/feed');
    expect(decoded.data.unknownKey).toBe('value');
  });

  it('encodes nested objects recursively', () => {
    const action = {
      type: 'component',
      timestamp: 1234567895,
      data: {
        component: 'Button',
        props: {
          name: 'submit',
          value: 'Click me',
        },
      },
    };

    const encoded = encodeAction(action);

    expect(encoded.d).toEqual({
      c: 'Button', // component → c
      pr: { // props → pr
        n: 'submit', // name → n
        v: 'Click me', // value → v
      },
    });
  });

  it('decodes nested objects recursively', () => {
    const encoded = {
      t: 'component',
      ts: 1234567895,
      d: {
        c: 'Button',
        pr: {
          n: 'submit',
          v: 'Click me',
        },
      },
    };

    const decoded = decodeAction(encoded);

    expect(decoded.data).toEqual({
      component: 'Button',
      props: {
        name: 'submit',
        value: 'Click me',
      },
    });
  });

  it('preserves number values correctly', () => {
    const action = {
      type: 'scroll',
      timestamp: 1234567896,
      data: {
        scrollY: 0.5,
        scrollX: 0,
      },
    };

    const encoded = encodeAction(action);
    const decoded = decodeAction(encoded);

    expect(typeof decoded.data.scrollY).toBe('number');
    expect(decoded.data.scrollY).toBe(0.5);
    expect(decoded.data.scrollX).toBe(0);
  });

  it('preserves string values correctly', () => {
    const action = {
      type: 'route',
      timestamp: 1234567897,
      data: { path: '/user/123' },
    };

    const encoded = encodeAction(action);
    const decoded = decodeAction(encoded);

    expect(typeof decoded.data.path).toBe('string');
    expect(decoded.data.path).toBe('/user/123');
  });
});

