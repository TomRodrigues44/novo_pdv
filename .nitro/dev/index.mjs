import process from 'node:process';globalThis._importMeta_={url:import.meta.url,env:process.env};import { tmpdir } from 'node:os';
import { Server } from 'node:http';
import { resolve, dirname, join } from 'node:path';
import crypto from 'node:crypto';
import { parentPort, threadId } from 'node:worker_threads';
import { defineEventHandler, handleCacheHeaders, splitCookiesString, createEvent, fetchWithEvent, isEvent, eventHandler, setHeaders, createError, sendRedirect, proxyRequest, getRequestURL, getRequestHeader, getResponseHeader, getRequestHeaders, setResponseHeaders, setResponseStatus, send, removeResponseHeader, appendResponseHeader, setResponseHeader, getCookie, setCookie, getRequestPath, createApp, createRouter as createRouter$1, toNodeListener, lazyEventHandler, getRouterParam, readBody, getQuery as getQuery$1, readFormData } from 'file://C:/Users/1793579/dyad-apps/novo-pdv/node_modules/.pnpm/h3@1.15.11/node_modules/h3/dist/index.mjs';
import destr from 'file://C:/Users/1793579/dyad-apps/novo-pdv/node_modules/.pnpm/destr@2.0.5/node_modules/destr/dist/index.mjs';
import { createHooks } from 'file://C:/Users/1793579/dyad-apps/novo-pdv/node_modules/.pnpm/hookable@5.5.3/node_modules/hookable/dist/index.mjs';
import { createFetch, Headers as Headers$1 } from 'file://C:/Users/1793579/dyad-apps/novo-pdv/node_modules/.pnpm/ofetch@1.5.1/node_modules/ofetch/dist/node.mjs';
import { fetchNodeRequestHandler, callNodeRequestHandler } from 'file://C:/Users/1793579/dyad-apps/novo-pdv/node_modules/.pnpm/node-mock-http@1.0.4/node_modules/node-mock-http/dist/index.mjs';
import { parseURL, withoutBase, joinURL, getQuery, withQuery, decodePath, withLeadingSlash, withoutTrailingSlash } from 'file://C:/Users/1793579/dyad-apps/novo-pdv/node_modules/.pnpm/ufo@1.6.4/node_modules/ufo/dist/index.mjs';
import { createStorage, prefixStorage } from 'file://C:/Users/1793579/dyad-apps/novo-pdv/node_modules/.pnpm/unstorage@1.17.5_db0@0.3.4_ioredis@5.11.1/node_modules/unstorage/dist/index.mjs';
import unstorage_47drivers_47fs from 'file://C:/Users/1793579/dyad-apps/novo-pdv/node_modules/.pnpm/unstorage@1.17.5_db0@0.3.4_ioredis@5.11.1/node_modules/unstorage/drivers/fs.mjs';
import { digest } from 'file://C:/Users/1793579/dyad-apps/novo-pdv/node_modules/.pnpm/ohash@2.0.11/node_modules/ohash/dist/index.mjs';
import { klona } from 'file://C:/Users/1793579/dyad-apps/novo-pdv/node_modules/.pnpm/klona@2.0.6/node_modules/klona/dist/index.mjs';
import defu, { defuFn } from 'file://C:/Users/1793579/dyad-apps/novo-pdv/node_modules/.pnpm/defu@6.1.7/node_modules/defu/dist/defu.mjs';
import { snakeCase } from 'file://C:/Users/1793579/dyad-apps/novo-pdv/node_modules/.pnpm/scule@1.3.0/node_modules/scule/dist/index.mjs';
import { toRouteMatcher, createRouter } from 'file://C:/Users/1793579/dyad-apps/novo-pdv/node_modules/.pnpm/radix3@1.1.2/node_modules/radix3/dist/index.mjs';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import consola from 'file://C:/Users/1793579/dyad-apps/novo-pdv/node_modules/.pnpm/consola@3.4.2/node_modules/consola/dist/index.mjs';
import { ErrorParser } from 'file://C:/Users/1793579/dyad-apps/novo-pdv/node_modules/.pnpm/youch-core@0.3.3/node_modules/youch-core/build/index.js';
import { Youch } from 'file://C:/Users/1793579/dyad-apps/novo-pdv/node_modules/.pnpm/youch@4.1.1/node_modules/youch/build/index.js';
import { SourceMapConsumer } from 'file://C:/Users/1793579/dyad-apps/novo-pdv/node_modules/.pnpm/source-map@0.7.6/node_modules/source-map/source-map.js';
import { promises } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname as dirname$1, resolve as resolve$1 } from 'file://C:/Users/1793579/dyad-apps/novo-pdv/node_modules/.pnpm/pathe@2.0.3/node_modules/pathe/dist/index.mjs';
import nodemailer from 'file://C:/Users/1793579/dyad-apps/novo-pdv/node_modules/.pnpm/nodemailer@9.0.5/node_modules/nodemailer/lib/nodemailer.js';
import forge from 'file://C:/Users/1793579/dyad-apps/novo-pdv/node_modules/.pnpm/node-forge@1.4.0/node_modules/node-forge/lib/index.js';
import QRCode from 'file://C:/Users/1793579/dyad-apps/novo-pdv/node_modules/.pnpm/qrcode@1.5.4/node_modules/qrcode/lib/index.js';
import https from 'node:https';
import { Pool } from 'file://C:/Users/1793579/dyad-apps/novo-pdv/node_modules/.pnpm/pg@8.22.0/node_modules/pg/esm/index.mjs';
import { v4 } from 'file://C:/Users/1793579/dyad-apps/novo-pdv/node_modules/.pnpm/uuid@14.0.1/node_modules/uuid/dist-node/index.js';

const serverAssets = [{"baseName":"server","dir":"C:/Users/1793579/dyad-apps/novo-pdv/server/assets"}];

const assets$1 = createStorage();

for (const asset of serverAssets) {
  assets$1.mount(asset.baseName, unstorage_47drivers_47fs({ base: asset.dir, ignore: (asset?.ignore || []) }));
}

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('root', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"C:/Users/1793579/dyad-apps/novo-pdv"}));
storage.mount('src', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"C:/Users/1793579/dyad-apps/novo-pdv/server"}));
storage.mount('build', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"C:/Users/1793579/dyad-apps/novo-pdv/.nitro"}));
storage.mount('cache', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"C:/Users/1793579/dyad-apps/novo-pdv/.nitro/cache"}));
storage.mount('data', unstorage_47drivers_47fs({"driver":"fs","base":"C:/Users/1793579/dyad-apps/novo-pdv/.data/kv"}));

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
    "etag": "\"3509b-pe2G1OQJm+EP/A885MO82Mq3EPE\"",
    "mtime": "2026-08-17T16:00:45.382Z",
    "size": 217243,
    "path": "index.mjs"
  },
  "/index.mjs.map": {
    "type": "application/json",
    "etag": "\"c903e-92OajafWciTiTcNuDX3faRMR6GU\"",
    "mtime": "2026-08-17T16:00:45.398Z",
    "size": 823358,
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
const _KZdrLu = eventHandler((event) => {
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

const databaseGlobal = globalThis;
function getConnectionString() {
  const connectionString = process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("LOCAL_DATABASE_URL ou DATABASE_URL n\xE3o est\xE1 definida");
  }
  return connectionString;
}
function getPool() {
  if (!databaseGlobal.__pdvPostgresPool) {
    const connectionString = getConnectionString();
    databaseGlobal.__pdvPostgresPool = new Pool({
      connectionString,
      max: 10,
      connectionTimeoutMillis: 5e3,
      idleTimeoutMillis: 3e4,
      enableChannelBinding: connectionString.includes("channel_binding=require")
    });
    databaseGlobal.__pdvPostgresPool.on("error", (error) => {
      console.error("Erro inesperado no pool PostgreSQL:", error);
    });
  }
  return databaseGlobal.__pdvPostgresPool;
}
function createQueryClient(execute) {
  let queryClient;
  queryClient = ((strings, ...values) => {
    if (!strings) {
      return queryClient;
    }
    let text = strings[0];
    for (let index = 0; index < values.length; index += 1) {
      text += `$${index + 1}${strings[index + 1]}`;
    }
    return execute(text, values);
  });
  queryClient.query = execute;
  return queryClient;
}
const executeQuery = async (text, values = []) => {
  const result = await getPool().query(text, values);
  return result.rows;
};
const sqlTag = createQueryClient(executeQuery);
sqlTag.transaction = async (callback) => {
  const client = await getPool().connect();
  const transaction = createQueryClient(async (text, values = []) => {
    const result = await client.query(text, values);
    return result.rows;
  });
  try {
    await client.query("BEGIN");
    const result = await callback(transaction);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
const sql = sqlTag;
function getDatabaseTarget() {
  const url = new URL(getConnectionString());
  const host = url.hostname;
  return {
    host,
    port: url.port || "5432",
    database: url.pathname.replace(/^\//, ""),
    user: decodeURIComponent(url.username),
    isLocal: host === "localhost" || host === "127.0.0.1" || host === "::1"
  };
}

const SESSION_COOKIE = "pdv_session";
const SESSION_DURATION_MS = 1e3 * 60 * 60 * 12;
const roleLabels = {
  admin: "Administrador",
  manager: "Gerente",
  cashier: "Caixa"
};
async function ensureAuthSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS app_users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'cashier')),
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS app_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;
}
function normalizeUsername(value) {
  return String(value != null ? value : "").trim().toLowerCase();
}
function validatePassword(password) {
  const value = String(password != null ? password : "");
  if (value.length < 8) {
    throw createError({
      statusCode: 400,
      statusMessage: "A senha precisa ter pelo menos 8 caracteres."
    });
  }
  return value;
}
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
  return `${salt}:${derivedKey.toString("hex")}`;
}
async function verifyPassword(password, storedHash) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const derivedKey = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), derivedKey);
}
async function createSession(event, userId) {
  const sessionId = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await sql`
    INSERT INTO app_sessions (id, user_id, expires_at)
    VALUES (${sessionId}, ${userId}, ${expiresAt})
  `;
  setCookie(event, SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "strict",
    secure: false,
    path: "/",
    maxAge: SESSION_DURATION_MS / 1e3
  });
}
async function getSessionUser(event) {
  await ensureAuthSchema();
  const sessionId = getCookie(event, SESSION_COOKIE);
  if (!sessionId) return null;
  const result = await sql`
    SELECT u.id, u.name, u.username, u.role, u.active
    FROM app_sessions s
    INNER JOIN app_users u ON u.id = s.user_id
    WHERE s.id = ${sessionId}
      AND s.expires_at > CURRENT_TIMESTAMP
      AND u.active = true
    LIMIT 1
  `;
  return result[0] || null;
}
async function clearSession(event) {
  const sessionId = getCookie(event, SESSION_COOKIE);
  if (sessionId) {
    await sql`DELETE FROM app_sessions WHERE id = ${sessionId}`;
  }
  setCookie(event, SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0
  });
}
function requireRole(user, roles) {
  if (!user || !roles.includes(user.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Voc\xEA n\xE3o tem permiss\xE3o para acessar este recurso."
    });
  }
}

const publicRoutes = /* @__PURE__ */ new Set([
  "/api/auth/status",
  "/api/auth/bootstrap",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/me"
]);
const cashierRoutes = [
  "/api/products",
  "/api/categories",
  "/api/customers",
  "/api/motoboys",
  "/api/cash-register",
  "/api/cash-transactions",
  "/api/sales",
  "/api/nfce",
  "/api/fiscal/company-config",
  "/api/reports",
  // Added: Relatórios
  "/api/nfe/emitir",
  // Added: Emitir NF-e
  "/api/xmls",
  // Added: XMLs Fiscais
  "/api/contingency",
  // Added: Contingência
  "/api/kitchen",
  // Added: Cozinha
  "/api/cancel-password",
  // Added: Senha de cancelamento
  "/api/nfe"
  // Added: NF-e geral
];
const managerRoutes = [
  ...cashierRoutes,
  "/api/fiscal/certificates",
  "/api/fiscal/test-connection",
  "/api/upload",
  "/api/cancel-password"
];
function isAllowed(path, role) {
  if (role === "admin") return true;
  const allowedRoutes = role === "manager" ? managerRoutes : cashierRoutes;
  return allowedRoutes.some((route) => path === route || path.startsWith(`${route}/`));
}
const _jJ_96o = defineEventHandler(async (event) => {
  const path = getRequestPath(event);
  if (!path.startsWith("/api/") || publicRoutes.has(path)) return;
  const user = await getSessionUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Fa\xE7a login para continuar." });
  }
  if (!isAllowed(path, user.role)) {
    throw createError({ statusCode: 403, statusMessage: "Seu perfil n\xE3o possui acesso a este recurso." });
  }
  event.context.authUser = user;
});

const _lazy_Xuq5nG = () => Promise.resolve().then(function () { return _action_$1; });
const _lazy_pI_aHK = () => Promise.resolve().then(function () { return cancelPassword_get$1; });
const _lazy_u1H1Gp = () => Promise.resolve().then(function () { return cancelPassword_post$1; });
const _lazy_r8IR9R = () => Promise.resolve().then(function () { return cashRegister_get$1; });
const _lazy_S_3Edu = () => Promise.resolve().then(function () { return close_post$1; });
const _lazy_CO4PpI = () => Promise.resolve().then(function () { return open_post$1; });
const _lazy_VDoUJE = () => Promise.resolve().then(function () { return cashTransactions_get$1; });
const _lazy_ZTH7RR = () => Promise.resolve().then(function () { return cashTransactions_post$1; });
const _lazy_pavYKV = () => Promise.resolve().then(function () { return _id__delete$b; });
const _lazy_81EKUE = () => Promise.resolve().then(function () { return categories_get$1; });
const _lazy_pOuWsz = () => Promise.resolve().then(function () { return categories_post$3; });
const _lazy_vcAbTK = () => Promise.resolve().then(function () { return _id__delete$9; });
const _lazy_JFNHev = () => Promise.resolve().then(function () { return _id__put$7; });
const _lazy_BuGWom = () => Promise.resolve().then(function () { return contingency_get$1; });
const _lazy_eBQVVI = () => Promise.resolve().then(function () { return retry_post$1; });
const _lazy_yUZyIo = () => Promise.resolve().then(function () { return customers_get$1; });
const _lazy_QQ0Juq = () => Promise.resolve().then(function () { return customers_post$1; });
const _lazy_IR0vWe = () => Promise.resolve().then(function () { return _id__delete$7; });
const _lazy__QCGpZ = () => Promise.resolve().then(function () { return _id__put$5; });
const _lazy_EsLjqI = () => Promise.resolve().then(function () { return sales_get$3; });
const _lazy_ildydY = () => Promise.resolve().then(function () { return ensureSchema_post$1; });
const _lazy_9rJuId = () => Promise.resolve().then(function () { return cancel_post$3; });
const _lazy_xdPudw = () => Promise.resolve().then(function () { return certificates_get$1; });
const _lazy_MXcZKk = () => Promise.resolve().then(function () { return certificates_post$1; });
const _lazy_kX9TnX = () => Promise.resolve().then(function () { return _id__delete$5; });
const _lazy_71aZ48 = () => Promise.resolve().then(function () { return _id__patch$1; });
const _lazy_A0Bgx4 = () => Promise.resolve().then(function () { return companyConfig_get$1; });
const _lazy_gAjlZG = () => Promise.resolve().then(function () { return companyConfig_post$1; });
const _lazy_R1WhG4 = () => Promise.resolve().then(function () { return testConnection_post$1; });
const _lazy_gREClb = () => Promise.resolve().then(function () { return categories_post$1; });
const _lazy_835IYQ = () => Promise.resolve().then(function () { return products_post$3; });
const _lazy_RX4l5n = () => Promise.resolve().then(function () { return sales_post$3; });
const _lazy_VC7h7z = () => Promise.resolve().then(function () { return motoboys_get$1; });
const _lazy_m2rp5b = () => Promise.resolve().then(function () { return motoboys_post$1; });
const _lazy_HJYunl = () => Promise.resolve().then(function () { return _id__delete$3; });
const _lazy_bVOyfb = () => Promise.resolve().then(function () { return _id__put$3; });
const _lazy_EdzNpV = () => Promise.resolve().then(function () { return nfce_get$1; });
const _lazy_GCv6E8 = () => Promise.resolve().then(function () { return qrCode_get$1; });
const _lazy_00tSs1 = () => Promise.resolve().then(function () { return _sale_id__get$1; });
const _lazy_2WKCh9 = () => Promise.resolve().then(function () { return emitir_post$3; });
const _lazy_UaVP20 = () => Promise.resolve().then(function () { return _id__get$3; });
const _lazy_HEa7Jp = () => Promise.resolve().then(function () { return nfe_get$1; });
const _lazy_ZnAW_4 = () => Promise.resolve().then(function () { return _saleId__get$1; });
const _lazy_sCEs6O = () => Promise.resolve().then(function () { return emitir_post$1; });
const _lazy_wo3HqI = () => Promise.resolve().then(function () { return _id__get$1; });
const _lazy_rgXLJb = () => Promise.resolve().then(function () { return products_get$1; });
const _lazy__MZiVU = () => Promise.resolve().then(function () { return products_post$1; });
const _lazy_DXFlHw = () => Promise.resolve().then(function () { return _id__delete$1; });
const _lazy_rnLMOS = () => Promise.resolve().then(function () { return _id__put$1; });
const _lazy_qDxTUA = () => Promise.resolve().then(function () { return sales_get$1; });
const _lazy_B9eeh0 = () => Promise.resolve().then(function () { return sales_post$1; });
const _lazy_1joiz8 = () => Promise.resolve().then(function () { return cancel_post$1; });
const _lazy_UlWYwo = () => Promise.resolve().then(function () { return status_put$1; });
const _lazy_aLfc8d = () => Promise.resolve().then(function () { return xml_get$1; });
const _lazy_XO4tfj = () => Promise.resolve().then(function () { return testDb_get$1; });
const _lazy_8z6UL4 = () => Promise.resolve().then(function () { return upload_post$1; });

const handlers = [
  { route: '', handler: _KZdrLu, lazy: false, middleware: true, method: undefined },
  { route: '', handler: _jJ_96o, lazy: false, middleware: true, method: undefined },
  { route: '/api/auth/:action', handler: _lazy_Xuq5nG, lazy: true, middleware: false, method: undefined },
  { route: '/api/cancel-password', handler: _lazy_pI_aHK, lazy: true, middleware: false, method: "get" },
  { route: '/api/cancel-password', handler: _lazy_u1H1Gp, lazy: true, middleware: false, method: "post" },
  { route: '/api/cash-register', handler: _lazy_r8IR9R, lazy: true, middleware: false, method: "get" },
  { route: '/api/cash-register/close', handler: _lazy_S_3Edu, lazy: true, middleware: false, method: "post" },
  { route: '/api/cash-register/open', handler: _lazy_CO4PpI, lazy: true, middleware: false, method: "post" },
  { route: '/api/cash-transactions', handler: _lazy_VDoUJE, lazy: true, middleware: false, method: "get" },
  { route: '/api/cash-transactions', handler: _lazy_ZTH7RR, lazy: true, middleware: false, method: "post" },
  { route: '/api/cash-transactions/:id', handler: _lazy_pavYKV, lazy: true, middleware: false, method: "delete" },
  { route: '/api/categories', handler: _lazy_81EKUE, lazy: true, middleware: false, method: "get" },
  { route: '/api/categories', handler: _lazy_pOuWsz, lazy: true, middleware: false, method: "post" },
  { route: '/api/categories/:id', handler: _lazy_vcAbTK, lazy: true, middleware: false, method: "delete" },
  { route: '/api/categories/:id', handler: _lazy_JFNHev, lazy: true, middleware: false, method: "put" },
  { route: '/api/contingency', handler: _lazy_BuGWom, lazy: true, middleware: false, method: "get" },
  { route: '/api/contingency/:id/retry', handler: _lazy_eBQVVI, lazy: true, middleware: false, method: "post" },
  { route: '/api/customers', handler: _lazy_yUZyIo, lazy: true, middleware: false, method: "get" },
  { route: '/api/customers', handler: _lazy_QQ0Juq, lazy: true, middleware: false, method: "post" },
  { route: '/api/customers/:id', handler: _lazy_IR0vWe, lazy: true, middleware: false, method: "delete" },
  { route: '/api/customers/:id', handler: _lazy__QCGpZ, lazy: true, middleware: false, method: "put" },
  { route: '/api/customers/:id/sales', handler: _lazy_EsLjqI, lazy: true, middleware: false, method: "get" },
  { route: '/api/customers/ensure-schema', handler: _lazy_ildydY, lazy: true, middleware: false, method: "post" },
  { route: '/api/fiscal/:id/cancel', handler: _lazy_9rJuId, lazy: true, middleware: false, method: "post" },
  { route: '/api/fiscal/certificates', handler: _lazy_xdPudw, lazy: true, middleware: false, method: "get" },
  { route: '/api/fiscal/certificates', handler: _lazy_MXcZKk, lazy: true, middleware: false, method: "post" },
  { route: '/api/fiscal/certificates/:id', handler: _lazy_kX9TnX, lazy: true, middleware: false, method: "delete" },
  { route: '/api/fiscal/certificates/:id', handler: _lazy_71aZ48, lazy: true, middleware: false, method: "patch" },
  { route: '/api/fiscal/company-config', handler: _lazy_A0Bgx4, lazy: true, middleware: false, method: "get" },
  { route: '/api/fiscal/company-config', handler: _lazy_gAjlZG, lazy: true, middleware: false, method: "post" },
  { route: '/api/fiscal/test-connection', handler: _lazy_R1WhG4, lazy: true, middleware: false, method: "post" },
  { route: '/api/migrate/categories', handler: _lazy_gREClb, lazy: true, middleware: false, method: "post" },
  { route: '/api/migrate/products', handler: _lazy_835IYQ, lazy: true, middleware: false, method: "post" },
  { route: '/api/migrate/sales', handler: _lazy_RX4l5n, lazy: true, middleware: false, method: "post" },
  { route: '/api/motoboys', handler: _lazy_VC7h7z, lazy: true, middleware: false, method: "get" },
  { route: '/api/motoboys', handler: _lazy_m2rp5b, lazy: true, middleware: false, method: "post" },
  { route: '/api/motoboys/:id', handler: _lazy_HJYunl, lazy: true, middleware: false, method: "delete" },
  { route: '/api/motoboys/:id', handler: _lazy_bVOyfb, lazy: true, middleware: false, method: "put" },
  { route: '/api/nfce', handler: _lazy_EdzNpV, lazy: true, middleware: false, method: "get" },
  { route: '/api/nfce/:id/qr-code', handler: _lazy_GCv6E8, lazy: true, middleware: false, method: "get" },
  { route: '/api/nfce/:sale_id', handler: _lazy_00tSs1, lazy: true, middleware: false, method: "get" },
  { route: '/api/nfce/emitir', handler: _lazy_2WKCh9, lazy: true, middleware: false, method: "post" },
  { route: '/api/nfce/xml/:id', handler: _lazy_UaVP20, lazy: true, middleware: false, method: "get" },
  { route: '/api/nfe', handler: _lazy_HEa7Jp, lazy: true, middleware: false, method: "get" },
  { route: '/api/nfe/:saleId', handler: _lazy_ZnAW_4, lazy: true, middleware: false, method: "get" },
  { route: '/api/nfe/emitir', handler: _lazy_sCEs6O, lazy: true, middleware: false, method: "post" },
  { route: '/api/nfe/xml/:id', handler: _lazy_wo3HqI, lazy: true, middleware: false, method: "get" },
  { route: '/api/products', handler: _lazy_rgXLJb, lazy: true, middleware: false, method: "get" },
  { route: '/api/products', handler: _lazy__MZiVU, lazy: true, middleware: false, method: "post" },
  { route: '/api/products/:id', handler: _lazy_DXFlHw, lazy: true, middleware: false, method: "delete" },
  { route: '/api/products/:id', handler: _lazy_rnLMOS, lazy: true, middleware: false, method: "put" },
  { route: '/api/sales', handler: _lazy_qDxTUA, lazy: true, middleware: false, method: "get" },
  { route: '/api/sales', handler: _lazy_B9eeh0, lazy: true, middleware: false, method: "post" },
  { route: '/api/sales/:id/cancel', handler: _lazy_1joiz8, lazy: true, middleware: false, method: "post" },
  { route: '/api/sales/:id/status', handler: _lazy_UlWYwo, lazy: true, middleware: false, method: "put" },
  { route: '/api/sales/:id/xml', handler: _lazy_aLfc8d, lazy: true, middleware: false, method: "get" },
  { route: '/api/test-db', handler: _lazy_XO4tfj, lazy: true, middleware: false, method: "get" },
  { route: '/api/upload', handler: _lazy_8z6UL4, lazy: true, middleware: false, method: "post" }
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
  globalThis.crypto = crypto.webcrypto;
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

const validRoles = ["admin", "manager", "cashier"];
const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  username: user.username,
  role: user.role,
  roleLabel: roleLabels[user.role],
  active: user.active,
  created_at: user.created_at
});
const _action_ = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e;
  await ensureAuthSchema();
  const action = getRouterParam(event, "action");
  if (action === "status") {
    const users = await sql`SELECT COUNT(*)::int AS count FROM app_users`;
    return { configured: Number(users[0].count) > 0 };
  }
  if (action === "bootstrap") {
    const users = await sql`SELECT COUNT(*)::int AS count FROM app_users`;
    if (Number(users[0].count) > 0) {
      throw createError({ statusCode: 403, statusMessage: "O administrador inicial j\xE1 foi configurado." });
    }
    const body = await readBody(event);
    const name = String((_a = body.name) != null ? _a : "").trim();
    const username = normalizeUsername(body.username);
    const password = validatePassword(body.password);
    if (!name || username.length < 3) {
      throw createError({ statusCode: 400, statusMessage: "Informe nome e usu\xE1rio com pelo menos 3 caracteres." });
    }
    const id = `user-${crypto.randomUUID()}`;
    await sql`
      INSERT INTO app_users (id, name, username, password_hash, role)
      VALUES (${id}, ${name}, ${username}, ${await hashPassword(password)}, 'admin')
    `;
    await createSession(event, id);
    return { user: { id, name, username, role: "admin", roleLabel: "Administrador", active: true } };
  }
  if (action === "login") {
    const body = await readBody(event);
    const username = normalizeUsername(body.username);
    const password = String((_b = body.password) != null ? _b : "");
    const users = await sql`
      SELECT * FROM app_users
      WHERE username = ${username} AND active = true
      LIMIT 1
    `;
    const user = users[0];
    if (!user || !await verifyPassword(password, user.password_hash)) {
      throw createError({ statusCode: 401, statusMessage: "Usu\xE1rio ou senha inv\xE1lidos." });
    }
    await createSession(event, user.id);
    return { user: publicUser(user) };
  }
  if (action === "logout") {
    await clearSession(event);
    return { success: true };
  }
  const currentUser = await getSessionUser(event);
  if (action === "me") return { user: currentUser };
  requireRole(currentUser, ["admin"]);
  if (action === "users" && event.method === "GET") {
    const users = await sql`
      SELECT id, name, username, role, active, created_at
      FROM app_users
      ORDER BY created_at ASC
    `;
    return users.map(publicUser);
  }
  if (action === "users" && event.method === "POST") {
    const body = await readBody(event);
    const name = String((_c = body.name) != null ? _c : "").trim();
    const username = normalizeUsername(body.username);
    const password = validatePassword(body.password);
    const role = body.role;
    if (!name || username.length < 3 || !validRoles.includes(role)) {
      throw createError({ statusCode: 400, statusMessage: "Preencha os dados do usu\xE1rio corretamente." });
    }
    const id = `user-${crypto.randomUUID()}`;
    const result = await sql`
      INSERT INTO app_users (id, name, username, password_hash, role)
      VALUES (${id}, ${name}, ${username}, ${await hashPassword(password)}, ${role})
      RETURNING id, name, username, role, active, created_at
    `;
    return publicUser(result[0]);
  }
  if (action === "users" && event.method === "PUT") {
    const body = await readBody(event);
    const id = String((_d = body.id) != null ? _d : "");
    const name = String((_e = body.name) != null ? _e : "").trim();
    const role = body.role;
    const active = Boolean(body.active);
    if (!id || !name || !validRoles.includes(role)) {
      throw createError({ statusCode: 400, statusMessage: "Dados inv\xE1lidos para atualiza\xE7\xE3o." });
    }
    if (id === (currentUser == null ? void 0 : currentUser.id) && !active) {
      throw createError({ statusCode: 400, statusMessage: "Voc\xEA n\xE3o pode desativar seu pr\xF3prio acesso." });
    }
    if (body.password) {
      await sql`
        UPDATE app_users
        SET name = ${name}, role = ${role}, active = ${active},
            password_hash = ${await hashPassword(validatePassword(body.password))},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `;
    } else {
      await sql`
        UPDATE app_users
        SET name = ${name}, role = ${role}, active = ${active}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `;
    }
    return { success: true };
  }
  throw createError({ statusCode: 404, statusMessage: "A\xE7\xE3o n\xE3o encontrada." });
});

const _action_$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _action_
});

const cancelPassword_get = defineEventHandler(async () => {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS cancel_password (
        id TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
    const result = await sql`
      SELECT password FROM cancel_password
      ORDER BY created_at DESC
      LIMIT 1
    `;
    if (result.length === 0) {
      return { configured: false };
    }
    return {
      configured: true,
      password: result[0].password
    };
  } catch (error) {
    console.error("Error fetching cancel password:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error fetching cancel password"
    });
  }
});

const cancelPassword_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: cancelPassword_get
});

const cancelPassword_post = defineEventHandler(async (event) => {
  try {
    const { password } = await readBody(event);
    if (!password || password.length < 4) {
      throw createError({
        statusCode: 400,
        statusMessage: "A senha de cancelamento deve ter pelo menos 4 caracteres"
      });
    }
    await sql`
      CREATE TABLE IF NOT EXISTS cancel_password (
        id TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`DELETE FROM cancel_password`;
    const result = await sql`
      INSERT INTO cancel_password (id, password)
      VALUES (${`cancel-${Date.now()}`}, ${password})
      RETURNING id, created_at
    `;
    return {
      success: true,
      message: "Senha de cancelamento configurada com sucesso",
      id: result[0].id
    };
  } catch (error) {
    console.error("Error setting cancel password:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Error setting cancel password"
    });
  }
});

const cancelPassword_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: cancelPassword_post
});

async function getRegisterDetails(register) {
  const salesAndPayments = await sql`
    SELECT
      s.id,
      s.total_amount,
      s.status,
      s.xml_status,
      sp.payment_type,
      sp.amount
    FROM sales s
    LEFT JOIN sale_payments sp ON s.id = sp.sale_id
    WHERE s.created_at >= ${register.opened_at}
      AND s.status != 'cancelled'
      AND s.xml_status != 'cancelled'
  `;
  let salesTotal = 0;
  const salesByPayment = {
    cash: 0,
    debit: 0,
    credit: 0,
    pix: 0
  };
  const processedSales = /* @__PURE__ */ new Set();
  salesAndPayments.forEach((row) => {
    if (!processedSales.has(row.id)) {
      salesTotal += parseFloat(row.total_amount);
      processedSales.add(row.id);
    }
    if (row.payment_type && row.amount) {
      const type = row.payment_type.toLowerCase();
      if (salesByPayment[type] !== void 0) {
        salesByPayment[type] += parseFloat(row.amount);
      }
    }
  });
  const transactionsResult = await sql`
    SELECT * FROM cash_transactions
    WHERE cash_register_id = ${register.id}
    ORDER BY created_at DESC
  `;
  return {
    ...register,
    salesTotal,
    salesByPayment,
    transactions: transactionsResult
  };
}
const cashRegister_get = defineEventHandler(async () => {
  try {
    const openRegisterResult = await sql`
      SELECT * FROM cash_registers
      WHERE status = 'open'
      ORDER BY opened_at DESC
      LIMIT 1
    `;
    if (openRegisterResult.length === 0) {
      const historyRaw2 = await sql`
        SELECT * FROM cash_registers
        WHERE status = 'closed'
        ORDER BY closed_at DESC
        LIMIT 10
      `;
      const history2 = await Promise.all(
        historyRaw2.map((register) => getRegisterDetails(register))
      );
      return { current: null, history: history2 };
    }
    const currentRegister = openRegisterResult[0];
    const currentDetails = await getRegisterDetails(currentRegister);
    const historyRaw = await sql`
      SELECT * FROM cash_registers
      WHERE status = 'closed'
      ORDER BY closed_at DESC
      LIMIT 10
    `;
    const history = await Promise.all(
      historyRaw.map((register) => getRegisterDetails(register))
    );
    return {
      current: currentDetails,
      history
    };
  } catch (error) {
    console.error("Error fetching cash register:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Error fetching cash register"
    });
  }
});

const cashRegister_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: cashRegister_get
});

function getEmailConfig() {
  return {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || ""
  };
}
function createTransporter() {
  const config = getEmailConfig();
  if (!config.user || !config.pass) {
    throw new Error("Configura\xE7\xF5es de e-mail (SMTP_USER, SMTP_PASS) n\xE3o definidas");
  }
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass
    }
  });
}
function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}
function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString("pt-BR");
}
function generateReportHtml(data) {
  const {
    openingAmount,
    salesTotal,
    calculatedClosingCash,
    salesByPayment,
    totalsByCategory,
    totalSangrias,
    vouchers,
    voucherTotal,
    additions,
    additionTotal,
    valorInformado,
    expectedAmount,
    difference,
    closedAt: closedAt2,
    notes
  } = data;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 18px; color: #e67e22; }
        .header p { margin: 5px 0; font-size: 11px; color: #666; }
        .section { margin-bottom: 15px; }
        .section-title { font-weight: bold; font-size: 12px; border-bottom: 1px solid #000; margin-bottom: 8px; padding-bottom: 2px; }
        .row { display: flex; justify-content: space-between; margin: 4px 0; font-size: 11px; }
        .row.bold { font-weight: bold; }
        .row.green { color: #27ae60; }
        .row.red { color: #e74c3c; }
        .row.blue { color: #3498db; }
        .row.orange { color: #e67e22; }
        .row.amber { color: #f39c12; }
        .divider { border-top: 1px dashed #000; margin: 10px 0; }
        .footer { text-align: center; font-size: 10px; color: #999; margin-top: 20px; padding-top: 10px; border-top: 2px dashed #000; }
        .sub-row { margin-left: 15px; font-size: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>EMP\xD3RIO DAS COXINHAS</h1>
          <p>Relat\xF3rio de Fechamento de Caixa</p>
          <p>${formatDateTime(closedAt2)}</p>
        </div>

        <div class="section">
          <div class="section-title">RESUMO</div>
          <div class="row"><span>Abertura:</span><span>${formatCurrency(openingAmount)}</span></div>
          <div class="row"><span>Total Vendas:</span><span class="green">${formatCurrency(salesTotal)}</span></div>
          <div class="row bold"><span>Fechamento Caixa (Calc):</span><span class="blue">${formatCurrency(calculatedClosingCash)}</span></div>
        </div>

        <div class="divider"></div>

        <div class="section">
          <div class="section-title">VENDAS POR FORMA</div>
          <div class="row"><span>Dinheiro:</span><span class="green">${formatCurrency(salesByPayment.cash)}</span></div>
          <div class="row"><span>D\xE9bito:</span><span class="blue">${formatCurrency(salesByPayment.debit)}</span></div>
          <div class="row"><span>Cr\xE9dito:</span><span class="purple">${formatCurrency(salesByPayment.credit)}</span></div>
          <div class="row"><span>Pix:</span><span class="teal">${formatCurrency(salesByPayment.pix)}</span></div>
        </div>

        <div class="divider"></div>

        ${totalSangrias > 0 ? `
        <div class="section">
          <div class="section-title">SANGRIAS: ${formatCurrency(totalSangrias)}</div>
          ${totalsByCategory.taxa_entrega > 0 ? `<div class="row sub-row"><span>Deliverys:</span><span class="orange">-${formatCurrency(totalsByCategory.taxa_entrega)}</span></div>` : ""}
          ${totalsByCategory.ifood > 0 ? `<div class="row sub-row"><span>Ifood:</span><span class="red">-${formatCurrency(totalsByCategory.ifood)}</span></div>` : ""}
          ${totalsByCategory.brigadeiros > 0 ? `<div class="row sub-row"><span>Brigadeiros:</span><span class="amber">-${formatCurrency(totalsByCategory.brigadeiros)}</span></div>` : ""}
          ${totalsByCategory.outros > 0 ? `<div class="row sub-row"><span>Outros:</span><span>-${formatCurrency(totalsByCategory.outros)}</span></div>` : ""}
        </div>
        <div class="divider"></div>
        ` : ""}

        ${voucherTotal > 0 ? `
        <div class="section">
          <div class="section-title">VALES: ${formatCurrency(voucherTotal)}</div>
          ${vouchers.map((v) => `<div class="row sub-row"><span>${v.description}:</span><span class="amber">-${formatCurrency(v.amount)}</span></div>`).join("")}
        </div>
        <div class="divider"></div>
        ` : ""}

        ${additionTotal > 0 ? `
        <div class="section">
          <div class="section-title">ADI\xC7\xD5ES: ${formatCurrency(additionTotal)}</div>
          ${additions.map((a) => `<div class="row sub-row"><span>${a.description}:</span><span class="green">+${formatCurrency(a.amount)}</span></div>`).join("")}
        </div>
        <div class="divider"></div>
        ` : ""}

        <div class="section">
          <div class="section-title">CONFER\xCANCIA</div>
          <div class="row"><span>Valor Informado (Contado):</span><span class="bold">${formatCurrency(valorInformado)}</span></div>
          <div class="row"><span>Valor Esperado:</span><span>${formatCurrency(expectedAmount)}</span></div>
          <div class="row bold ${difference >= 0 ? "green" : "red"}"><span>DIFEREN\xC7A:</span><span>${formatCurrency(difference)}</span></div>
          <div class="row" style="font-size: 10px; color: ${difference > 0 ? "#27ae60" : difference < 0 ? "#e74c3c" : "#3498db"};">
            <span></span>
            <span>${difference > 0 ? "Sobrou dinheiro" : difference < 0 ? "Faltou dinheiro" : "Caixa fechou exato"}</span>
          </div>
        </div>

        ${notes ? `
        <div class="divider"></div>
        <div class="section">
          <div class="section-title">OBSERVA\xC7\xD5ES</div>
          <p style="font-size: 11px; white-space: pre-wrap;">${notes}</p>
        </div>
        ` : ""}

        <div class="footer">
          <p>*** OBRIGADO PELA PREFER\xCANCIA ***</p>
          <p>Emp\xF3rio das Coxinhas</p>
          <p>Enviado automaticamente em ${formatDateTime((/* @__PURE__ */ new Date()).toISOString())}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
async function sendCashRegisterCloseEmail(data) {
  try {
    const transporter = createTransporter();
    const toEmail = process.env.CASH_REGISTER_EMAIL_TO || "tom.santanna@gmail.com";
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || "";
    if (!fromEmail) {
      throw new Error("E-mail remetente (SMTP_FROM ou SMTP_USER) n\xE3o configurado");
    }
    const html = generateReportHtml(data);
    const subject = `\u{1F4CA} Fechamento de Caixa - Emp\xF3rio das Coxinhas - ${formatDateTime(closedAt)}`;
    await transporter.sendMail({
      from: `"Emp\xF3rio das Coxinhas" <${fromEmail}>`,
      to: toEmail,
      subject,
      html
    });
    console.log(`\u2705 E-mail de fechamento de caixa enviado para ${toEmail}`);
    return { success: true };
  } catch (error) {
    console.error("\u274C Erro ao enviar e-mail de fechamento:", error);
    return { success: false, error: error.message };
  }
}

const close_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
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
      SELECT
        s.id,
        s.total_amount,
        COALESCE(SUM(sp.amount) FILTER (WHERE sp.payment_type = 'cash'), 0) AS cash_paid,
        COALESCE(SUM(sp.amount) FILTER (WHERE sp.payment_type <> 'cash'), 0) AS non_cash_paid
      FROM sales s
      LEFT JOIN sale_payments sp ON sp.sale_id = s.id
      WHERE s.created_at >= ${register.opened_at}
        AND s.status != 'cancelled'
        AND s.xml_status != 'cancelled'
      GROUP BY s.id, s.total_amount
    `;
    let salesTotal = 0;
    let cashSales = 0;
    sales.forEach((sale) => {
      const total = parseFloat(sale.total_amount);
      const cashPaid = parseFloat(sale.cash_paid);
      const nonCashPaid = parseFloat(sale.non_cash_paid);
      const netCash = Math.min(cashPaid, Math.max(total - nonCashPaid, 0));
      salesTotal += total;
      cashSales += netCash;
    });
    const transactionsResult = await sql`
      SELECT * FROM cash_transactions
      WHERE cash_register_id = ${register.id}
      ORDER BY created_at DESC
    `;
    const transactions = transactionsResult;
    let withdrawals = 0;
    let additions = 0;
    let vouchers = 0;
    const vouchersList = [];
    const additionsList = [];
    const totalsByCategory = {
      taxa_entrega: 0,
      ifood: 0,
      brigadeiros: 0,
      outros: 0
    };
    transactions.forEach((trans) => {
      const total = parseFloat(trans.amount);
      const desc = trans.description || "";
      if (trans.type === "withdrawal") {
        withdrawals += total;
        if (desc.startsWith("Taxa Entrega")) {
          totalsByCategory.taxa_entrega += total;
        } else if (desc.startsWith("iFood")) {
          totalsByCategory.ifood += total;
        } else if (desc.startsWith("Brigadeiros")) {
          totalsByCategory.brigadeiros += total;
        } else {
          totalsByCategory.outros += total;
        }
      } else if (trans.type === "addition") {
        additions += total;
        additionsList.push({ description: desc, amount: total });
      } else if (trans.type === "voucher") {
        vouchers += total;
        vouchersList.push({ description: desc, amount: total });
      }
    });
    const totalSangrias = totalsByCategory.taxa_entrega + totalsByCategory.ifood + totalsByCategory.brigadeiros + totalsByCategory.outros;
    const openingAmount = parseFloat(register.opening_amount);
    const calculatedClosingCash = salesTotal - totalSangrias;
    const valorInformado = parseFloat(closingAmount) || 0;
    const expectedAmount = openingAmount + cashSales + additions - totalSangrias - vouchers;
    const difference = valorInformado - expectedAmount;
    await sql`
      UPDATE cash_registers
      SET
        closed_at = CURRENT_TIMESTAMP,
        closing_amount = ${closingAmount},
        expected_amount = ${expectedAmount},
        difference = ${difference},
        status = 'closed',
        notes = ${notes || null}
      WHERE id = ${register.id}
    `;
    const result = {
      success: true,
      salesTotal,
      cashSales,
      closingCash: calculatedClosingCash,
      expectedCashAmount: expectedAmount,
      expectedTotalAmount: openingAmount + salesTotal + additions - totalSangrias - vouchers,
      withdrawals: totalSangrias,
      additions,
      vouchers,
      difference
    };
    const emailData = {
      openingAmount,
      salesTotal,
      calculatedClosingCash,
      salesByPayment: {
        cash: ((_a = register.salesByPayment) == null ? void 0 : _a.cash) || 0,
        debit: ((_b = register.salesByPayment) == null ? void 0 : _b.debit) || 0,
        credit: ((_c = register.salesByPayment) == null ? void 0 : _c.credit) || 0,
        pix: ((_d = register.salesByPayment) == null ? void 0 : _d.pix) || 0
      },
      totalsByCategory,
      totalSangrias,
      vouchers: vouchersList,
      voucherTotal: vouchers,
      additions: additionsList,
      additionTotal: additions,
      valorInformado,
      expectedAmount,
      difference,
      closedAt: (/* @__PURE__ */ new Date()).toISOString(),
      notes
    };
    sendCashRegisterCloseEmail(emailData).catch((err) => {
      console.error("Erro ao enviar e-mail (background):", err);
    });
    return result;
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

const _id__delete$a = defineEventHandler(async (event) => {
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

const _id__delete$b = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__delete$a
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

const _id__delete$8 = defineEventHandler(async (event) => {
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

const _id__delete$9 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__delete$8
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

async function ensureContingencySchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS contingency_notes (
      id BIGSERIAL PRIMARY KEY,
      sale_id TEXT NOT NULL,
      xml_content TEXT NOT NULL,
      reason TEXT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      attempts INTEGER NOT NULL DEFAULT 0,
      payload JSONB,
      last_attempt_at TIMESTAMP,
      resolved_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await sql`ALTER TABLE contingency_notes ADD COLUMN IF NOT EXISTS sale_id TEXT`;
  await sql`ALTER TABLE contingency_notes ADD COLUMN IF NOT EXISTS xml_content TEXT`;
  await sql`ALTER TABLE contingency_notes ADD COLUMN IF NOT EXISTS reason TEXT`;
  await sql`ALTER TABLE contingency_notes ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending'`;
  await sql`ALTER TABLE contingency_notes ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0`;
  await sql`ALTER TABLE contingency_notes ADD COLUMN IF NOT EXISTS payload JSONB`;
  await sql`ALTER TABLE contingency_notes ADD COLUMN IF NOT EXISTS last_attempt_at TIMESTAMP`;
  await sql`ALTER TABLE contingency_notes ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP`;
  await sql`ALTER TABLE contingency_notes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
  await sql`ALTER TABLE contingency_notes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
}
async function saveContingencyNote(input) {
  await ensureContingencySchema();
  const existing = await sql`
    SELECT id
    FROM contingency_notes
    WHERE sale_id::text = ${input.saleId}
      AND COALESCE(status, 'pending') IN ('pending', 'processing')
    ORDER BY created_at DESC
    LIMIT 1
  `;
  if (existing.length > 0) {
    await sql`
      UPDATE contingency_notes
      SET xml_content = ${input.xmlContent},
          reason = ${input.reason},
          payload = ${JSON.stringify(input.payload)}::jsonb,
          status = 'pending',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${existing[0].id}
    `;
    return existing[0].id;
  }
  const inserted = await sql`
    INSERT INTO contingency_notes (
      sale_id, xml_content, reason, status, attempts, payload, created_at, updated_at
    ) VALUES (
      ${input.saleId}, ${input.xmlContent}, ${input.reason}, 'pending', 0,
      ${JSON.stringify(input.payload)}::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
    RETURNING id
  `;
  return inserted[0].id;
}

const contingency_get = defineEventHandler(async () => {
  try {
    await ensureContingencySchema();
    return await sql`
      SELECT
        cn.id,
        cn.sale_id::text AS sale_id,
        cn.reason,
        COALESCE(cn.status, 'pending') AS status,
        COALESCE(cn.attempts, 0) AS attempts,
        cn.last_attempt_at,
        cn.resolved_at,
        cn.created_at,
        cn.updated_at,
        COALESCE(s.total_amount, 0) AS total_amount,
        c.name AS customer_name,
        COALESCE(
          NULLIF((cn.payload->>'numero')::text, '')::integer,
          (regexp_match(cn.xml_content, '<nNF>([0-9]+)</nNF>'))[1]::integer
        ) AS numero
      FROM contingency_notes cn
      LEFT JOIN sales s ON s.id::text = cn.sale_id::text
      LEFT JOIN customers c ON c.id = s.customer_id
      ORDER BY
        CASE WHEN COALESCE(cn.status, 'pending') = 'pending' THEN 0 ELSE 1 END,
        cn.created_at DESC
    `;
  } catch (error) {
    console.error("Error fetching contingency notes:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Erro ao carregar notas em conting\xEAncia"
    });
  }
});

const contingency_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: contingency_get
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
async function cancelarNfce(chaveAcesso, numero, justificativa, ambiente) {
  try {
    if (!justificativa || justificativa.trim().length < 15) {
      throw new Error("A justificativa deve ter pelo menos 15 caracteres");
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const protocolo = `RR${Date.now().toString().slice(-9)}`;
    return {
      success: true,
      status: "cancelada",
      mensagem: "NFC-e cancelada com sucesso na SEFAZ",
      chave_acesso: chaveAcesso,
      numero: parseInt(numero),
      protocolo
    };
  } catch (error) {
    console.error("Error cancelling NFC-e:", error);
    return {
      success: false,
      status: "rejeitada",
      mensagem: "Erro ao comunicar com SEFAZ para cancelamento"
    };
  }
}

const extractNumber = (xml, tag, fallback) => {
  const match = xml.match(new RegExp(`<${tag}>([0-9]+)</${tag}>`));
  return match ? Number(match[1]) : fallback;
};
const retry_post = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const id = getRouterParam(event, "id");
  if (!id || !/^\d+$/.test(id)) {
    throw createError({ statusCode: 400, statusMessage: "ID de conting\xEAncia inv\xE1lido" });
  }
  try {
    await ensureContingencySchema();
    const notes = await sql`
      SELECT * FROM contingency_notes WHERE id = ${id} LIMIT 1
    `;
    if (notes.length === 0) {
      throw createError({ statusCode: 404, statusMessage: "Nota em conting\xEAncia n\xE3o encontrada" });
    }
    const note = notes[0];
    if (note.status === "resolved") {
      throw createError({ statusCode: 409, statusMessage: "Esta NFC-e j\xE1 foi reenviada" });
    }
    if (!note.xml_content) {
      throw createError({ statusCode: 422, statusMessage: "XML n\xE3o armazenado para reenvio" });
    }
    const alreadyAuthorized = await sql`
      SELECT id FROM nfce
      WHERE sale_id::text = ${String(note.sale_id)} AND status = 'autorizada'
      LIMIT 1
    `;
    if (alreadyAuthorized.length > 0) {
      await sql`
        UPDATE contingency_notes
        SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `;
      return { success: true, message: "A venda j\xE1 possu\xEDa uma NFC-e autorizada. Conting\xEAncia finalizada." };
    }
    await sql`
      UPDATE contingency_notes
      SET status = 'processing', attempts = COALESCE(attempts, 0) + 1,
          last_attempt_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    const ambiente = ((_a = note.payload) == null ? void 0 : _a.ambiente) || "homologacao";
    const sefazResult = await enviarParaSefaz(note.xml_content, ambiente);
    if (!sefazResult.success) {
      const reason = sefazResult.mensagem || "Falha ao comunicar com a SEFAZ";
      await sql`
        UPDATE contingency_notes
        SET status = 'pending', reason = ${reason}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `;
      throw createError({ statusCode: 503, statusMessage: reason });
    }
    const numero = Number(sefazResult.numero || ((_b = note.payload) == null ? void 0 : _b.numero) || extractNumber(note.xml_content, "nNF", 0));
    const serie = Number(((_c = note.payload) == null ? void 0 : _c.serie) || extractNumber(note.xml_content, "serie", 1));
    const inserted = await sql`
      INSERT INTO nfce (
        sale_id, chave_acesso, numero, serie, data_emissao, data_autorizacao,
        protocolo, status, qr_code, xml_envio, xml_retorno, url_consulta,
        ambiente, mensagem_status
      ) VALUES (
        ${String(note.sale_id)}, ${sefazResult.chave_acesso || ""}, ${numero}, ${serie},
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ${sefazResult.protocolo || ""},
        'autorizada', ${sefazResult.qr_code || ""}, ${note.xml_content},
        ${sefazResult.xml_retorno || ""}, ${sefazResult.url_consulta || ""},
        ${ambiente}, ${sefazResult.mensagem || "NFC-e autorizada ap\xF3s conting\xEAncia"}
      ) RETURNING id
    `;
    await sql`
      UPDATE sales
      SET xml_chave = ${sefazResult.chave_acesso || ""},
          xml_numero = ${numero},
          xml_status = 'autorizada',
          xml_content = ${sefazResult.xml_retorno || note.xml_content}
      WHERE id::text = ${String(note.sale_id)}
    `;
    await sql`
      UPDATE contingency_notes
      SET status = 'resolved', reason = ${sefazResult.mensagem || "NFC-e autorizada"},
          resolved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    return {
      success: true,
      message: "NFC-e reenviada e autorizada com sucesso",
      nfce_id: inserted[0].id
    };
  } catch (error) {
    console.error("Error retrying contingency note:", error);
    if (error.statusCode) {
      throw error;
    }
    await sql`
      UPDATE contingency_notes
      SET status = 'pending', reason = ${error.message || "Erro inesperado no reenvio"},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Erro ao reenviar NFC-e"
    });
  }
});

const retry_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: retry_post
});

const customers_get = defineEventHandler(async () => {
  try {
    const customers = await sql`
        SELECT
          c.*,
          COALESCE(SUM(CASE WHEN s.status != 'cancelled' AND s.xml_status != 'cancelled' THEN s.total_amount ELSE 0 END), 0) as total_spent,
          COALESCE(SUM(CASE WHEN s.status != 'cancelled' AND s.xml_status != 'cancelled' THEN FLOOR(s.total_amount) ELSE 0 END), 0) as points,
          COUNT(CASE WHEN s.status != 'cancelled' AND s.xml_status != 'cancelled' THEN s.id ELSE NULL END) as total_orders
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
          INSERT INTO customers (id, name, phone, address, email, points, total_spent, cpf_cnpj, inscricao_estadual, cep, logradouro, numero, complemento, bairro, municipio, uf, codigo_municipio)
          VALUES (
            ${customer.id},
            ${customer.name},
            ${customer.phone || null},
            ${customer.address || null},
            ${customer.email || null},
            ${customer.points || 0},
            ${customer.total_spent || 0},
            ${customer.cpf_cnpj || null},
            ${customer.inscricao_estadual || null},
            ${customer.cep || null},
            ${customer.logradouro || null},
            ${customer.numero || null},
            ${customer.complemento || null},
            ${customer.bairro || null},
            ${customer.municipio || null},
            ${customer.uf || null},
            ${customer.codigo_municipio || null}
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

const _id__delete$6 = defineEventHandler(async (event) => {
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

const _id__delete$7 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__delete$6
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
            cpf_cnpj = ${customer.cpf_cnpj || null},
            inscricao_estadual = ${customer.inscricao_estadual || null},
            cep = ${customer.cep || null},
            logradouro = ${customer.logradouro || null},
            numero = ${customer.numero || null},
            complemento = ${customer.complemento || null},
            bairro = ${customer.bairro || null},
            municipio = ${customer.municipio || null},
            uf = ${customer.uf || null},
            codigo_municipio = ${customer.codigo_municipio || null},
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
            AND s.status != 'cancelled'
            AND s.xml_status != 'cancelled'
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

const ensureSchema_post = defineEventHandler(async () => {
  try {
    await sql`
      ALTER TABLE customers
      ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT,
      ADD COLUMN IF NOT EXISTS inscricao_estadual TEXT,
      ADD COLUMN IF NOT EXISTS cep TEXT,
      ADD COLUMN IF NOT EXISTS logradouro TEXT,
      ADD COLUMN IF NOT EXISTS numero TEXT,
      ADD COLUMN IF NOT EXISTS complemento TEXT,
      ADD COLUMN IF NOT EXISTS bairro TEXT,
      ADD COLUMN IF NOT EXISTS municipio TEXT,
      ADD COLUMN IF NOT EXISTS uf TEXT,
      ADD COLUMN IF NOT EXISTS codigo_municipio TEXT
    `;
    return { success: true, message: "Schema atualizado com sucesso" };
  } catch (error) {
    console.error("Error ensuring customer schema:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error ensuring customer schema"
    });
  }
});

const ensureSchema_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: ensureSchema_post
});

const cancel_post$2 = defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    const { password, justificativa } = await readBody(event);
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID da nota fiscal \xE9 obrigat\xF3rio"
      });
    }
    if (!password) {
      throw createError({
        statusCode: 400,
        statusMessage: "Senha de cancelamento \xE9 obrigat\xF3ria"
      });
    }
    if (!justificativa || justificativa.trim().length < 15) {
      throw createError({
        statusCode: 400,
        statusMessage: "Justificativa \xE9 obrigat\xF3ria e deve ter pelo menos 15 caracteres"
      });
    }
    await sql`
      CREATE TABLE IF NOT EXISTS cancel_password (
        id TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
    const passwordResult = await sql`
      SELECT password FROM cancel_password
      ORDER BY created_at DESC
      LIMIT 1
    `;
    if (passwordResult.length === 0) {
      throw createError({
        statusCode: 403,
        statusMessage: "Senha de cancelamento n\xE3o configurada"
      });
    }
    if (password !== passwordResult[0].password) {
      throw createError({
        statusCode: 403,
        statusMessage: "Senha de cancelamento inv\xE1lida"
      });
    }
    const nfeResult = await sql`
      SELECT id, status, sale_id, chave_acesso, numero, serie, ambiente
      FROM nfe
      WHERE sale_id::text = ${String(id)}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const nfceResult = await sql`
      SELECT id, status, sale_id, chave_acesso, numero, serie, ambiente
      FROM nfce
      WHERE sale_id::text = ${String(id)}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const fiscalNote = nfeResult.length > 0 ? nfeResult[0] : nfceResult.length > 0 ? nfceResult[0] : null;
    if (!fiscalNote) {
      throw createError({
        statusCode: 404,
        statusMessage: "Nota fiscal n\xE3o encontrada"
      });
    }
    if (fiscalNote.status === "cancelada") {
      throw createError({
        statusCode: 400,
        statusMessage: "Esta nota fiscal j\xE1 foi cancelada"
      });
    }
    if (fiscalNote.status !== "autorizada") {
      throw createError({
        statusCode: 400,
        statusMessage: "Apenas notas autorizadas podem ser canceladas"
      });
    }
    const ambiente = fiscalNote.ambiente === "producao" ? "producao" : "homologacao";
    let sefazResult;
    try {
      if (nfeResult.length > 0) {
        sefazResult = await cancelarNfce(
          fiscalNote.chave_acesso,
          fiscalNote.numero.toString(),
          justificativa,
          ambiente
        );
      } else {
        sefazResult = await cancelarNfce(
          fiscalNote.chave_acesso,
          fiscalNote.numero.toString(),
          justificativa,
          ambiente
        );
      }
    } catch (sefazError) {
      console.error("Erro ao cancelar na SEFAZ:", sefazError);
      throw createError({
        statusCode: 502,
        statusMessage: `Erro ao comunicar com a SEFAZ: ${sefazError.message || "Falha na comunica\xE7\xE3o"}`
      });
    }
    if (!sefazResult.success) {
      throw createError({
        statusCode: 502,
        statusMessage: `SEFAZ rejeitou o cancelamento: ${sefazResult.mensagem || "Motivo n\xE3o informado"}`
      });
    }
    if (fiscalNote.sale_id) {
      const saleResult = await sql`
        SELECT freight, total_amount, customer_id FROM sales
        WHERE id::text = ${String(fiscalNote.sale_id)}
        LIMIT 1
      `;
      if (saleResult.length > 0) {
        const freight = parseFloat(saleResult[0].freight || 0);
        const totalAmount = parseFloat(saleResult[0].total_amount || 0);
        const customerId = saleResult[0].customer_id;
        if (freight > 0) {
          const openRegister = await sql`
            SELECT id FROM cash_registers
            WHERE status = 'open'
            ORDER BY opened_at DESC
            LIMIT 1
          `;
          if (openRegister.length > 0) {
            const cashRegisterId = openRegister[0].id;
            const freightTransactions = await sql`
              SELECT id FROM cash_transactions
              WHERE cash_register_id = ${cashRegisterId}
                AND type = 'withdrawal'
                AND amount = ${freight}
                AND description LIKE 'Taxa Entrega%'
              ORDER BY created_at DESC
              LIMIT 1
            `;
            if (freightTransactions.length > 0) {
              await sql`
                DELETE FROM cash_transactions
                WHERE id = ${freightTransactions[0].id}
              `;
            }
          }
        }
        if (customerId) {
          const pointsToRemove = Math.floor(totalAmount);
          if (pointsToRemove > 0) {
            await sql`
              UPDATE customers
              SET points = GREATEST(COALESCE(points, 0) - ${pointsToRemove}, 0),
                  total_spent = GREATEST(COALESCE(total_spent, 0) - ${totalAmount}, 0)
              WHERE id = ${customerId}
            `;
          }
        }
      }
    }
    if (nfeResult.length > 0) {
      await sql`
        UPDATE nfe
        SET status = 'cancelada'
        WHERE id = ${fiscalNote.id}
      `;
    } else {
      await sql`
        UPDATE nfce
        SET status = 'cancelada'
        WHERE id = ${fiscalNote.id}
      `;
    }
    if (fiscalNote.sale_id) {
      await sql`
        UPDATE sales
        SET xml_status = 'cancelled'
        WHERE id::text = ${String(fiscalNote.sale_id)}
      `;
    }
    return {
      success: true,
      message: "Nota fiscal cancelada com sucesso na SEFAZ e no sistema",
      sefaz: {
        protocolo: sefazResult.protocolo,
        status: sefazResult.status,
        mensagem: sefazResult.mensagem
      }
    };
  } catch (error) {
    console.error("Error cancelling fiscal note:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: "Error cancelling fiscal note"
    });
  }
});

const cancel_post$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: cancel_post$2
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

async function ensureNfeSchema(client = sql) {
  await client.query(`
    ALTER TABLE customers
      ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT,
      ADD COLUMN IF NOT EXISTS inscricao_estadual TEXT,
      ADD COLUMN IF NOT EXISTS cep TEXT,
      ADD COLUMN IF NOT EXISTS logradouro TEXT,
      ADD COLUMN IF NOT EXISTS numero TEXT,
      ADD COLUMN IF NOT EXISTS complemento TEXT,
      ADD COLUMN IF NOT EXISTS bairro TEXT,
      ADD COLUMN IF NOT EXISTS municipio TEXT,
      ADD COLUMN IF NOT EXISTS uf TEXT,
      ADD COLUMN IF NOT EXISTS codigo_municipio TEXT
  `);
  await client.query(`
      CREATE TABLE IF NOT EXISTS digital_certificates (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        arquivo BYTEA NOT NULL,
        senha TEXT NOT NULL,
        data_validade TIMESTAMPTZ NOT NULL,
        ativo BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
  await client.query(`
      ALTER TABLE digital_certificates ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT false
    `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS nfe (
      id BIGSERIAL PRIMARY KEY,
      sale_id TEXT NOT NULL UNIQUE,
      customer_id TEXT,
      chave_acesso TEXT NOT NULL,
      numero INTEGER NOT NULL,
      serie INTEGER NOT NULL,
      status TEXT NOT NULL,
      ambiente TEXT NOT NULL,
      protocolo TEXT,
      data_emissao TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      data_autorizacao TIMESTAMPTZ,
      natureza_operacao TEXT NOT NULL DEFAULT 'VENDA',
      valor_produtos NUMERIC(12, 2) NOT NULL,
      valor_frete NUMERIC(12, 2) NOT NULL DEFAULT 0,
      valor_total NUMERIC(12, 2) NOT NULL,
      destinatario JSONB NOT NULL,
      itens JSONB NOT NULL,
      pagamentos JSONB NOT NULL,
      xml_envio TEXT NOT NULL,
      xml_retorno TEXT,
      url_consulta TEXT,
      mensagem_status TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

const certificates_post = defineEventHandler(async (event) => {
  var _a, _b, _c;
  try {
    await ensureNfeSchema();
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
    const pfxBuffer = Buffer.from(arrayBuffer);
    let dataValidade = /* @__PURE__ */ new Date();
    let certificadoInfo = "";
    try {
      const p12Asn1 = forge.asn1.fromDer(pfxBuffer.toString("binary"));
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, senha);
      let certificate = null;
      for (const safeContent of p12.safeContents) {
        for (const bag of safeContent.safeBags) {
          if (bag.type === forge.pki.oids.certBag && bag.cert && !certificate) {
            certificate = bag.cert;
          }
        }
      }
      if (!certificate) {
        throw new Error("Certificado X.509 n\xE3o encontrado no arquivo.");
      }
      dataValidade = ((_a = certificate.validity) == null ? void 0 : _a.notAfter) || /* @__PURE__ */ new Date();
      if (dataValidade < /* @__PURE__ */ new Date()) {
        throw new Error(`Certificado expirado em ${dataValidade.toLocaleDateString("pt-BR")}.`);
      }
      certificadoInfo = ((_c = (_b = certificate.subject) == null ? void 0 : _b.attributes) == null ? void 0 : _c.map((attr) => `${attr.shortName}=${attr.value}`).join(", ")) || "";
      await sql`UPDATE digital_certificates SET ativo = false WHERE ativo = true`;
    } catch (certError) {
      throw createError({
        statusCode: 400,
        statusMessage: `Certificado inv\xE1lido: ${certError.message || "senha incorreta ou arquivo corrompido."}`
      });
    }
    const id = `cert-${Date.now()}`;
    const result = await sql`
          INSERT INTO digital_certificates (id, nome, arquivo, senha, data_validade, ativo)
          VALUES (${id}, ${nome}, ${pfxBuffer}, ${senha}, ${dataValidade}, true)
          RETURNING id, nome, data_validade
        `;
    return {
      ...result[0],
      expirado: false,
      subject: certificadoInfo
    };
  } catch (error) {
    console.error("Error saving certificate:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Error saving certificate"
    });
  }
});

const certificates_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: certificates_post
});

const _id__delete$4 = defineEventHandler(async (event) => {
  const { id } = event.context.params || {};
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID do certificado n\xE3o fornecido"
    });
  }
  try {
    await sql`
      UPDATE digital_certificates
      SET ativo = false
      WHERE id = ${id}
    `;
    return {
      message: "Certificado exclu\xEDdo com sucesso"
    };
  } catch (error) {
    console.error("Error deleting certificate:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Erro ao excluir certificado"
    });
  }
});

const _id__delete$5 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__delete$4
});

const _id__patch = defineEventHandler(async (event) => {
  const { id } = event.context.params || {};
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID do certificado n\xE3o fornecido"
    });
  }
  try {
    const result = await sql`
      UPDATE digital_certificates
      SET ativo = true
      WHERE id = ${id}
    `;
    if (result.rowCount === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Certificado n\xE3o encontrado"
      });
    }
    return {
      message: "Certificado ativado com sucesso"
    };
  } catch (error) {
    console.error("Error activating certificate:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Erro ao ativar certificado"
    });
  }
});

const _id__patch$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__patch
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

function extractPrivateKey(bag, password) {
  if (bag.key) {
    return bag.key;
  }
  if (!bag.asn1) {
    return null;
  }
  try {
    if (bag.type === forge.pki.oids.keyBag) {
      return forge.pki.privateKeyFromAsn1(bag.asn1);
    }
    if (bag.type === forge.pki.oids.pkcs8ShroudedKeyBag) {
      const decryptedKeyInfo = forge.pki.decryptPrivateKeyInfo(bag.asn1, password);
      if (!decryptedKeyInfo) {
        return null;
      }
      return forge.pki.privateKeyFromAsn1(decryptedKeyInfo);
    }
  } catch {
    return null;
  }
  return null;
}
async function loadActiveCertificate() {
  var _a, _b, _c;
  const rows = await sql`
    SELECT arquivo, senha
    FROM digital_certificates
    WHERE ativo = true
    ORDER BY created_at DESC
    LIMIT 1
  `;
  let certRow = rows[0];
  if (!certRow) {
    const fallback = await sql`
      SELECT arquivo, senha
      FROM digital_certificates
      ORDER BY created_at DESC
      LIMIT 1
    `;
    certRow = fallback[0];
  }
  if (!certRow) {
    throw new Error(
      "Nenhum certificado digital encontrado. Fa\xE7a upload do certificado A1 em Configura\xE7\xF5es Fiscais."
    );
  }
  const pfxBuffer = Buffer.isBuffer(certRow.arquivo) ? certRow.arquivo : Buffer.from(certRow.arquivo);
  const password = String(certRow.senha || "");
  try {
    const p12Asn1 = forge.asn1.fromDer(pfxBuffer.toString("binary"));
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, password);
    let privateKey = null;
    let certificate = null;
    for (const safeContent of p12.safeContents) {
      for (const rawBag of safeContent.safeBags) {
        const bag = rawBag;
        if (!privateKey) {
          privateKey = extractPrivateKey(bag, password);
        }
        if (!certificate && bag.type === forge.pki.oids.certBag && bag.cert) {
          certificate = bag.cert;
        }
        if (privateKey && certificate) {
          break;
        }
      }
      if (privateKey && certificate) {
        break;
      }
    }
    if (!privateKey) {
      throw new Error(
        "Chave privada n\xE3o encontrada no certificado. Confirme que o arquivo \xE9 um certificado A1 (.pfx/.p12) com chave privada e que a senha est\xE1 correta."
      );
    }
    if (!certificate) {
      throw new Error("Certificado X.509 n\xE3o encontrado no arquivo PFX.");
    }
    const validTo = ((_a = certificate.validity) == null ? void 0 : _a.notAfter) || /* @__PURE__ */ new Date();
    if (validTo < /* @__PURE__ */ new Date()) {
      throw new Error(
        `Certificado digital expirado em ${validTo.toLocaleDateString("pt-BR")}. Renove o certificado A1.`
      );
    }
    const privateKeyPem = forge.pki.privateKeyToPem(privateKey);
    const certificatePem = forge.pki.certificateToPem(certificate);
    const certificateBase64 = forge.util.encode64(
      forge.asn1.toDer(forge.pki.certificateToAsn1(certificate)).getBytes()
    );
    const subject = ((_c = (_b = certificate.subject) == null ? void 0 : _b.attributes) == null ? void 0 : _c.map((attribute) => `${attribute.shortName}=${attribute.value}`).join(", ")) || "";
    return {
      pfxBuffer,
      password,
      privateKeyPem,
      certificatePem,
      certificateBase64,
      validTo,
      subject
    };
  } catch (error) {
    const message = String((error == null ? void 0 : error.message) || "");
    if (message.includes("Chave privada n\xE3o encontrada") || message.includes("Certificado X.509 n\xE3o encontrado") || message.includes("Certificado digital expirado")) {
      throw error;
    }
    throw new Error(
      `Erro ao ler o certificado digital: senha incorreta ou arquivo inv\xE1lido. ${message}`
    );
  }
}

const SEFAZ_ENDPOINTS = {
  homologacao: {
    autorizacao: "https://nfe-homologacao.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx",
    retAutorizacao: "https://nfe-homologacao.svrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx",
    statusServico: "https://nfe-homologacao.svrs.rs.gov.br/ws/NfeStatusServico/NFeStatusServico4.asmx"
  },
  producao: {
    autorizacao: "https://nfe.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx",
    retAutorizacao: "https://nfe.svrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx",
    statusServico: "https://nfe.svrs.rs.gov.br/ws/NfeStatusServico/NFeStatusServico4.asmx"
  }
};
function extractTag(xml, tag) {
  var _a;
  const expression = new RegExp(
    `<(?:[\\w.-]+:)?${tag}\\b[^>]*>([\\s\\S]*?)</(?:[\\w.-]+:)?${tag}>`,
    "i"
  );
  const match = xml.match(expression);
  return ((_a = match == null ? void 0 : match[1]) == null ? void 0 : _a.trim()) || null;
}
function extractTags(xml, tag) {
  const expression = new RegExp(
    `<(?:[\\w.-]+:)?${tag}\\b[^>]*>([\\s\\S]*?)</(?:[\\w.-]+:)?${tag}>`,
    "gi"
  );
  return [...xml.matchAll(expression)].map((match) => {
    var _a;
    return (_a = match[1]) == null ? void 0 : _a.trim();
  }).filter((value) => Boolean(value));
}
function extractElement(xml, tag) {
  var _a;
  const expression = new RegExp(
    `<(?:[\\w.-]+:)?${tag}\\b[^>]*>[\\s\\S]*?</(?:[\\w.-]+:)?${tag}>`,
    "i"
  );
  return ((_a = xml.match(expression)) == null ? void 0 : _a[0]) || null;
}
function buildSoapEnvelope(serviceNamespace, innerXml) {
  return `<?xml version="1.0" encoding="UTF-8"?><soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"><soap:Body><nfeDadosMsg xmlns="${serviceNamespace}">${innerXml}</nfeDadosMsg></soap:Body></soap:Envelope>`;
}
function createHttpsAgent(certificate, environment) {
  return new https.Agent({
    pfx: certificate.pfxBuffer,
    passphrase: certificate.password,
    // Don't specify ca - let Node.js use its default trust store
    // But we include the client certificate (pfx) for signing
    rejectUnauthorized: false
    // Try to include ICP-Brasil certificates if available, but don't fail if not
    // keepAlive: true,
    // maxSockets: 5,
  });
}
function sendSoapRequest(url, soapBody, certificate, environment, soapAction) {
  const urlObj = new URL(url);
  console.log(`[NFE] POST ${url} (${environment === "producao" ? "produ\xE7\xE3o" : "homologa\xE7\xE3o"})`);
  const agent = createHttpsAgent(certificate);
  return new Promise((resolve, reject) => {
    const request = https.request(urlObj, {
      agent,
      method: "POST",
      timeout: 6e4,
      headers: {
        Accept: "application/soap+xml, text/xml, */*",
        "Content-Type": `application/soap+xml; charset=utf-8; action="${soapAction}"`,
        "Content-Length": Buffer.byteLength(soapBody),
        "User-Agent": "PDV-NFe/1.0"
      }
    }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        resolve({
          statusCode: response.statusCode || 0,
          body
        });
      });
    });
    request.on("error", (error) => {
      console.error(`[NFE] Erro de comunica\xE7\xE3o com SEFAZ (${environment}):`, {
        message: error.message,
        code: error.code,
        errno: error.errno,
        syscall: error.syscall
      });
      reject(new Error(`Erro de comunica\xE7\xE3o com a SEFAZ: ${error.message}`));
    });
    request.on("timeout", () => {
      request.destroy();
      reject(new Error("Tempo limite excedido ao aguardar resposta da SEFAZ (60 segundos)."));
    });
    request.write(soapBody);
    request.end();
  });
}
function parseAuthorizationResponse(responseXml, httpStatus) {
  const fault = extractTag(responseXml, "faultstring") || extractTag(responseXml, "Reason");
  if (fault) {
    return {
      success: false,
      status: "rejeitada",
      message: `Falha SOAP da SEFAZ: ${fault}`,
      rawResponse: responseXml
    };
  }
  const statusCodes = extractTags(responseXml, "cStat");
  const messages = extractTags(responseXml, "xMotivo");
  const cStat = statusCodes.at(-1) || null;
  const xMotivo = messages.at(-1) || null;
  const protocol = extractTag(responseXml, "nProt");
  const authorizationDate = extractTag(responseXml, "dhRecbto");
  const receipt = extractTag(responseXml, "nRec");
  if (cStat === "100") {
    return {
      success: true,
      status: "autorizada",
      message: xMotivo || "Autorizado o uso da NF-e",
      protocol: protocol || void 0,
      authorizationDate: authorizationDate || void 0,
      authorizationXml: extractElement(responseXml, "protNFe") || responseXml,
      rawResponse: responseXml
    };
  }
  if (cStat === "103" && receipt) {
    return {
      success: false,
      status: "processando",
      message: "Lote recebido pela SEFAZ e aguardando processamento.",
      rawResponse: responseXml
    };
  }
  if (cStat === "104") {
    return {
      success: false,
      status: "rejeitada",
      message: "Lote processado pela SEFAZ, mas a autoriza\xE7\xE3o individual da NF-e n\xE3o foi encontrada na resposta.",
      rawResponse: responseXml
    };
  }
  if (cStat) {
    return {
      success: false,
      status: "rejeitada",
      message: `SEFAZ rejeitou a NF-e (cStat ${cStat}): ${xMotivo || "motivo n\xE3o informado"}`,
      rawResponse: responseXml
    };
  }
  return {
    success: false,
    status: "rejeitada",
    message: httpStatus >= 400 ? `A SEFAZ respondeu HTTP ${httpStatus} sem informar o cStat. Resposta recebida: ${responseXml.slice(0, 300)}` : "A SEFAZ respondeu sem cStat. Verifique o endpoint, o namespace SOAP e o XML enviado.",
    rawResponse: responseXml
  };
}
async function pollForResult(receipt, environment, certificate) {
  const endpoint = SEFAZ_ENDPOINTS[environment];
  const innerXml = `<consReciNFe versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe"><tpAmb>${environment === "producao" ? "1" : "2"}</tpAmb><nRec>${receipt}</nRec></consReciNFe>`;
  const serviceNamespace = "http://www.portalfiscal.inf.br/nfe/wsdl/NFeRetAutorizacao4";
  const response = await sendSoapRequest(
    endpoint.retAutorizacao,
    buildSoapEnvelope(serviceNamespace, innerXml),
    certificate,
    environment,
    `${serviceNamespace}/nfeRetAutorizacaoLote`
  );
  return parseAuthorizationResponse(response.body, response.statusCode);
}
async function authorizeNfe(signedXml, _accessKey, environment, certificate) {
  const normalizedEnvironment = environment === "producao" ? "producao" : "homologacao";
  const endpoint = SEFAZ_ENDPOINTS[normalizedEnvironment];
  const loteId = String(Date.now()).slice(-15);
  const nfeXml = signedXml.replace(/^<\?xml[^>]*>\s*/i, "").trim();
  const innerXml = `<enviNFe versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe"><idLote>${loteId}</idLote><indSinc>1</indSinc>${nfeXml}</enviNFe>`;
  const serviceNamespace = "http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4";
  const response = await sendSoapRequest(
    endpoint.autorizacao,
    buildSoapEnvelope(serviceNamespace, innerXml),
    certificate,
    normalizedEnvironment,
    `${serviceNamespace}/nfeAutorizacaoLote`
  );
  let result = parseAuthorizationResponse(response.body, response.statusCode);
  if (result.status === "processando") {
    const receipt = extractTag(response.body, "nRec");
    if (receipt) {
      await new Promise((resolve) => setTimeout(resolve, 3e3));
      result = await pollForResult(receipt, normalizedEnvironment, certificate);
    }
  }
  return result;
}
async function checkStatusServico(environment, certificate) {
  const normalizedEnvironment = environment === "producao" ? "producao" : "homologacao";
  const endpoint = SEFAZ_ENDPOINTS[normalizedEnvironment];
  const innerXml = `<consStatServ versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe"><tpAmb>${normalizedEnvironment === "producao" ? "1" : "2"}</tpAmb><cUF>14</cUF><xServ>STATUS</xServ></consStatServ>`;
  const serviceNamespace = "http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4";
  const response = await sendSoapRequest(
    endpoint.statusServico,
    buildSoapEnvelope(serviceNamespace, innerXml),
    certificate,
    normalizedEnvironment,
    `${serviceNamespace}/nfeStatusServicoNF`
  );
  return {
    status: extractTag(response.body, "cStat") || `HTTP-${response.statusCode}`,
    message: extractTag(response.body, "xMotivo") || extractTag(response.body, "faultstring") || `Resposta HTTP ${response.statusCode} sem motivo informado`
  };
}

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
    const ambiente = config.ambiente === "producao" ? "producao" : "homologacao";
    const certificate = await loadActiveCertificate();
    const now = /* @__PURE__ */ new Date();
    const diasRestantes = Math.floor(
      (certificate.validTo.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24)
    );
    const sefazResult = await checkStatusServico(ambiente, certificate);
    return {
      success: sefazResult.status === "107",
      message: sefazResult.status === "107" ? "SEFAZ-RR online e operante" : sefazResult.status === "108" ? "SEFAZ-RR em manuten\xE7\xE3o" : `SEFAZ-RR respondeu: ${sefazResult.message} (cStat: ${sefazResult.status})`,
      details: {
        ambiente,
        cnpj: config.cnpj,
        razao_social: config.razao_social,
        certificado: {
          nome: certificate.subject || "Certificado A1",
          validade: certificate.validTo.toISOString(),
          dias_restantes: diasRestantes
        },
        sefaz_status: sefazResult.status,
        sefaz_motivo: sefazResult.message
      }
    };
  } catch (error) {
    console.error("Error testing SEFAZ connection:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Error testing SEFAZ connection"
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
              ${Array.isArray(item.flavors) ? item.flavors : null}
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

const nfce_get = defineEventHandler(async () => {
  try {
    const notas = await sql`
      SELECT
        n.id AS nfce_id,
        n.sale_id::text AS id,
        COALESCE(NULLIF(n.xml_retorno, ''), n.xml_envio) AS xml_content,
        n.chave_acesso AS xml_chave,
        n.numero AS xml_numero,
        n.status AS xml_status,
        COALESCE(n.data_emissao, n.created_at) AS created_at,
        COALESCE(s.total_amount, 0) AS total_amount,
        c.name AS customer_name
      FROM nfce n
      LEFT JOIN sales s ON s.id::text = n.sale_id::text
      LEFT JOIN customers c ON c.id = s.customer_id
      WHERE n.status = 'autorizada'
        AND COALESCE(NULLIF(n.xml_retorno, ''), NULLIF(n.xml_envio, '')) IS NOT NULL
      ORDER BY COALESCE(n.data_emissao, n.created_at) DESC
    `;
    return notas;
  } catch (error) {
    console.error("Error fetching NFC-e XMLs:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Erro ao carregar XMLs fiscais"
    });
  }
});

const nfce_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: nfce_get
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

const UF_CODES$1 = {
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
  const codigoUf = UF_CODES$1[uf];
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
const emitir_post$2 = defineEventHandler(async (event) => {
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
    let sefazResult;
    try {
      sefazResult = await enviarParaSefaz(xmlEnvio, config.ambiente || "homologacao");
    } catch (sendError2) {
      sefazResult = {
        success: false,
        status: "erro",
        mensagem: (sendError2 == null ? void 0 : sendError2.message) || "Falha de conex\xE3o com a SEFAZ"
      };
    }
    console.log("\u{1F4E4} Resposta SEFAZ:", sefazResult);
    if (!sefazResult.success) {
      const failureReason = sefazResult.mensagem || "N\xE3o foi poss\xEDvel comunicar com a SEFAZ";
      console.error("\u274C Erro ao autorizar NFC-e na SEFAZ:", sefazResult);
      await saveContingencyNote({
        saleId: String(saleDbId),
        xmlContent: xmlEnvio,
        reason: failureReason,
        payload: {
          ambiente: config.ambiente || "homologacao",
          numero: proximoNumero,
          serie: serieNfce,
          valor_total
        }
      });
      await sql`
        INSERT INTO nfce (sale_id, status, xml_envio, mensagem_status, ambiente, numero, serie)
        VALUES (${String(saleIdNumber)}, 'rejeitada', ${xmlEnvio}, ${failureReason}, ${config.ambiente || "homologacao"}, ${proximoNumero}, ${serieNfce})
      `;
      await sql`
        UPDATE sales SET xml_status = 'contingencia' WHERE id = ${saleDbId}
      `;
      throw createError({ statusCode: 503, statusMessage: `${failureReason}. NFC-e salva em conting\xEAncia para reenvio.` });
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

const emitir_post$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: emitir_post$2
});

const _id__get$2 = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id || !/^\d+$/.test(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID da NFC-e inv\xE1lido"
    });
  }
  try {
    const result = await sql`
      SELECT
        numero,
        COALESCE(NULLIF(xml_retorno, ''), xml_envio) AS xml_content
      FROM nfce
      WHERE id = ${id}
        AND status = 'autorizada'
      LIMIT 1
    `;
    if (result.length === 0 || !result[0].xml_content) {
      throw createError({
        statusCode: 404,
        statusMessage: "XML da NFC-e n\xE3o encontrado"
      });
    }
    setResponseHeaders(event, {
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="nfe-${result[0].numero || id}.xml"`
    });
    return result[0].xml_content;
  } catch (error) {
    console.error("Error downloading NFC-e XML:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Erro ao baixar XML fiscal"
    });
  }
});

const _id__get$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__get$2
});

const nfe_get = defineEventHandler(async () => {
  try {
    const notes = await sql`
      SELECT
        n.id AS nfe_id,
        n.sale_id::text AS id,
        n.chave_acesso AS xml_chave,
        n.numero AS xml_numero,
        n.status AS xml_status,
        COALESCE(n.data_autorizacao, n.data_emissao, n.created_at) AS created_at,
        n.valor_total AS total_amount,
        c.name AS customer_name
      FROM nfe n
      LEFT JOIN customers c ON c.id = n.customer_id
      WHERE n.status = 'autorizada'
        AND NULLIF(n.xml_envio, '') IS NOT NULL
      ORDER BY COALESCE(n.data_autorizacao, n.data_emissao, n.created_at) DESC
    `;
    return notes;
  } catch (error) {
    console.error("Error fetching NFe XMLs:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Erro ao carregar XMLs de NF-e"
    });
  }
});

const nfe_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: nfe_get
});

const _saleId__get = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
  try {
    const saleId = getRouterParam(event, "saleId");
    if (!saleId) {
      throw createError({
        statusCode: 400,
        statusMessage: "sale_id \xE9 obrigat\xF3rio"
      });
    }
    const result = await sql`
      SELECT
        n.*,
        c.name AS customer_name,
        c.cpf_cnpj AS customer_cpf_cnpj,
        c.inscricao_estadual AS customer_ie,
        c.phone AS customer_phone,
        c.email AS customer_email,
        c.cep AS customer_cep,
        c.logradouro AS customer_logradouro,
        c.numero AS customer_numero,
        c.complemento AS customer_complemento,
        c.bairro AS customer_bairro,
        c.municipio AS customer_municipio,
        c.uf AS customer_uf
      FROM nfe n
      LEFT JOIN customers c ON c.id = n.customer_id
      WHERE n.sale_id = ${saleId}
      ORDER BY n.created_at DESC
      LIMIT 1
    `;
    if (!result || result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "NF-e n\xE3o encontrada para esta venda"
      });
    }
    const row = result[0];
    const items = Array.isArray(row.itens) ? row.itens : typeof row.itens === "string" ? (() => {
      try {
        return JSON.parse(row.itens);
      } catch {
        return [];
      }
    })() : [];
    const payments = Array.isArray(row.pagamentos) ? row.pagamentos : typeof row.pagamentos === "string" ? (() => {
      try {
        return JSON.parse(row.pagamentos);
      } catch {
        return [];
      }
    })() : [];
    const customer = {
      name: row.customer_name || ((_a = row.destinatario) == null ? void 0 : _a.name) || "",
      cpf_cnpj: row.customer_cpf_cnpj || ((_b = row.destinatario) == null ? void 0 : _b.cpf_cnpj) || "",
      inscricao_estadual: row.customer_ie || ((_c = row.destinatario) == null ? void 0 : _c.inscricao_estadual) || "",
      phone: row.customer_phone || ((_d = row.destinatario) == null ? void 0 : _d.phone) || "",
      email: row.customer_email || ((_e = row.destinatario) == null ? void 0 : _e.email) || "",
      cep: row.customer_cep || ((_f = row.destinatario) == null ? void 0 : _f.cep) || "",
      logradouro: row.customer_logradouro || ((_g = row.destinatario) == null ? void 0 : _g.logradouro) || "",
      numero: row.customer_numero || ((_h = row.destinatario) == null ? void 0 : _h.numero) || "",
      complemento: row.customer_complemento || ((_i = row.destinatario) == null ? void 0 : _i.complemento) || "",
      bairro: row.customer_bairro || ((_j = row.destinatario) == null ? void 0 : _j.bairro) || "",
      municipio: row.customer_municipio || ((_k = row.destinatario) == null ? void 0 : _k.municipio) || "",
      uf: row.customer_uf || ((_l = row.destinatario) == null ? void 0 : _l.uf) || ""
    };
    return {
      number: row.numero,
      series: row.serie,
      accessKey: row.chave_acesso,
      protocol: row.protocolo || "",
      status: row.status,
      environment: row.ambiente,
      consultationUrl: row.url_consulta || "",
      customer,
      items,
      payments,
      freight: Number(row.valor_frete) || 0,
      productsTotal: Number(row.valor_produtos) || 0,
      total: Number(row.valor_total) || 0
    };
  } catch (error) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: "Erro ao buscar NF-e"
    });
  }
});

const _saleId__get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _saleId__get
});

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
const HOMOLOGATION_RECIPIENT_NAME = "NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL";
const text$1 = (value) => String(value != null ? value : "").trim();
const digits$1 = (value) => text$1(value).replace(/\D/g, "");
const xml = (value) => text$1(value).replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
function accessKeyDigit(key) {
  const weights = [2, 3, 4, 5, 6, 7, 8, 9];
  let sum = 0;
  for (let index = key.length - 1; index >= 0; index -= 1) {
    sum += Number(key[index]) * weights[(key.length - 1 - index) % weights.length];
  }
  const remainder = sum % 11;
  return String(remainder < 2 ? 0 : 11 - remainder);
}
function generateAccessKey(ufCode, issuedAt, cnpj, series, number) {
  const yearMonth = `${String(issuedAt.getFullYear()).slice(-2)}${String(issuedAt.getMonth() + 1).padStart(2, "0")}`;
  const numericCode = Math.floor(1e7 + Math.random() * 9e7).toString();
  const base = `${ufCode}${yearMonth}${digits$1(cnpj)}55${String(series).padStart(3, "0")}${String(number).padStart(9, "0")}1${numericCode}`;
  return `${base}${accessKeyDigit(base)}`;
}
function formatIssueDate(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Boa_Vista",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}-04:00`;
}
function paymentCode(type) {
  const codes = {
    cash: "01",
    credit: "03",
    debit: "04",
    pix: "17",
    boleto: "15",
    bank_transfer: "18",
    other: "99"
  };
  return codes[type] || "99";
}
function generateNfeXml(data, config, number, series) {
  const requiredConfig = ["cnpj", "razao_social", "inscricao_estadual", "crt", "cep", "logradouro", "numero", "bairro", "municipio", "uf"];
  const missingConfig = requiredConfig.filter((field) => !text$1(config[field]));
  if (missingConfig.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Complete as Configura\xE7\xF5es Fiscais antes de emitir a NF-e."
    });
  }
  const emitterUf = text$1(config.uf).toUpperCase();
  const ufCode = UF_CODES[emitterUf];
  if (!ufCode) {
    throw createError({ statusCode: 400, statusMessage: "UF do emitente inv\xE1lida." });
  }
  const issuedAt = /* @__PURE__ */ new Date();
  const issuedAtNfe = formatIssueDate(issuedAt);
  const accessKey = generateAccessKey(ufCode, issuedAt, config.cnpj, series, number);
  const recipient = data.customer;
  const recipientDocument = digits$1(recipient.cpf_cnpj);
  const recipientUf = text$1(recipient.uf).toUpperCase();
  const recipientName = config.ambiente === "producao" ? recipient.name : HOMOLOGATION_RECIPIENT_NAME;
  const interstate = recipientUf !== emitterUf;
  const productsTotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const freight = Number(data.freight) || 0;
  const total = productsTotal + freight;
  const itemsXml = data.items.map((item, index) => {
    var _a;
    const fiscal = item.fiscal || {};
    const itemTotal = item.price * item.quantity;
    const itemFreight = index === 0 ? freight : 0;
    const cfop = digits$1(fiscal.cfop) || (interstate ? "6102" : "5102");
    const ncm = digits$1(fiscal.ncm);
    const origin = Number((_a = fiscal.origem) != null ? _a : 0);
    return `
      <det nItem="${index + 1}">
        <prod>
          <cProd>${xml(item.id)}</cProd>
          <cEAN>SEM GTIN</cEAN>
          <xProd>${xml(item.name)}</xProd>
          <NCM>${ncm}</NCM>
          ${digits$1(fiscal.cest) ? `<CEST>${digits$1(fiscal.cest)}</CEST>` : ""}
          <CFOP>${cfop}</CFOP>
          <uCom>${xml(fiscal.unidade || "UN")}</uCom>
          <qCom>${Number(item.quantity).toFixed(4)}</qCom>
          <vUnCom>${Number(item.price).toFixed(10)}</vUnCom>
          <vProd>${itemTotal.toFixed(2)}</vProd>
          <cEANTrib>SEM GTIN</cEANTrib>
          <uTrib>${xml(fiscal.unidade || "UN")}</uTrib>
          <qTrib>${Number(item.quantity).toFixed(4)}</qTrib>
          <vUnTrib>${Number(item.price).toFixed(10)}</vUnTrib>
          ${itemFreight > 0 ? `<vFrete>${itemFreight.toFixed(2)}</vFrete>` : ""}
          <indTot>1</indTot>
        </prod>
        <imposto>
          <ICMS>
            <ICMSSN102>
              <orig>${origin}</orig>
              <CSOSN>102</CSOSN>
            </ICMSSN102>
          </ICMS>
          <PIS>
            <PISOutr>
              <CST>49</CST>
              <vBC>0.00</vBC>
              <pPIS>0.0000</pPIS>
              <vPIS>0.00</vPIS>
            </PISOutr>
          </PIS>
          <COFINS>
            <COFINSOutr>
              <CST>49</CST>
              <vBC>0.00</vBC>
              <pCOFINS>0.0000</pCOFINS>
              <vCOFINS>0.00</vCOFINS>
            </COFINSOutr>
          </COFINS>
        </imposto>
      </det>`;
  }).join("");
  const paymentsXml = data.payments.map((payment) => `
      <detPag><tPag>${paymentCode(payment.type)}</tPag><vPag>${Number(payment.amount).toFixed(2)}</vPag></detPag>`).join("");
  const consultationUrl = "https://www.sefaz.rr.gov.br/nfe/consulta";
  const emitterMunicipalityCode = digits$1(config.codigo_municipio || "1400100");
  const generatedXml = `<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="http://www.portalfiscal.inf.br/nfe">
  <infNFe Id="NFe${accessKey}" versao="4.00">
    <ide>
      <cUF>${ufCode}</cUF><cNF>${accessKey.slice(35, 43)}</cNF><natOp>VENDA DE MERCADORIA</natOp>
      <mod>55</mod><serie>${series}</serie><nNF>${number}</nNF><dhEmi>${issuedAtNfe}</dhEmi>
      <tpNF>1</tpNF><idDest>${interstate ? 2 : 1}</idDest><cMunFG>${emitterMunicipalityCode}</cMunFG>
      <tpImp>1</tpImp><tpEmis>1</tpEmis><cDV>${accessKey.slice(-1)}</cDV>
      <tpAmb>${config.ambiente === "producao" ? 1 : 2}</tpAmb><finNFe>1</finNFe><indFinal>1</indFinal>
      <indPres>1</indPres><procEmi>0</procEmi><verProc>PDV-1.0</verProc>
    </ide>
    <emit>
      <CNPJ>${digits$1(config.cnpj)}</CNPJ><xNome>${xml(config.razao_social)}</xNome><xFant>${xml(config.nome_fantasia)}</xFant>
      <enderEmit><xLgr>${xml(config.logradouro)}</xLgr><nro>${xml(config.numero)}</nro>${config.complemento ? `<xCpl>${xml(config.complemento)}</xCpl>` : ""}
        <xBairro>${xml(config.bairro)}</xBairro><cMun>${emitterMunicipalityCode}</cMun><xMun>${xml(config.municipio)}</xMun>
        <UF>${emitterUf}</UF><CEP>${digits$1(config.cep)}</CEP><cPais>1058</cPais><xPais>BRASIL</xPais></enderEmit>
      <IE>${digits$1(config.inscricao_estadual)}</IE><CRT>${text$1(config.crt)}</CRT>
    </emit>
    <dest>
      <${recipientDocument.length === 14 ? "CNPJ" : "CPF"}>${recipientDocument}</${recipientDocument.length === 14 ? "CNPJ" : "CPF"}>
      <xNome>${xml(recipientName)}</xNome><enderDest><xLgr>${xml(recipient.logradouro)}</xLgr><nro>${xml(recipient.numero)}</nro>
        ${recipient.complemento ? `<xCpl>${xml(recipient.complemento)}</xCpl>` : ""}<xBairro>${xml(recipient.bairro)}</xBairro>
        <cMun>${digits$1(recipient.codigo_municipio)}</cMun><xMun>${xml(recipient.municipio)}</xMun><UF>${recipientUf}</UF>
        <CEP>${digits$1(recipient.cep)}</CEP><cPais>1058</cPais><xPais>BRASIL</xPais>${digits$1(recipient.phone) ? `<fone>${digits$1(recipient.phone)}</fone>` : ""}</enderDest>
      <indIEDest>${digits$1(recipient.inscricao_estadual) ? 1 : 9}</indIEDest>${digits$1(recipient.inscricao_estadual) ? `<IE>${digits$1(recipient.inscricao_estadual)}</IE>` : ""}
      ${recipient.email ? `<email>${xml(recipient.email)}</email>` : ""}
    </dest>${itemsXml}
    <total><ICMSTot><vBC>0.00</vBC><vICMS>0.00</vICMS><vICMSDeson>0.00</vICMSDeson><vFCP>0.00</vFCP>
      <vBCST>0.00</vBCST><vST>0.00</vST><vFCPST>0.00</vFCPST><vFCPSTRet>0.00</vFCPSTRet>
      <vProd>${productsTotal.toFixed(2)}</vProd><vFrete>${freight.toFixed(2)}</vFrete><vSeg>0.00</vSeg><vDesc>0.00</vDesc>
      <vII>0.00</vII><vIPI>0.00</vIPI><vIPIDevol>0.00</vIPIDevol><vPIS>0.00</vPIS><vCOFINS>0.00</vCOFINS>
      <vOutro>0.00</vOutro><vNF>${total.toFixed(2)}</vNF><vTotTrib>0.00</vTotTrib></ICMSTot></total>
    <transp><modFrete>${data.freightMode || (freight > 0 ? "0" : "9")}</modFrete></transp>
    <pag>${paymentsXml}</pag>
    <infAdic><infCpl>NF-e EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL.</infCpl></infAdic>
  </infNFe>
</NFe>`;
  return { accessKey, xml: generatedXml, consultationUrl };
}

const NFE_NAMESPACE = "http://www.portalfiscal.inf.br/nfe";
const DSIG_NAMESPACE = "http://www.w3.org/2000/09/xmldsig#";
const CANONICALIZATION_ALGORITHM = "http://www.w3.org/TR/2001/REC-xml-c14n-20010315";
const ENVELOPED_SIGNATURE_ALGORITHM = "http://www.w3.org/2000/09/xmldsig#enveloped-signature";
const RSA_SHA1_ALGORITHM = "http://www.w3.org/2000/09/xmldsig#rsa-sha1";
const SHA1_ALGORITHM = "http://www.w3.org/2000/09/xmldsig#sha1";
function canonicalizeInfNFe(xml, accessKey) {
  const id = `NFe${accessKey}`;
  const startMarker = `<infNFe Id="${id}"`;
  const startPos = xml.indexOf(startMarker);
  if (startPos === -1) {
    throw new Error("Elemento infNFe n\xE3o encontrado no XML para assinatura.");
  }
  const endMarker = "</infNFe>";
  const endPos = xml.indexOf(endMarker, startPos);
  if (endPos === -1) {
    throw new Error("Fechamento do elemento infNFe n\xE3o encontrado.");
  }
  const elementXml = xml.substring(startPos, endPos + endMarker.length);
  return elementXml.replace(
    `<infNFe Id="${id}"`,
    `<infNFe xmlns="${NFE_NAMESPACE}" Id="${id}"`
  );
}
function buildCanonicalSignedInfo(accessKey, digestValue) {
  const id = `NFe${accessKey}`;
  return `<SignedInfo xmlns="${DSIG_NAMESPACE}"><CanonicalizationMethod Algorithm="${CANONICALIZATION_ALGORITHM}"></CanonicalizationMethod><SignatureMethod Algorithm="${RSA_SHA1_ALGORITHM}"></SignatureMethod><Reference URI="#${id}"><Transforms><Transform Algorithm="${ENVELOPED_SIGNATURE_ALGORITHM}"></Transform><Transform Algorithm="${CANONICALIZATION_ALGORITHM}"></Transform></Transforms><DigestMethod Algorithm="${SHA1_ALGORITHM}"></DigestMethod><DigestValue>${digestValue}</DigestValue></Reference></SignedInfo>`;
}
function signNfeXml(xml, accessKey, privateKeyPem, certificateBase64) {
  const canonicalizedInfNFe = canonicalizeInfNFe(xml, accessKey);
  const digestValue = crypto.createHash("sha1").update(canonicalizedInfNFe, "utf8").digest("base64");
  const canonicalSignedInfo = buildCanonicalSignedInfo(accessKey, digestValue);
  const signer = crypto.createSign("RSA-SHA1");
  signer.update(canonicalSignedInfo, "utf8");
  const signatureValue = signer.sign(privateKeyPem, "base64");
  const signatureBlock = `<Signature xmlns="${DSIG_NAMESPACE}">` + canonicalSignedInfo + `<SignatureValue>${signatureValue}</SignatureValue><KeyInfo><X509Data><X509Certificate>${certificateBase64}</X509Certificate></X509Data></KeyInfo></Signature>`;
  const insertPos = xml.indexOf("</infNFe>");
  if (insertPos === -1) {
    throw new Error("N\xE3o foi poss\xEDvel inserir a assinatura: infNFe n\xE3o encontrado.");
  }
  const signedXml = xml.substring(0, insertPos + "</infNFe>".length) + signatureBlock + xml.substring(insertPos + "</infNFe>".length);
  return { signedXml, digestValue, signatureValue };
}

const digits = (value) => String(value != null ? value : "").replace(/\D/g, "");
const text = (value) => String(value != null ? value : "").trim();
const emitir_post = defineEventHandler(async (event) => {
  try {
    await ensureNfeSchema();
    const body = await readBody(event);
    const customer = body.customer || {};
    const requestedItems = Array.isArray(body.items) ? body.items : [];
    const payments = Array.isArray(body.payments) ? body.payments : [];
    const freight = Math.max(Number(body.freight) || 0, 0);
    const document = digits(customer.cpf_cnpj);
    const requiredCustomerFields = ["name", "cep", "logradouro", "numero", "bairro", "municipio", "uf", "codigo_municipio"];
    const missingCustomerFields = requiredCustomerFields.filter((field) => !text(customer[field]));
    if (![11, 14].includes(document.length) || missingCustomerFields.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Preencha CPF/CNPJ e todos os campos obrigat\xF3rios do endere\xE7o do destinat\xE1rio."
      });
    }
    if (digits(customer.cep).length !== 8 || digits(customer.codigo_municipio).length !== 7) {
      throw createError({ statusCode: 400, statusMessage: "CEP ou c\xF3digo IBGE do munic\xEDpio inv\xE1lido." });
    }
    if (!/^[A-Za-z]{2}$/.test(text(customer.uf))) {
      throw createError({ statusCode: 400, statusMessage: "UF do destinat\xE1rio inv\xE1lida." });
    }
    if (requestedItems.length === 0) {
      throw createError({ statusCode: 400, statusMessage: "Adicione pelo menos um produto \xE0 NF-e." });
    }
    const productIds = [...new Set(requestedItems.map((item) => text(item.productId)).filter(Boolean))];
    const products = await sql`
      SELECT id, name, price, stock, fiscal
      FROM products
      WHERE id = ANY(${productIds}::text[])
    `;
    const productMap = new Map(products.map((product) => [String(product.id), product]));
    const items = requestedItems.map((requested) => {
      const product = productMap.get(text(requested.productId));
      const quantity = Number(requested.quantity);
      if (!product || !Number.isInteger(quantity) || quantity <= 0) {
        throw createError({ statusCode: 400, statusMessage: "Produto ou quantidade inv\xE1lida." });
      }
      if (product.stock !== null && Number(product.stock) < quantity) {
        throw createError({ statusCode: 400, statusMessage: `Estoque insuficiente para ${product.name}.` });
      }
      const fiscal = typeof product.fiscal === "string" ? JSON.parse(product.fiscal) : product.fiscal || {};
      if (digits(fiscal.ncm).length !== 8) {
        throw createError({
          statusCode: 400,
          statusMessage: `Complete o NCM do produto \u201C${product.name}\u201D no cadastro de produtos.`
        });
      }
      return {
        id: String(product.id),
        name: String(product.name),
        price: Number(product.price),
        quantity,
        fiscal
      };
    });
    const productsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = productsTotal + freight;
    const paymentsTotal = payments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
    if (payments.length === 0 || Math.abs(paymentsTotal - total) > 0.01) {
      throw createError({
        statusCode: 400,
        statusMessage: "A soma das formas de pagamento deve ser igual ao total da NF-e."
      });
    }
    const configRows = await sql`
      SELECT * FROM company_fiscal_config
      ORDER BY created_at DESC
      LIMIT 1
    `;
    if (configRows.length === 0) {
      throw createError({ statusCode: 400, statusMessage: "Configure os dados fiscais da empresa antes de emitir." });
    }
    const numberRows = await sql`
      UPDATE company_fiscal_config
      SET ultima_nfe = COALESCE(ultima_nfe, 0) + 1
      WHERE id = ${configRows[0].id}
      RETURNING ultima_nfe, serie_nfe
    `;
    const number = Number(numberRows[0].ultima_nfe);
    const series = Number(numberRows[0].serie_nfe || 1);
    const ambiente = configRows[0].ambiente === "producao" ? "producao" : "homologacao";
    const generated = generateNfeXml({
      customer: { ...customer, cpf_cnpj: document },
      items,
      payments,
      freight,
      freightMode: body.freightMode
    }, configRows[0], number, series);
    const certificate = await loadActiveCertificate();
    const unsignedXml = generated.xml.replace(/>\s+</g, "><").trim();
    const { signedXml } = signNfeXml(
      unsignedXml,
      generated.accessKey,
      certificate.privateKeyPem,
      certificate.certificateBase64
    );
    const authorization = await authorizeNfe(signedXml, generated.accessKey, ambiente, certificate);
    if (!authorization.success) {
      await sql`
        UPDATE company_fiscal_config
        SET ultima_nfe = GREATEST(COALESCE(ultima_nfe, 1) - 1, 0)
        WHERE id = ${configRows[0].id}
      `;
      throw createError({
        statusCode: 422,
        statusMessage: `SEFAZ rejeitou a NF-e: ${authorization.message}`
      });
    }
    const result = await sql.transaction(async (transaction) => {
      const customerId = text(customer.id) || `customer-nfe-${Date.now()}`;
      const address = `${text(customer.logradouro)}, ${text(customer.numero)} - ${text(customer.bairro)}, ${text(customer.municipio)}/${text(customer.uf).toUpperCase()}`;
      const existingCustomer = await transaction`SELECT id FROM customers WHERE id = ${customerId} LIMIT 1`;
      if (existingCustomer.length > 0) {
        await transaction`
          UPDATE customers SET
            name = ${text(customer.name)}, phone = ${text(customer.phone) || null},
            email = ${text(customer.email) || null}, address = ${address},
            cpf_cnpj = ${document}, inscricao_estadual = ${digits(customer.inscricao_estadual) || null},
            cep = ${digits(customer.cep)}, logradouro = ${text(customer.logradouro)}, numero = ${text(customer.numero)},
            complemento = ${text(customer.complemento) || null}, bairro = ${text(customer.bairro)},
            municipio = ${text(customer.municipio)}, uf = ${text(customer.uf).toUpperCase()},
            codigo_municipio = ${digits(customer.codigo_municipio)}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${customerId}
        `;
      } else {
        await transaction`
          INSERT INTO customers (
            id, name, phone, address, email, points, total_spent, cpf_cnpj, inscricao_estadual,
            cep, logradouro, numero, complemento, bairro, municipio, uf, codigo_municipio
          ) VALUES (
            ${customerId}, ${text(customer.name)}, ${text(customer.phone) || null}, ${address},
            ${text(customer.email) || null}, 0, 0, ${document}, ${digits(customer.inscricao_estadual) || null},
            ${digits(customer.cep)}, ${text(customer.logradouro)}, ${text(customer.numero)},
            ${text(customer.complemento) || null}, ${text(customer.bairro)}, ${text(customer.municipio)},
            ${text(customer.uf).toUpperCase()}, ${digits(customer.codigo_municipio)}
          )
        `;
      }
      const dailyRows = await transaction`
        SELECT COALESCE(MAX(daily_sale_number), 99) + 1 AS next_number
        FROM sales WHERE DATE(created_at) = CURRENT_DATE
      `;
      const saleRows = await transaction`
        INSERT INTO sales (total_amount, customer_id, freight, status, daily_sale_number, xml_chave, xml_numero, xml_status, xml_content)
        VALUES (${total}, ${customerId}, ${freight}, 'delivered', ${dailyRows[0].next_number},
          ${generated.accessKey}, ${number}, 'autorizada', ${signedXml})
        RETURNING id, daily_sale_number
      `;
      const sale = saleRows[0];
      for (const item of items) {
        await transaction`
          INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price, flavors)
          VALUES (${sale.id}, ${item.id}, ${item.name}, ${item.quantity}, ${item.price}, ${null})
        `;
        await transaction`
          UPDATE products SET stock = stock - ${item.quantity} WHERE id = ${item.id}
        `;
      }
      for (const payment of payments) {
        await transaction`
          INSERT INTO sale_payments (sale_id, payment_type, amount)
          VALUES (${sale.id}, ${text(payment.type)}, ${Number(payment.amount)})
        `;
      }
      await transaction`
        UPDATE customers SET total_spent = COALESCE(total_spent, 0) + ${total} WHERE id = ${customerId}
      `;
      const nfeRows = await transaction`
        INSERT INTO nfe (
          sale_id, customer_id, chave_acesso, numero, serie, status, ambiente, protocolo,
          data_autorizacao, valor_produtos, valor_frete, valor_total, destinatario, itens,
          pagamentos, xml_envio, xml_retorno, url_consulta, mensagem_status
        ) VALUES (
          ${String(sale.id)}, ${customerId}, ${generated.accessKey}, ${number}, ${series}, 'autorizada',
          ${ambiente}, ${authorization.protocol || null}, CURRENT_TIMESTAMP, ${productsTotal}, ${freight},
          ${total}, ${JSON.stringify(customer)}::jsonb, ${JSON.stringify(items)}::jsonb,
          ${JSON.stringify(payments)}::jsonb, ${signedXml}, ${authorization.authorizationXml || authorization.rawResponse || null},
          ${generated.consultationUrl}, ${authorization.message}
        ) RETURNING id
      `;
      return {
        nfeId: nfeRows[0].id,
        saleId: sale.id,
        dailySaleNumber: sale.daily_sale_number,
        customerId
      };
    });
    const motoboy = body.motoboy;
    let sangriaCreated = false;
    if (freight > 0 && motoboy && motoboy.id && motoboy.name) {
      const openRegister = await sql`
        SELECT id FROM cash_registers
        WHERE status = 'open'
        ORDER BY opened_at DESC
        LIMIT 1
      `;
      if (openRegister.length > 0) {
        await sql`
          INSERT INTO cash_transactions (id, cash_register_id, type, amount, description)
          VALUES (${"trans-nfe-" + Date.now()}, ${openRegister[0].id}, 'withdrawal', ${freight},
            ${"Taxa Entrega NF-e - " + text(motoboy.name)})
        `;
        sangriaCreated = true;
      }
    }
    return {
      success: true,
      message: ambiente === "producao" ? "NF-e autorizada em produ\xE7\xE3o e venda registrada com sucesso." : "NF-e autorizada em homologa\xE7\xE3o e venda registrada com sucesso.",
      nfe: {
        id: result.nfeId,
        number,
        series,
        accessKey: generated.accessKey,
        protocol: authorization.protocol,
        status: "autorizada",
        environment: ambiente,
        consultationUrl: generated.consultationUrl
      },
      sale: {
        id: result.saleId,
        dailySaleNumber: result.dailySaleNumber,
        total
      },
      customerId: result.customerId,
      sangriaCreated
    };
  } catch (error) {
    console.error("Erro ao emitir NF-e:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Erro ao emitir NF-e."
    });
  }
});

const emitir_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: emitir_post
});

const _id__get = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id || !/^\d+$/.test(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID da NF-e inv\xE1lido"
    });
  }
  try {
    const result = await sql`
      SELECT numero, xml_envio
      FROM nfe
      WHERE id = ${id}
        AND status = 'autorizada'
      LIMIT 1
    `;
    if (result.length === 0 || !result[0].xml_envio) {
      throw createError({
        statusCode: 404,
        statusMessage: "XML da NF-e n\xE3o encontrado"
      });
    }
    setResponseHeaders(event, {
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="nfe-${result[0].numero || id}.xml"`
    });
    return result[0].xml_envio;
  } catch (error) {
    console.error("Error downloading NFe XML:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Erro ao baixar XML de NF-e"
    });
  }
});

const _id__get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__get
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
        c.name AS customer_name,
        s.freight,
        s.status,
        s.daily_sale_number,
        s.xml_chave,
        s.xml_numero,
        s.xml_status,
        CASE
          WHEN EXISTS (
            SELECT 1 FROM nfe n
            WHERE n.sale_id::text = s.id::text AND n.status = 'autorizada'
          ) THEN 'NFe'
          WHEN EXISTS (
            SELECT 1 FROM nfce n
            WHERE n.sale_id::text = s.id::text AND n.status = 'autorizada'
          ) THEN 'NFCe'
          ELSE NULL
        END AS fiscal_model,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', si.id,
            'product_id', si.product_id,
            'name', si.product_name,
            'product_name', si.product_name,
            'price', si.price,
            'quantity', si.quantity,
            'flavors', si.flavors
          ))
           FROM sale_items si WHERE si.sale_id = s.id),
          '[]'::json
        ) as items,
        COALESCE(
          (SELECT json_agg(json_build_object('type', sp.payment_type, 'amount', sp.amount))
           FROM sale_payments sp WHERE sp.sale_id = s.id),
          '[]'::json
        ) as payments
      FROM sales s
      LEFT JOIN customers c ON c.id = s.customer_id
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
    const body = await readBody(event);
    const { items, total, payments, customerId, freight, type } = body;
    if (!items || !total) {
      throw createError({
        statusCode: 400,
        statusMessage: "Itens e total s\xE3o obrigat\xF3rios"
      });
    }
    const lastSaleNumberResult = await sql`
      SELECT MAX(daily_sale_number) as last_number
      FROM sales
      WHERE DATE(created_at) = CURRENT_DATE;
    `;
    const lastNumber = (_a = lastSaleNumberResult[0]) == null ? void 0 : _a.last_number;
    const nextDailyNumber = lastNumber ? lastNumber + 1 : 100;
    const saleResult = await sql`
      INSERT INTO sales (total_amount, customer_id, freight, status, daily_sale_number)
      VALUES (${total}, ${customerId}, ${freight}, ${type}, ${nextDailyNumber})
      RETURNING id, daily_sale_number;
    `;
    const saleId = saleResult[0].id;
    const dailySaleNumber = saleResult[0].daily_sale_number;
    if (items.length > 0) {
      for (const item of items) {
        await sql`
          INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price, flavors)
          VALUES (
            ${saleId},
            ${item.id},
            ${item.name},
            ${item.quantity},
            ${item.price},
            ${Array.isArray(item.flavors) ? item.flavors : null}
          );
        `;
      }
    }
    if (payments && payments.length > 0) {
      for (const p of payments) {
        await sql`
          INSERT INTO sale_payments (sale_id, payment_type, amount)
          VALUES (${saleId}, ${p.type}, ${p.amount});
        `;
      }
    }
    for (const item of items) {
      await sql`
        UPDATE products
        SET stock = stock - ${item.quantity}
        WHERE id = ${item.id};
      `;
    }
    if (customerId) {
      const pointsToAdd = Math.floor(parseFloat(String(total)) || 0);
      if (pointsToAdd > 0) {
        await sql`
          UPDATE customers
          SET points = COALESCE(points, 0) + ${pointsToAdd},
              total_spent = COALESCE(total_spent, 0) + ${parseFloat(String(total)) || 0}
          WHERE id = ${customerId};
        `;
      }
    }
    return { id: saleId, daily_sale_number: dailySaleNumber, message: "Venda registrada com sucesso" };
  } catch (error) {
    console.error("Error creating sale:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Error creating sale"
    });
  }
});

const sales_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: sales_post
});

const cancel_post = defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    const { password } = await readBody(event);
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID da venda \xE9 obrigat\xF3rio"
      });
    }
    if (!password) {
      throw createError({
        statusCode: 400,
        statusMessage: "Senha de cancelamento \xE9 obrigat\xF3ria"
      });
    }
    await sql`
      CREATE TABLE IF NOT EXISTS cancel_password (
        id TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
    const passwordResult = await sql`
      SELECT password FROM cancel_password
      ORDER BY created_at DESC
      LIMIT 1
    `;
    if (passwordResult.length === 0) {
      throw createError({
        statusCode: 403,
        statusMessage: "Senha de cancelamento n\xE3o configurada. Configure uma senha de cancelamento primeiro."
      });
    }
    if (password !== passwordResult[0].password) {
      throw createError({
        statusCode: 403,
        statusMessage: "Senha de cancelamento inv\xE1lida"
      });
    }
    const saleResult = await sql`
      SELECT id, status, xml_status, freight, total_amount, customer_id, created_at
      FROM sales
      WHERE id = ${id}
      LIMIT 1
    `;
    if (saleResult.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Venda n\xE3o encontrada"
      });
    }
    const sale = saleResult[0];
    const freight = parseFloat(sale.freight || 0);
    const totalAmount = parseFloat(sale.total_amount || 0);
    const customerId = sale.customer_id;
    if (freight > 0) {
      const openRegister = await sql`
        SELECT id FROM cash_registers
        WHERE status = 'open'
        ORDER BY opened_at DESC
        LIMIT 1
      `;
      if (openRegister.length > 0) {
        const cashRegisterId = openRegister[0].id;
        const freightTransactions = await sql`
          SELECT id FROM cash_transactions
          WHERE cash_register_id = ${cashRegisterId}
            AND type = 'withdrawal'
            AND amount = ${freight}
            AND description LIKE 'Taxa Entrega%'
          ORDER BY created_at DESC
          LIMIT 1
        `;
        if (freightTransactions.length > 0) {
          await sql`
            DELETE FROM cash_transactions
            WHERE id = ${freightTransactions[0].id}
          `;
        }
      }
    }
    if (customerId) {
      const pointsToRemove = Math.floor(totalAmount);
      if (pointsToRemove > 0) {
        await sql`
          UPDATE customers
          SET points = GREATEST(COALESCE(points, 0) - ${pointsToRemove}, 0),
              total_spent = GREATEST(COALESCE(total_spent, 0) - ${totalAmount}, 0)
          WHERE id = ${customerId}
        `;
      }
    }
    await sql`
      UPDATE sales
      SET status = 'cancelled',
          xml_status = 'cancelled'
      WHERE id = ${id}
    `;
    return {
      success: true,
      message: "Venda cancelada com sucesso"
    };
  } catch (error) {
    console.error("Error cancelling sale:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: "Error cancelling sale"
    });
  }
});

const cancel_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: cancel_post
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
    const target = getDatabaseTarget();
    const result = await sql`
      SELECT
        current_database() AS database,
        current_user AS user,
        version() AS version
    `;
    return {
      success: true,
      message: "Conex\xE3o com PostgreSQL funcionando!",
      connection: {
        mode: target.isLocal ? "local" : "remote",
        host: target.host,
        port: target.port,
        database: target.database
      },
      server: result[0]
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Erro ao conectar com PostgreSQL"
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
