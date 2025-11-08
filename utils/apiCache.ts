/**
 * API 响应缓存工具
 * 用于优化 API 响应时间，减少重复请求
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

class ApiCache {
  private cache = new Map<string, CacheItem<any>>();
  private pendingRequests = new Map<string, PendingRequest<any>>();
  
  // 默认缓存时间：5分钟
  private defaultTTL = 5 * 60 * 1000;
  
  // 请求去重时间窗口：2秒内相同请求会被合并
  private dedupeWindow = 2000;

  /**
   * 生成缓存键
   */
  private getCacheKey(url: string, params?: any): string {
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${url}${paramsStr}`;
  }

  /**
   * 检查缓存是否有效
   */
  private isValid(item: CacheItem<any>): boolean {
    return Date.now() < item.expiresAt;
  }

  /**
   * 获取缓存数据
   */
  get<T>(url: string, params?: any): T | null {
    const key = this.getCacheKey(url, params);
    const item = this.cache.get(key);
    
    if (item && this.isValid(item)) {
      return item.data as T;
    }
    
    // 缓存过期，删除
    if (item) {
      this.cache.delete(key);
    }
    
    return null;
  }

  /**
   * 设置缓存数据
   */
  set<T>(url: string, data: T, params?: any, ttl?: number): void {
    const key = this.getCacheKey(url, params);
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
    });
  }

  /**
   * 带缓存的请求函数
   * 支持请求去重和缓存
   */
  async request<T>(
    requestFn: () => Promise<T>,
    url: string,
    params?: any,
    options?: {
      ttl?: number; // 缓存时间（毫秒）
      useCache?: boolean; // 是否使用缓存，默认 true
      useDedupe?: boolean; // 是否使用请求去重，默认 true
    }
  ): Promise<T> {
    const { ttl, useCache = true, useDedupe = true } = options || {};
    const key = this.getCacheKey(url, params);

    // 1. 检查缓存
    if (useCache) {
      const cached = this.get<T>(url, params);
      if (cached !== null) {
        return cached;
      }
    }

    // 2. 检查是否有正在进行的相同请求（请求去重）
    if (useDedupe) {
      const pending = this.pendingRequests.get(key);
      if (pending) {
        const age = Date.now() - pending.timestamp;
        // 如果请求在去重时间窗口内，返回相同的 Promise
        if (age < this.dedupeWindow) {
          return pending.promise;
        } else {
          // 请求时间过长，可能是卡住了，移除
          this.pendingRequests.delete(key);
        }
      }
    }

    // 3. 发起新请求
    const promise = requestFn()
      .then((data) => {
        // 请求成功，缓存数据
        if (useCache) {
          this.set(url, data, params, ttl);
        }
        // 移除待处理请求
        this.pendingRequests.delete(key);
        return data;
      })
      .catch((error) => {
        // 请求失败，移除待处理请求
        this.pendingRequests.delete(key);
        throw error;
      });

    // 记录待处理请求
    if (useDedupe) {
      this.pendingRequests.set(key, {
        promise,
        timestamp: Date.now(),
      });
    }

    return promise;
  }

  /**
   * 清除指定缓存
   */
  clear(url?: string, params?: any): void {
    if (url) {
      const key = this.getCacheKey(url, params);
      this.cache.delete(key);
      this.pendingRequests.delete(key);
    } else {
      // 清除所有缓存
      this.cache.clear();
      this.pendingRequests.clear();
    }
  }

  /**
   * 清除过期缓存
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now >= item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
    };
  }
}

// 导出单例
export const apiCache = new ApiCache();

// 定期清理过期缓存（每5分钟）
if (typeof window !== 'undefined') {
  setInterval(() => {
    apiCache.clearExpired();
  }, 5 * 60 * 1000);
}

