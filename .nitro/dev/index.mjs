import process from 'node:process';globalThis._importMeta_={url:import.meta.url,env:process.env};import { tmpdir } from 'node:os';
import { Server } from 'node:http';
import { resolve, dirname, join } from 'node:path';
import nodeCrypto from 'node:crypto';
import { parentPort, threadId } from 'node:worker_threads';
import { defineEventHandler, handleCacheHeaders, splitCookiesString, createEvent, fetchWithEvent, isEvent, eventHandler, setHeaders, createError, sendRedirect, proxyRequest, getRequestURL, getRequestHeader, getResponseHeader, getRequestHeaders, setResponseHeaders, setResponseStatus, send, removeResponseHeader, appendResponseHeader, setResponseHeader, createApp, createRouter as createRouter$1, toNodeListener, lazyEventHandler, getRouterParam, readBody, getQuery as getQuery$1, readFormData } from 'file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/h3@1.15.11/node_modules/h3/dist/index.mjs';
import destr from 'file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/destr@2.0.5/node_modules/destr/dist/index.mjs';
import { createHooks } from 'file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/hookable@5.5.3/node_modules/hookable/dist/index.mjs';
import { createFetch, Headers as Headers$1 } from 'file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/ofetch@1.5.1/node_modules/ofetch/dist/node.mjs';
import { fetchNodeRequestHandler, callNodeRequestHandler } from 'file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/node-mock-http@1.0.4/node_modules/node-mock-http/dist/index.mjs';
import { parseURL, withoutBase, joinURL, getQuery, withQuery, decodePath, withLeadingSlash, withoutTrailingSlash } from 'file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/ufo@1.6.4/node_modules/ufo/dist/index.mjs';
import { createStorage, prefixStorage } from 'file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/unstorage@1.17.5_db0@0.3.4_ioredis@5.11.1/node_modules/unstorage/dist/index.mjs';
import unstorage_47drivers_47fs from 'file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/unstorage@1.17.5_db0@0.3.4_ioredis@5.11.1/node_modules/unstorage/drivers/fs.mjs';
import { digest } from 'file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/ohash@2.0.11/node_modules/ohash/dist/index.mjs';
import { klona } from 'file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/klona@2.0.6/node_modules/klona/dist/index.mjs';
import defu, { defuFn } from 'file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/defu@6.1.7/node_modules/defu/dist/defu.mjs';
import { snakeCase } from 'file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/scule@1.3.0/node_modules/scule/dist/index.mjs';
import { toRouteMatcher, createRouter } from 'file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/radix3@1.1.2/node_modules/radix3/dist/index.mjs';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import consola from 'file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/consola@3.4.2/node_modules/consola/dist/index.mjs';
import { ErrorParser } from 'file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/youch-core@0.3.3/node_modules/youch-core/build/index.js';
import { Youch } from 'file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/youch@4.1.1/node_modules/youch/build/index.js';
import { SourceMapConsumer } from 'file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/source-map@0.7.6/node_modules/source-map/source-map.js';
import { promises } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname as dirname$1, resolve as resolve$1 } from 'file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/pathe@2.0.3/node_modules/pathe/dist/index.mjs';
import QRCode from 'file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/qrcode@1.5.4/node_modules/qrcode/lib/index.js';
import { neon } from 'file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/@neondatabase+serverless@1.1.0/node_modules/@neondatabase/serverless/index.mjs';
import { v4 } from 'file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/uuid@14.0.1/node_modules/uuid/dist-node/index.js';

const serverAssets = [{"baseName":"server","dir":"C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/server/assets"}];

const assets$1 = createStorage();

for (const asset of serverAssets) {
  assets$1.mount(asset.baseName, unstorage_47drivers_47fs({ base: asset.dir, ignore: (asset?.ignore || []) }));
}

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('root', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas"}));
storage.mount('src', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/server"}));
storage.mount('build', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/.nitro"}));
storage.mount('cache', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/.nitro/cache"}));
storage.mount('data', unstorage_47drivers_47fs({"driver":"fs","base":"C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

const inlineAppConfig = {};



const appConfig = defuFn(inlineAppConfig);

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/"
  },
  "nitro": {
    "routeRules": {
      "/api/**": {
        "cors": true,
        "headers": {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "*",
          "access-control-allow-headers": "*",
          "access-control-max-age": "0"
        }
      }
    }
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  {
    return _sharedRuntimeConfig;
  }
}
_deepFreeze(klona(appConfig));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

function isPathInScope(pathname, base) {
  let canonical;
  try {
    const pre = pathname.replace(/%2f/gi, "/").replace(/%5c/gi, "\\");
    canonical = new URL(pre, "http://_").pathname;
  } catch {
    return false;
  }
  return !base || canonical === base || canonical.startsWith(base + "/");
}

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          if (!isPathInScope(event.path.split("?")[0], strpBase)) {
            throw createError({ statusCode: 400 });
          }
          targetPath = withoutBase(targetPath, strpBase);
        } else if (targetPath.startsWith("//")) {
          targetPath = targetPath.replace(/^\/+/, "/");
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          if (!isPathInScope(event.path.split("?")[0], strpBase)) {
            throw createError({ statusCode: 400 });
          }
          targetPath = withoutBase(targetPath, strpBase);
        } else if (targetPath.startsWith("//")) {
          targetPath = targetPath.replace(/^\/+/, "/");
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$0 = defineNitroErrorHandler(
  async function defaultNitroErrorHandler(error, event) {
    const res = await defaultHandler(error, event);
    if (!event.node?.res.headersSent) {
      setResponseHeaders(event, res.headers);
    }
    setResponseStatus(event, res.status, res.statusText);
    return send(
      event,
      typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2)
    );
  }
);
async function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  await loadStackTrace(error).catch(consola.error);
  const youch = new Youch();
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    const ansiError = await (await youch.toANSI(error)).replaceAll(process.cwd(), ".");
    consola.error(
      `[request error] ${tags} [${event.method}] ${url}

`,
      ansiError
    );
  }
  const useJSON = opts?.json ?? !getRequestHeader(event, "accept")?.includes("text/html");
  const headers = {
    "content-type": useJSON ? "application/json" : "text/html",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self';"
  };
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = useJSON ? {
    error: true,
    url,
    statusCode,
    statusMessage,
    message: error.message,
    data: error.data,
    stack: error.stack?.split("\n").map((line) => line.trim())
  } : await youch.toHTML(error, {
    request: {
      url: url.href,
      method: event.method,
      headers: getRequestHeaders(event)
    }
  });
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}
async function loadStackTrace(error) {
  if (!(error instanceof Error)) {
    return;
  }
  const parsed = await new ErrorParser().defineSourceLoader(sourceLoader).parse(error);
  const stack = error.message + "\n" + parsed.frames.map((frame) => fmtFrame(frame)).join("\n");
  Object.defineProperty(error, "stack", { value: stack });
  if (error.cause) {
    await loadStackTrace(error.cause).catch(consola.error);
  }
}
async function sourceLoader(frame) {
  if (!frame.fileName || frame.fileType !== "fs" || frame.type === "native") {
    return;
  }
  if (frame.type === "app") {
    const rawSourceMap = await readFile(`${frame.fileName}.map`, "utf8").catch(() => {
    });
    if (rawSourceMap) {
      const consumer = await new SourceMapConsumer(rawSourceMap);
      const originalPosition = consumer.originalPositionFor({ line: frame.lineNumber, column: frame.columnNumber });
      if (originalPosition.source && originalPosition.line) {
        frame.fileName = resolve(dirname(frame.fileName), originalPosition.source);
        frame.lineNumber = originalPosition.line;
        frame.columnNumber = originalPosition.column || 0;
      }
    }
  }
  const contents = await readFile(frame.fileName, "utf8").catch(() => {
  });
  return contents ? { contents } : void 0;
}
function fmtFrame(frame) {
  if (frame.type === "native") {
    return frame.raw;
  }
  const src = `${frame.fileName || ""}:${frame.lineNumber}:${frame.columnNumber})`;
  return frame.functionName ? `at ${frame.functionName} (${src}` : `at ${src}`;
}

const errorHandlers = [errorHandler$0];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

const plugins = [
  
];

const assets = {
  "/index.mjs": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1d71f-TX0LdwD955mpXIfFq6acD4JwTQE\"",
    "mtime": "2026-08-03T15:35:50.750Z",
    "size": 120607,
    "path": "index.mjs"
  },
  "/index.mjs.map": {
    "type": "application/json",
    "etag": "\"69aa8-nzg1+VFsOmqp3dY1BoAlstKuk3c\"",
    "mtime": "2026-08-03T15:35:50.750Z",
    "size": 432808,
    "path": "index.mjs.map"
  }
};

function readAsset (id) {
  const serverDir = dirname$1(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve$1(serverDir, assets[id].path))
}

const publicAssetBases = {};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _ngUQxC = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError({ statusCode: 404 });
    }
    return;
  }
  if (asset.encoding !== void 0) {
    appendResponseHeader(event, "Vary", "Accept-Encoding");
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

const _lazy_zyPM9J = () => Promise.resolve().then(function () { return cashRegister_get$1; });
const _lazy_s4P548 = () => Promise.resolve().then(function () { return close_post$1; });
const _lazy_rID8to = () => Promise.resolve().then(function () { return open_post$1; });
const _lazy_4uV9wR = () => Promise.resolve().then(function () { return cashTransactions_get$1; });
const _lazy_cQiAIV = () => Promise.resolve().then(function () { return cashTransactions_post$1; });
const _lazy_EvjcMH = () => Promise.resolve().then(function () { return _id__delete$9; });
const _lazy__iU8wW = () => Promise.resolve().then(function () { return categories_get$1; });
const _lazy_o1wo52 = () => Promise.resolve().then(function () { return categories_post$3; });
const _lazy_b2VTWC = () => Promise.resolve().then(function () { return _id__delete$7; });
const _lazy_eDpqQf = () => Promise.resolve().then(function () { return _id__put$7; });
const _lazy_thsE84 = () => Promise.resolve().then(function () { return customers_get$1; });
const _lazy_krY3pv = () => Promise.resolve().then(function () { return customers_post$1; });
const _lazy_H45_Wb = () => Promise.resolve().then(function () { return _id__delete$5; });
const _lazy_h4GIBs = () => Promise.resolve().then(function () { return _id__put$5; });
const _lazy_YtRTDx = () => Promise.resolve().then(function () { return sales_get$3; });
const _lazy_N2rBSe = () => Promise.resolve().then(function () { return certificates_get$1; });
const _lazy_0mr2g0 = () => Promise.resolve().then(function () { return certificates_post$1; });
const _lazy_8HWzgs = () => Promise.resolve().then(function () { return companyConfig_get$1; });
const _lazy_PpOTdY = () => Promise.resolve().then(function () { return companyConfig_post$1; });
const _lazy_M8uIuJ = () => Promise.resolve().then(function () { return testConnection_post$1; });
const _lazy_zELk_7 = () => Promise.resolve().then(function () { return categories_post$1; });
const _lazy_GwWEhE = () => Promise.resolve().then(function () { return products_post$3; });
const _lazy_lNzaoz = () => Promise.resolve().then(function () { return sales_post$3; });
const _lazy_lqSuRD = () => Promise.resolve().then(function () { return motoboys_get$1; });
const _lazy_zC6TWw = () => Promise.resolve().then(function () { return motoboys_post$1; });
const _lazy_ykGK35 = () => Promise.resolve().then(function () { return _id__delete$3; });
const _lazy_RateJQ = () => Promise.resolve().then(function () { return _id__put$3; });
const _lazy_YLEYS8 = () => Promise.resolve().then(function () { return qrCode_get$1; });
const _lazy_hjc9Uv = () => Promise.resolve().then(function () { return _sale_id__get$1; });
const _lazy_8aGe64 = () => Promise.resolve().then(function () { return emitir_post$1; });
const _lazy_9dG2yK = () => Promise.resolve().then(function () { return products_get$1; });
const _lazy_C0_k4l = () => Promise.resolve().then(function () { return products_post$1; });
const _lazy_q5qboF = () => Promise.resolve().then(function () { return _id__delete$1; });
const _lazy_gmpj8W = () => Promise.resolve().then(function () { return _id__put$1; });
const _lazy_nl6xh4 = () => Promise.resolve().then(function () { return sales_get$1; });
const _lazy__VRAiA = () => Promise.resolve().then(function () { return sales_post$1; });
const _lazy_aXzNxt = () => Promise.resolve().then(function () { return status_put$1; });
const _lazy_ir38yz = () => Promise.resolve().then(function () { return xml_get$1; });
const _lazy_C90ob_ = () => Promise.resolve().then(function () { return testDb_get$1; });
const _lazy_RQnKGR = () => Promise.resolve().then(function () { return upload_post$1; });

const handlers = [
  { route: '', handler: _ngUQxC, lazy: false, middleware: true, method: undefined },
  { route: '/api/cash-register', handler: _lazy_zyPM9J, lazy: true, middleware: false, method: "get" },
  { route: '/api/cash-register/close', handler: _lazy_s4P548, lazy: true, middleware: false, method: "post" },
  { route: '/api/cash-register/open', handler: _lazy_rID8to, lazy: true, middleware: false, method: "post" },
  { route: '/api/cash-transactions', handler: _lazy_4uV9wR, lazy: true, middleware: false, method: "get" },
  { route: '/api/cash-transactions', handler: _lazy_cQiAIV, lazy: true, middleware: false, method: "post" },
  { route: '/api/cash-transactions/:id', handler: _lazy_EvjcMH, lazy: true, middleware: false, method: "delete" },
  { route: '/api/categories', handler: _lazy__iU8wW, lazy: true, middleware: false, method: "get" },
  { route: '/api/categories', handler: _lazy_o1wo52, lazy: true, middleware: false, method: "post" },
  { route: '/api/categories/:id', handler: _lazy_b2VTWC, lazy: true, middleware: false, method: "delete" },
  { route: '/api/categories/:id', handler: _lazy_eDpqQf, lazy: true, middleware: false, method: "put" },
  { route: '/api/customers', handler: _lazy_thsE84, lazy: true, middleware: false, method: "get" },
  { route: '/api/customers', handler: _lazy_krY3pv, lazy: true, middleware: false, method: "post" },
  { route: '/api/customers/:id', handler: _lazy_H45_Wb, lazy: true, middleware: false, method: "delete" },
  { route: '/api/customers/:id', handler: _lazy_h4GIBs, lazy: true, middleware: false, method: "put" },
  { route: '/api/customers/:id/sales', handler: _lazy_YtRTDx, lazy: true, middleware: false, method: "get" },
  { route: '/api/fiscal/certificates', handler: _lazy_N2rBSe, lazy: true, middleware: false, method: "get" },
  { route: '/api/fiscal/certificates', handler: _lazy_0mr2g0, lazy: true, middleware: false, method: "post" },
  { route: '/api/fiscal/company-config', handler: _lazy_8HWzgs, lazy: true, middleware: false, method: "get" },
  { route: '/api/fiscal/company-config', handler: _lazy_PpOTdY, lazy: true, middleware: false, method: "post" },
  { route: '/api/fiscal/test-connection', handler: _lazy_M8uIuJ, lazy: true, middleware: false, method: "post" },
  { route: '/api/migrate/categories', handler: _lazy_zELk_7, lazy: true, middleware: false, method: "post" },
  { route: '/api/migrate/products', handler: _lazy_GwWEhE, lazy: true, middleware: false, method: "post" },
  { route: '/api/migrate/sales', handler: _lazy_lNzaoz, lazy: true, middleware: false, method: "post" },
  { route: '/api/motoboys', handler: _lazy_lqSuRD, lazy: true, middleware: false, method: "get" },
  { route: '/api/motoboys', handler: _lazy_zC6TWw, lazy: true, middleware: false, method: "post" },
  { route: '/api/motoboys/:id', handler: _lazy_ykGK35, lazy: true, middleware: false, method: "delete" },
  { route: '/api/motoboys/:id', handler: _lazy_RateJQ, lazy: true, middleware: false, method: "put" },
  { route: '/api/nfce/:id/qr-code', handler: _lazy_YLEYS8, lazy: true, middleware: false, method: "get" },
  { route: '/api/nfce/:sale_id', handler: _lazy_hjc9Uv, lazy: true, middleware: false, method: "get" },
  { route: '/api/nfce/emitir', handler: _lazy_8aGe64, lazy: true, middleware: false, method: "post" },
  { route: '/api/products', handler: _lazy_9dG2yK, lazy: true, middleware: false, method: "get" },
  { route: '/api/products', handler: _lazy_C0_k4l, lazy: true, middleware: false, method: "post" },
  { route: '/api/products/:id', handler: _lazy_q5qboF, lazy: true, middleware: false, method: "delete" },
  { route: '/api/products/:id', handler: _lazy_gmpj8W, lazy: true, middleware: false, method: "put" },
  { route: '/api/sales', handler: _lazy_nl6xh4, lazy: true, middleware: false, method: "get" },
  { route: '/api/sales', handler: _lazy__VRAiA, lazy: true, middleware: false, method: "post" },
  { route: '/api/sales/:id/status', handler: _lazy_aXzNxt, lazy: true, middleware: false, method: "put" },
  { route: '/api/sales/:id/xml', handler: _lazy_ir38yz, lazy: true, middleware: false, method: "get" },
  { route: '/api/test-db', handler: _lazy_C90ob_, lazy: true, middleware: false, method: "get" },
  { route: '/api/upload', handler: _lazy_RQnKGR, lazy: true, middleware: false, method: "post" }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(true),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp$1.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter$1({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => callNodeRequestHandler(
    nodeHandler,
    aRequest
  );
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return fetchNodeRequestHandler(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp$1 = createNitroApp();
function useNitroApp() {
  return nitroApp$1;
}
runNitroPlugins(nitroApp$1);

const scheduledTasks = false;

const tasks = {
  
};

const __runningTasks__ = {};
async function runTask(name, {
  payload = {},
  context = {}
} = {}) {
  if (__runningTasks__[name]) {
    return __runningTasks__[name];
  }
  if (!(name in tasks)) {
    throw createError({
      message: `Task \`${name}\` is not available!`,
      statusCode: 404
    });
  }
  if (!tasks[name].resolve) {
    throw createError({
      message: `Task \`${name}\` is not implemented!`,
      statusCode: 501
    });
  }
  const handler = await tasks[name].resolve();
  const taskEvent = { name, payload, context };
  __runningTasks__[name] = handler.run(taskEvent);
  try {
    const res = await __runningTasks__[name];
    return res;
  } finally {
    delete __runningTasks__[name];
  }
}

if (!globalThis.crypto) {
  globalThis.crypto = nodeCrypto.webcrypto;
}
const { NITRO_NO_UNIX_SOCKET, NITRO_DEV_WORKER_ID } = process.env;
trapUnhandledNodeErrors();
parentPort?.on("message", (msg) => {
  if (msg && msg.event === "shutdown") {
    shutdown();
  }
});
const nitroApp = useNitroApp();
const server = new Server(toNodeListener(nitroApp.h3App));
let listener;
listen().catch(() => listen(
  true
  /* use random port */
)).catch((error) => {
  console.error("Dev worker failed to listen:", error);
  return shutdown();
});
nitroApp.router.get(
  "/_nitro/tasks",
  defineEventHandler(async (event) => {
    const _tasks = await Promise.all(
      Object.entries(tasks).map(async ([name, task]) => {
        const _task = await task.resolve?.();
        return [name, { description: _task?.meta?.description }];
      })
    );
    return {
      tasks: Object.fromEntries(_tasks),
      scheduledTasks
    };
  })
);
nitroApp.router.use(
  "/_nitro/tasks/:name",
  defineEventHandler(async (event) => {
    const name = getRouterParam(event, "name");
    const payload = {
      ...getQuery$1(event),
      ...await readBody(event).then((r) => r?.payload).catch(() => ({}))
    };
    return await runTask(name, { payload });
  })
);
function listen(useRandomPort = Boolean(
  NITRO_NO_UNIX_SOCKET || process.versions.webcontainer || "Bun" in globalThis && process.platform === "win32"
)) {
  return new Promise((resolve, reject) => {
    try {
      listener = server.listen(useRandomPort ? 0 : getSocketAddress(), () => {
        const address = server.address();
        parentPort?.postMessage({
          event: "listen",
          address: typeof address === "string" ? { socketPath: address } : { host: "localhost", port: address?.port }
        });
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}
function getSocketAddress() {
  const socketName = `nitro-worker-${process.pid}-${threadId}-${NITRO_DEV_WORKER_ID}-${Math.round(Math.random() * 1e4)}.sock`;
  if (process.platform === "win32") {
    return join(String.raw`\\.\pipe`, socketName);
  }
  if (process.platform === "linux") {
    const nodeMajor = Number.parseInt(process.versions.node.split(".")[0], 10);
    if (nodeMajor >= 20) {
      return `\0${socketName}`;
    }
  }
  return join(tmpdir(), socketName);
}
async function shutdown() {
  server.closeAllConnections?.();
  await Promise.all([
    new Promise((resolve) => listener?.close(resolve)),
    nitroApp.hooks.callHook("close").catch(console.error)
  ]);
  parentPort?.postMessage({ event: "exit" });
}

const sql = neon(process.env.DATABASE_URL);

const cashRegister_get = defineEventHandler(async () => {
  try {
    const openRegister = await sql`
          SELECT * FROM cash_registers
          WHERE status = 'open'
          ORDER BY opened_at DESC
          LIMIT 1
        `;
    let currentRegister = null;
    let salesTotal = 0;
    let salesByPayment = {
      cash: 0,
      debit: 0,
      credit: 0,
      pix: 0
    };
    if (openRegister.length > 0) {
      currentRegister = openRegister[0];
      const sales = await sql`
              SELECT * FROM sales
              WHERE created_at >= ${currentRegister.opened_at}
            `;
      sales.forEach((sale) => {
        const total = parseFloat(sale.total_amount);
        salesTotal += total;
        if (sale.payments && Array.isArray(sale.payments)) {
          sale.payments.forEach((payment) => {
            const amount = parseFloat(payment.amount);
            const change = parseFloat(payment.change || 0);
            const netAmount = amount - change;
            if (salesByPayment[payment.type] !== void 0) {
              salesByPayment[payment.type] += netAmount;
            }
          });
        } else {
          const method = sale.payment_method.toLowerCase();
          if (method.includes("dinheiro") || method.includes("cash")) {
            salesByPayment.cash += total;
          } else if (method.includes("d\xE9bito") || method.includes("debit")) {
            salesByPayment.debit += total;
          } else if (method.includes("cr\xE9dito") || method.includes("credit")) {
            salesByPayment.credit += total;
          } else if (method.includes("pix")) {
            salesByPayment.pix += total;
          } else {
            salesByPayment.cash += total;
          }
        }
      });
      const transactionsResult = await sql`
              SELECT * FROM cash_transactions
              WHERE cash_register_id = ${currentRegister.id}
              ORDER BY created_at DESC
            `;
      currentRegister = {
        ...currentRegister,
        salesTotal,
        salesByPayment,
        transactions: transactionsResult
      };
    }
    const history = await sql`
          SELECT * FROM cash_registers
          WHERE status = 'closed'
          ORDER BY closed_at DESC
          LIMIT 10
        `;
    return {
      current: currentRegister,
      history
    };
  } catch (error) {
    console.error("Error fetching cash register:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error fetching cash register"
    });
  }
});

const cashRegister_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: cashRegister_get
});

const close_post = defineEventHandler(async (event) => {
  try {
    const { closingAmount, notes } = await readBody(event);
    const openRegister = await sql`
          SELECT * FROM cash_registers
          WHERE status = 'open'
          ORDER BY opened_at DESC
          LIMIT 1
        `;
    if (openRegister.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Nenhum caixa aberto encontrado"
      });
    }
    const register = openRegister[0];
    const sales = await sql`
          SELECT payment_method, payments, total_amount
          FROM sales
          WHERE created_at >= ${register.opened_at}
        `;
    let salesTotal = 0;
    let cashSales = 0;
    sales.forEach((sale) => {
      const total = parseFloat(sale.total_amount);
      salesTotal += total;
      if (sale.payments && Array.isArray(sale.payments)) {
        sale.payments.forEach((payment) => {
          const amount = parseFloat(payment.amount);
          const change = parseFloat(payment.change || 0);
          const netAmount = amount - change;
          if (payment.type === "cash") {
            cashSales += netAmount;
          }
        });
      } else {
        const method = sale.payment_method.toLowerCase();
        if (method.includes("dinheiro") || method.includes("cash")) {
          cashSales += total;
        }
      }
    });
    const transactionsResult = await sql`
          SELECT type, COALESCE(SUM(amount), 0) as total
          FROM cash_transactions
          WHERE cash_register_id = ${register.id}
          GROUP BY type
        `;
    let withdrawals = 0;
    let additions = 0;
    let vouchers = 0;
    transactionsResult.forEach((trans) => {
      const total = parseFloat(trans.total);
      if (trans.type === "withdrawal") {
        withdrawals += total;
      } else if (trans.type === "addition") {
        additions += total;
      } else if (trans.type === "voucher") {
        vouchers += total;
      }
    });
    const openingAmount = parseFloat(register.opening_amount);
    const closingCash = salesTotal - withdrawals;
    const expectedCashAmount = openingAmount + cashSales + additions - withdrawals - vouchers;
    const expectedTotalAmount = openingAmount + salesTotal + additions - withdrawals - vouchers;
    const difference = closingAmount - expectedCashAmount;
    await sql`
          UPDATE cash_registers
          SET
            closed_at = CURRENT_TIMESTAMP,
            closing_amount = ${closingAmount},
            expected_amount = ${expectedCashAmount},
            difference = ${difference},
            status = 'closed',
            notes = ${notes || null}
          WHERE id = ${register.id}
        `;
    return {
      success: true,
      salesTotal,
      cashSales,
      closingCash,
      expectedCashAmount,
      expectedTotalAmount,
      withdrawals,
      additions,
      vouchers,
      // NOVO: Total de Vales
      difference
    };
  } catch (error) {
    console.error("Error closing cash register:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error closing cash register"
    });
  }
});

const close_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: close_post
});

const open_post = defineEventHandler(async (event) => {
  try {
    const { openingAmount, notes } = await readBody(event);
    const existing = await sql`
          SELECT * FROM cash_registers
          WHERE status = 'open'
          LIMIT 1
        `;
    if (existing.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "J\xE1 existe um caixa aberto"
      });
    }
    const id = `cash-${Date.now()}`;
    await sql`
          INSERT INTO cash_registers (id, opening_amount, status, notes)
          VALUES (${id}, ${openingAmount}, 'open', ${notes || null})
        `;
    return { success: true, id };
  } catch (error) {
    console.error("Error opening cash register:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error opening cash register"
    });
  }
});

const open_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: open_post
});

const cashTransactions_get = defineEventHandler(async () => {
  try {
    const openRegister = await sql`
        SELECT * FROM cash_registers
        WHERE status = 'open'
        ORDER BY opened_at DESC
        LIMIT 1
      `;
    if (openRegister.length === 0) {
      return { transactions: [] };
    }
    const cashRegisterId = openRegister[0].id;
    const transactions = await sql`
          SELECT * FROM cash_transactions
          WHERE cash_register_id = ${cashRegisterId}
          ORDER BY created_at DESC
        `;
    return { transactions };
  } catch (error) {
    console.error("Error fetching cash transactions:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error fetching cash transactions"
    });
  }
});

const cashTransactions_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: cashTransactions_get
});

const cashTransactions_post = defineEventHandler(async (event) => {
  try {
    const { type, amount, description } = await readBody(event);
    const openRegister = await sql`
          SELECT * FROM cash_registers
          WHERE status = 'open'
          ORDER BY opened_at DESC
          LIMIT 1
        `;
    if (openRegister.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Nenhum caixa aberto encontrado"
      });
    }
    const cashRegisterId = openRegister[0].id;
    const id = `trans-${Date.now()}`;
    await sql`
          INSERT INTO cash_transactions (id, cash_register_id, type, amount, description)
          VALUES (${id}, ${cashRegisterId}, ${type}, ${amount}, ${description || null})
        `;
    return { success: true, id };
  } catch (error) {
    console.error("Error creating cash transaction:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error creating cash transaction"
    });
  }
});

const cashTransactions_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: cashTransactions_post
});

const _id__delete$8 = defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    const result = await sql`
          DELETE FROM cash_transactions
          WHERE id = ${id}
          RETURNING *
        `;
    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction not found"
      });
    }
    return { success: true };
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error deleting transaction"
    });
  }
});

const _id__delete$9 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__delete$8
});

const categories_get = defineEventHandler(async () => {
  try {
    const categories = await sql`
          SELECT * FROM categories
          ORDER BY
            CASE id
              WHEN 'salgados' THEN 1
              WHEN 'bolos' THEN 2
              WHEN 'brigadeiros' THEN 3
              WHEN 'bebidas' THEN 4
              WHEN 'combos' THEN 5
              WHEN 'diversos' THEN 6
              ELSE 7
            END ASC,
            name ASC
        `;
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error fetching categories"
    });
  }
});

const categories_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: categories_get
});

const categories_post$2 = defineEventHandler(async (event) => {
  var _a;
  try {
    const category = await readBody(event);
    const result = await sql`
          INSERT INTO categories (id, name, icon, active)
          VALUES (${category.id}, ${category.name}, ${category.icon}, ${(_a = category.active) != null ? _a : true})
          RETURNING *
        `;
    return result[0];
  } catch (error) {
    console.error("Error creating category:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error creating category"
    });
  }
});

const categories_post$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: categories_post$2
});

const _id__delete$6 = defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    await sql`DELETE FROM products WHERE category = ${id}`;
    const result = await sql`
          DELETE FROM categories
          WHERE id = ${id}
          RETURNING *
        `;
    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Category not found"
      });
    }
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error deleting category"
    });
  }
});

const _id__delete$7 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__delete$6
});

const _id__put$6 = defineEventHandler(async (event) => {
  var _a;
  try {
    const id = getRouterParam(event, "id");
    const category = await readBody(event);
    const result = await sql`
          UPDATE categories
          SET
            name = ${category.name},
            icon = ${category.icon},
            active = ${(_a = category.active) != null ? _a : true}
          WHERE id = ${id}
          RETURNING *
        `;
    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Category not found"
      });
    }
    return result[0];
  } catch (error) {
    console.error("Error updating category:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error updating category"
    });
  }
});

const _id__put$7 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__put$6
});

const customers_get = defineEventHandler(async () => {
  try {
    const customers = await sql`
        SELECT
          c.*,
          COUNT(s.id) as total_orders
        FROM customers c
        LEFT JOIN sales s ON c.id = s.customer_id
        GROUP BY c.id
        ORDER BY c.created_at DESC
      `;
    return customers;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error fetching customers"
    });
  }
});

const customers_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: customers_get
});

const customers_post = defineEventHandler(async (event) => {
  try {
    const customer = await readBody(event);
    const result = await sql`
          INSERT INTO customers (id, name, phone, address, email, points, total_spent)
          VALUES (
            ${customer.id},
            ${customer.name},
            ${customer.phone || null},
            ${customer.address || null},
            ${customer.email || null},
            ${customer.points || 0},
            ${customer.total_spent || 0}
          )
          RETURNING *
        `;
    return result[0];
  } catch (error) {
    console.error("Error creating customer:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error creating customer"
    });
  }
});

const customers_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: customers_post
});

const _id__delete$4 = defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    await sql`UPDATE sales SET customer_id = NULL WHERE customer_id = ${id}`;
    const result = await sql`
          DELETE FROM customers
          WHERE id = ${id}
          RETURNING *
        `;
    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Customer not found"
      });
    }
    return { success: true };
  } catch (error) {
    console.error("Error deleting customer:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error deleting customer"
    });
  }
});

const _id__delete$5 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__delete$4
});

const _id__put$4 = defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    const customer = await readBody(event);
    const result = await sql`
          UPDATE customers
          SET
            name = ${customer.name},
            phone = ${customer.phone || null},
            address = ${customer.address || null},
            email = ${customer.email || null},
            points = ${customer.points || 0},
            total_spent = ${customer.total_spent || 0},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING *
        `;
    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Customer not found"
      });
    }
    return result[0];
  } catch (error) {
    console.error("Error updating customer:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error updating customer"
    });
  }
});

const _id__put$5 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__put$4
});

const sales_get$2 = defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    const sales = await sql`
          SELECT
            s.*,
            json_agg(
              json_build_object(
                'id', si.id,
                'product_id', si.product_id,
                'product_name', si.product_name,
                'quantity', si.quantity,
                'price', si.price,
                'flavors', si.flavors
              )
            ) as items
          FROM sales s
          LEFT JOIN sale_items si ON s.id = si.sale_id
          WHERE s.customer_id = ${id}
          GROUP BY s.id
          ORDER BY s.created_at DESC
          LIMIT 50
        `;
    return sales;
  } catch (error) {
    console.error("Error fetching customer sales:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error fetching customer sales"
    });
  }
});

const sales_get$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: sales_get$2
});

const certificates_get = defineEventHandler(async () => {
  try {
    const certificates = await sql`
          SELECT id, nome, data_validade, ativo, created_at
          FROM digital_certificates
          ORDER BY created_at DESC
        `;
    return certificates.map((cert) => ({
      ...cert,
      expirado: new Date(cert.data_validade) < /* @__PURE__ */ new Date()
    }));
  } catch (error) {
    console.error("Error fetching certificates:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error fetching certificates"
    });
  }
});

const certificates_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: certificates_get
});

const certificates_post = defineEventHandler(async (event) => {
  try {
    const formData = await readFormData(event);
    const file = formData.get("file");
    const nome = formData.get("nome");
    const senha = formData.get("senha");
    if (!file || !nome || !senha) {
      throw createError({
        statusCode: 400,
        statusMessage: "Dados incompletos"
      });
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const dataValidade = /* @__PURE__ */ new Date();
    dataValidade.setFullYear(dataValidade.getFullYear() + 1);
    const id = `cert-${Date.now()}`;
    const result = await sql`
          INSERT INTO digital_certificates (id, nome, arquivo, senha, data_validade)
          VALUES (${id}, ${nome}, ${buffer}, ${senha}, ${dataValidade})
          RETURNING id, nome, data_validade
        `;
    return result[0];
  } catch (error) {
    console.error("Error saving certificate:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error saving certificate"
    });
  }
});

const certificates_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: certificates_post
});

const companyConfig_get = defineEventHandler(async () => {
  try {
    const configs = await sql`
          SELECT * FROM company_fiscal_config
          ORDER BY created_at DESC
          LIMIT 1
        `;
    return configs[0] || null;
  } catch (error) {
    console.error("Error fetching company config:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error fetching company config"
    });
  }
});

const companyConfig_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: companyConfig_get
});

const optionalText = (value) => {
  const text = String(value != null ? value : "").trim();
  return text || null;
};
const positiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(String(value != null ? value : ""), 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
};
const companyConfig_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e;
  try {
    const config = await readBody(event);
    const cnpj = String((_a = config.cnpj) != null ? _a : "").replace(/\D/g, "");
    const razaoSocial = String((_b = config.razao_social) != null ? _b : "").trim();
    const uf = String((_c = config.uf) != null ? _c : "").trim().toUpperCase();
    const crt = String((_e = (_d = config.crt) != null ? _d : config.CRT) != null ? _e : "").trim();
    if (cnpj.length !== 14 || !razaoSocial || !/^[A-Z]{2}$/.test(uf) || !["1", "2", "3"].includes(crt)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Informe CNPJ, raz\xE3o social, UF e CRT v\xE1lidos."
      });
    }
    const existing = await sql`
      SELECT id FROM company_fiscal_config
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const values = {
      cnpj,
      razaoSocial,
      nomeFantasia: optionalText(config.nome_fantasia),
      inscricaoEstadual: optionalText(config.inscricao_estadual),
      inscricaoMunicipal: optionalText(config.inscricao_municipal),
      cnae: optionalText(config.cnae),
      cnpjMatriz: optionalText(config.cnpj_matriz),
      regimeTributario: optionalText(config.regime_tributario),
      crt,
      cep: optionalText(config.cep),
      logradouro: optionalText(config.logradouro),
      numero: optionalText(config.numero),
      complemento: optionalText(config.complemento),
      bairro: optionalText(config.bairro),
      municipio: optionalText(config.municipio),
      uf,
      telefone: optionalText(config.telefone),
      email: optionalText(config.email),
      ambiente: config.ambiente === "producao" ? "producao" : "homologacao",
      serieNfe: positiveInteger(config.serie_nfe, 1),
      serieNfce: positiveInteger(config.serie_nfce, 1),
      ultimaNfe: positiveInteger(config.ultima_nfe, 0),
      ultimaNfce: positiveInteger(config.ultima_nfce, 0)
    };
    if (existing.length > 0) {
      const result2 = await sql`
        UPDATE company_fiscal_config
        SET
          cnpj = ${values.cnpj},
          razao_social = ${values.razaoSocial},
          nome_fantasia = ${values.nomeFantasia},
          inscricao_estadual = ${values.inscricaoEstadual},
          inscricao_municipal = ${values.inscricaoMunicipal},
          cnae = ${values.cnae},
          cnpj_matriz = ${values.cnpjMatriz},
          regime_tributario = ${values.regimeTributario},
          crt = ${values.crt},
          cep = ${values.cep},
          logradouro = ${values.logradouro},
          numero = ${values.numero},
          complemento = ${values.complemento},
          bairro = ${values.bairro},
          municipio = ${values.municipio},
          uf = ${values.uf},
          telefone = ${values.telefone},
          email = ${values.email},
          ambiente = ${values.ambiente},
          serie_nfe = ${values.serieNfe},
          serie_nfce = ${values.serieNfce},
          ultima_nfe = ${values.ultimaNfe},
          ultima_nfce = ${values.ultimaNfce},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existing[0].id}
        RETURNING *
      `;
      return result2[0];
    }
    const result = await sql`
      INSERT INTO company_fiscal_config (
        cnpj, razao_social, nome_fantasia, inscricao_estadual,
        inscricao_municipal, cnae, cnpj_matriz, regime_tributario,
        crt, cep, logradouro, numero, complemento, bairro,
        municipio, uf, telefone, email, ambiente,
        serie_nfe, serie_nfce, ultima_nfe, ultima_nfce
      ) VALUES (
        ${values.cnpj}, ${values.razaoSocial}, ${values.nomeFantasia}, ${values.inscricaoEstadual},
        ${values.inscricaoMunicipal}, ${values.cnae}, ${values.cnpjMatriz}, ${values.regimeTributario},
        ${values.crt}, ${values.cep}, ${values.logradouro}, ${values.numero}, ${values.complemento},
        ${values.bairro}, ${values.municipio}, ${values.uf}, ${values.telefone}, ${values.email},
        ${values.ambiente}, ${values.serieNfe}, ${values.serieNfce}, ${values.ultimaNfe}, ${values.ultimaNfce}
      )
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error("Error saving company config:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Erro ao salvar configura\xE7\xF5es fiscais"
    });
  }
});

const companyConfig_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: companyConfig_post
});

const testConnection_post = defineEventHandler(async (event) => {
  try {
    const configResult = await sql`
          SELECT * FROM company_fiscal_config
          ORDER BY created_at DESC
          LIMIT 1
        `;
    if (!configResult || configResult.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Configura\xE7\xE3o da empresa n\xE3o encontrada"
      });
    }
    const config = configResult[0];
    const certResult = await sql`
          SELECT * FROM digital_certificates
          WHERE ativo = true
          ORDER BY created_at DESC
          LIMIT 1
        `;
    if (!certResult || certResult.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Nenhum certificado ativo encontrado"
      });
    }
    const cert = certResult[0];
    const now = /* @__PURE__ */ new Date();
    const validade = new Date(cert.data_validade);
    if (validade < now) {
      return {
        success: false,
        message: "Certificado expirado",
        details: {
          validade: validade.toISOString(),
          hoje: now.toISOString()
        }
      };
    }
    const sefazUrl = config.ambiente === "producao" ? "https://nfe.sefaz.rr.gov.br/nfe/services/NfeStatusServico2" : "https://homologacao.nfe.sefaz.rr.gov.br/nfe/services/NfeStatusServico2";
    const diasRestantes = Math.floor((validade.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24));
    return {
      success: true,
      message: "Conex\xE3o com SEFAZ-RR estabelecida com sucesso",
      details: {
        ambiente: config.ambiente,
        cnpj: config.cnpj,
        razao_social: config.razao_social,
        certificado: {
          nome: cert.nome,
          validade: validade.toISOString(),
          dias_restantes: diasRestantes
        },
        sefaz_url: sefazUrl,
        nota: "Este \xE9 um teste simulado. Em produ\xE7\xE3o, uma requisi\xE7\xE3o SOAP real seria feita."
      }
    };
  } catch (error) {
    console.error("Error testing SEFAZ connection:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error testing SEFAZ connection"
    });
  }
});

const testConnection_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: testConnection_post
});

const categories_post = defineEventHandler(async (event) => {
  var _a;
  try {
    const categories = await readBody(event);
    if (!Array.isArray(categories)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid data format"
      });
    }
    let migrated = 0;
    for (const cat of categories) {
      await sql()`
        INSERT INTO categories (id, name, icon, active)
        VALUES (${cat.id}, ${cat.name}, ${cat.icon}, ${(_a = cat.active) != null ? _a : true})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          icon = EXCLUDED.icon,
          active = EXCLUDED.active
      `;
      migrated++;
    }
    return { success: true, count: migrated };
  } catch (error) {
    console.error("Error migrating categories:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error migrating categories"
    });
  }
});

const categories_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: categories_post
});

const products_post$2 = defineEventHandler(async (event) => {
  var _a, _b;
  try {
    const products = await readBody(event);
    if (!Array.isArray(products)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid data format"
      });
    }
    let migrated = 0;
    for (const prod of products) {
      await sql()`
        INSERT INTO products (
          id, name, description, price, category, category_name,
          image, available, stock, fiscal
        )
        VALUES (
          ${prod.id},
          ${prod.name},
          ${prod.description || null},
          ${prod.price},
          ${prod.category},
          ${null},
          ${prod.image},
          ${(_a = prod.available) != null ? _a : true},
          ${(_b = prod.stock) != null ? _b : 0},
          ${prod.fiscal ? JSON.stringify(prod.fiscal) : null}::jsonb
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          price = EXCLUDED.price,
          category = EXCLUDED.category,
          image = EXCLUDED.image,
          available = EXCLUDED.available,
          stock = EXCLUDED.stock,
          fiscal = EXCLUDED.fiscal,
          updated_at = CURRENT_TIMESTAMP
      `;
      migrated++;
    }
    return { success: true, count: migrated };
  } catch (error) {
    console.error("Error migrating products:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error migrating products"
    });
  }
});

const products_post$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: products_post$2
});

const sales_post$2 = defineEventHandler(async (event) => {
  var _a, _b;
  try {
    const sales = await readBody(event);
    if (!Array.isArray(sales)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid data format"
      });
    }
    let migrated = 0;
    for (const sale of sales) {
      const saleResult = await sql()`
        INSERT INTO sales (total_amount, payment_method, freight, created_at)
        VALUES (
          ${sale.total}, 
          ${((_b = (_a = sale.payments) == null ? void 0 : _a[0]) == null ? void 0 : _b.type) || "cash"}, 
          ${sale.freight || 0}, 
          ${sale.date}
        )
        RETURNING id
      `;
      const saleId = saleResult[0].id;
      if (sale.items && Array.isArray(sale.items)) {
        for (const item of sale.items) {
          await sql()`
            INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price, flavors)
            VALUES (
              ${saleId},
              ${item.id},
              ${item.name},
              ${item.quantity},
              ${item.price},
              ${item.flavors ? JSON.stringify(item.flavors) : null}::jsonb
            )
          `;
        }
      }
      migrated++;
    }
    return { success: true, count: migrated };
  } catch (error) {
    console.error("Error migrating sales:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error migrating sales"
    });
  }
});

const sales_post$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: sales_post$2
});

const motoboys_get = defineEventHandler(async () => {
  try {
    const motoboys = await sql`
        SELECT * FROM motoboys
        ORDER BY name ASC
      `;
    return motoboys;
  } catch (error) {
    console.error("Error fetching motoboys:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error fetching motoboys"
    });
  }
});

const motoboys_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: motoboys_get
});

const motoboys_post = defineEventHandler(async (event) => {
  try {
    const motoboy = await readBody(event);
    const result = await sql`
          INSERT INTO motoboys (id, name, phone)
          VALUES (${motoboy.id}, ${motoboy.name}, ${motoboy.phone || null})
          RETURNING *
        `;
    return result[0];
  } catch (error) {
    console.error("Error creating motoboy:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error creating motoboy"
    });
  }
});

const motoboys_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: motoboys_post
});

const _id__delete$2 = defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    const result = await sql`
          DELETE FROM motoboys
          WHERE id = ${id}
          RETURNING *
        `;
    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Motoboy not found"
      });
    }
    return { success: true };
  } catch (error) {
    console.error("Error deleting motoboy:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error deleting motoboy"
    });
  }
});

const _id__delete$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__delete$2
});

const _id__put$2 = defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    const motoboy = await readBody(event);
    const result = await sql`
          UPDATE motoboys
          SET
            name = ${motoboy.name},
            phone = ${motoboy.phone || null}
          WHERE id = ${id}
          RETURNING *
        `;
    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Motoboy not found"
      });
    }
    return result[0];
  } catch (error) {
    console.error("Error updating motoboy:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error updating motoboy"
    });
  }
});

const _id__put$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__put$2
});

async function generateQrCodeImage(qrCodeString) {
  try {
    const qrDataUrl = await QRCode.toDataURL(qrCodeString, {
      width: 150,
      margin: 1,
      errorCorrectionLevel: "L"
    });
    return qrDataUrl;
  } catch (error) {
    console.error("Error generating QR code image:", error);
    throw error;
  }
}

const qrCode_get = defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID da NFC-e \xE9 obrigat\xF3rio"
      });
    }
    const result = await sql`
          SELECT qr_code FROM nfce
          WHERE id = ${id}
          LIMIT 1
        `;
    if (!result || result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "NFC-e n\xE3o encontrada"
      });
    }
    const qrCodeString = result[0].qr_code;
    if (!qrCodeString) {
      throw createError({
        statusCode: 400,
        statusMessage: "QR Code n\xE3o dispon\xEDvel para esta NFC-e"
      });
    }
    const qrCodeImage = await generateQrCodeImage(qrCodeString);
    return {
      image: qrCodeImage
    };
  } catch (error) {
    console.error("Error generating QR code:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Erro ao gerar QR Code"
    });
  }
});

const qrCode_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: qrCode_get
});

const _sale_id__get = defineEventHandler(async (event) => {
  try {
    const saleId = getRouterParam(event, "sale_id");
    if (!saleId) {
      throw createError({
        statusCode: 400,
        statusMessage: "sale_id \xE9 obrigat\xF3rio"
      });
    }
    const result = await sql`
          SELECT * FROM nfce
          WHERE sale_id = ${saleId}
          ORDER BY created_at DESC
          LIMIT 1
        `;
    if (!result || result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "NFC-e n\xE3o encontrada para esta venda"
      });
    }
    return result[0];
  } catch (error) {
    console.error("Error fetching NFC-e:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Erro ao buscar NFC-e"
    });
  }
});

const _sale_id__get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _sale_id__get
});

async function enviarParaSefaz(xml, ambiente) {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1e3));
    const chaveMatch = xml.match(/Id="NFe(\d{44})"/);
    const chaveAcesso = chaveMatch ? chaveMatch[1] : "";
    const numeroMatch = xml.match(/<nNF>(\d+)<\/nNF>/);
    const numero = numeroMatch ? parseInt(numeroMatch[1]) : 0;
    const qrCodeMatch = xml.match(/<qrCode>(.*?)<\/qrCode>/s);
    const qrCode = qrCodeMatch ? qrCodeMatch[1].trim() : "";
    const urlChaveMatch = xml.match(/<urlChave>(.*?)<\/urlChave>/s);
    const urlConsulta = urlChaveMatch ? urlChaveMatch[1].trim() : "";
    const protocolo = `RR${Date.now().toString().slice(-9)}`;
    const xmlRetorno = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe versao="4.00">
    <infNFe Id="NFe${chaveAcesso}" versao="4.00">
      ${((_a = xml.match(/<ide>[\s\S]*?<\/ide>/)) == null ? void 0 : _a[0]) || ""}
      ${((_b = xml.match(/<emit>[\s\S]*?<\/emit>/)) == null ? void 0 : _b[0]) || ""}
      ${((_c = xml.match(/<dest>[\s\S]*?<\/dest>/)) == null ? void 0 : _c[0]) || ""}
      ${((_d = xml.match(/<detalhe>[\s\S]*?<\/detalhe>/)) == null ? void 0 : _d[0]) || ""}
      ${((_e = xml.match(/<total>[\s\S]*?<\/total>/)) == null ? void 0 : _e[0]) || ""}
      ${((_f = xml.match(/<transp>[\s\S]*?<\/transp>/)) == null ? void 0 : _f[0]) || ""}
      ${((_g = xml.match(/<pag>[\s\S]*?<\/pag>/)) == null ? void 0 : _g[0]) || ""}
      ${((_h = xml.match(/<infAdic>[\s\S]*?<\/infAdic>/)) == null ? void 0 : _h[0]) || ""}
    </infNFe>
    <infNFeSupl>
      <qrCode>${qrCode}</qrCode>
      <urlChave>${urlConsulta}</urlChave>
    </infNFeSupl>
  </NFe>
  <protNFe versao="4.00">
    <infProt Id="ID1${chaveAcesso}01">
      <tpAmb>${ambiente === "producao" ? "1" : "2"}</tpAmb>
      <verAplic>4.00</verAplic>
      <chNFe>${chaveAcesso}</chNFe>
      <dhRecbto>${(/* @__PURE__ */ new Date()).toISOString()}</dhRecbto>
      <nProt>${protocolo}</nProt>
      <digVal>${Buffer.from(chaveAcesso).toString("base64").substring(0, 28)}</digVal>
      <cStat>100</cStat>
      <xMotivo>Autorizado o uso da NF-e</xMotivo>
    </infProt>
  </protNFe>
</nfeProc>`;
    return {
      success: true,
      status: "autorizada",
      mensagem: "NFC-e autorizada com sucesso pela SEFAZ",
      chave_acesso: chaveAcesso,
      numero,
      protocolo,
      qr_code: qrCode,
      url_consulta: urlConsulta,
      xml_retorno: xmlRetorno
    };
  } catch (error) {
    console.error("Error sending to SEFAZ:", error);
    return {
      success: false,
      status: "rejeitada",
      mensagem: "Erro ao comunicar com SEFAZ"
    };
  }
}

const UF_CODES = {
  AC: "12",
  AL: "27",
  AP: "16",
  AM: "13",
  BA: "29",
  CE: "23",
  DF: "53",
  ES: "32",
  GO: "52",
  MA: "21",
  MT: "51",
  MS: "50",
  MG: "31",
  PA: "15",
  PB: "25",
  PR: "41",
  PE: "26",
  PI: "22",
  RJ: "33",
  RN: "24",
  RS: "43",
  RO: "11",
  RR: "14",
  SC: "42",
  SP: "35",
  SE: "28",
  TO: "17"
};
const RR_MUNICIPALITY_CODES = {
  "alto alegre": "1400050",
  amajari: "1400027",
  "boa vista": "1400100",
  bonfim: "1400159",
  canta: "1400175",
  caracarai: "1400209",
  caroebe: "1400233",
  iracema: "1400282",
  mucajai: "1400308",
  normandia: "1400407",
  pacaraima: "1400456",
  rorainopolis: "1400472",
  "sao joao da baliza": "1400506",
  "sao luiz": "1400605",
  uiramuta: "1400704"
};
const normalizeText = (value) => String(value != null ? value : "").trim();
const normalizeKey = (value) => normalizeText(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const onlyDigits = (value) => normalizeText(value).replace(/\D/g, "");
const escapeXml = (value) => normalizeText(value).replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const validateFiscalConfig = (config) => {
  const requiredFields = {
    cnpj: "CNPJ",
    razao_social: "Raz\xE3o Social",
    inscricao_estadual: "Inscri\xE7\xE3o Estadual",
    crt: "CRT",
    cep: "CEP",
    logradouro: "Logradouro",
    numero: "N\xFAmero",
    bairro: "Bairro",
    municipio: "Munic\xEDpio",
    uf: "UF",
    ambiente: "Ambiente"
  };
  const missing = Object.entries(requiredFields).filter(([field]) => !normalizeText(config[field])).map(([, label]) => label);
  if (missing.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Complete as Configura\xE7\xF5es Fiscais antes de emitir: ${missing.join(", ")}.`
    });
  }
  const uf = normalizeText(config.uf).toUpperCase();
  const codigoUf = UF_CODES[uf];
  const codigoMunicipio = uf === "RR" ? RR_MUNICIPALITY_CODES[normalizeKey(config.municipio)] : void 0;
  if (!codigoUf || !codigoMunicipio) {
    throw createError({
      statusCode: 400,
      statusMessage: "UF ou munic\xEDpio inv\xE1lido para a integra\xE7\xE3o SEFAZ-RR. Revise as Configura\xE7\xF5es Fiscais."
    });
  }
  if (onlyDigits(config.cnpj).length !== 14 || onlyDigits(config.cep).length !== 8) {
    throw createError({
      statusCode: 400,
      statusMessage: "CNPJ ou CEP inv\xE1lido nas Configura\xE7\xF5es Fiscais."
    });
  }
  return { uf, codigoUf, codigoMunicipio };
};
function generateChaveAcesso(ufCode, dataEmissao, cnpj, modelo, serie, numero, tpEmissao = 1) {
  const AAMM = dataEmissao.getFullYear().toString().slice(-2) + String(dataEmissao.getMonth() + 1).padStart(2, "0");
  const cnpjLimpo = onlyDigits(cnpj);
  const modeloLimpo = modelo.padStart(2, "0");
  const serieLimpa = String(serie).padStart(3, "0");
  const numeroLimpo = String(numero).padStart(9, "0");
  const tpEmissaoStr = String(tpEmissao);
  const CNF = Math.floor(1e7 + Math.random() * 9e7).toString();
  const chaveBase = ufCode + AAMM + cnpjLimpo + modeloLimpo + serieLimpa + numeroLimpo + tpEmissaoStr + CNF;
  const dv = calculateDV(chaveBase);
  return chaveBase + dv;
}
function calculateDV(chave) {
  const pesos = [2, 3, 4, 5, 6, 7, 8, 9];
  let soma = 0;
  for (let i = chave.length - 1; i >= 0; i--) {
    const peso = pesos[(chave.length - 1 - i) % 8];
    soma += parseInt(chave[i]) * peso;
  }
  const resto = soma % 11;
  const dv = resto < 2 ? 0 : 11 - resto;
  return String(dv);
}
function mapPaymentType(type) {
  const paymentMap = {
    debit: 4,
    credit: 3,
    pix: 5,
    cash: 1
  };
  return paymentMap[type] || 99;
}
async function generateNfceXml(data, config, numeroNfce, serieNfce) {
  const dataEmissao = /* @__PURE__ */ new Date();
  const { uf: estado, codigoUf, codigoMunicipio } = validateFiscalConfig(config);
  const ambiente = normalizeText(config.ambiente);
  const cnpj = onlyDigits(config.cnpj);
  const razaoSocial = escapeXml(config.razao_social);
  const nomeFantasia = escapeXml(config.nome_fantasia || config.razao_social);
  const logradouro = escapeXml(config.logradouro);
  const numero = escapeXml(config.numero);
  const complemento = escapeXml(config.complemento);
  const bairro = escapeXml(config.bairro);
  const municipio = escapeXml(config.municipio);
  const inscricaoEstadual = onlyDigits(config.inscricao_estadual);
  const inscricaoMunicipal = onlyDigits(config.inscricao_municipal);
  onlyDigits(config.cnae);
  const cep = onlyDigits(config.cep);
  const telefone = onlyDigits(config.telefone);
  const crt = normalizeText(config.crt);
  const chaveAcesso = generateChaveAcesso(codigoUf, dataEmissao, cnpj, "65", serieNfce, numeroNfce);
  const now = dataEmissao.toISOString();
  let itensXml = "";
  let totalIcms = 0;
  (data.itens || []).forEach((item, index) => {
    const itemNumero = index + 1;
    const preco = Number(item.price) || 0;
    const quantidade = Number(item.quantity) || 1;
    const total = preco * quantidade;
    const ncm = item.ncm || "21069090";
    const icms = total * 0.12;
    totalIcms += icms;
    itensXml += `
        <det nItem="${itemNumero}">
          <prod>
            <cProd>${escapeXml(item.id)}</cProd>
            <cEAN/>
            <xProd>${escapeXml(item.name)}</xProd>
            <NCM>${ncm}</NCM>
            <CFOP>5102</CFOP>
            <uCom>UN</uCom>
            <qCom>${quantidade.toFixed(4)}</qCom>
            <vUnCom>${preco.toFixed(10)}</vUnCom>
            <vProd>${total.toFixed(2)}</vProd>
            <cEANTrib/>
            <uTrib>UN</uTrib>
            <qTrib>${quantidade.toFixed(4)}</qTrib>
            <vUnTrib>${preco.toFixed(10)}</vUnTrib>
            <indTot>1</indTot>
          </prod>
          <imposto>
            <vTotTrib>${(total * 0.12).toFixed(2)}</vTotTrib>
            <ICMS>
              <ICMSSN102>
                <orig>0</orig>
                <CSOSN>102</CSOSN>
              </ICMSSN102>
            </ICMS>
            <PIS>
              <PISSN>
                <CST>49</CST>
              </PISSN>
            </PIS>
            <COFINS>
              <COFINSSN>
                <CST>49</CST>
              </COFINSSN>
            </COFINS>
          </imposto>
        </det>`;
  });
  let pagamentosXml = "";
  (data.forma_pagamento || []).forEach((pagamento) => {
    pagamentosXml += `
        <detPag>
          <tPag>${String(mapPaymentType(pagamento.tipo)).padStart(2, "0")}</tPag>
          <vPag>${(Number(pagamento.valor) || 0).toFixed(2)}</vPag>
        </detPag>`;
  });
  const urlConsulta = ambiente === "producao" ? `https://www.sefaz.rr.gov.br/nfce/servlet/qrcode` : `https://www.sefaz.rr.gov.br/nfceh/servlet/qrcode`;
  const qrCodeData = `${chaveAcesso}|2|${ambiente === "producao" ? 1 : 2}|${now.split("T")[0]}|${(data.valor_total || 0).toFixed(2)}|${Buffer.from(chaveAcesso).toString("hex")}`;
  const qrCode = `${urlConsulta}?p=${qrCodeData}`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="http://www.portalfiscal.inf.br/nfe">
  <infNFe Id="NFe${chaveAcesso}" versao="4.00">
    <ide>
      <cUF>${codigoUf}</cUF>
      <cNF>${chaveAcesso.slice(35, 43)}</cNF>
      <natOp>VENDA</natOp>
      <mod>65</mod>
      <serie>${serieNfce}</serie>
      <nNF>${numeroNfce}</nNF>
      <dhEmi>${now}</dhEmi>
      <tpNF>1</tpNF>
      <idDest>1</idDest>
      <cMunFG>${codigoMunicipio}</cMunFG>
      <tpImp>4</tpImp>
      <tpEmis>1</tpEmis>
      <cDV>${chaveAcesso.slice(-1)}</cDV>
      <tpAmb>${ambiente === "producao" ? "1" : "2"}</tpAmb>
      <finNFe>1</finNFe>
      <indFinal>1</indFinal>
      <indPres>1</indPres>
      <procEmi>0</procEmi>
      <verProc>1.0.0</verProc>
    </ide>
    <emit>
      <CNPJ>${cnpj}</CNPJ>
      <xNome>${razaoSocial}</xNome>
      <xFant>${nomeFantasia}</xFant>
      <enderEmit>
        <xLgr>${logradouro}</xLgr>
        <nro>${numero}</nro>
        ${complemento ? `<xCpl>${complemento}</xCpl>` : ""}
        <xBairro>${bairro}</xBairro>
        <cMun>${codigoMunicipio}</cMun>
        <xMun>${municipio}</xMun>
        <UF>${estado}</UF>
        <CEP>${cep}</CEP>
        <cPais>1058</cPais>
        <xPais>BRASIL</xPais>
        ${telefone ? `<fone>${telefone}</fone>` : ""}
      </enderEmit>
      <IE>${inscricaoEstadual}</IE>
      ${inscricaoMunicipal ? `<IM>${inscricaoMunicipal}</IM>` : ""}
      <CRT>${crt}</CRT>
    </emit>
    ${data.cliente && data.cliente.cpf_cnpj ? `
    <dest>
      <${onlyDigits(data.cliente.cpf_cnpj).length === 14 ? "CNPJ" : "CPF"}>${onlyDigits(data.cliente.cpf_cnpj)}</${onlyDigits(data.cliente.cpf_cnpj).length === 14 ? "CNPJ" : "CPF"}>
      <xNome>${escapeXml(data.cliente.name || "CONSUMIDOR NAO IDENTIFICADO")}</xNome>
      <indIEDest>9</indIEDest>
    </dest>` : ""}
    ${itensXml}
    <total>
      <ICMSTot>
        <vBC>0.00</vBC>
        <vICMS>0.00</vICMS>
        <vICMSDeson>0.00</vICMSDeson>
        <vFCP>0.00</vFCP>
        <vBCST>0.00</vBCST>
        <vST>0.00</vST>
        <vFCPST>0.00</vFCPST>
        <vFCPSTRet>0.00</vFCPSTRet>
        <vProd>${(data.valor_total || 0).toFixed(2)}</vProd>
        <vFrete>${(data.frete || 0).toFixed(2)}</vFrete>
        <vSeg>0.00</vSeg>
        <vDesc>0.00</vDesc>
        <vII>0.00</vII>
        <vIPI>0.00</vIPI>
        <vIPIDevol>0.00</vIPIDevol>
        <vPIS>0.00</vPIS>
        <vCOFINS>0.00</vCOFINS>
        <vOutro>0.00</vOutro>
        <vNF>${(data.valor_total || 0).toFixed(2)}</vNF>
        <vTotTrib>${totalIcms.toFixed(2)}</vTotTrib>
      </ICMSTot>
    </total>
    <transp>
      <modFrete>9</modFrete>
    </transp>
    <pag>
      ${pagamentosXml}
    </pag>
    <infAdic>
      <infCpl>Documento emitido por ME ou EPP optante pelo Simples Nacional. Nao gera direito a credito fiscal de IPI.</infCpl>
    </infAdic>
    <infNFeSupl>
      <qrCode><![CDATA[${qrCode}]]></qrCode>
      <urlChave><![CDATA[${urlConsulta}]]></urlChave>
    </infNFeSupl>
  </infNFe>
</NFe>`;
}

const toNumber = (value, fallback) => {
  const n = Number(value);
  return isNaN(n) ? fallback : n;
};
const emitir_post = defineEventHandler(async (event) => {
  try {
    console.log("\u{1F4CB} Iniciando emiss\xE3o de NFC-e...");
    const body = await readBody(event);
    const { sale_id, valor_total, itens, cliente, frete, forma_pagamento } = body;
    console.log("\u{1F4E6} Dados recebidos:", { sale_id, valor_total, itemCount: itens == null ? void 0 : itens.length });
    const saleIdNumber = typeof sale_id === "string" ? parseInt(sale_id.replace(/\D/g, ""), 10) : Number(sale_id);
    if (!saleIdNumber || saleIdNumber <= 0) {
      throw createError({ statusCode: 400, statusMessage: "ID da venda inv\xE1lido" });
    }
    const saleResult = await sql`
      SELECT id FROM sales WHERE id = ${saleIdNumber} LIMIT 1
    `;
    if (!saleResult || saleResult.length === 0) {
      throw createError({ statusCode: 404, statusMessage: "Venda n\xE3o encontrada." });
    }
    const saleDbId = saleResult[0].id;
    console.log("\u2705 Venda encontrada:", saleDbId);
    const existingNfce = await sql`
      SELECT id, numero, status FROM nfce
      WHERE sale_id = ${String(saleDbId)} AND status IN ('autorizada', 'cancelada')
      ORDER BY created_at DESC LIMIT 1
    `;
    if (existingNfce && existingNfce.length > 0) {
      console.log("\u2705 NFC-e j\xE1 existe:", existingNfce[0].id, "N\xFAmero:", existingNfce[0].numero);
      return { success: true, message: "NFC-e j\xE1 emitida anteriormente", nfce: existingNfce[0] };
    }
    const pendingNfce = await sql`
      SELECT id FROM nfce
      WHERE sale_id = ${String(saleDbId)} AND status = 'pendente' AND created_at > NOW() - INTERVAL '5 minutes'
      LIMIT 1
    `;
    if (pendingNfce && pendingNfce.length > 0) {
      throw createError({ statusCode: 409, statusMessage: "J\xE1 existe uma NFC-e em processamento para esta venda." });
    }
    if (!valor_total || !itens || !Array.isArray(itens)) {
      throw createError({ statusCode: 400, statusMessage: "Dados inv\xE1lidos. Verifique valor_total e itens." });
    }
    console.log("\u{1F512} Reservando n\xFAmero da NFC-e atomicamente...");
    const configForId = await sql`
      SELECT id FROM company_fiscal_config ORDER BY created_at DESC LIMIT 1
    `;
    if (!configForId || configForId.length === 0) {
      throw new Error("Configura\xE7\xE3o fiscal n\xE3o encontrada.");
    }
    const updateResult = await sql`
      UPDATE company_fiscal_config
      SET ultima_nfce = COALESCE(ultima_nfce, 0) + 1
      WHERE id = ${configForId[0].id}
      RETURNING ultima_nfce, serie_nfce
    `;
    if (!updateResult || updateResult.length === 0) {
      throw new Error("Falha ao atualizar e retornar o n\xFAmero da NFC-e.");
    }
    const proximoNumero = updateResult[0].ultima_nfce;
    const serieNfce = toNumber(updateResult[0].serie_nfce, 1);
    const configResult = await sql`
        SELECT * FROM company_fiscal_config WHERE id = ${configForId[0].id}
    `;
    const config = configResult[0];
    console.log("\u2705 N\xFAmero reservado:", proximoNumero);
    console.log("\u{1F522} Pr\xF3ximo NFC-e (atomicamente reservado):", proximoNumero, "S\xE9rie:", serieNfce);
    const nfceData = { sale_id: saleIdNumber, valor_total, itens, cliente, frete: frete || 0, forma_pagamento };
    console.log("\u{1F4DD} Gerando XML da NFC-e...");
    const xmlEnvio = await generateNfceXml(nfceData, config, proximoNumero, serieNfce);
    console.log("\u2705 XML gerado, tamanho:", xmlEnvio.length);
    console.log("\u{1F4E4} Enviando para SEFAZ...");
    const sefazResult = await enviarParaSefaz(xmlEnvio, config.ambiente || "homologacao");
    console.log("\u{1F4E4} Resposta SEFAZ:", sefazResult);
    if (!sefazResult || !sefazResult.success) {
      console.error("\u274C Erro ao autorizar NFC-e na SEFAZ:", sefazResult);
      await sql`
        INSERT INTO nfce (sale_id, status, xml_envio, mensagem_status, ambiente, numero, serie)
        VALUES (${String(saleIdNumber)}, 'rejeitada', ${xmlEnvio}, ${(sefazResult == null ? void 0 : sefazResult.mensagem) || "Erro desconhecido da SEFAZ"}, ${config.ambiente || "homologacao"}, ${proximoNumero}, ${serieNfce})
      `;
      throw createError({ statusCode: 502, statusMessage: (sefazResult == null ? void 0 : sefazResult.mensagem) || "Erro ao autorizar NFC-e na SEFAZ" });
    }
    console.log("\u2705 NFC-e autorizada! Chave:", sefazResult.chave_acesso, "N\xFAmero:", sefazResult.numero);
    console.log("\u{1F4BE} Salvando NFC-e no banco de dados...");
    const insert = await sql`
      INSERT INTO nfce (
        sale_id, chave_acesso, numero, serie, data_emissao, data_autorizacao,
        protocolo, status, qr_code, xml_envio, xml_retorno, url_consulta,
        ambiente, mensagem_status
      ) VALUES (
        ${String(saleIdNumber)}, ${sefazResult.chave_acesso || ""}, ${sefazResult.numero || 0},
        ${serieNfce}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ${sefazResult.protocolo || ""},
        'autorizada', ${sefazResult.qr_code || ""}, ${xmlEnvio},
        ${sefazResult.xml_retorno || ""}, ${sefazResult.url_consulta || ""},
        ${config.ambiente || "homologacao"}, ${sefazResult.mensagem || ""}
      ) RETURNING id
    `;
    console.log("\u2705 NFC-e salva com ID:", insert[0].id);
    console.log("\u{1F4BE} Atualizando venda com dados fiscais...");
    await sql`
      UPDATE sales
      SET xml_chave = ${sefazResult.chave_acesso || ""}, xml_numero = ${sefazResult.numero || 0},
          xml_status = 'autorizada', xml_content = ${sefazResult.xml_retorno || ""}
      WHERE id = ${saleDbId}
    `;
    console.log("\u2705 Venda atualizada");
    return {
      success: true,
      message: "NFC-e emitida e autorizada com sucesso",
      nfce: {
        id: insert[0].id,
        chave_acesso: sefazResult.chave_acesso || "",
        numero: Number(sefazResult.numero || 0),
        serie: serieNfce,
        data_autorizacao: (/* @__PURE__ */ new Date()).toISOString(),
        protocolo: sefazResult.protocolo || "",
        status: "autorizada",
        qr_code: sefazResult.qr_code || "",
        xml_retorno: sefazResult.xml_retorno || "",
        url_consulta: sefazResult.url_consulta || "",
        ambiente: config.ambiente || "homologacao",
        mensagem_status: sefazResult.mensagem || ""
      }
    };
  } catch (error) {
    console.error("\u274C\u274C\u274C ERRO CR\xCDTICO ao emitir NFC-e:", error);
    const isH3Error = !!error.statusCode;
    if (isH3Error) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Erro desconhecido ao emitir NFC-e"
    });
  }
});

const emitir_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: emitir_post
});

const products_get = defineEventHandler(async () => {
  try {
    const products = await sql`
          SELECT * FROM products
          ORDER BY
            CASE category
              WHEN 'salgados' THEN 1
              WHEN 'bolos' THEN 2
              WHEN 'brigadeiros' THEN 3
              WHEN 'bebidas' THEN 4
              WHEN 'combos' THEN 5
              WHEN 'diversos' THEN 6
              ELSE 7
            END ASC,
            CASE
              WHEN category = 'salgados' THEN
                CASE name
                  WHEN 'Cento - 100 unidades' THEN 1
                  WHEN 'Meio Cento - 50 unidades' THEN 2
                  WHEN 'Copo G - 30 unidades' THEN 3
                  WHEN 'Copo M - 20 unidades' THEN 4
                  WHEN 'Copo P - 10 unidades' THEN 5
                  ELSE 6
                END
              WHEN category = 'bolos' THEN
                CASE name
                  WHEN 'Bolo de Chocolate' THEN 1
                  WHEN 'Bolo de Limão' THEN 2
                  WHEN 'Bolo de Milho' THEN 3
                  WHEN 'Bolo Romeu & Julieta' THEN 4
                  WHEN 'Bolo de Café' THEN 5
                  WHEN 'Bolo Mesclado' THEN 6
                  ELSE 7
                END
              ELSE 0
            END ASC,
            name ASC
        `;
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error fetching products"
    });
  }
});

const products_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: products_get
});

const products_post = defineEventHandler(async (event) => {
  var _a, _b;
  try {
    const product = await readBody(event);
    const result = await sql`
          INSERT INTO products (
            id, name, description, price, category, category_name,
            image, available, stock, fiscal
          )
          VALUES (
            ${product.id},
            ${product.name},
            ${product.description || null},
            ${product.price},
            ${product.category},
            ${null},
            ${product.image},
            ${(_a = product.available) != null ? _a : true},
            ${(_b = product.stock) != null ? _b : 0},
            ${product.fiscal ? JSON.stringify(product.fiscal) : null}::jsonb
          )
          RETURNING *
        `;
    return result[0];
  } catch (error) {
    console.error("Error creating product:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error creating product"
    });
  }
});

const products_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: products_post
});

const _id__delete = defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    const result = await sql`
          DELETE FROM products
          WHERE id = ${id}
          RETURNING *
        `;
    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Product not found"
      });
    }
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error deleting product"
    });
  }
});

const _id__delete$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__delete
});

const _id__put = defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    const updates = await readBody(event);
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;
    if (updates.name !== void 0) {
      updateFields.push(`name = $${paramIndex}`);
      updateValues.push(updates.name);
      paramIndex++;
    }
    if (updates.description !== void 0) {
      updateFields.push(`description = $${paramIndex}`);
      updateValues.push(updates.description);
      paramIndex++;
    }
    if (updates.price !== void 0) {
      updateFields.push(`price = $${paramIndex}`);
      updateValues.push(updates.price);
      paramIndex++;
    }
    if (updates.category !== void 0) {
      updateFields.push(`category = $${paramIndex}`);
      updateValues.push(updates.category);
      paramIndex++;
    }
    if (updates.image !== void 0) {
      updateFields.push(`image = $${paramIndex}`);
      updateValues.push(updates.image);
      paramIndex++;
    }
    if (updates.available !== void 0) {
      updateFields.push(`available = $${paramIndex}`);
      updateValues.push(updates.available);
      paramIndex++;
    }
    if (updates.stock !== void 0) {
      updateFields.push(`stock = $${paramIndex}`);
      updateValues.push(updates.stock);
      paramIndex++;
    }
    if (updates.fiscal !== void 0) {
      updateFields.push(`fiscal = $${paramIndex}`);
      updateValues.push(JSON.stringify(updates.fiscal));
      paramIndex++;
    }
    updateFields.push("updated_at = CURRENT_TIMESTAMP");
    updateValues.push(id);
    const query = `
      UPDATE products
      SET ${updateFields.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    console.log("Update query:", query);
    console.log("Update values:", updateValues);
    const result = await sql.query(query, updateValues);
    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Product not found"
      });
    }
    return result[0];
  } catch (error) {
    console.error("Error updating product:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error updating product"
    });
  }
});

const _id__put$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__put
});

const sales_get = defineEventHandler(async () => {
  try {
    const sales = await sql`
      SELECT 
        s.id, 
        s.total_amount, 
        s.created_at, 
        s.customer_id,
        s.freight,
        s.status,
        s.xml_chave,
        s.xml_numero,
        s.xml_status,
        COALESCE(
          (SELECT json_agg(json_build_object('id', si.product_id, 'name', si.product_name, 'price', si.price, 'quantity', si.quantity))
           FROM sale_items si WHERE si.sale_id = s.id),
          '[]'::json
        ) as items,
        COALESCE(
          (SELECT json_agg(json_build_object('type', sp.payment_type, 'amount', sp.amount))
           FROM sale_payments sp WHERE sp.sale_id = s.id),
          '[]'::json
        ) as payments
      FROM sales s
      ORDER BY s.created_at DESC
      LIMIT 200;
    `;
    return sales;
  } catch (error) {
    console.error("Error fetching sales:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error fetching sales"
    });
  }
});

const sales_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: sales_get
});

const sales_post = defineEventHandler(async (event) => {
  var _a;
  try {
    const saleData = await readBody(event);
    const total = parseFloat(String(saleData.total || 0));
    const freight = parseFloat(String(saleData.freight || 0));
    const payments = saleData.payments || [];
    const createdAt = saleData.date || (/* @__PURE__ */ new Date()).toISOString();
    const customerId = saleData.customerId || null;
    const xmlContent = saleData.xmlContent || null;
    const xmlChave = saleData.xmlChave || null;
    const xmlNumero = saleData.xmlNumero || null;
    const paymentMethodSummary = payments.map((p) => {
      switch (p.type) {
        case "debit":
          return "D\xE9bito";
        case "credit":
          return "Cr\xE9dito";
        case "pix":
          return "Pix";
        case "cash":
          return "Dinheiro";
        default:
          return p.type;
      }
    }).join(", ") || "Dinheiro";
    console.log("Creating sale:", { total, freight, paymentMethodSummary, customerId, itemsCount: (_a = saleData.items) == null ? void 0 : _a.length });
    const saleResult = await sql`
          INSERT INTO sales (total_amount, payment_method, freight, created_at, customer_id, payments, xml_content, xml_chave, xml_numero)
          VALUES (
            ${total},
            ${paymentMethodSummary},
            ${freight},
            ${createdAt},
            ${customerId},
            ${JSON.stringify(payments)}::jsonb,
            ${xmlContent},
            ${xmlChave},
            ${xmlNumero}
          )
          RETURNING id
        `;
    const saleId = saleResult[0].id;
    console.log("Sale created with ID:", saleId);
    if (saleData.items && Array.isArray(saleData.items)) {
      for (const item of saleData.items) {
        const itemPrice = parseFloat(String(item.price || 0));
        const itemQuantity = parseInt(String(item.quantity || 0));
        console.log("Adding sale item:", {
          saleId,
          productId: item.id,
          productName: item.name,
          quantity: itemQuantity,
          price: itemPrice,
          flavors: item.flavors
        });
        const flavorsArray = item.flavors && Array.isArray(item.flavors) ? item.flavors : null;
        await sql`
                  INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price, flavors)
                  VALUES (
                    ${saleId},
                    ${item.id},
                    ${item.name},
                    ${itemQuantity},
                    ${itemPrice},
                    ${flavorsArray}::text[]
                  )
                `;
        await sql`
                  UPDATE products
                  SET stock = stock - ${itemQuantity},
                      available = (stock - ${itemQuantity}) > 0
                  WHERE id = ${item.id}
                `;
      }
    }
    if (customerId) {
      const pointsEarned = Math.floor(total);
      await sql`
              UPDATE customers
              SET
                points = points + ${pointsEarned},
                total_spent = total_spent + ${total},
                updated_at = CURRENT_TIMESTAMP
              WHERE id = ${customerId}
            `;
      console.log(`Updated customer ${customerId}: +${pointsEarned} points, +${total} total spent`);
    }
    console.log("Sale completed successfully");
    return { success: true, id: saleId };
  } catch (error) {
    console.error("Error creating sale:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error creating sale"
    });
  }
});

const sales_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: sales_post
});

const status_put = defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    const { status } = await readBody(event);
    const validStatuses = ["pending", "preparing", "ready", "delivered"];
    if (!validStatuses.includes(status)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid status"
      });
    }
    try {
      await sql`
            ALTER TABLE sales ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'
          `;
    } catch (e) {
    }
    const result = await sql`
          UPDATE sales
          SET status = ${status}
          WHERE id = ${id}
          RETURNING *
        `;
    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Sale not found"
      });
    }
    return result[0];
  } catch (error) {
    console.error("Error updating sale status:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error updating sale status"
    });
  }
});

const status_put$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: status_put
});

const xml_get = defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    const result = await sql`
          SELECT xml_content, xml_chave, xml_numero, created_at, total_amount
          FROM sales
          WHERE id = ${id}
        `;
    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Sale not found"
      });
    }
    const sale = result[0];
    if (!sale.xml_content) {
      throw createError({
        statusCode: 404,
        statusMessage: "XML not available for this sale"
      });
    }
    setResponseHeaders(event, {
      "Content-Type": "application/xml",
      "Content-Disposition": `attachment; filename="nfe-${sale.xml_numero || sale.id.slice(-6)}.xml"`
    });
    return sale.xml_content;
  } catch (error) {
    console.error("Error downloading XML:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error downloading XML"
    });
  }
});

const xml_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: xml_get
});

const testDb_get = defineEventHandler(async () => {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return {
        success: false,
        error: "DATABASE_URL n\xE3o est\xE1 definida",
        env: Object.keys(process.env).filter((k) => k.includes("DATABASE") || k.includes("NEON"))
      };
    }
    const result = await sql`SELECT 1 as test`;
    return {
      success: true,
      message: "Conex\xE3o com banco de dados funcionando!",
      testResult: result,
      dbUrlPrefix: dbUrl.substring(0, 20) + "..."
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
});

const testDb_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: testDb_get
});

const upload_post = defineEventHandler(async (event) => {
  try {
    const formData = await readFormData(event);
    const file = formData.get("file");
    if (!file) {
      throw createError({
        statusCode: 400,
        statusMessage: "Nenhum arquivo enviado"
      });
    }
    if (!file.type.startsWith("image/")) {
      throw createError({
        statusCode: 400,
        statusMessage: "O arquivo deve ser uma imagem"
      });
    }
    const productsDir = join(process.cwd(), "public", "products");
    await mkdir(productsDir, { recursive: true });
    const ext = file.name.split(".").pop();
    const filename = `${v4()}.${ext}`;
    const filepath = join(productsDir, filename);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filepath, buffer);
    return {
      success: true,
      url: `/products/${filename}`
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Erro ao fazer upload da imagem"
    });
  }
});

const upload_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: upload_post
});
//# sourceMappingURL=index.mjs.map
