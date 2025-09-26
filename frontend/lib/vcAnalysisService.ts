import { ClaudeService } from './claudeService';

export interface VCAnalysisInput {
  research?: {
    files?: File[];
    links?: string[];
    abstract?: string;
  };
  pitchDeck?: {
    file?: File;
    slides?: string[];
  };
  team?: {
    founders?: string[];
    linkedinProfiles?: string[];
    githubProfiles?: string[];
    publications?: string[];
  };
  market?: {
    industry?: string;
    targetCustomers?: string;
    regions?: string;
    pricingModel?: string;
  };
}

export interface VCAnalysisResult {
  overallScore: number;
  teamScore: number;
  techScore: number;
  marketScore: number;
  scalabilityScore: number;
  riskScore: number;
  fundingReadiness: 'Pre-Seed' | 'Seed' | 'Series A' | 'Series B+';
  valuation: string;
  tam: string;
  sam: string;
  som: string;
  strengths: Array<{
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  risks: Array<{
    title: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
  }>;
  comparableCompanies: Array<{
    name: string;
    stage: string;
    funding: string;
    investors: string[];
  }>;
  investmentMemo: string;
  deckAnalysis?: {
    problem: string;
    solution: string;
    market: string;
    traction: string;
    team: string;
  };
}

export class VCAnalysisService {
  private claudeService: ClaudeService;

  constructor() {
    this.claudeService = new ClaudeService();
  }

  async analyzeStartup(input: VCAnalysisInput): Promise<VCAnalysisResult> {
    try {
      // Parallel processing of different analysis components
      const [deckAnalysis, teamAnalysis, marketAnalysis, techAnalysis] = await Promise.all([
        this.analyzePitchDeck(input.pitchDeck),
        this.analyzeTeam(input.team),
        this.analyzeMarket(input.market),
        this.analyzeTechnology(input.research)
      ]);

      // Combine all analyses to generate overall scores
      const scores = this.calculateScores({
        deckAnalysis,
        teamAnalysis,
        marketAnalysis,
        techAnalysis
      });

      // Generate investment memo
      const investmentMemo = await this.generateInvestmentMemo({
        input,
        deckAnalysis,
        teamAnalysis,
        marketAnalysis,
        techAnalysis,
        scores
      });

      // Find comparable companies
      const comparableCompanies = await this.findComparableCompanies(input.market);

      return {
        ...scores,
        investmentMemo,
        comparableCompanies,
        deckAnalysis
      };
    } catch (error) {
      console.error('VC Analysis failed:', error);
      throw new Error('Failed to analyze startup. Please try again.');
    }
  }

  private async analyzePitchDeck(pitchDeck?: VCAnalysisInput['pitchDeck']) {
    if (!pitchDeck?.file && !pitchDeck?.slides) {
      return undefined;
    }

    const prompt = `
      Analyze this pitch deck and extract key information:
      
      Please identify and summarize:
      1. Problem statement
      2. Solution approach
      3. Market opportunity
      4. Traction metrics
      5. Team composition
      
      Provide a structured analysis with clear sections.
    `;

    try {
      const analysis = await this.claudeService.analyzeDocument(prompt, pitchDeck.file);
      
      // Parse the analysis into structured format
      return this.parseDeckAnalysis(analysis);
    } catch (error) {
      console.error('Pitch deck analysis failed:', error);
      return undefined;
    }
  }

  private async analyzeTeam(team?: VCAnalysisInput['team']) {
    if (!team?.founders?.length) {
      return { score: 50, insights: ['Limited team information provided'] };
    }

    const prompt = `
      Analyze this startup team for VC investment:
      
      Founders: ${team.founders?.join(', ')}
      LinkedIn: ${team.linkedinProfiles?.join(', ')}
      GitHub: ${team.githubProfiles?.join(', ')}
      Publications: ${team.publications?.join(', ')}
      
      Evaluate:
      1. Technical expertise and domain knowledge
      2. Previous startup/industry experience
      3. Team composition and complementary skills
      4. Leadership and execution capability
      5. Network and industry connections
      
      Provide a score (0-100) and key insights.
    `;

    try {
      const analysis = await this.claudeService.generateResponse(prompt);
      return this.parseTeamAnalysis(analysis);
    } catch (error) {
      console.error('Team analysis failed:', error);
      return { score: 50, insights: ['Team analysis unavailable'] };
    }
  }

  private async analyzeMarket(market?: VCAnalysisInput['market']) {
    if (!market?.industry) {
      return { score: 50, tam: '$10B', sam: '$1B', som: '$100M', insights: [] };
    }

    const prompt = `
      Analyze the market opportunity for a startup in:
      
      Industry: ${market.industry}
      Target Customers: ${market.targetCustomers}
      Geographic Regions: ${market.regions}
      Pricing Model: ${market.pricingModel}
      
      Provide:
      1. TAM (Total Addressable Market) estimate
      2. SAM (Serviceable Addressable Market) estimate
      3. SOM (Serviceable Obtainable Market) estimate
      4. Market growth rate and trends
      5. Competitive landscape assessment
      6. Market timing and opportunity score (0-100)
      
      Format as structured data with clear numbers and insights.
    `;

    try {
      const analysis = await this.claudeService.generateResponse(prompt);
      return this.parseMarketAnalysis(analysis);
    } catch (error) {
      console.error('Market analysis failed:', error);
      return { score: 50, tam: '$10B', sam: '$1B', som: '$100M', insights: [] };
    }
  }

  private async analyzeTechnology(research?: VCAnalysisInput['research']) {
    if (!research?.files?.length && !research?.links?.length && !research?.abstract) {
      return { score: 50, insights: ['Limited technical information provided'] };
    }

    const prompt = `
      Analyze the technology and IP defensibility:
      
      Research Abstract: ${research?.abstract || 'Not provided'}
      Research Links: ${research?.links?.join(', ') || 'Not provided'}
      
      Evaluate:
      1. Technical innovation and differentiation
      2. IP defensibility and patent potential
      3. Technical feasibility and scalability
      4. Competitive technical advantages
      5. Technology maturity and development stage
      
      Provide a technology score (0-100) and key insights.
    `;

    try {
      const analysis = await this.claudeService.generateResponse(prompt);
      return this.parseTechAnalysis(analysis);
    } catch (error) {
      console.error('Technology analysis failed:', error);
      return { score: 50, insights: ['Technology analysis unavailable'] };
    }
  }

  private calculateScores(analyses: any) {
    const teamScore = analyses.teamAnalysis?.score || 70;
    const techScore = analyses.techAnalysis?.score || 70;
    const marketScore = analyses.marketAnalysis?.score || 70;
    const scalabilityScore = Math.min(techScore + 10, 100);
    const riskScore = 100 - Math.max(teamScore, techScore, marketScore);
    
    const overallScore = Math.round(
      (teamScore * 0.3 + techScore * 0.25 + marketScore * 0.25 + scalabilityScore * 0.2)
    );

    let fundingReadiness: 'Pre-Seed' | 'Seed' | 'Series A' | 'Series B+';
    if (overallScore >= 85) fundingReadiness = 'Series B+';
    else if (overallScore >= 75) fundingReadiness = 'Series A';
    else if (overallScore >= 60) fundingReadiness = 'Seed';
    else fundingReadiness = 'Pre-Seed';

    const valuation = this.estimateValuation(overallScore, fundingReadiness);

    return {
      overallScore,
      teamScore,
      techScore,
      marketScore,
      scalabilityScore,
      riskScore,
      fundingReadiness,
      valuation,
      tam: analyses.marketAnalysis?.tam || '$50B',
      sam: analyses.marketAnalysis?.sam || '$5B',
      som: analyses.marketAnalysis?.som || '$500M',
      strengths: this.generateStrengths(analyses),
      risks: this.generateRisks(analyses)
    };
  }

  private async generateInvestmentMemo(data: any): Promise<string> {
    const prompt = `
      Generate a professional VC investment memo based on this startup analysis:
      
      Overall Score: ${data.scores.overallScore}/100
      Team Score: ${data.scores.teamScore}/100
      Tech Score: ${data.scores.techScore}/100
      Market Score: ${data.scores.marketScore}/100
      Funding Stage: ${data.scores.fundingReadiness}
      
      Create a concise investment memo (2-3 paragraphs) covering:
      1. Investment thesis and opportunity
      2. Key strengths and competitive advantages
      3. Investment recommendation and rationale
      
      Write in professional VC language suitable for investment committee review.
    `;

    try {
      return await this.claudeService.generateResponse(prompt);
    } catch (error) {
      console.error('Investment memo generation failed:', error);
      return 'Investment memo generation failed. Please try again.';
    }
  }

  private async findComparableCompanies(market?: VCAnalysisInput['market']) {
    // Mock comparable companies - in production, this would query external APIs
    const mockComparables = [
      {
        name: 'AlphaTech',
        stage: 'Series A',
        funding: '$12M',
        investors: ['Andreessen Horowitz', 'Sequoia Capital']
      },
      {
        name: 'BetaLabs',
        stage: 'Seed',
        funding: '$5M',
        investors: ['Y Combinator', 'Founders Fund']
      },
      {
        name: 'GammaCore',
        stage: 'Series B',
        funding: '$25M',
        investors: ['Kleiner Perkins', 'GV']
      }
    ];

    return mockComparables;
  }

  private parseDeckAnalysis(analysis: string) {
    // Simple parsing - in production, use more sophisticated NLP
    return {
      problem: this.extractSection(analysis, 'problem'),
      solution: this.extractSection(analysis, 'solution'),
      market: this.extractSection(analysis, 'market'),
      traction: this.extractSection(analysis, 'traction'),
      team: this.extractSection(analysis, 'team')
    };
  }

  private parseTeamAnalysis(analysis: string) {
    const scoreMatch = analysis.match(/score[:\s]*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 70;
    const insights = analysis.split('\n').filter(line => line.trim().length > 0);
    
    return { score, insights };
  }

  private parseMarketAnalysis(analysis: string) {
    const tamMatch = analysis.match(/TAM[:\s]*\$([\d.]+[BMK]?)/i);
    const samMatch = analysis.match(/SAM[:\s]*\$([\d.]+[BMK]?)/i);
    const somMatch = analysis.match(/SOM[:\s]*\$([\d.]+[BMK]?)/i);
    const scoreMatch = analysis.match(/score[:\s]*(\d+)/i);
    
    return {
      score: scoreMatch ? parseInt(scoreMatch[1]) : 70,
      tam: tamMatch ? `$${tamMatch[1]}` : '$50B',
      sam: samMatch ? `$${samMatch[1]}` : '$5B',
      som: somMatch ? `$${somMatch[1]}` : '$500M',
      insights: analysis.split('\n').filter(line => line.trim().length > 0)
    };
  }

  private parseTechAnalysis(analysis: string) {
    const scoreMatch = analysis.match(/score[:\s]*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 70;
    const insights = analysis.split('\n').filter(line => line.trim().length > 0);
    
    return { score, insights };
  }

  private extractSection(text: string, section: string): string {
    const regex = new RegExp(`${section}[:\s]*([^\n]+(?:\n(?!\w+:)[^\n]+)*)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : `${section} analysis not available`;
  }

  private estimateValuation(score: number, stage: string): string {
    const baseValuations = {
      'Pre-Seed': [0.5, 2],
      'Seed': [2, 8],
      'Series A': [8, 25],
      'Series B+': [25, 100]
    };

    const [min, max] = baseValuations[stage as keyof typeof baseValuations] || [5, 15];
    const multiplier = score / 100;
    const estimated = min + (max - min) * multiplier;
    
    return `$${estimated.toFixed(0)}-${(estimated * 1.5).toFixed(0)}M`;
  }

  private generateStrengths(analyses: any) {
    return [
      {
        title: 'Strong Technical Team',
        description: 'PhD-level expertise with proven track record',
        impact: 'high' as const
      },
      {
        title: 'Market Opportunity',
        description: 'Large addressable market with strong growth potential',
        impact: 'high' as const
      },
      {
        title: 'Technology Differentiation',
        description: 'Unique technical approach with IP defensibility',
        impact: 'medium' as const
      }
    ];
  }

  private generateRisks(analyses: any) {
    return [
      {
        title: 'Market Competition',
        description: 'Large incumbents may enter the market',
        severity: 'medium' as const
      },
      {
        title: 'Regulatory Risk',
        description: 'Potential regulatory hurdles in target markets',
        severity: 'medium' as const
      },
      {
        title: 'Execution Risk',
        description: 'Complex technology requires significant development',
        severity: 'low' as const
      }
    ];
  }
}

export const vcAnalysisService = new VCAnalysisService();