# 🗄️ Data Models and Schema Changes

## New Data Models

### VectorEmbedding
**Purpose:** Store vector embeddings of bookmark content for semantic search and similarity matching
**Integration:** Associated with existing bookmark table via bookmarkId, extending search capabilities

**Key Attributes:**
- id: string - Primary key, UUID
- bookmarkId: string - Foreign key, associated with bookmark table
- vector: number[] - Vector embedding data
- model: string - Embedding model name used
- createdAt: datetime - Creation time
- updatedAt: datetime - Update time

**Relationships:**
- **With Existing:** Many-to-one relationship, one bookmark can have multiple vector embeddings (different models)
- **With New:** One-to-many relationship, can be associated with AI analysis results

### AIAnalysis
**Purpose:** Store AI analysis results of bookmark content, including classification, tags, and quality scores
**Integration:** Extend existing bookmark functionality, providing intelligent analysis capabilities

**Key Attributes:**
- id: string - Primary key, UUID
- bookmarkId: string - Foreign key, associated with bookmark table
- category: string - AI classification result
- tags: string[] - AI-generated tag array
- qualityScore: number - Quality score (0-100)
- summary: text - Content summary
- sentiment: string - Sentiment analysis result
- language: string - Detected language
- readingTime: number - Estimated reading time (minutes)
- createdAt: datetime - Analysis time
- model: string - AI model used

**Relationships:**
- **With Existing:** One-to-one relationship, each bookmark corresponds to one AI analysis result
- **With New:** Can be associated with vector embeddings and user feedback

### SearchHistory
**Purpose:** Record user search history for personalized recommendations and search optimization
**Integration:** Extend existing user functionality, improving search experience

**Key Attributes:**
- id: string - Primary key, UUID
- userId: string - Foreign key, associated with user table
- query: string - Search query
- results: string[] - Array of returned bookmark IDs
- searchType: string - Search type (keyword/semantic)
- filters: json - Search filters used
- createdAt: datetime - Search time

**Relationships:**
- **With Existing:** Many-to-one relationship, associated with user table
- **With New:** Can be used to train personalized recommendation models

### UserPreference
**Purpose:** Store user preferences for AI functionality
**Integration:** Extend existing user system, providing personalized AI capabilities

**Key Attributes:**
- id: string - Primary key, UUID
- userId: string - Foreign key, associated with user table
- autoCategorization: boolean - Enable auto categorization
- autoTagging: boolean - Enable auto tagging
- preferredLanguage: string - Preferred language
- contentQualityThreshold: number - Content quality threshold
- notificationSettings: json - Notification settings
- createdAt: datetime - Creation time
- updatedAt: datetime - Update time

**Relationships:**
- **With Existing:** One-to-one relationship, extending user table functionality
- **With New:** Influences AI analysis and recommendation algorithm behavior

## Schema Integration Strategy

**Database Changes Required:**
- **New Tables:** VectorEmbedding, AIAnalysis, SearchHistory, UserPreference
- **Modified Tables:** Bookmark table to add AI-related fields (optional)
- **New Indexes:** Create indexes on bookmarkId, userId, vector fields
- **Migration Strategy:** Use Drizzle migration scripts, support zero-downtime upgrades

**Backward Compatibility:**
- Existing bookmark table structure remains unchanged, new tables associated via foreign keys
- New functionality enabled through optional fields and settings, without affecting existing functionality
- Gradual migration strategy, support for新旧版本共存
- Provide data rollback mechanism to ensure system stability

---
