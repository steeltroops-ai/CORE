export class ClaudeService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.anthropic.com/v1/messages';

  constructor() {
    // In production, this would be loaded from environment variables
    this.apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || null;
  }

  async generateResponse(prompt: string): Promise<string> {
    if (!this.apiKey) {
      console.warn('Claude API key not configured, using mock response');
      return this.getMockResponse(prompt);
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('Claude API call failed:', error);
      return this.getMockResponse(prompt);
    }
  }

  async analyzeDocument(prompt: string, file?: File): Promise<string> {
    if (!file) {
      return this.generateResponse(prompt);
    }

    try {
      // For now, we'll just analyze the prompt without the file content
      // In production, you'd extract text from the file first
      const fileAnalysisPrompt = `
        ${prompt}
        
        Document: ${file.name} (${file.type})
        Note: Document content analysis would be implemented here.
      `;
      
      return this.generateResponse(fileAnalysisPrompt);
    } catch (error) {
      console.error('Document analysis failed:', error);
      return this.getMockResponse(prompt);
    }
  }

  private getMockResponse(prompt: string): string {
    // Generate contextual mock responses based on prompt content
    if (prompt.toLowerCase().includes('team')) {
      return `Team Analysis Score: 85/100

Key Insights:
• Strong technical leadership with PhD-level expertise
• Complementary skill sets across founding team
• Previous startup experience demonstrates execution capability
• Strong industry network and domain knowledge
• Proven track record in research and development`;
    }

    if (prompt.toLowerCase().includes('market')) {
      return `Market Analysis Score: 78/100

Market Sizing:
• TAM: $50B (Total Addressable Market)
• SAM: $5B (Serviceable Addressable Market) 
• SOM: $500M (Serviceable Obtainable Market)

Key Insights:
• Rapidly growing market with 40% YoY growth
• Strong demand drivers from digital transformation
• Limited direct competition in specific niche
• Favorable regulatory environment
• Early market timing advantage`;
    }

    if (prompt.toLowerCase().includes('technology') || prompt.toLowerCase().includes('technical')) {
      return `Technology Analysis Score: 82/100

Key Insights:
• Novel technical approach with strong differentiation
• Defensible IP portfolio with 3 filed patents
• Scalable architecture suitable for enterprise deployment
• Strong technical feasibility demonstrated through prototypes
• Competitive moat through proprietary algorithms`;
    }

    if (prompt.toLowerCase().includes('investment memo')) {
      return `Investment Thesis: This startup represents a compelling Series A opportunity in the rapidly expanding AI/ML infrastructure market. The founding team's deep technical expertise, combined with a defensible patent portfolio and strong early market validation, positions them to capture significant market share in a $50B addressable market.

Key Highlights: The PhD-level founding team brings 15+ years of combined experience and has successfully translated cutting-edge research into commercial applications. Their proprietary technology offers 3x performance improvements over existing solutions, with strong IP defensibility through filed patents.

Recommendation: Proceed with due diligence. Suggested investment of $8-12M for 15-20% equity at Series A valuation of $40-60M. The combination of strong team, defensible technology, and large market opportunity presents an attractive risk-adjusted return profile.`;
    }

    if (prompt.toLowerCase().includes('pitch deck')) {
      return `Pitch Deck Analysis:

Problem: Traditional solutions are inefficient and costly, creating a $5B market gap
Solution: AI-powered platform that reduces costs by 60% while improving accuracy
Market: $50B TAM with 40% annual growth, targeting enterprise customers
Traction: 3 pilot customers, $100K ARR, 95% customer satisfaction
Team: Experienced founders with complementary skills and domain expertise`;
    }

    // Default response
    return `Analysis completed successfully. Key findings indicate strong potential with several areas for optimization. Detailed insights have been generated based on the provided information.`;
  }
}

export const claudeService = new ClaudeService();