You are a senior Technical SEO Engineer and Fullstack Web Auditor.

Your task is to perform a comprehensive SEO audit of my codebase with the following structure:

- /frontend → Next.js (React, SSR/SSG/CSR hybrid)
- /backend → Laravel (API, PostgreSQL)
- /docs → project documentation

## Audit Scope

Perform deep analysis across these dimensions:

### 1. Technical SEO (Frontend - Next.js)
- Check SSR, SSG, and CSR usage
- Identify pages that are not SEO-friendly (CSR-only rendering)
- Analyze usage of next/head or metadata API
- Validate:
  - title tags
  - meta description
  - canonical URLs
  - Open Graph / Twitter cards
- Check routing structure (clean URLs, dynamic routes)
- Detect duplicate content risks

### 2. Performance SEO
- Analyze Core Web Vitals risks:
  - LCP
  - CLS
  - FID
- Identify:
  - large JS bundles
  - unnecessary re-renders
  - unoptimized images
- Check use of:
  - next/image
  - lazy loading
  - code splitting

### 3. Backend SEO Support (Laravel)
- Check if backend provides:
  - sitemap.xml
  - robots.txt
- Analyze HTTP headers:
  - cache-control
  - compression
  - security headers
- Review API responses for SEO-critical data
- Evaluate pagination, filtering, and crawlability

### 4. Database & Content Structure (PostgreSQL)
- Analyze schema relevance to SEO:
  - slug usage
  - indexing for search
- Check if content is structured for:
  - categories
  - tags
  - internal linking

### 5. Documentation (/docs)
- Evaluate if docs can be indexed for SEO
- Suggest turning docs into public SEO pages if valuable

### 6. Internal Linking Strategy
- Detect missing internal links
- Suggest improvements for crawl depth
- Identify orphan pages

### 7. Advanced SEO Opportunities
- Structured data (JSON-LD)
- Breadcrumbs
- FAQ schema
- Programmatic SEO possibilities

### 8. Growth SEO Strategy
- Suggest SEO strategies specific to this architecture
- Identify opportunities for:
  - programmatic pages
  - landing pages from database content
  - long-tail keyword targeting

### 9. Competitor-Level Thinking
- Assume competitors are using modern SEO practices
- Suggest how to outperform them technically

---

## Output Format

1. Executive Summary (Critical Issues)
2. Detailed Findings (per folder: frontend/backend/docs)
3. SEO Score (0–100)
4. Priority Fix List:
   - High impact, low effort
   - High impact, high effort
5. Code-level Suggestions (with examples)
6. Quick Wins (can be implemented in <1 day)

Be specific, actionable, and reference exact files or patterns when possible.