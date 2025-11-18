/**
 * Gemini API Response Cache
 * Caches TTS audio and pronunciation analysis to reduce API calls and improve performance
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class GeminiCache {
  private ttsCache: Map<string, CacheEntry<string>> = new Map();
  private analysisCache: Map<string, CacheEntry<any>> = new Map();
  
  // Cache TTL: 1 hour for TTS, 30 minutes for analysis
  private readonly TTS_TTL = 60 * 60 * 1000; // 1 hour
  private readonly ANALYSIS_TTL = 30 * 60 * 1000; // 30 minutes

  /**
   * Get cached TTS audio
   */
  getTTS(text: string, accent: string): string | null {
    const key = `${text}_${accent}`;
    const entry = this.ttsCache.get(key);
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.ttsCache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Cache TTS audio
   */
  setTTS(text: string, accent: string, audioBase64: string): void {
    const key = `${text}_${accent}`;
    this.ttsCache.set(key, {
      data: audioBase64,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.TTS_TTL,
    });
    
    // Cleanup old entries if cache gets too large
    if (this.ttsCache.size > 1000) {
      this.cleanupCache(this.ttsCache);
    }
  }

  /**
   * Get cached pronunciation analysis
   */
  getAnalysis(targetWord: string, transcript: string, difficulty: string): any | null {
    const key = `${targetWord}_${transcript}_${difficulty}`;
    const entry = this.analysisCache.get(key);
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.analysisCache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Cache pronunciation analysis
   */
  setAnalysis(targetWord: string, transcript: string, difficulty: string, analysis: any): void {
    const key = `${targetWord}_${transcript}_${difficulty}`;
    this.analysisCache.set(key, {
      data: analysis,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.ANALYSIS_TTL,
    });
    
    // Cleanup old entries if cache gets too large
    if (this.analysisCache.size > 500) {
      this.cleanupCache(this.analysisCache);
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanupCache<T>(cache: Map<string, CacheEntry<T>>): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => cache.delete(key));
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.ttsCache.clear();
    this.analysisCache.clear();
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      ttsEntries: this.ttsCache.size,
      analysisEntries: this.analysisCache.size,
    };
  }
}

// Export singleton instance
export const geminiCache = new GeminiCache();
