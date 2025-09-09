# 📏 Coding Standards and Conventions

## Existing Standards Compliance

**Code Style:** Follow existing TypeScript strict mode, ESLint configuration, and Prettier formatting
**Linting Rules:** Use existing ESLint and TypeScript configurations, add AI-related rules
**Testing Patterns:** Follow existing unit test and integration test patterns
**Documentation Style:** Use existing JSDoc comments and documentation generation patterns

## Enhancement-Specific Standards

**AI Component Development Standards:**
- **Error Handling:** AI API calls must include retry logic and graceful degradation
- **Type Safety:** All AI-related data must use strict TypeScript type definitions
- **Performance Optimization:** AI analysis result caching, avoid duplicate API calls
- **User Experience:** Friendly prompts for AI functionality loading and error states

**Data Processing Standards:**
- **Data Validation:** Use Zod for all AI API request and response validation
- **Sensitive Information:** Do not log user content and AI API keys in logs
- **Data Format:** Uniformly use JSON format for data exchange
- **Character Encoding:** Uniformly use UTF-8 encoding for multi-language content processing

## Critical Integration Rules

**Existing API Compatibility:** New AI functionality must not break existing API endpoints
**Database Integration:** All database changes must be executed through Drizzle migration scripts
**Error Handling:** AI service errors must be consistent with existing error handling patterns
**Logging Consistency:** AI functionality logging must follow existing log formats and levels

**Code Example Standards:**

```typescript
// AI service component standard pattern
export class AIService {
  private openai: OpenAI;
  private vectorDb: VectorDatabase;
  private cache: Cache;

  constructor(config: AIServiceConfig) {
    this.openai = new OpenAI(config.openai);
    this.vectorDb = new VectorDatabase(config.vectorDb);
    this.cache = new Cache(config.cache);
  }

  async analyzeContent(content: string): Promise<AIAnalysisResult> {
    try {
      // Check cache
      const cached = await this.cache.get(content);
      if (cached) return cached;

      // Call AI API
      const result = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that analyzes web content.'
          },
          {
            role: 'user',
            content: `Analyze this content: ${content}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      });

      // Process result
      const analysis = this.processAnalysisResult(result);
      
      // Cache result
      await this.cache.set(content, analysis);
      
      return analysis;
    } catch (error) {
      // Graceful degradation
      logger.error('AI analysis failed', { error });
      return this.getFallbackAnalysis(content);
    }
  }

  private processAnalysisResult(result: any): AIAnalysisResult {
    // Process and validate AI returned results
    return {
      category: this.extractCategory(result),
      tags: this.extractTags(result),
      qualityScore: this.calculateQualityScore(result),
      summary: this.extractSummary(result),
      sentiment: this.extractSentiment(result),
      language: this.detectLanguage(result),
      readingTime: this.estimateReadingTime(result),
      timestamp: new Date().toISOString(),
      model: 'gpt-4'
    };
  }

  private getFallbackAnalysis(content: string): AIAnalysisResult {
    // Provide basic analysis as fallback
    return {
      category: 'general',
      tags: this.extractBasicTags(content),
      qualityScore: 50,
      summary: content.substring(0, 200) + '...',
      sentiment: 'neutral',
      language: 'en',
      readingTime: Math.ceil(content.length / 200),
      timestamp: new Date().toISOString(),
      model: 'fallback'
    };
  }
}
```

---
