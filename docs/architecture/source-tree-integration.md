# 📁 Source Tree Integration

## Existing Project Structure

```
linklink/
├── apps/
│   ├── web/                 # Frontend application (React + TanStack Router)
│   │   ├── src/
│   │   │   ├── components/   # React components
│   │   │   ├── pages/       # Page components
│   │   │   ├── hooks/       # Custom hooks
│   │   │   ├── utils/       # Utility functions
│   │   │   └── lib/         # External library configurations
│   │   └── package.json
│   ├── server/              # Backend API (Hono, TRPC)
│   │   ├── src/
│   │   │   ├── routers/     # tRPC routers
│   │   │   ├── middleware/  # Middleware functions
│   │   │   ├── services/    # Business logic services
│   │   │   ├── db/          # Database configuration
│   │   │   └── lib/         # External library configurations
│   │   └── package.json
│   └── extension/           # Browser extension (WXT + React)
│       ├── src/
│       │   ├── components/  # Extension components
│       │   ├── content/     # Content scripts
│       │   ├── background/ # Background scripts
│       │   └── lib/         # External library configurations
│       └── package.json
├── docs/                    # Documentation
├── .bmad-core/             # BMAD framework configuration
└── package.json
```

## New File Organization

```
linklink/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ai/              # AI-specific components
│   │   │   │   │   ├── AnalysisResultCard.tsx
│   │   │   │   │   ├── SmartSearchBox.tsx
│   │   │   │   │   ├── AISettingsPanel.tsx
│   │   │   │   │   └── RecommendationList.tsx
│   │   │   │   └── bookmark/        # Existing bookmark components (enhanced)
│   │   │   ├── pages/
│   │   │   │   ├── dashboard/      # Enhanced dashboard
│   │   │   │   ├── search/         # Enhanced search page
│   │   │   │   └── settings/       # Enhanced settings page
│   │   │   ├── hooks/
│   │   │   │   ├── useAIAnalysis.ts      # AI analysis hooks
│   │   │   │   ├── useSemanticSearch.ts  # Semantic search hooks
│   │   │   │   └── useRecommendations.ts # Recommendation hooks
│   │   │   ├── lib/
│   │   │   │   ├── ai/             # AI service configurations
│   │   │   │   │   └── client.ts
│   │   │   │   └── utils/
│   │   │   │       └── ai.ts      # AI utility functions
│   │   │   └── types/
│   │   │       └── ai.ts          # AI-related types
│   │   └── package.json           # Updated with AI dependencies
│   ├── server/
│   │   ├── src/
│   │   │   ├── routers/
│   │   │   │   ├── ai.ts          # AI-related tRPC routes
│   │   │   │   └── bookmarks.ts   # Enhanced bookmark routes
│   │   │   ├── services/
│   │   │   │   ├── ai/            # AI business logic
│   │   │   │   │   ├── AIService.ts
│   │   │   │   │   ├── VectorDatabase.ts
│   │   │   │   │   └── ContentExtractor.ts
│   │   │   │   └── bookmarks/     # Enhanced bookmark services
│   │   │   ├── db/
│   │   │   │   ├── schema/
│   │   │   │   │   ├── ai.ts      # AI-related database schemas
│   │   │   │   │   └── migrations/ # Database migrations
│   │   │   │   └── queries/
│   │   │   │       ├── ai.ts      # AI-related database queries
│   │   │   ├── lib/
│   │   │   │   ├── ai/            # AI library configurations
│   │   │   │   │   ├── openai.ts
│   │   │   │   │   └── pinecone.ts
│   │   │   │   └── utils/
│   │   │   │       └── ai.ts      # AI utility functions
│   │   │   └── types/
│   │   │       └── ai.ts          # AI-related types
│   │   └── package.json           # Updated with AI dependencies
│   └── extension/
│       ├── src/
│       │   ├── components/
│       │   │   ├── ai/            # AI extension components
│       │   │   │   ├── AIAnalysisPopup.tsx
│       │   │   │   └── TagSuggester.tsx
│       │   │   └── content/
│       │   │       ├── AIContentScript.ts
│       │   │       └── AIAutoTagger.ts
│       │   ├── background/
│       │   │   └── AIBackgroundService.ts
│       │   └── lib/
│       │       └── ai.ts          # AI utility functions
│       └── package.json           # Updated with AI dependencies
├── docs/
│   ├── architecture/
│   │   ├── ai-architecture.md     # AI architecture documentation
│   │   └── api-reference.md       # Updated API reference
│   └── prd/                       # Product requirements
└── package.json
```

## Integration Guidelines

**File Naming:** Follow existing naming conventions, use PascalCase for components, camelCase for utilities
**Folder Organization:** Organize by functional domain, AI-related functionality in dedicated `ai/` subdirectories
**Import/Export Patterns:** Maintain existing import/export patterns, use relative paths and type-safe imports

**Integration Principles:**
1. **Minimize disruptive changes** - New functionality implemented through addition rather than modification of existing code
2. **Maintain consistency** - Follow existing code style and architectural patterns
3. **Modular design** - AI functionality modularized for easy testing and maintenance
4. **Gradual deployment** - Support feature flags and gradual enablement

---
