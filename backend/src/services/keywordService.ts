import { KeywordRepository, FullKeywordData } from '../repositories/keywordRepository.js';

export class KeywordService {
  static async analyzeKeywords(params: {
    businessId: string;
    keywords: string[];
    category: string;
    city: string;
  }): Promise<FullKeywordData[]> {
    const existingList = await KeywordRepository.findByBusinessId(params.businessId);
    const existingKeywordsMap = new Map(existingList.map(k => [k.keyword.keyword.toLowerCase(), k]));

    const results: FullKeywordData[] = [];

    for (const kwRaw of params.keywords) {
      const kwClean = kwRaw.trim();
      if (!kwClean) continue;

      if (existingKeywordsMap.has(kwClean.toLowerCase())) {
        results.push(existingKeywordsMap.get(kwClean.toLowerCase())!);
        continue;
      }

      // Analyze Intent
      const intent = this.determineSearchIntent(kwClean, params.city);

      // Analyze Relevance & Competition
      const localRelevance = this.calculateLocalRelevance(kwClean, params.city, params.category);
      const competition = this.calculateCompetition(kwClean);
      const volume = this.estimateSearchVolume(kwClean, params.city);
      const visibility = this.estimateVisibilityScore(kwClean, localRelevance);
      const related = this.generateRelatedKeywords(kwClean, params.city, params.category);

      const saved = await KeywordRepository.saveKeywordWithResult(
        {
          business_id: params.businessId,
          keyword: kwClean,
          search_intent: intent,
          is_primary: results.length === 0,
        },
        {
          local_relevance_score: localRelevance,
          competition_level: competition,
          estimated_volume: volume,
          visibility_score: visibility,
          serp_features: ['Local Map Pack', 'Organic Snippet', 'People Also Ask'],
          related_queries: related,
        }
      );

      results.push(saved);
    }

    return results;
  }

  static async getBusinessKeywords(businessId: string): Promise<FullKeywordData[]> {
    return KeywordRepository.findByBusinessId(businessId);
  }

  private static determineSearchIntent(keyword: string, city: string): string {
    const kw = keyword.toLowerCase();
    if (kw.includes('near me') || kw.includes('in ' + city.toLowerCase()) || kw.includes(city.toLowerCase())) {
      return 'Local Commercial';
    }
    if (kw.includes('buy') || kw.includes('order') || kw.includes('price') || kw.includes('cost') || kw.includes('custom')) {
      return 'Transactional';
    }
    if (kw.includes('best') || kw.includes('top') || kw.includes('review') || kw.includes('ratings')) {
      return 'Local Commercial';
    }
    if (kw.includes('how') || kw.includes('what') || kw.includes('recipe') || kw.includes('guide')) {
      return 'Informational';
    }
    return 'Navigational';
  }

  private static calculateLocalRelevance(keyword: string, city: string, category: string): number {
    const kw = keyword.toLowerCase();
    let score = 50;

    if (kw.includes(city.toLowerCase()) || kw.includes('near me')) {
      score += 35;
    }
    if (kw.includes(category.toLowerCase())) {
      score += 15;
    }
    return Math.min(100, score);
  }

  private static calculateCompetition(keyword: string): 'Low' | 'Medium' | 'High' {
    const len = keyword.split(' ').length;
    if (len >= 4) return 'Low'; // Long-tail keywords have lower competition
    if (keyword.toLowerCase().includes('best') || keyword.toLowerCase().includes('near me')) return 'High';
    return 'Medium';
  }

  private static estimateSearchVolume(keyword: string, city: string): number {
    const len = keyword.length;
    let base = (len % 7 + 1) * 350;
    if (keyword.toLowerCase().includes('near me')) base += 1800;
    if (keyword.toLowerCase().includes(city.toLowerCase())) base += 750;
    return Math.round(base);
  }

  private static estimateVisibilityScore(keyword: string, relevance: number): number {
    if (relevance > 80) return Math.floor(Math.random() * 30 + 65); // Rank #2 - #6
    return Math.floor(Math.random() * 40 + 30);
  }

  private static generateRelatedKeywords(keyword: string, city: string, category: string): string[] {
    const base = keyword.trim();
    return [
      `${base} in ${city}`,
      `best ${base} ${city}`,
      `top rated ${base} near me`,
      `affordable ${base} ${city}`,
      `custom ${base} delivery ${city}`,
    ];
  }
}
