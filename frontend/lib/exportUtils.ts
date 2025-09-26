import { GTMAnalysisResult } from './gtmAnalysisService';
import { VCAnalysisResult } from './vcAnalysisService';

/**
 * Utility functions for exporting GTM analysis results
 */
export class ExportUtils {
  /**
   * Export GTM strategy memo as HTML
   */
  static async exportMemo(analysisData: GTMAnalysisResult | null, title: string = 'GTM Strategy'): Promise<void> {
    if (!analysisData) {
      console.warn('No analysis data available for export');
      return;
    }

    try {
      const memoContent = this.formatGTMStrategyMemo(analysisData, title);
      this.downloadAsHTML(memoContent, `${title.replace(/\s+/g, '_')}_Strategy.html`);
    } catch (error) {
      console.error('Failed to export GTM strategy memo:', error);
      throw new Error('Export failed. Please try again.');
    }
  }

  /**
   * Export launch plan as HTML
   */
  static async exportPitch(analysisData: GTMAnalysisResult | null, title: string = 'Launch Plan'): Promise<void> {
    if (!analysisData) {
      console.warn('No analysis data available for export');
      return;
    }

    try {
      const launchContent = this.formatLaunchPlan(analysisData, title);
      this.downloadAsHTML(launchContent, `${title.replace(/\s+/g, '_')}_Launch_Plan.html`);
    } catch (error) {
      console.error('Failed to export launch plan:', error);
      throw new Error('Export failed. Please try again.');
    }
  }

  /**
   * Export sales playbook as HTML
   */
  static async exportSummary(analysisData: GTMAnalysisResult | null, title: string = 'Sales Playbook'): Promise<void> {
    if (!analysisData) {
      console.warn('No analysis data available for export');
      return;
    }

    try {
      const playbookContent = this.formatSalesPlaybook(analysisData, title);
      this.downloadAsHTML(playbookContent, `${title.replace(/\s+/g, '_')}_Playbook.html`);
    } catch (error) {
      console.error('Failed to export sales playbook:', error);
      throw new Error('Export failed. Please try again.');
    }
  }

  /**
   * Export complete GTM data as JSON
   */
  static async exportData(analysisData: GTMAnalysisResult | null, title: string = 'GTM Analysis'): Promise<void> {
    if (!analysisData) {
      console.warn('No analysis data available for export');
      return;
    }

    try {
      const jsonData = JSON.stringify(analysisData, null, 2);
      this.downloadAsFile(jsonData, `${title.replace(/\s+/g, '_')}_Data.json`, 'application/json');
    } catch (error) {
      console.error('Failed to export GTM data:', error);
      throw new Error('Export failed. Please try again.');
    }
  }

  private static formatGTMStrategyMemo(analysisData: GTMAnalysisResult, title: string): string {
    const currentDate = new Date().toLocaleDateString();
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>${title} - GTM Strategy Memo</title>
    <style>
        body { 
            font-family: 'Arial', sans-serif; 
            max-width: 900px; 
            margin: 0 auto; 
            padding: 40px; 
            line-height: 1.6; 
            color: #333;
        }
        .header { 
            text-align: center; 
            border-bottom: 3px solid #2563eb; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
        }
        .section { 
            margin-bottom: 25px;
        }
        .section h2 { 
            color: #2563eb; 
            border-bottom: 1px solid #e5e7eb; 
            padding-bottom: 5px;
        }
        .metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .metric-box {
            border: 1px solid #e5e7eb;
            padding: 15px;
            border-radius: 8px;
            background: #f8fafc;
            text-align: center;
        }
        .score {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
        }
        .strategy-content {
            background: #f1f5f9;
            padding: 20px;
            border-radius: 8px;
            margin: 15px 0;
        }
        @media print {
            body { margin: 0; padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>GO-TO-MARKET STRATEGY</h1>
        <h2>${title}</h2>
        <p>Date: ${currentDate}</p>
        <p>Confidential Business Strategy Document</p>
    </div>

    <div class="section">
        <h2>Executive Summary</h2>
        <div class="metrics">
            <div class="metric-box">
                <div class="score">${analysisData.overallScore}/100</div>
                <div>Overall GTM Score</div>
            </div>
            <div class="metric-box">
                <div class="score">${analysisData.marketOpportunityScore}/100</div>
                <div>Market Opportunity</div>
            </div>
            <div class="metric-box">
                <div class="score">${analysisData.productMarketFitScore}/100</div>
                <div>Product-Market Fit</div>
            </div>
            <div class="metric-box">
                <div class="score">${analysisData.executionReadinessScore}/100</div>
                <div>Execution Readiness</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Market Opportunity</h2>
        <div class="strategy-content">
            <p><strong>Total Addressable Market (TAM):</strong> ${analysisData.gtmStrategy?.marketSizing?.tam || 'Not specified'}</p>
            <p><strong>Serviceable Addressable Market (SAM):</strong> ${analysisData.gtmStrategy?.marketSizing?.sam || 'Not specified'}</p>
            <p><strong>Serviceable Obtainable Market (SOM):</strong> ${analysisData.gtmStrategy?.marketSizing?.som || 'Not specified'}</p>
            <p><strong>Market Growth Rate:</strong> ${analysisData.gtmStrategy?.marketSizing?.growthRate || 'Not specified'}</p>
        </div>
    </div>

    <div class="section">
        <h2>GTM Strategy Document</h2>
        <div class="strategy-content">
            ${analysisData.gtmDocuments?.strategyDocument || 'Strategy document content will be generated based on analysis results.'}
        </div>
    </div>

    <div class="section">
        <h2>Value Proposition</h2>
        <div class="strategy-content">
            <p><strong>Core Value:</strong> ${analysisData.gtmStrategy?.valueProposition?.coreValue || 'Not defined'}</p>
            <p><strong>Key Differentiators:</strong></p>
            <ul>
                ${analysisData.gtmStrategy?.valueProposition?.differentiators?.map(diff => `<li>${diff}</li>`).join('') || '<li>No differentiators specified</li>'}
            </ul>
        </div>
    </div>

    <div class="section">
        <h2>Customer Segments</h2>
        <div class="strategy-content">
            ${analysisData.gtmStrategy?.customerSegmentation?.map(segment => `
                <div style="margin-bottom: 15px; padding: 10px; border-left: 4px solid #2563eb; background: white;">
                    <h4>${segment.segment} (${segment.priority})</h4>
                    <p><strong>Size:</strong> ${segment.size}</p>
                    <p><strong>Characteristics:</strong> ${segment.characteristics.join(', ')}</p>
                    <p><strong>Pain Points:</strong> ${segment.painPoints.join(', ')}</p>
                </div>
            `).join('') || '<p>No customer segments defined</p>'}
        </div>
    </div>

    <div class="section">
        <h2>Recommendations</h2>
        <div class="strategy-content">
            ${analysisData.recommendations?.map(rec => `
                <div style="margin-bottom: 10px; padding: 10px; border-left: 4px solid ${rec.priority === 'high' ? '#dc2626' : rec.priority === 'medium' ? '#f59e0b' : '#10b981'}; background: white;">
                    <strong>${rec.category}:</strong> ${rec.recommendation}
                    <br><small>Priority: ${rec.priority} | Timeline: ${rec.timeline}</small>
                </div>
            `).join('') || '<p>No recommendations available</p>'}
        </div>
    </div>
</body>
</html>
    `;
  }

  private static formatLaunchPlan(analysisData: GTMAnalysisResult, title: string): string {
    const currentDate = new Date().toLocaleDateString();
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>${title} - Launch Plan</title>
    <style>
        body { 
            font-family: 'Arial', sans-serif; 
            max-width: 900px; 
            margin: 0 auto; 
            padding: 40px; 
            line-height: 1.6; 
            color: #333;
        }
        .header { 
            text-align: center; 
            border-bottom: 3px solid #3b82f6; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
        }
        .timeline-item {
            margin-bottom: 20px;
            padding: 15px;
            border-left: 4px solid #3b82f6;
            background: #f8fafc;
        }
        .phase-title {
            font-size: 18px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
        }
        .duration {
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            margin-left: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>PRODUCT LAUNCH PLAN</h1>
        <h2>${title}</h2>
        <p>Date: ${currentDate}</p>
    </div>

    <div class="section">
        <h2>Launch Timeline</h2>
        ${analysisData.gtmDocuments?.launchPlan?.timeline?.map(phase => `
            <div class="timeline-item">
                <div class="phase-title">
                    ${phase.phase}
                    <span class="duration">${phase.duration}</span>
                </div>
                <p><strong>Milestones:</strong> ${phase.milestones.join(', ')}</p>
                <p><strong>Dependencies:</strong> ${phase.dependencies.join(', ')}</p>
                <p><strong>Success Metrics:</strong> ${phase.successMetrics.join(', ')}</p>
            </div>
        `).join('') || '<p>No launch timeline available</p>'}
    </div>

    <div class="section">
        <h2>Budget & Resources</h2>
        <p><strong>Budget:</strong> ${analysisData.gtmDocuments?.launchPlan?.budget || 'Not specified'}</p>
        <p><strong>Required Resources:</strong></p>
        <ul>
            ${analysisData.gtmDocuments?.launchPlan?.resources?.map(resource => `<li>${resource}</li>`).join('') || '<li>No resources specified</li>'}
        </ul>
    </div>
</body>
</html>
    `;
  }

  private static formatSalesPlaybook(analysisData: GTMAnalysisResult, title: string): string {
    const currentDate = new Date().toLocaleDateString();
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>${title} - Sales Playbook</title>
    <style>
        body { 
            font-family: 'Arial', sans-serif; 
            max-width: 900px; 
            margin: 0 auto; 
            padding: 40px; 
            line-height: 1.6; 
            color: #333;
        }
        .header { 
            text-align: center; 
            border-bottom: 3px solid #7c3aed; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
        }
        .persona-card {
            margin-bottom: 20px;
            padding: 15px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: #faf5ff;
        }
        .persona-title {
            font-size: 18px;
            font-weight: bold;
            color: #7c3aed;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>SALES PLAYBOOK</h1>
        <h2>${title}</h2>
        <p>Date: ${currentDate}</p>
    </div>

    <div class="section">
        <h2>Customer Profiles</h2>
        ${analysisData.gtmDocuments?.salesPlaybook?.customerProfiles?.map(profile => `
            <div class="persona-card">
                <div class="persona-title">${profile.persona}</div>
                <p><strong>Characteristics:</strong> ${profile.characteristics.join(', ')}</p>
                <p><strong>Pain Points:</strong> ${profile.painPoints.join(', ')}</p>
                <p><strong>Buying Process:</strong> ${profile.buyingProcess}</p>
            </div>
        `).join('') || '<p>No customer profiles available</p>'}
    </div>

    <div class="section">
        <h2>Sales Process</h2>
        <ol>
            ${analysisData.gtmDocuments?.salesPlaybook?.salesProcess?.map(step => `<li>${step}</li>`).join('') || '<li>No sales process defined</li>'}
        </ol>
    </div>

    <div class="section">
        <h2>Objection Handling</h2>
        ${analysisData.gtmDocuments?.salesPlaybook?.objectionHandling?.map(obj => `
            <div style="margin-bottom: 15px; padding: 10px; border-left: 4px solid #7c3aed; background: #faf5ff;">
                <p><strong>Objection:</strong> ${obj.objection}</p>
                <p><strong>Response:</strong> ${obj.response}</p>
            </div>
        `).join('') || '<p>No objection handling strategies available</p>'}
    </div>
</body>
</html>
    `;
  }

  private static downloadAsHTML(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private static downloadAsFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
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

// Export default instance for convenience
export const exportUtils = ExportUtils;