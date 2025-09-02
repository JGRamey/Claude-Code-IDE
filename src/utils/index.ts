// Central export for all utility functions in the Claude Code IDE

export * from './fileHelpers';
export * from './dockerHelpers';
export * from './agentHelpers';
export * from './constants';

// Additional utility functions

/**
 * Generates a unique UUID
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Delays execution for a specified amount of time
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Creates a cancelable promise
 */
export function makeCancelable<T>(promise: Promise<T>): {
  promise: Promise<T>;
  cancel: () => void;
} {
  let cancelled = false;
  
  const cancelablePromise = new Promise<T>((resolve, reject) => {
    promise
      .then(value => {
        if (!cancelled) resolve(value);
      })
      .catch(error => {
        if (!cancelled) reject(error);
      });
  });
  
  return {
    promise: cancelablePromise,
    cancel: () => { cancelled = true; },
  };
}

/**
 * Retries a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000,
  maxDelay: number = 10000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      // Exponential backoff with jitter
      const delayMs = Math.min(
        baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000,
        maxDelay
      );
      
      await delay(delayMs);
    }
  }
  
  throw lastError!;
}

/**
 * Deep clones an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;
  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    Object.keys(obj).forEach(key => {
      (clonedObj as any)[key] = deepClone((obj as any)[key]);
    });
    return clonedObj;
  }
  return obj;
}

/**
 * Merges objects deeply
 */
export function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target;
  const source = sources.shift();
  
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  
  return deepMerge(target, ...sources);
}

/**
 * Checks if a value is a plain object
 */
export function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Converts a string to camelCase
 */
export function camelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
}

/**
 * Converts a string to kebab-case
 */
export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Converts a string to PascalCase
 */
export function pascalCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase())
    .replace(/\s+/g, '');
}

/**
 * Converts a string to snake_case
 */
export function snakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * Truncates text to a specified length
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Escapes HTML entities
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Unescapes HTML entities
 */
export function unescapeHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

/**
 * Validates an email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Formats a number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Formats a percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Creates a hash from a string
 */
export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

/**
 * Checks if the current environment is development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Checks if the current environment is production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Gets the current environment
 */
export function getEnvironment(): 'development' | 'production' | 'test' {
  return (process.env.NODE_ENV as any) || 'development';
}

/**
 * Safely parses JSON with error handling
 */
export function safeJsonParse<T = any>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return defaultValue;
  }
}

/**
 * Safely stringifies JSON with error handling
 */
export function safeJsonStringify(obj: any, defaultValue: string = '{}'): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return defaultValue;
  }
}

/**
 * Creates a logger with different levels
 */
export function createLogger(name: string) {
  const log = (level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: any[]) => {
    if (isDevelopment() || level !== 'debug') {
      const timestamp = new Date().toISOString();
      console[level](`[${timestamp}] [${name}] ${message}`, ...args);
    }
  };
  
  return {
    debug: (message: string, ...args: any[]) => log('debug', message, ...args),
    info: (message: string, ...args: any[]) => log('info', message, ...args),
    warn: (message: string, ...args: any[]) => log('warn', message, ...args),
    error: (message: string, ...args: any[]) => log('error', message, ...args),
  };
}

/**
 * Creates a simple event emitter
 */
export function createEventEmitter<T extends Record<string, any>>() {
  const listeners: Partial<Record<keyof T, Array<(data: T[keyof T]) => void>>> = {};
  
  return {
    on<K extends keyof T>(event: K, callback: (data: T[K]) => void) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event]!.push(callback);
      
      return () => {
        const callbacks = listeners[event];
        if (callbacks) {
          const index = callbacks.indexOf(callback);
          if (index > -1) callbacks.splice(index, 1);
        }
      };
    },
    
    emit<K extends keyof T>(event: K, data: T[K]) {
      const callbacks = listeners[event];
      if (callbacks) {
        callbacks.forEach(callback => callback(data));
      }
    },
    
    off<K extends keyof T>(event: K, callback?: (data: T[K]) => void) {
      if (!callback) {
        delete listeners[event];
      } else {
        const callbacks = listeners[event];
        if (callbacks) {
          const index = callbacks.indexOf(callback);
          if (index > -1) callbacks.splice(index, 1);
        }
      }
    },
    
    removeAllListeners() {
      Object.keys(listeners).forEach(event => {
        delete listeners[event as keyof T];
      });
    },
  };
}

/**
 * Creates a simple cache with TTL support
 */
export function createCache<T>(defaultTTL: number = 300000) {
  const cache = new Map<string, { value: T; expires: number }>();
  
  return {
    get(key: string): T | undefined {
      const item = cache.get(key);
      if (!item) return undefined;
      
      if (Date.now() > item.expires) {
        cache.delete(key);
        return undefined;
      }
      
      return item.value;
    },
    
    set(key: string, value: T, ttl: number = defaultTTL): void {
      cache.set(key, {
        value,
        expires: Date.now() + ttl,
      });
    },
    
    delete(key: string): boolean {
      return cache.delete(key);
    },
    
    clear(): void {
      cache.clear();
    },
    
    has(key: string): boolean {
      const item = cache.get(key);
      if (!item) return false;
      
      if (Date.now() > item.expires) {
        cache.delete(key);
        return false;
      }
      
      return true;
    },
    
    size(): number {
      // Clean expired items first
      const now = Date.now();
      for (const [key, item] of cache.entries()) {
        if (now > item.expires) {
          cache.delete(key);
        }
      }
      
      return cache.size;
    },
  };
}

/**
 * Creates a rate limiter
 */
export function createRateLimiter(maxRequests: number, windowMs: number) {
  const requests: number[] = [];
  
  return {
    isAllowed(): boolean {
      const now = Date.now();
      
      // Remove old requests outside the window
      while (requests.length > 0 && requests[0] <= now - windowMs) {
        requests.shift();
      }
      
      // Check if under limit
      if (requests.length < maxRequests) {
        requests.push(now);
        return true;
      }
      
      return false;
    },
    
    getRemainingRequests(): number {
      const now = Date.now();
      
      // Clean old requests
      while (requests.length > 0 && requests[0] <= now - windowMs) {
        requests.shift();
      }
      
      return Math.max(0, maxRequests - requests.length);
    },
    
    getResetTime(): number {
      if (requests.length === 0) return 0;
      return requests[0] + windowMs;
    },
  };
}

/**
 * Validates environment variables
 */
export function validateEnvironment(required: string[]): { valid: boolean; missing: string[] } {
  const missing = required.filter(key => !process.env[key]);
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Creates a configuration object from environment variables
 */
export function createConfigFromEnv(prefix: string = ''): Record<string, string> {
  const config: Record<string, string> = {};
  
  Object.entries(process.env).forEach(([key, value]) => {
    if (key.startsWith(prefix) && value !== undefined) {
      const configKey = key.slice(prefix.length).toLowerCase();
      config[configKey] = value;
    }
  });
  
  return config;
}

/**
 * Formats a duration in milliseconds to human readable format
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

/**
 * Parses a duration string to milliseconds
 */
export function parseDuration(duration: string): number {
  const regex = /(\d+)([smhd])/g;
  let totalMs = 0;
  let match;
  
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  
  while ((match = regex.exec(duration)) !== null) {
    const value = parseInt(match[1]);
    const unit = match[2] as keyof typeof multipliers;
    totalMs += value * multipliers[unit];
  }
  
  return totalMs;
}

/**
 * Creates a simple queue with concurrency control
 */
export function createQueue<T>(concurrency: number = 1) {
  const queue: Array<() => Promise<T>> = [];
  let running = 0;
  
  const process = async (): Promise<void> => {
    if (running >= concurrency || queue.length === 0) return;
    
    running++;
    const task = queue.shift()!;
    
    try {
      await task();
    } catch (error) {
      console.error('Queue task failed:', error);
    } finally {
      running--;
      process(); // Process next task
    }
  };
  
  return {
    add(task: () => Promise<T>): Promise<T> {
      return new Promise((resolve, reject) => {
        queue.push(async () => {
          try {
            const result = await task();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
        
        process();
      });
    },
    
    size(): number {
      return queue.length;
    },
    
    running(): number {
      return running;
    },
    
    clear(): void {
      queue.length = 0;
    },
  };
}

/**
 * Creates a simple pub/sub system
 */
export function createPubSub<T extends Record<string, any>>() {
  const subscribers: Partial<Record<keyof T, Set<(data: T[keyof T]) => void>>> = {};
  
  return {
    subscribe<K extends keyof T>(event: K, callback: (data: T[K]) => void): () => void {
      if (!subscribers[event]) {
        subscribers[event] = new Set();
      }
      
      subscribers[event]!.add(callback);
      
      return () => {
        subscribers[event]?.delete(callback);
      };
    },
    
    publish<K extends keyof T>(event: K, data: T[K]): void {
      const callbacks = subscribers[event];
      if (callbacks) {
        callbacks.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error(`Error in subscriber for event ${String(event)}:`, error);
          }
        });
      }
    },
    
    unsubscribe<K extends keyof T>(event: K, callback?: (data: T[K]) => void): void {
      if (!callback) {
        delete subscribers[event];
      } else {
        subscribers[event]?.delete(callback);
      }
    },
    
    clear(): void {
      Object.keys(subscribers).forEach(event => {
        delete subscribers[event as keyof T];
      });
    },
    
    getSubscriberCount<K extends keyof T>(event: K): number {
      return subscribers[event]?.size || 0;
    },
  };
}

/**
 * Creates a simple state machine
 */
export function createStateMachine<S extends string, E extends string>(
  initialState: S,
  transitions: Record<S, Partial<Record<E, S>>>
) {
  let currentState = initialState;
  const listeners: Array<(oldState: S, newState: S, event: E) => void> = [];
  
  return {
    getState(): S {
      return currentState;
    },
    
    transition(event: E): boolean {
      const nextState = transitions[currentState]?.[event];
      
      if (nextState && nextState !== currentState) {
        const oldState = currentState;
        currentState = nextState;
        
        listeners.forEach(listener => {
          try {
            listener(oldState, currentState, event);
          } catch (error) {
            console.error('State machine listener error:', error);
          }
        });
        
        return true;
      }
      
      return false;
    },
    
    canTransition(event: E): boolean {
      return !!transitions[currentState]?.[event];
    },
    
    onTransition(callback: (oldState: S, newState: S, event: E) => void): () => void {
      listeners.push(callback);
      
      return () => {
        const index = listeners.indexOf(callback);
        if (index > -1) listeners.splice(index, 1);
      };
    },
    
    getAvailableTransitions(): E[] {
      return Object.keys(transitions[currentState] || {}) as E[];
    },
  };
}

/**
 * Formats bytes to human readable format
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Creates a performance monitor
 */
export function createPerformanceMonitor() {
  const marks: Record<string, number> = {};
  const measures: Record<string, number[]> = {};
  
  return {
    mark(name: string): void {
      marks[name] = performance.now();
    },
    
    measure(name: string, startMark: string, endMark?: string): number {
      const start = marks[startMark];
      const end = endMark ? marks[endMark] : performance.now();
      
      if (start === undefined) {
        throw new Error(`Start mark "${startMark}" not found`);
      }
      
      const duration = end - start;
      
      if (!measures[name]) measures[name] = [];
      measures[name].push(duration);
      
      return duration;
    },
    
    getAverage(name: string): number {
      const durations = measures[name];
      if (!durations || durations.length === 0) return 0;
      
      return durations.reduce((sum, d) => sum + d, 0) / durations.length;
    },
    
    getStats(name: string): { count: number; min: number; max: number; avg: number } {
      const durations = measures[name] || [];
      
      if (durations.length === 0) {
        return { count: 0, min: 0, max: 0, avg: 0 };
      }
      
      return {
        count: durations.length,
        min: Math.min(...durations),
        max: Math.max(...durations),
        avg: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      };
    },
    
    clear(name?: string): void {
      if (name) {
        delete marks[name];
        delete measures[name];
      } else {
        Object.keys(marks).forEach(key => delete marks[key]);
        Object.keys(measures).forEach(key => delete measures[key]);
      }
    },
  };
}