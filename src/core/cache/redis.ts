import Redis from 'ioredis';

// Create Redis client
const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Default TTL in seconds
const DEFAULT_TTL = 3600; // 1 hour

/**
 * Set a value in Redis cache
 */
export const setCache = async (key: string, value: any, ttl = DEFAULT_TTL): Promise<void> => {
  try {
    const stringValue = JSON.stringify(value);
    if (ttl > 0) {
      await redisClient.set(key, stringValue, 'EX', ttl);
    } else {
      await redisClient.set(key, stringValue);
    }
  } catch (error) {
    console.error('Redis cache set error:', error);
  }
};

/**
 * Get a value from Redis cache
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const value = await redisClient.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('Redis cache get error:', error);
    return null;
  }
};

/**
 * Delete a key from Redis cache
 */
export const deleteCache = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('Redis cache delete error:', error);
  }
};

/**
 * Delete multiple keys matching a pattern
 */
export const deleteCacheByPattern = async (pattern: string): Promise<void> => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  } catch (error) {
    console.error('Redis cache deleteByPattern error:', error);
  }
};

/**
 * Cache middleware for Express routes
 */
export const cacheMiddleware = (keyPrefix: string, ttl = DEFAULT_TTL) => {
  return async (req: any, res: any, next: any) => {
    try {
      // Skip cache if method is not GET
      if (req.method !== 'GET') {
        return next();
      }
      
      // Create a cache key based on the URL and query parameters
      const cacheKey = `${keyPrefix}:${req.originalUrl}`;
      
      // Try to get the cached response
      const cachedData = await getCache<{statusCode: number, data: any}>(cacheKey);
      
      if (cachedData) {
        return res.status(cachedData.statusCode).json(cachedData.data);
      }
      
      // Store original response.json method
      const originalJson = res.json;
      
      // Override response.json method to cache the response
      res.json = function(data: any) {
        // Cache the response
        setCache(cacheKey, { statusCode: res.statusCode, data }, ttl).catch(console.error);
        
        // Call the original json method
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

export default redisClient; 