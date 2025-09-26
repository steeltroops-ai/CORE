import { VCAnalysisResult } from './vcAnalysisService';

export class ExportService {
  /**
   * Export investment memo as PDF
   */
  async exportInvestmentMemo(analysisData: VCAnalysisResult, companyName: string = 'Startup'): Promise<void> {
    try {
      // Create a formatted document for PDF export
      const memoContent = this.formatInvestmentMemo(analysisData, companyName);
      
      // In a real implementation, you would use a PDF library like jsPDF or Puppeteer
      // For now, we'll create a downloadable HTML file that can be printed to PDF
      this.downloadAsHTML(memoContent, `${companyName}_Investment_Memo.html`);
    } catch (error) {
      console.error('Failed to export investment memo:', error);
      throw new Error('Export failed. Please try again.');
    }
  }

  /**
   * Export pitch deck summary as PDF
   */
  async exportPitchSummary(analysisData: VCAnalysisResult, companyName: string = 'Startup'): Promise<void> {
    try {
      const summaryContent = this.formatPitchSummary(analysisData, companyName);
      this.downloadAsHTML(summaryContent, `${companyName}_Pitch_Summary.html`);
    } catch (error) {
      console.error('Failed to export pitch summary:', error);
      throw new Error('Export failed. Please try again.');
    }
  }

  /**
   * Export analysis data as JSON
   */
  async exportAnalysisData(analysisData: VCAnalysisResult, companyName: string = 'Startup'): Promise<void> {
    try {
      const jsonData = JSON.stringify(analysisData, null, 2);
      this.downloadAsFile(jsonData, `${companyName}_Analysis_Data.json`, 'application/json');
    } catch (error) {
      console.error('Failed to export analysis data:', error);
      throw new Error('Export failed. Please try again.');
    }
  }

  /**
   * Export executive summary as text
   */
  async exportExecutiveSummary(analysisData: VCAnalysisResult, companyName: string = 'Startup'): Promise<void> {
    try {
      const summary = this.formatExecutiveSummary(analysisData, companyName);
      this.downloadAsFile(summary, `${companyName}_Executive_Summary.txt`, 'text/plain');
    } catch (error) {
      console.error('Failed to export executive summary:', error);
      throw new Error('Export failed. Please try again.');
    }
  }

  private formatInvestmentMemo(analysisData: VCAnalysisResult, companyName: string): string {
    const currentDate = new Date().toLocaleDateString();
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Investment Memo - ${companyName}</title>
    <style>
        body { 
            font-family: 'Times New Roman', serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px; 
            line-height: 1.6; 
            color: #333;
        }
        .header { 
            text-align: center; 
            border-bottom: 2px solid #333; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
        }
        .section { 
            margin-bottom: 25px;
        }
        .section h2 { 
            color: #2c5aa0; 
            border-bottom: 1px solid #ddd; 
            padding-bottom: 5px;
        }
        .metrics {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin: 20px 0;
        }
        .metric-box {
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 5px;
            background: #f9f9f9;
        }
        .score {
            font-size: 24px;
            font-weight: bold;
            color: #2c5aa0;
        }
        .strengths, .risks {
            margin: 15px 0;
        }
        .strength-item, .risk-item {
            margin: 10px 0;
            padding: 10px;
            border-left: 4px solid #28a745;
            background: #f8f9fa;
        }
        .risk-item {
            border-left-color: #dc3545;
        }
        @media print {
            body { margin: 0; padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>INVESTMENT MEMORANDUM</h1>
        <h2>${companyName}</h2>
        <p>Date: ${currentDate}</p>
        <p>Confidential and Proprietary</p>
    </div>

    <div class="section">
        <h2>Executive Summary</h2>
        <div class="metrics">
            <div class="metric-box">
                <div class="score">${analysisData.overallScore}/100</div>
                <div>Overall VC Readiness</div>
            </div>
            <div class="metric-box">
                <div class="score">${analysisData.fundingReadiness}</div>
                <div>Funding Stage</div>
            </div>
            <div class="metric-box">
                <div class="score">${analysisData.valuation}</div>
                <div>Estimated Valuation</div>
            </div>
            <div class="metric-box">
                <div class="score">${analysisData.tam}</div>
                <div>Total Addressable Market</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Investment Thesis</h2>
        <p>${analysisData.investmentMemo}</p>
    </div>

    <div class="section">
        <h2>Key Performance Metrics</h2>
        <ul>
            <li><strong>Team Score:</strong> ${analysisData.teamScore}/100</li>
            <li><strong>Technology Score:</strong> ${analysisData.techScore}/100</li>
            <li><strong>Market Score:</strong> ${analysisData.marketScore}/100</li>
            <li><strong>Scalability Score:</strong> ${analysisData.scalabilityScore}/100</li>
            <li><strong>Risk Assessment:</strong> ${analysisData.riskScore}/100</li>
        </ul>
    </div>

    <div class="section">
        <h2>Market Opportunity</h2>
        <ul>
            <li><strong>TAM (Total Addressable Market):</strong> ${analysisData.tam}</li>
            <li><strong>SAM (Serviceable Addressable Market):</strong> ${analysisData.sam}</li>
            <li><strong>SOM (Serviceable Obtainable Market):</strong> ${analysisData.som}</li>
        </ul>
    </div>

    <div class="section">
        <h2>Key Strengths</h2>
        <div class="strengths">
            ${analysisData.strengths?.map(strength => `
                <div class="strength-item">
                    <strong>${strength.title}</strong><br>
                    ${strength.description}
                </div>
            `).join('') || '<p>No strengths identified</p>'}
        </div>
    </div>

    <div class="section">
        <h2>Key Risks</h2>
        <div class="risks">
            ${analysisData.risks?.map(risk => `
                <div class="risk-item">
                    <strong>${risk.title}</strong> (${risk.severity})<br>
                    ${risk.description}
                </div>
            `).join('') || '<p>No risks identified</p>'}
        </div>
    </div>

    <div class="section">
        <h2>Comparable Companies</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
                <tr style="background: #f8f9fa; border-bottom: 2px solid #ddd;">
                    <th style="padding: 10px; text-align: left;">Company</th>
                    <th style="padding: 10px; text-align: left;">Stage</th>
                    <th style="padding: 10px; text-align: left;">Funding</th>
                    <th style="padding: 10px; text-align: left;">Investors</th>
                </tr>
            </thead>
            <tbody>
                ${analysisData.comparableCompanies?.map(company => `
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 10px;">${company.name}</td>
                        <td style="padding: 10px;">${company.stage}</td>
                        <td style="padding: 10px;">${company.funding}</td>
                        <td style="padding: 10px;">${company.investors.join(', ')}</td>
                    </tr>
                `).join('') || '<tr><td colspan="4" style="padding: 10px; text-align: center;">No comparable companies found</td></tr>'}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>Recommendation</h2>
        <p><strong>Investment Recommendation:</strong> ${analysisData.overallScore >= 75 ? 'PROCEED' : analysisData.overallScore >= 60 ? 'PROCEED WITH CAUTION' : 'PASS'}</p>
        <p><strong>Suggested Next Steps:</strong> ${analysisData.overallScore >= 75 ? 'Initiate due diligence process and term sheet preparation.' : analysisData.overallScore >= 60 ? 'Conduct additional market validation and team assessment.' : 'Monitor for future development milestones.'}</p>
    </div>

    <footer style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px;">
        <p>This document contains confidential and proprietary information. Distribution is restricted.</p>
        <p>Generated on ${currentDate} by VC Lens Analysis Platform</p>
    </footer>
</body>
</html>
    `;
  }

  private formatPitchSummary(analysisData: VCAnalysisResult, companyName: string): string {
    const currentDate = new Date().toLocaleDateString();
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Pitch Deck Summary - ${companyName}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px; 
            line-height: 1.6;
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px;
        }
        .section { 
            margin-bottom: 25px; 
            padding: 20px; 
            border: 1px solid #ddd; 
            border-radius: 8px;
        }
        .section h3 { 
            color: #2c5aa0; 
            margin-top: 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>PITCH DECK ANALYSIS</h1>
        <h2>${companyName}</h2>
        <p>Date: ${currentDate}</p>
    </div>

    ${analysisData.deckAnalysis ? `
        <div class="section">
            <h3>Problem Statement</h3>
            <p>${analysisData.deckAnalysis.problem}</p>
        </div>

        <div class="section">
            <h3>Solution Approach</h3>
            <p>${analysisData.deckAnalysis.solution}</p>
        </div>

        <div class="section">
            <h3>Market Opportunity</h3>
            <p>${analysisData.deckAnalysis.market}</p>
        </div>

        <div class="section">
            <h3>Traction & Metrics</h3>
            <p>${analysisData.deckAnalysis.traction}</p>
        </div>

        <div class="section">
            <h3>Team Composition</h3>
            <p>${analysisData.deckAnalysis.team}</p>
        </div>
    ` : '<div class="section"><p>Pitch deck analysis not available. Please upload a pitch deck for detailed analysis.</p></div>'}

    <div class="section">
        <h3>Overall Assessment</h3>
        <p><strong>VC Readiness Score:</strong> ${analysisData.overallScore}/100</p>
        <p><strong>Funding Stage:</strong> ${analysisData.fundingReadiness}</p>
        <p><strong>Estimated Valuation:</strong> ${analysisData.valuation}</p>
    </div>
</body>
</html>
    `;
  }

  private formatExecutiveSummary(analysisData: VCAnalysisResult, companyName: string): string {
    const currentDate = new Date().toLocaleDateString();
    
    return `
EXECUTIVE SUMMARY - ${companyName}
Generated: ${currentDate}

=== OVERVIEW ===
VC Readiness Score: ${analysisData.overallScore}/100
Funding Stage: ${analysisData.fundingReadiness}
Estimated Valuation: ${analysisData.valuation}

=== MARKET OPPORTUNITY ===
Total Addressable Market (TAM): ${analysisData.tam}
Serviceable Addressable Market (SAM): ${analysisData.sam}
Serviceable Obtainable Market (SOM): ${analysisData.som}

=== PERFORMANCE METRICS ===
Team Score: ${analysisData.teamScore}/100
Technology Score: ${analysisData.techScore}/100
Market Score: ${analysisData.marketScore}/100
Scalability Score: ${analysisData.scalabilityScore}/100
Risk Assessment: ${analysisData.riskScore}/100

=== KEY STRENGTHS ===
${analysisData.strengths?.map((strength, index) => 
  `${index + 1}. ${strength.title}: ${strength.description}`
).join('\n') || 'No strengths identified'}

=== KEY RISKS ===
${analysisData.risks?.map((risk, index) => 
  `${index + 1}. ${risk.title} (${risk.severity}): ${risk.description}`
).join('\n') || 'No risks identified'}

=== INVESTMENT THESIS ===
${analysisData.investmentMemo}

=== COMPARABLE COMPANIES ===
${analysisData.comparableCompanies?.map(company => 
  `• ${company.name} (${company.stage}): ${company.funding} - ${company.investors.join(', ')}`
).join('\n') || 'No comparable companies found'}

=== RECOMMENDATION ===
${analysisData.overallScore >= 75 ? 'PROCEED - Strong investment opportunity' : 
  analysisData.overallScore >= 60 ? 'PROCEED WITH CAUTION - Moderate opportunity with risks' : 
  'PASS - Significant concerns identified'}

---
This summary was generated by VC Lens Analysis Platform
Confidential and Proprietary Information
    `;
  }

  private downloadAsHTML(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/html' });
    this.triggerDownload(blob, filename);
  }

  private downloadAsFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    this.triggerDownload(blob, filename);
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const exportService = new ExportService();

// Export utility functions for common export operations
export const exportUtils = {
  /**
   * Quick export investment memo
   */
  async exportMemo(analysisData: VCAnalysisResult, companyName?: string) {
    return exportService.exportInvestmentMemo(analysisData, companyName);
  },

  /**
   * Quick export pitch summary
   */
  async exportPitch(analysisData: VCAnalysisResult, companyName?: string) {
    return exportService.exportPitchSummary(analysisData, companyName);
  },

  /**
   * Quick export analysis data
   */
  async exportData(analysisData: VCAnalysisResult, companyName?: string) {
    return exportService.exportAnalysisData(analysisData, companyName);
  },

  /**
   * Quick export executive summary
   */
  async exportSummary(analysisData: VCAnalysisResult, companyName?: string) {
    return exportService.exportExecutiveSummary(analysisData, companyName);
  }
};