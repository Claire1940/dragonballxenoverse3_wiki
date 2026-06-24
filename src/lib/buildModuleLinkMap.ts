import { getAllContent, CONTENT_TYPES } from '@/lib/content'
import type { Language, ContentItem } from '@/lib/content'

export interface ArticleLink {
  url: string
  title: string
}

export type ModuleLinkMap = Record<string, ArticleLink | null>

interface ArticleWithType extends ContentItem {
  contentType: string
}

// Module sub-field mapping: moduleKey -> { field, nameKey }
// field = 子项数组字段名（8 个 DBXV3 模块统一用 items）
// nameKey = 子项元素里的名称字段（label / headline / title / name / storefront）
const MODULE_FIELDS: Record<string, { field: string; nameKey: string }> = {
  dbxv3ReleaseDatePlatforms: { field: 'items', nameKey: 'label' },
  dbxv3OfficialNewsTimeline: { field: 'items', nameKey: 'headline' },
  dbxv3Age1000Story: { field: 'items', nameKey: 'title' },
  dbxv3GameplayCombat: { field: 'items', nameKey: 'title' },
  dbxv3CharactersRoster: { field: 'items', nameKey: 'name' },
  dbxv3BuildsCustomization: { field: 'items', nameKey: 'name' },
  dbxv3EditionsPrice: { field: 'items', nameKey: 'storefront' },
  dbxv3CodesBonuses: { field: 'items', nameKey: 'name' },
}

// Extra semantic keywords per module to boost matching for h2 titles
// 用 DBXV3 专有名词（AGE 1000 / Soul Switch / West City / Brett / Lilica 等）提升大标题匹配率
const MODULE_EXTRA_KEYWORDS: Record<string, string[]> = {
  dbxv3ReleaseDatePlatforms: ['release date', 'platforms', 'ps5', 'xbox', 'steam', 'store status', 'wishlist'],
  dbxv3OfficialNewsTimeline: ['trailer', 'news', 'reveal', 'gameplay', 'west city', 'announcement'],
  dbxv3Age1000Story: ['age 1000', 'story', 'west city', 'saiya squad', 'soul assist', 'lore', 'timeline'],
  dbxv3GameplayCombat: ['gameplay', 'combat', 'soul switch', 'soul assist', 'battles', 'mechanics', 'demo'],
  dbxv3CharactersRoster: ['roster', 'characters', 'brett', 'lilica', 'transformations', 'protagonist', 'soul switch'],
  dbxv3BuildsCustomization: ['builds', 'customization', 'avatar', 'character creation', 'cac', 'soul'],
  dbxv3EditionsPrice: ['editions', 'price', 'wishlist', 'preorder', 'store', 'steam'],
  dbxv3CodesBonuses: ['codes', 'bonuses', 'rewards', 'redeem', 'launch', 'preorder bonus'],
}

const FILLER_WORDS = ['dragon', 'ball', 'xenoverse', '3', '2027', '2026', '2025', 'complete', 'the', 'and', 'for', 'how', 'with', 'our', 'this', 'your', 'all', 'from', 'learn', 'master', 'guide', 'systems', 'official']

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getSignificantTokens(text: string): string[] {
  return normalize(text)
    .split(' ')
    .filter(w => w.length > 2 && !FILLER_WORDS.includes(w))
}

function matchScore(queryText: string, article: ArticleWithType, extraKeywords?: string[]): number {
  const normalizedQuery = normalize(queryText)
  const normalizedTitle = normalize(article.frontmatter.title)
  const normalizedDesc = normalize(article.frontmatter.description || '')
  const normalizedSlug = article.slug.replace(/-/g, ' ').toLowerCase()

  let score = 0

  // Exact phrase match in title (stripped of the game name prefix)
  const strippedQuery = normalizedQuery.replace(/dragon ball xenoverse 3\s*/g, '').trim()
  const strippedTitle = normalizedTitle.replace(/dragon ball xenoverse 3\s*/g, '').trim()
  if (strippedQuery.length > 3 && strippedTitle.includes(strippedQuery)) {
    score += 100
  }

  // Token overlap from query text
  const queryTokens = getSignificantTokens(queryText)
  for (const token of queryTokens) {
    if (normalizedTitle.includes(token)) score += 20
    if (normalizedDesc.includes(token)) score += 5
    if (normalizedSlug.includes(token)) score += 15
  }

  // Extra keywords scoring (for module h2 titles)
  if (extraKeywords) {
    for (const kw of extraKeywords) {
      const normalizedKw = normalize(kw)
      if (normalizedTitle.includes(normalizedKw)) score += 15
      if (normalizedDesc.includes(normalizedKw)) score += 5
      if (normalizedSlug.includes(normalizedKw)) score += 10
    }
  }

  return score
}

function findBestMatch(
  queryText: string,
  articles: ArticleWithType[],
  extraKeywords?: string[],
  threshold = 20,
): ArticleLink | null {
  let bestScore = 0
  let bestArticle: ArticleWithType | null = null

  for (const article of articles) {
    const score = matchScore(queryText, article, extraKeywords)
    if (score > bestScore) {
      bestScore = score
      bestArticle = article
    }
  }

  if (bestScore >= threshold && bestArticle) {
    return {
      url: `/${bestArticle.contentType}/${bestArticle.slug}`,
      title: bestArticle.frontmatter.title,
    }
  }

  return null
}

export async function buildModuleLinkMap(locale: Language): Promise<ModuleLinkMap> {
  // 1. Load all articles across all content types
  const allArticles: ArticleWithType[] = []
  for (const contentType of CONTENT_TYPES) {
    const items = await getAllContent(contentType, locale)
    for (const item of items) {
      allArticles.push({ ...item, contentType })
    }
  }

  // 2. Load module data from en.json (use English for keyword matching)
  const enMessages = (await import('../locales/en.json')).default as any

  const linkMap: ModuleLinkMap = {}

  // 3. For each module, match h2 title and sub-items
  for (const [moduleKey, fieldConfig] of Object.entries(MODULE_FIELDS)) {
    const moduleData = enMessages.modules?.[moduleKey]
    if (!moduleData) continue

    // Match module h2 title (use extra keywords + lower threshold for broader matching)
    const moduleTitle = moduleData.title as string
    if (moduleTitle) {
      const extraKw = MODULE_EXTRA_KEYWORDS[moduleKey] || []
      linkMap[moduleKey] = findBestMatch(moduleTitle, allArticles, extraKw, 15)
    }

    // Match sub-items
    const subItems = moduleData[fieldConfig.field] as any[]
    if (Array.isArray(subItems)) {
      for (let i = 0; i < subItems.length; i++) {
        const itemName = subItems[i]?.[fieldConfig.nameKey] as string
        if (itemName) {
          const key = `${moduleKey}::${fieldConfig.field}::${i}`
          linkMap[key] = findBestMatch(itemName, allArticles)
        }
      }
    }
  }

  return linkMap
}
