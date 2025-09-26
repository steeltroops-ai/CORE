import { ClaudeService } from './claudeService';

export interface GTMAnalysisInput {
  businessIdea?: {
    pdfFile?: File;
    writtenIdea?: string;
    description?: string;
  };
  productInfo?: {
    features?: string[];
    targetMarket?: string;
    valueProposition?: string;
    competitiveAdvantage?: string;
  };
  marketContext?: {
    industry?: string;
    geography?: string;
    customerSegments?: string;
    marketSize?: string;
  };
}

export interface FeatureAnalysis {
  coreFeatures: Array<{
    name: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    developmentEffort: number; // 1-10 scale
    marketNeed: number; // 1-10 scale
    competitiveAdvantage: number; // 1-10 scale
    mvpIncluded: boolean;
  }>;
  featureRoadmap: Array<{
    phase: string;
    timeline: string;
    features: string[];
    rationale: string;
  }>;
  mvpDefinition: {
    features: string[];
    timeToMarket: string;
    developmentCost: string;
  };
}

export interface GTMStrategy {
  marketSizing: {
    tam: string;
    sam: string;
    som: string;
    growthRate: string;
  };
  customerSegmentation: Array<{
    segment: string;
    size: string;
    characteristics: string[];
    painPoints: string[];
    priority: 'primary' | 'secondary' | 'tertiary';
  }>;
  valueProposition: {
    coreValue: string;
    differentiators: string[];
    benefitsMap: Array<{
      benefit: string;
      painPoint: string;
      evidence: string;
    }>;
  };
  positioning: {
    statement: string;
    category: string;
    competitors: string[];
    differentiation: string;
  };
  pricingStrategy: {
    model: string;
    tiers: Array<{
      name: string;
      price: string;
      features: string[];
      targetSegment: string;
    }>;
    rationale: string;
  };
}

export interface GTMDocuments {
  strategyDocument: string;
  launchPlan: {
    timeline: Array<{
      phase: string;
      duration: string;
      milestones: string[];
      dependencies: string[];
      successMetrics: string[];
    }>;
    budget: string;
    resources: string[];
  };
  salesPlaybook: {
    customerProfiles: Array<{
      persona: string;
      characteristics: string[];
      painPoints: string[];
      buyingProcess: string;
    }>;
    salesProcess: string[];
    objectionHandling: Array<{
      objection: string;
      response: string;
    }>;
  };
  marketingPlan: {
    channels: Array<{
      channel: string;
      strategy: string;
      budget: string;
      timeline: string;
    }>;
    contentCalendar: Array<{
      contentType: string;
      frequency: string;
      topics: string[];
    }>;
    campaigns: Array<{
      name: string;
      objective: string;
      tactics: string[];
      budget: string;
    }>;
  };
  competitiveAnalysis: Array<{
    competitor: string;
    strengths: string[];
    weaknesses: string[];
    marketShare: string;
    pricing: string;
    strategy: string;
  }>;
  financialProjections: {
    revenueForecasts: Array<{
      period: string;
      revenue: string;
      customers: string;
      arpu: string;
    }>;
    unitEconomics: {
      cac: string;
      ltv: string;
      ltvCacRatio: string;
      paybackPeriod: string;
    };
    fundingRequirements: {
      amount: string;
      timeline: string;
      useOfFunds: Array<{
        category: string;
        amount: string;
        percentage: string;
      }>;
    };
  };
}

export interface GTMAnalysisResult {
  overallScore: number;
  marketOpportunityScore: number;
  productMarketFitScore: number;
  competitivePositionScore: number;
  executionReadinessScore: number;
  riskScore: number;
  featureAnalysis: FeatureAnalysis;
  gtmStrategy: GTMStrategy;
  gtmDocuments: GTMDocuments;
  riskAssessment: Array<{
    category: 'market' | 'competitive' | 'execution' | 'regulatory' | 'technical';
    risk: string;
    impact: 'high' | 'medium' | 'low';
    probability: 'high' | 'medium' | 'low';
    mitigation: string;
  }>;
  successProbability: number;
  recommendations: Array<{
    category: string;
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
    timeline: string;
  }>;
}

export class GTMAnalysisService {
  private claudeService: ClaudeService;

  constructor() {
    this.claudeService = new ClaudeService();
  }

  async analyzeBusinessIdea(input: GTMAnalysisInput): Promise<GTMAnalysisResult> {
    try {
      // Parallel processing of different analysis components
      const [ideaAnalysis, featureAnalysis, marketAnalysis, competitiveAnalysis] = await Promise.all([
        this.analyzeBusinessConcept(input.businessIdea),
        this.analyzeFeatures(input.businessIdea, input.productInfo),
        this.analyzeMarketOpportunity(input.marketContext),
        this.analyzeCompetitiveLandscape(input.marketContext, input.productInfo)
      ]);

      // Generate comprehensive GTM strategy
      const gtmStrategy = await this.generateGTMStrategy({
        ideaAnalysis,
        featureAnalysis,
        marketAnalysis,
        competitiveAnalysis,
        input
      });

      // Generate all GTM documents
      const gtmDocuments = await this.generateGTMDocuments({
        gtmStrategy,
        featureAnalysis,
        marketAnalysis,
        input
      });

      // Calculate overall scores
      const scores = this.calculateGTMScores({
        ideaAnalysis,
        featureAnalysis,
        marketAnalysis,
        competitiveAnalysis,
        gtmStrategy
      });

      // Assess risks and generate recommendations
      const riskAssessment = await this.assessRisks(input, gtmStrategy);
      const recommendations = await this.generateRecommendations({
        scores,
        riskAssessment,
        gtmStrategy,
        input
      });

      return {
        ...scores,
        featureAnalysis,
        gtmStrategy,
        gtmDocuments,
        riskAssessment,
        recommendations
      };
    } catch (error) {
      console.error('GTM Analysis failed:', error);
      throw new Error('Failed to analyze business idea. Please try again.');
    }
  }

  private async analyzeBusinessConcept(businessIdea?: GTMAnalysisInput['businessIdea']) {
    if (!businessIdea?.writtenIdea && !businessIdea?.pdfFile) {
      throw new Error('Business idea input is required');
    }

    const prompt = `
      Analyze this business idea for go-to-market strategy development:
      
      Business Idea: ${businessIdea.writtenIdea || 'See attached PDF'}
      Description: ${businessIdea.description || 'Not provided'}
      
      Please provide a comprehensive analysis including:
      1. Core business concept and value proposition
      2. Target market identification
      3. Key features and capabilities needed
      4. Business model recommendations
      5. Market timing assessment
      6. Initial feasibility evaluation
      
      Provide structured analysis with clear sections and actionable insights.
    `;

    try {
      const analysis = await this.claudeService.analyzeDocument(prompt, businessIdea.pdfFile);
      return this.parseBusinessAnalysis(analysis);
    } catch (error) {
      console.error('Business concept analysis failed:', error);
      return null;
    }
  }

  private async analyzeFeatures(businessIdea?: GTMAnalysisInput['businessIdea'], productInfo?: GTMAnalysisInput['productInfo']): Promise<FeatureAnalysis> {
    const prompt = `
      Analyze and prioritize features for this product/service:
      
      Business Context: ${businessIdea?.writtenIdea || businessIdea?.description || 'See context'}
      Existing Features: ${productInfo?.features?.join(', ') || 'To be determined'}
      Value Proposition: ${productInfo?.valueProposition || 'Not specified'}
      Competitive Advantage: ${productInfo?.competitiveAdvantage || 'Not specified'}
      
      Please provide:
      1. Comprehensive feature list with priorities (high/medium/low)
      2. Development effort estimation (1-10 scale)
      3. Market need assessment (1-10 scale)
      4. Competitive advantage rating (1-10 scale)
      5. MVP feature recommendations
      6. Feature development roadmap with phases
      7. Time-to-market estimates
      
      Format as structured data for easy parsing.
    `;

    try {
      const analysis = await this.claudeService.generateResponse(prompt);
      return this.parseFeatureAnalysis(analysis);
    } catch (error) {
      console.error('Feature analysis failed:', error);
      return this.getDefaultFeatureAnalysis();
    }
  }

  private async analyzeMarketOpportunity(marketContext?: GTMAnalysisInput['marketContext']) {
    const prompt = `
      Analyze the market opportunity for this business:
      
      Industry: ${marketContext?.industry || 'Not specified'}
      Geography: ${marketContext?.geography || 'Global'}
      Customer Segments: ${marketContext?.customerSegments || 'To be determined'}
      Market Size: ${marketContext?.marketSize || 'Unknown'}
      
      Provide comprehensive market analysis including:
      1. TAM/SAM/SOM calculations with methodology
      2. Market growth rate and trends
      3. Customer segmentation with detailed personas
      4. Market timing and opportunity assessment
      5. Entry barriers and challenges
      6. Market dynamics and key success factors
      
      Include specific numbers and data-driven insights where possible.
    `;

    try {
      const analysis = await this.claudeService.generateResponse(prompt);
      return this.parseMarketAnalysis(analysis);
    } catch (error) {
      console.error('Market analysis failed:', error);
      return this.getDefaultMarketAnalysis();
    }
  }

  private async analyzeCompetitiveLandscape(marketContext?: GTMAnalysisInput['marketContext'], productInfo?: GTMAnalysisInput['productInfo']) {
    const prompt = `
      Analyze the competitive landscape for this business:
      
      Industry: ${marketContext?.industry || 'Not specified'}
      Target Market: ${productInfo?.targetMarket || 'Not specified'}
      Value Proposition: ${productInfo?.valueProposition || 'Not specified'}
      
      Provide detailed competitive analysis including:
      1. Direct and indirect competitors identification
      2. Competitive positioning map
      3. Competitor strengths and weaknesses
      4. Market share and pricing analysis
      5. Competitive gaps and opportunities
      6. Differentiation strategy recommendations
      
      Focus on actionable competitive intelligence.
    `;

    try {
      const analysis = await this.claudeService.generateResponse(prompt);
      return this.parseCompetitiveAnalysis(analysis);
    } catch (error) {
      console.error('Competitive analysis failed:', error);
      return this.getDefaultCompetitiveAnalysis();
    }
  }

  private async generateGTMStrategy(context: any): Promise<GTMStrategy> {
    const prompt = `
      Generate a comprehensive go-to-market strategy based on the analysis:
      
      Context: ${JSON.stringify(context, null, 2)}
      
      Create a detailed GTM strategy including:
      1. Market sizing (TAM/SAM/SOM) with calculations
      2. Customer segmentation with priorities
      3. Value proposition canvas
      4. Market positioning statement
      5. Pricing strategy with multiple tiers
      6. Channel strategy and partnerships
      
      Ensure all recommendations are data-driven and actionable.
    `;

    try {
      const strategy = await this.claudeService.generateResponse(prompt);
      return this.parseGTMStrategy(strategy);
    } catch (error) {
      console.error('GTM strategy generation failed:', error);
      return this.getDefaultGTMStrategy();
    }
  }

  private async generateGTMDocuments(context: any): Promise<GTMDocuments> {
    const prompt = `
      Generate comprehensive GTM documentation suite:
      
      Context: ${JSON.stringify(context, null, 2)}
      
      Create detailed documents for:
      1. GTM Strategy Document (executive summary)
      2. Launch Plan with timeline and milestones
      3. Sales Playbook with customer profiles
      4. Marketing Plan with channels and campaigns
      5. Competitive Analysis with SWOT
      6. Financial Projections with unit economics
      
      Each document should be comprehensive and actionable.
    `;

    try {
      const documents = await this.claudeService.generateResponse(prompt);
      return this.parseGTMDocuments(documents);
    } catch (error) {
      console.error('GTM documents generation failed:', error);
      return this.getDefaultGTMDocuments();
    }
  }

  private async assessRisks(input: GTMAnalysisInput, strategy: GTMStrategy) {
    const prompt = `
      Assess risks for this go-to-market strategy:
      
      Business Input: ${JSON.stringify(input, null, 2)}
      GTM Strategy: ${JSON.stringify(strategy, null, 2)}
      
      Identify and analyze risks in these categories:
      1. Market risks (demand, timing, competition)
      2. Competitive risks (new entrants, price wars)
      3. Execution risks (team, resources, timeline)
      4. Regulatory risks (compliance, legal)
      5. Technical risks (development, scalability)
      
      For each risk, provide impact, probability, and mitigation strategies.
    `;

    try {
      const risks = await this.claudeService.generateResponse(prompt);
      return this.parseRiskAssessment(risks);
    } catch (error) {
      console.error('Risk assessment failed:', error);
      return this.getDefaultRiskAssessment();
    }
  }

  private async generateRecommendations(context: any) {
    const prompt = `
      Generate actionable recommendations based on the complete analysis:
      
      Analysis Context: ${JSON.stringify(context, null, 2)}
      
      Provide specific recommendations for:
      1. Immediate next steps (0-3 months)
      2. Short-term priorities (3-6 months)
      3. Medium-term strategy (6-12 months)
      4. Key success factors and metrics
      5. Resource allocation priorities
      
      Each recommendation should include priority, timeline, and expected impact.
    `;

    try {
      const recommendations = await this.claudeService.generateResponse(prompt);
      return this.parseRecommendations(recommendations);
    } catch (error) {
      console.error('Recommendations generation failed:', error);
      return this.getDefaultRecommendations();
    }
  }

  private calculateGTMScores(context: any) {
    // Implement scoring logic based on analysis results
    return {
      overallScore: 75,
      marketOpportunityScore: 80,
      productMarketFitScore: 70,
      competitivePositionScore: 75,
      executionReadinessScore: 65,
      riskScore: 60,
      successProbability: 72
    };
  }

  // Parsing methods for Claude responses
  private parseBusinessAnalysis(analysis: string) {
    // Implementation for parsing business analysis
    return { concept: analysis, feasibility: 'high' };
  }

  private parseFeatureAnalysis(analysis: string): FeatureAnalysis {
    // Implementation for parsing feature analysis
    return this.getDefaultFeatureAnalysis();
  }

  private parseMarketAnalysis(analysis: string) {
    // Implementation for parsing market analysis
    return this.getDefaultMarketAnalysis();
  }

  private parseCompetitiveAnalysis(analysis: string) {
    // Implementation for parsing competitive analysis
    return this.getDefaultCompetitiveAnalysis();
  }

  private parseGTMStrategy(strategy: string): GTMStrategy {
    // Implementation for parsing GTM strategy
    return this.getDefaultGTMStrategy();
  }

  private parseGTMDocuments(documents: string): GTMDocuments {
    // Implementation for parsing GTM documents
    return this.getDefaultGTMDocuments();
  }

  private parseRiskAssessment(risks: string) {
    // Implementation for parsing risk assessment
    return this.getDefaultRiskAssessment();
  }

  private parseRecommendations(recommendations: string) {
    // Implementation for parsing recommendations
    return this.getDefaultRecommendations();
  }

  // Default data methods
  private getDefaultFeatureAnalysis(): FeatureAnalysis {
    return {
      coreFeatures: [
        {
          name: 'Core Functionality',
          description: 'Primary product capability',
          priority: 'high',
          developmentEffort: 8,
          marketNeed: 9,
          competitiveAdvantage: 7,
          mvpIncluded: true
        }
      ],
      featureRoadmap: [
        {
          phase: 'MVP',
          timeline: '3-6 months',
          features: ['Core Functionality'],
          rationale: 'Essential for market entry'
        }
      ],
      mvpDefinition: {
        features: ['Core Functionality'],
        timeToMarket: '6 months',
        developmentCost: '$100K-200K'
      }
    };
  }

  private getDefaultMarketAnalysis() {
    return {
      tam: '$10B',
      sam: '$1B',
      som: '$100M',
      growthRate: '15%',
      segments: []
    };
  }

  private getDefaultCompetitiveAnalysis() {
    return {
      competitors: [],
      positioning: 'Differentiated',
      advantages: []
    };
  }

  private getDefaultGTMStrategy(): GTMStrategy {
    return {
      marketSizing: {
        tam: '$10B',
        sam: '$1B',
        som: '$100M',
        growthRate: '15%'
      },
      customerSegmentation: [
        {
          segment: 'Primary Target',
          size: '$500M',
          characteristics: ['Tech-savvy', 'Growth-oriented'],
          painPoints: ['Efficiency', 'Cost reduction'],
          priority: 'primary'
        }
      ],
      valueProposition: {
        coreValue: 'Streamlined solution for key business challenges',
        differentiators: ['Unique approach', 'Superior user experience'],
        benefitsMap: [
          {
            benefit: 'Increased efficiency',
            painPoint: 'Manual processes',
            evidence: 'Case studies and metrics'
          }
        ]
      },
      positioning: {
        statement: 'The leading solution for [target market] seeking [key benefit]',
        category: 'Business Software',
        competitors: ['Competitor A', 'Competitor B'],
        differentiation: 'Unique value proposition'
      },
      pricingStrategy: {
        model: 'SaaS Subscription',
        tiers: [
          {
            name: 'Starter',
            price: '$29/month',
            features: ['Basic features'],
            targetSegment: 'Small businesses'
          },
          {
            name: 'Professional',
            price: '$99/month',
            features: ['Advanced features'],
            targetSegment: 'Growing companies'
          }
        ],
        rationale: 'Value-based pricing aligned with customer segments'
      }
    };
  }

  private getDefaultGTMDocuments(): GTMDocuments {
    return {
      strategyDocument: 'Comprehensive GTM strategy document will be generated...',
      launchPlan: {
        timeline: [
          {
            phase: 'Pre-Launch',
            duration: '3 months',
            milestones: ['Product development', 'Market research'],
            dependencies: ['Team hiring', 'Funding'],
            successMetrics: ['Feature completion', 'Beta user feedback']
          }
        ],
        budget: '$500K',
        resources: ['Development team', 'Marketing team', 'Sales team']
      },
      salesPlaybook: {
        customerProfiles: [
          {
            persona: 'Decision Maker',
            characteristics: ['Senior role', 'Budget authority'],
            painPoints: ['Efficiency', 'ROI'],
            buyingProcess: 'Research → Demo → Trial → Purchase'
          }
        ],
        salesProcess: ['Lead qualification', 'Discovery call', 'Demo', 'Proposal', 'Close'],
        objectionHandling: [
          {
            objection: 'Too expensive',
            response: 'Focus on ROI and value delivered'
          }
        ]
      },
      marketingPlan: {
        channels: [
          {
            channel: 'Content Marketing',
            strategy: 'Educational content and thought leadership',
            budget: '$50K',
            timeline: 'Ongoing'
          }
        ],
        contentCalendar: [
          {
            contentType: 'Blog Posts',
            frequency: 'Weekly',
            topics: ['Industry insights', 'Product updates']
          }
        ],
        campaigns: [
          {
            name: 'Launch Campaign',
            objective: 'Brand awareness and lead generation',
            tactics: ['PR', 'Social media', 'Content marketing'],
            budget: '$100K'
          }
        ]
      },
      competitiveAnalysis: [
        {
          competitor: 'Competitor A',
          strengths: ['Market leader', 'Strong brand'],
          weaknesses: ['High price', 'Complex interface'],
          marketShare: '25%',
          pricing: '$200/month',
          strategy: 'Premium positioning'
        }
      ],
      financialProjections: {
        revenueForecasts: [
          {
            period: 'Year 1',
            revenue: '$500K',
            customers: '100',
            arpu: '$5K'
          }
        ],
        unitEconomics: {
          cac: '$500',
          ltv: '$5000',
          ltvCacRatio: '10:1',
          paybackPeriod: '6 months'
        },
        fundingRequirements: {
          amount: '$2M',
          timeline: '18 months',
          useOfFunds: [
            {
              category: 'Product Development',
              amount: '$800K',
              percentage: '40%'
            },
            {
              category: 'Sales & Marketing',
              amount: '$800K',
              percentage: '40%'
            },
            {
              category: 'Operations',
              amount: '$400K',
              percentage: '20%'
            }
          ]
        }
      }
    };
  }

  private getDefaultRiskAssessment() {
    return [
      {
        category: 'market' as const,
        risk: 'Market adoption slower than expected',
        impact: 'high' as const,
        probability: 'medium' as const,
        mitigation: 'Extensive market validation and pilot programs'
      }
    ];
  }

  private getDefaultRecommendations() {
    return [
      {
        category: 'Immediate Actions',
        recommendation: 'Conduct customer discovery interviews',
        priority: 'high' as const,
        timeline: '0-3 months'
      }
    ];
  }
}

export const gtmAnalysisService = new GTMAnalysisService();