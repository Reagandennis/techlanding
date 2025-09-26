import { LRUCache } from 'lru-cache';

// In-memory cache configuration
const cacheOptions = {
  max: 500, // Maximum number of items
  ttl: 1000 * 60 * 15, // 15 minutes TTL
  allowStale: false,
  updateAgeOnGet: false,
  updateAgeOnHas: false,
};

// Create cache instances for different data types
const caches = {
  courses: new LRUCache<string, any>(cacheOptions),
  users: new LRUCache<string, any>({ ...cacheOptions, ttl: 1000 * 60 * 5 }), // 5 minutes for user data
  lessons: new LRUCache<string, any>(cacheOptions),
  quizzes: new LRUCache<string, any>(cacheOptions),
  certificates: new LRUCache<string, any>({ ...cacheOptions, ttl: 1000 * 60 * 60 }), // 1 hour for certificates
  analytics: new LRUCache<string, any>({ ...cacheOptions, ttl: 1000 * 60 * 30 }), // 30 minutes for analytics
};

// Cache utility class
export class CacheManager {
  /**
   * Get item from cache
   */
  static get<T>(type: keyof typeof caches, key: string): T | undefined {
    return caches[type].get(key) as T | undefined;
  }

  /**
   * Set item in cache
   */
  static set<T>(type: keyof typeof caches, key: string, value: T, customTtl?: number): void {
    if (customTtl) {
      caches[type].set(key, value, { ttl: customTtl });
    } else {
      caches[type].set(key, value);
    }
  }

  /**
   * Delete item from cache
   */
  static delete(type: keyof typeof caches, key: string): void {
    caches[type].delete(key);
  }

  /**
   * Clear entire cache for a type
   */
  static clear(type: keyof typeof caches): void {
    caches[type].clear();
  }

  /**
   * Get cache statistics
   */
  static getStats() {
    const stats: Record<string, any> = {};
    Object.entries(caches).forEach(([key, cache]) => {
      stats[key] = {
        size: cache.size,
        max: cache.max,
        calculatedSize: cache.calculatedSize,
        hit: cache.calculatedSize,
      };
    });
    return stats;
  }

  /**
   * Invalidate related caches when data changes
   */
  static invalidateRelated(type: string, id: string) {
    switch (type) {
      case 'course':
        this.delete('courses', id);
        // Also clear course-related caches
        caches.lessons.forEach((_, key) => {
          if (key.includes(`course:${id}`)) {
            caches.lessons.delete(key);
          }
        });
        break;
      case 'user':
        this.delete('users', id);
        break;
      case 'lesson':
        this.delete('lessons', id);
        break;
      default:
        break;
    }
  }
}

// Database query optimization utilities
export class DatabaseOptimizer {
  /**
   * Optimize Prisma queries with caching
   */
  static async cachedQuery<T>(
    cacheType: keyof typeof caches,
    cacheKey: string,
    queryFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Check cache first
    const cached = CacheManager.get<T>(cacheType, cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    // Execute query and cache result
    const result = await queryFn();
    CacheManager.set(cacheType, cacheKey, result, ttl);
    
    return result;
  }

  /**
   * Batch database operations to reduce round trips
   */
  static async batchOperations<T>(operations: (() => Promise<T>)[]): Promise<T[]> {
    return Promise.all(operations);
  }

  /**
   * Optimize pagination queries
   */
  static getPaginationParams(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100); // Cap at 100 items per page
    
    return { skip, take };
  }

  /**
   * Generate optimized select fields for Prisma
   */
  static getSelectFields(fields: string[]): Record<string, boolean> {
    return fields.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Record<string, boolean>);
  }

  /**
   * Create database indexes recommendations
   */
  static getIndexRecommendations() {
    return {
      courses: [
        'CREATE INDEX idx_courses_instructor_id ON courses(instructor_id)',
        'CREATE INDEX idx_courses_category_id ON courses(category_id)',
        'CREATE INDEX idx_courses_published ON courses(published)',
        'CREATE INDEX idx_courses_created_at ON courses(created_at)',
      ],
      lessons: [
        'CREATE INDEX idx_lessons_course_id ON lessons(course_id)',
        'CREATE INDEX idx_lessons_position ON lessons(position)',
      ],
      quiz_attempts: [
        'CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id)',
        'CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id)',
        'CREATE INDEX idx_quiz_attempts_completed_at ON quiz_attempts(completed_at)',
      ],
      lesson_progress: [
        'CREATE INDEX idx_lesson_progress_user_id ON lesson_progress(user_id)',
        'CREATE INDEX idx_lesson_progress_lesson_id ON lesson_progress(lesson_id)',
        'CREATE INDEX idx_lesson_progress_completed ON lesson_progress(completed)',
      ],
      enrollments: [
        'CREATE INDEX idx_enrollments_user_id ON enrollments(user_id)',
        'CREATE INDEX idx_enrollments_course_id ON enrollments(course_id)',
        'CREATE INDEX idx_enrollments_created_at ON enrollments(created_at)',
      ],
    };
  }
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();

  /**
   * Start performance timing
   */
  static startTimer(name: string): () => void {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      const duration = end - start;
      
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      
      this.metrics.get(name)!.push(duration);
      
      // Keep only last 100 measurements
      const measurements = this.metrics.get(name)!;
      if (measurements.length > 100) {
        measurements.shift();
      }
    };
  }

  /**
   * Get performance metrics
   */
  static getMetrics() {
    const result: Record<string, any> = {};
    
    this.metrics.forEach((measurements, name) => {
      if (measurements.length > 0) {
        const avg = measurements.reduce((a, b) => a + b, 0) / measurements.length;
        const min = Math.min(...measurements);
        const max = Math.max(...measurements);
        
        result[name] = {
          count: measurements.length,
          average: Math.round(avg * 100) / 100,
          min: Math.round(min * 100) / 100,
          max: Math.round(max * 100) / 100,
        };
      }
    });
    
    return result;
  }

  /**
   * Clear all metrics
   */
  static clearMetrics() {
    this.metrics.clear();
  }
}

// Image optimization utilities
export class ImageOptimizer {
  /**
   * Generate optimized image URLs for different sizes
   */
  static generateImageSizes(originalUrl: string, sizes: number[] = [400, 800, 1200]) {
    const sizeUrls: Record<string, string> = {};
    
    sizes.forEach(size => {
      // Assuming Cloudinary URLs - adjust based on your CDN
      if (originalUrl.includes('cloudinary.com')) {
        const optimized = originalUrl.replace('/upload/', `/upload/w_${size},c_fill,f_auto,q_auto/`);
        sizeUrls[`${size}w`] = optimized;
      } else {
        // Fallback to original URL if not Cloudinary
        sizeUrls[`${size}w`] = originalUrl;
      }
    });
    
    return sizeUrls;
  }

  /**
   * Generate responsive image srcSet
   */
  static generateSrcSet(imageUrl: string, sizes: number[] = [400, 800, 1200]): string {
    const sizeUrls = this.generateImageSizes(imageUrl, sizes);
    
    return sizes
      .map(size => `${sizeUrls[`${size}w`]} ${size}w`)
      .join(', ');
  }

  /**
   * Get optimized video thumbnail
   */
  static getVideoThumbnail(videoUrl: string, time: number = 0): string {
    if (videoUrl.includes('cloudinary.com')) {
      return videoUrl.replace('/upload/', `/upload/so_${time},w_800,c_fill,f_auto,q_auto/`);
    }
    
    // Fallback thumbnail generation would go here
    return videoUrl;
  }
}

// Code splitting and lazy loading utilities
export class LazyLoader {
  /**
   * Preload route components
   */
  static preloadRoute(routePath: string) {
    // This would integrate with your routing system
    // For Next.js, you might use router.prefetch()
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = routePath;
      document.head.appendChild(link);
    }
  }

  /**
   * Intersection Observer for lazy loading elements
   */
  static observeElement(
    element: Element,
    callback: () => void,
    options: IntersectionObserverInit = {}
  ) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback();
          observer.unobserve(element);
        }
      });
    }, {
      rootMargin: '50px',
      ...options
    });

    observer.observe(element);
    
    return () => observer.unobserve(element);
  }
}

// Bundle size analyzer utilities
export class BundleOptimizer {
  /**
   * Tree shake unused code recommendations
   */
  static getTreeShakeRecommendations() {
    return {
      lodash: "Import specific functions: import { debounce } from 'lodash/debounce'",
      moment: "Consider using date-fns or dayjs for smaller bundle size",
      'react-icons': "Import specific icons: import { FaUser } from 'react-icons/fa'",
      'chart.js': "Consider using recharts or victory for React-specific charts",
    };
  }

  /**
   * Dynamic import recommendations
   */
  static getDynamicImportRecommendations() {
    return [
      'Large libraries like PDF generators should be dynamically imported',
      'Admin-only components should be code-split',
      'Non-critical third-party scripts should be lazy loaded',
      'Heavy visualization libraries should be loaded on-demand',
    ];
  }
}

