import process from 'node:process';globalThis._importMeta_={url:import.meta.url,env:process.env};import { tmpdir } from 'node:os';
import { Server } from 'node:http';
import { resolve, dirname, join } from 'node:path';
import nodeCrypto from 'node:crypto';
import { parentPort, threadId } from 'node:worker_threads';
import { defineEventHandler, handleCacheHeaders, splitCookiesString, createEvent, fetchWithEvent, isEvent, eventHandler, setHeaders, createError, sendRedirect, proxyRequest, getRequestURL, getRequestHeader, getResponseHeader, getRequestHeaders, setResponseHeaders, setResponseStatus, send, removeResponseHeader, appendResponseHeader, setResponseHeader, createApp, createRouter as createRouter$1, toNodeListener, lazyEventHandler, getRouterParam, readBody, getQuery as getQuery$1 } from 'file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/h3@1.15.11/node_modules/h3/dist/index.mjs';
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
import { readFile } from 'node:fs/promises';
import consola from 'file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/consola@3.4.2/node_modules/consola/dist/index.mjs';
import { ErrorParser } from 'file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/youch-core@0.3.3/node_modules/youch-core/build/index.js';
import { Youch } from 'file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/youch@4.1.1/node_modules/youch/build/index.js';
import { SourceMapConsumer } from 'file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/source-map@0.7.6/node_modules/source-map/source-map.js';
import { promises, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname as dirname$1, resolve as resolve$1 } from 'file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/pathe@2.0.3/node_modules/pathe/dist/index.mjs';

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
    "etag": "\"155ab-uyLkaE9Gd+2EOoYAv7cjqZ29M94\"",
    "mtime": "2026-07-06T14:21:24.444Z",
    "size": 87467,
    "path": "index.mjs"
  },
  "/index.mjs.map": {
    "type": "application/json",
    "etag": "\"4784d-Z/wvajT97X/MGYhU/H4BBL/g2jM\"",
    "mtime": "2026-07-06T14:21:24.445Z",
    "size": 292941,
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

const _lazy_0oqOZ3 = () => Promise.resolve().then(function () { return ____all_$1; });
const _lazy_zyPM9J = () => Promise.resolve().then(function () { return cashRegister_get$1; });
const _lazy_s4P548 = () => Promise.resolve().then(function () { return close_post$1; });
const _lazy_rID8to = () => Promise.resolve().then(function () { return open_post$1; });
const _lazy_4uV9wR = () => Promise.resolve().then(function () { return cashTransactions_get$1; });
const _lazy_cQiAIV = () => Promise.resolve().then(function () { return cashTransactions_post$1; });
const _lazy__iU8wW = () => Promise.resolve().then(function () { return categories_get$1; });
const _lazy_o1wo52 = () => Promise.resolve().then(function () { return categories_post$3; });
const _lazy_b2VTWC = () => Promise.resolve().then(function () { return _id__delete$5; });
const _lazy_eDpqQf = () => Promise.resolve().then(function () { return _id__put$5; });
const _lazy_thsE84 = () => Promise.resolve().then(function () { return customers_get$1; });
const _lazy_krY3pv = () => Promise.resolve().then(function () { return customers_post$1; });
const _lazy_H45_Wb = () => Promise.resolve().then(function () { return _id__delete$3; });
const _lazy_h4GIBs = () => Promise.resolve().then(function () { return _id__put$3; });
const _lazy_YtRTDx = () => Promise.resolve().then(function () { return sales_get$3; });
const _lazy_zELk_7 = () => Promise.resolve().then(function () { return categories_post$1; });
const _lazy_GwWEhE = () => Promise.resolve().then(function () { return products_post$3; });
const _lazy_lNzaoz = () => Promise.resolve().then(function () { return sales_post$3; });
const _lazy_9dG2yK = () => Promise.resolve().then(function () { return products_get$1; });
const _lazy_C0_k4l = () => Promise.resolve().then(function () { return products_post$1; });
const _lazy_q5qboF = () => Promise.resolve().then(function () { return _id__delete$1; });
const _lazy_gmpj8W = () => Promise.resolve().then(function () { return _id__put$1; });
const _lazy_nl6xh4 = () => Promise.resolve().then(function () { return sales_get$1; });
const _lazy__VRAiA = () => Promise.resolve().then(function () { return sales_post$1; });
const _lazy_aXzNxt = () => Promise.resolve().then(function () { return status_put$1; });
const _lazy_C90ob_ = () => Promise.resolve().then(function () { return testDb_get$1; });

const handlers = [
  { route: '', handler: _ngUQxC, lazy: false, middleware: true, method: undefined },
  { route: '/**:all', handler: _lazy_0oqOZ3, lazy: true, middleware: false, method: undefined },
  { route: '/api/cash-register', handler: _lazy_zyPM9J, lazy: true, middleware: false, method: "get" },
  { route: '/api/cash-register/close', handler: _lazy_s4P548, lazy: true, middleware: false, method: "post" },
  { route: '/api/cash-register/open', handler: _lazy_rID8to, lazy: true, middleware: false, method: "post" },
  { route: '/api/cash-transactions', handler: _lazy_4uV9wR, lazy: true, middleware: false, method: "get" },
  { route: '/api/cash-transactions', handler: _lazy_cQiAIV, lazy: true, middleware: false, method: "post" },
  { route: '/api/categories', handler: _lazy__iU8wW, lazy: true, middleware: false, method: "get" },
  { route: '/api/categories', handler: _lazy_o1wo52, lazy: true, middleware: false, method: "post" },
  { route: '/api/categories/:id', handler: _lazy_b2VTWC, lazy: true, middleware: false, method: "delete" },
  { route: '/api/categories/:id', handler: _lazy_eDpqQf, lazy: true, middleware: false, method: "put" },
  { route: '/api/customers', handler: _lazy_thsE84, lazy: true, middleware: false, method: "get" },
  { route: '/api/customers', handler: _lazy_krY3pv, lazy: true, middleware: false, method: "post" },
  { route: '/api/customers/:id', handler: _lazy_H45_Wb, lazy: true, middleware: false, method: "delete" },
  { route: '/api/customers/:id', handler: _lazy_h4GIBs, lazy: true, middleware: false, method: "put" },
  { route: '/api/customers/:id/sales', handler: _lazy_YtRTDx, lazy: true, middleware: false, method: "get" },
  { route: '/api/migrate/categories', handler: _lazy_zELk_7, lazy: true, middleware: false, method: "post" },
  { route: '/api/migrate/products', handler: _lazy_GwWEhE, lazy: true, middleware: false, method: "post" },
  { route: '/api/migrate/sales', handler: _lazy_lNzaoz, lazy: true, middleware: false, method: "post" },
  { route: '/api/products', handler: _lazy_9dG2yK, lazy: true, middleware: false, method: "get" },
  { route: '/api/products', handler: _lazy_C0_k4l, lazy: true, middleware: false, method: "post" },
  { route: '/api/products/:id', handler: _lazy_q5qboF, lazy: true, middleware: false, method: "delete" },
  { route: '/api/products/:id', handler: _lazy_gmpj8W, lazy: true, middleware: false, method: "put" },
  { route: '/api/sales', handler: _lazy_nl6xh4, lazy: true, middleware: false, method: "get" },
  { route: '/api/sales', handler: _lazy__VRAiA, lazy: true, middleware: false, method: "post" },
  { route: '/api/sales/:id/status', handler: _lazy_aXzNxt, lazy: true, middleware: false, method: "put" },
  { route: '/api/test-db', handler: _lazy_C90ob_, lazy: true, middleware: false, method: "get" }
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

const ____all_ = defineEventHandler((event) => {
  var _a;
  if ((_a = event.node.req.url) == null ? void 0 : _a.startsWith("/api")) {
    return;
  }
  const indexPath = join(process.cwd(), "index.html");
  try {
    const html = readFileSync(indexPath, "utf-8");
    return html;
  } catch (error) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found"
    });
  }
});

const ____all_$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: ____all_
});

const cashRegister_get = defineEventHandler(async () => {
  try {
    const { neon } = await import('file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/@neondatabase+serverless@1.1.0/node_modules/@neondatabase/serverless/index.mjs');
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(dbUrl);
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
            if (salesByPayment[payment.type] !== void 0) {
              salesByPayment[payment.type] += amount;
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
    const { neon } = await import('file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/@neondatabase+serverless@1.1.0/node_modules/@neondatabase/serverless/index.mjs');
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(dbUrl);
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
          if (payment.type === "cash") {
            cashSales += amount;
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
    transactionsResult.forEach((trans) => {
      const total = parseFloat(trans.total);
      if (trans.type === "withdrawal") {
        withdrawals += total;
      } else if (trans.type === "addition") {
        additions += total;
      }
    });
    const openingAmount = parseFloat(register.opening_amount);
    const expectedCashAmount = openingAmount + cashSales + additions - withdrawals;
    const expectedTotalAmount = openingAmount + salesTotal + additions - withdrawals;
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
      expectedCashAmount,
      expectedTotalAmount,
      withdrawals,
      additions,
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
    const { neon } = await import('file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/@neondatabase+serverless@1.1.0/node_modules/@neondatabase/serverless/index.mjs');
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(dbUrl);
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
    const { neon } = await import('file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/@neondatabase+serverless@1.1.0/node_modules/@neondatabase/serverless/index.mjs');
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(dbUrl);
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
    const { neon } = await import('file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/@neondatabase+serverless@1.1.0/node_modules/@neondatabase/serverless/index.mjs');
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(dbUrl);
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

const categories_get = defineEventHandler(async () => {
  try {
    const { neon } = await import('file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/@neondatabase+serverless@1.1.0/node_modules/@neondatabase/serverless/index.mjs');
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(dbUrl);
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
    const { neon } = await import('file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/@neondatabase+serverless@1.1.0/node_modules/@neondatabase/serverless/index.mjs');
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(dbUrl);
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

const _id__delete$4 = defineEventHandler(async (event) => {
  try {
    const { neon } = await import('file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/@neondatabase+serverless@1.1.0/node_modules/@neondatabase/serverless/index.mjs');
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(dbUrl);
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

const _id__delete$5 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__delete$4
});

const _id__put$4 = defineEventHandler(async (event) => {
  var _a;
  try {
    const { neon } = await import('file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/@neondatabase+serverless@1.1.0/node_modules/@neondatabase/serverless/index.mjs');
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(dbUrl);
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

const _id__put$5 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__put$4
});

const customers_get = defineEventHandler(async () => {
  try {
    const { neon } = await import('file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/@neondatabase+serverless@1.1.0/node_modules/@neondatabase/serverless/index.mjs');
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(dbUrl);
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
    const { neon } = await import('file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/@neondatabase+serverless@1.1.0/node_modules/@neondatabase/serverless/index.mjs');
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(dbUrl);
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

const _id__delete$2 = defineEventHandler(async (event) => {
  try {
    const { neon } = await import('file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/@neondatabase+serverless@1.1.0/node_modules/@neondatabase/serverless/index.mjs');
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(dbUrl);
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

const _id__delete$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__delete$2
});

const _id__put$2 = defineEventHandler(async (event) => {
  try {
    const { neon } = await import('file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/@neondatabase+serverless@1.1.0/node_modules/@neondatabase/serverless/index.mjs');
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(dbUrl);
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

const _id__put$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__put$2
});

const sales_get$2 = defineEventHandler(async (event) => {
  try {
    const { neon } = await import('file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/@neondatabase+serverless@1.1.0/node_modules/@neondatabase/serverless/index.mjs');
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(dbUrl);
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

const categories_post = defineEventHandler(async (event) => {
  var _a;
  try {
    const { neon } = await import('file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/@neondatabase+serverless@1.1.0/node_modules/@neondatabase/serverless/index.mjs');
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(dbUrl);
    const categories = await readBody(event);
    if (!Array.isArray(categories)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid data format"
      });
    }
    let migrated = 0;
    for (const cat of categories) {
      await sql`
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
    const { neon } = await import('file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/@neondatabase+serverless@1.1.0/node_modules/@neondatabase/serverless/index.mjs');
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(dbUrl);
    const products = await readBody(event);
    if (!Array.isArray(products)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid data format"
      });
    }
    let migrated = 0;
    for (const prod of products) {
      await sql`
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
    const { neon } = await import('file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/@neondatabase+serverless@1.1.0/node_modules/@neondatabase/serverless/index.mjs');
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(dbUrl);
    const sales = await readBody(event);
    if (!Array.isArray(sales)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid data format"
      });
    }
    let migrated = 0;
    for (const sale of sales) {
      const saleResult = await sql`
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
          await sql`
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

const products_get = defineEventHandler(async () => {
  try {
    const { neon } = await import('file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/@neondatabase+serverless@1.1.0/node_modules/@neondatabase/serverless/index.mjs');
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(dbUrl);
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
    const { neon } = await import('file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/@neondatabase+serverless@1.1.0/node_modules/@neondatabase/serverless/index.mjs');
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(dbUrl);
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
    const { neon } = await import('file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/@neondatabase+serverless@1.1.0/node_modules/@neondatabase/serverless/index.mjs');
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(dbUrl);
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
    const { neon } = await import('file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/@neondatabase+serverless@1.1.0/node_modules/@neondatabase/serverless/index.mjs');
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(dbUrl);
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
    const { neon } = await import('file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/@neondatabase+serverless@1.1.0/node_modules/@neondatabase/serverless/index.mjs');
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(dbUrl);
    const sales = await sql`
      SELECT 
        s.*,
        c.name as customer_name,
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
      LEFT JOIN customers c ON s.customer_id = c.id
      GROUP BY s.id, c.name
      ORDER BY s.created_at DESC
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
    const { neon } = await import('file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/@neondatabase+serverless@1.1.0/node_modules/@neondatabase/serverless/index.mjs');
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(dbUrl);
    const saleData = await readBody(event);
    const total = parseFloat(String(saleData.total || 0));
    const freight = parseFloat(String(saleData.freight || 0));
    const payments = saleData.payments || [];
    const createdAt = saleData.date || (/* @__PURE__ */ new Date()).toISOString();
    const customerId = saleData.customerId || null;
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
      INSERT INTO sales (total_amount, payment_method, freight, created_at, customer_id, payments)
      VALUES (
        ${total}, 
        ${paymentMethodSummary}, 
        ${freight}, 
        ${createdAt},
        ${customerId},
        ${JSON.stringify(payments)}::jsonb
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
    const { neon } = await import('file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/@neondatabase+serverless@1.1.0/node_modules/@neondatabase/serverless/index.mjs');
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(dbUrl);
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

const testDb_get = defineEventHandler(async () => {
  try {
    const { neon } = await import('file://C:/Users/1793579/dyad-apps/emp-rio-das-coxinhas/node_modules/.pnpm/@neondatabase+serverless@1.1.0/node_modules/@neondatabase/serverless/index.mjs');
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return {
        success: false,
        error: "DATABASE_URL n\xE3o est\xE1 definida",
        env: Object.keys(process.env).filter((k) => k.includes("DATABASE") || k.includes("NEON"))
      };
    }
    const sql = neon(dbUrl);
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
//# sourceMappingURL=index.mjs.map
