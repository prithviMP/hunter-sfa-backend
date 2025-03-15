import { createClient } from 'redis';
import { logger } from './logger';

// Redis client
let redisClient: ReturnType<typeof createClient> | null = null;

/**
 * Initialize the Redis cache
 */
export const initializeCache = async (): Promise<void> => {
  try {
    // Check if Redis is configured in environment
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    // Create Redis client
    redisClient = createClient({
      url: redisUrl,
    });

    // Set up event handlers
    redisClient.on('error', (err) => {
      logger.error('Redis Client Error', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis Client Connected');
    });

    // Connect to Redis
    await redisClient.connect();
  } catch (error) {
    logger.error('Failed to initialize Redis cache', error);
    // Continue without cache
    redisClient = null;
  }
};

/**
 * Get value from cache
 * @param key - Cache key
 * @returns Cached value or null if not found
 */
export const getFromCache = async <T>(key: string): Promise<T | null> => {
  if (!redisClient) return null;
  
  try {
    const cachedData = await redisClient.get(key);
    if (!cachedData) return null;
    
    return JSON.parse(cachedData) as T;
  } catch (error) {
    logger.error(`Error getting from cache: ${key}`, error);
    return null;
  }
};

/**
 * Set value in cache
 * @param key - Cache key
 * @param value - Value to cache
 * @param expirySeconds - Expiry time in seconds (default: 1 hour)
 */
export const setInCache = async <T>(
  key: string,
  value: T,
  expirySeconds = 3600
): Promise<void> => {
  if (!redisClient) return;
  
  try {
    await redisClient.set(key, JSON.stringify(value), {
      EX: expirySeconds,
    });
  } catch (error) {
    logger.error(`Error setting in cache: ${key}`, error);
  }
};

/**
 * Delete value from cache
 * @param key - Cache key
 */
export const deleteFromCache = async (key: string): Promise<void> => {
  if (!redisClient) return;
  
  try {
    await redisClient.del(key);
  } catch (error) {
    logger.error(`Error deleting from cache: ${key}`, error);
  }
};

/**
 * Delete multiple values from cache by pattern
 * @param pattern - Key pattern to match
 */
export const deleteByPattern = async (pattern: string): Promise<void> => {
  if (!redisClient) return;
  
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    logger.error(`Error deleting by pattern: ${pattern}`, error);
  }
};

/**
 * Close the Redis connection
 */
export const closeCache = async (): Promise<void> => {
  if (!redisClient) return;
  
  try {
    await redisClient.quit();
    logger.info('Redis connection closed');
  } catch (error) {
    logger.error('Error closing Redis connection', error);
  }
}; 