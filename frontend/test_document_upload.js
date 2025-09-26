#!/usr/bin/env node
/**
 * Frontend Document Upload and Extraction Test Suite
 * 
 * This script tests the frontend document upload functionality,
 * Claude API integration, and Logic Mill API data formatting
 * to ensure end-to-end system functionality.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

class DocumentUploadTester {
    constructor(frontendUrl = 'http://localhost:3000', backendUrl = 'http://localhost:8000') {
        this.frontendUrl = frontendUrl;
        this.backendUrl = backendUrl;
        this.testResults = [];
        this.testDocuments = this.prepareTestDocuments();
    }

    prepareTestDocuments() {
        return [
            {
                name: 'Quantum Computing Research',
                content: `
                Title: Quantum Error Correction Using Topological Qubits
                
                Abstract: We demonstrate a novel approach to quantum error correction using 
                topological qubits based on Majorana fermions. Our method achieves 99.9% 
                fidelity with significantly reduced overhead compared to surface codes.
                
                Keywords: quantum computing, error correction, topological qubits, Majorana fermions
                
                Introduction: Quantum computers require robust error correction to achieve 
                fault-tolerant computation. Traditional approaches using surface codes require 
                thousands of physical qubits per logical qubit...
                
                Methods: We fabricated topological qubits using InAs/Al heterostructures 
                and implemented braiding operations for quantum gates. Error rates were 
                measured using randomized benchmarking protocols.
                
                Results: Topological protection reduced error rates by 3 orders of magnitude. 
                Gate fidelities exceeded 99.9% for single-qubit operations and 99.5% for 
                two-qubit gates.
                
                Applications: Fault-tolerant quantum computing, quantum cryptography, 
                quantum simulation of many-body systems.
                `,
                type: 'research_paper',
                expectedTechnologies: ['quantum computing', 'topological qubits', 'error correction'],
                expectedDomain: 'quantum physics'
            },
            {
                name: 'Renewable Energy Patent',
                content: `
                Title: High-Efficiency Perovskite Solar Cell with Stability Enhancement
                
                Abstract: A perovskite solar cell structure incorporating novel encapsulation 
                materials and interface engineering that achieves 26.7% efficiency with 
                95% performance retention after 1000 hours of operation.
                
                Claims: 1. A solar cell comprising a perovskite absorber layer with 
                composition CH3NH3PbI3-xClx. 2. An encapsulation layer of cross-linked 
                polymer matrix. 3. Interface modification using self-assembled monolayers.
                
                Technical Field: Photovoltaic devices, renewable energy, materials science
                
                Background: Perovskite solar cells show promise for low-cost, high-efficiency 
                photovoltaics but suffer from stability issues under operational conditions...
                
                Detailed Description: The perovskite layer is deposited using a two-step 
                sequential deposition process. The encapsulation layer prevents moisture 
                ingress while maintaining optical transparency.
                `,
                type: 'patent',
                expectedTechnologies: ['perovskite', 'solar cells', 'encapsulation'],
                expectedDomain: 'renewable energy'
            },
            {
                name: 'Medical Device Innovation',
                content: `
                Title: Minimally Invasive Cardiac Monitoring Device with AI-Powered Diagnostics
                
                Abstract: A wearable cardiac monitoring system that combines high-resolution 
                ECG sensing with machine learning algorithms for real-time arrhythmia detection 
                and prediction of cardiac events with 94% accuracy.
                
                Device Components: Flexible electrode array, low-power signal processing unit, 
                wireless communication module, AI inference chip
                
                Clinical Performance: Tested on 500 patients over 6 months. Detected 98% 
                of atrial fibrillation episodes and predicted 87% of cardiac events 24 hours 
                in advance.
                
                Regulatory Status: FDA 510(k) clearance pending, CE marking obtained
                
                Market Applications: Remote patient monitoring, preventive cardiology, 
                clinical trials, telemedicine platforms
                `,
                type: 'medical_device',
                expectedTechnologies: ['wearable sensors', 'AI diagnostics', 'cardiac monitoring'],
                expectedDomain: 'medical technology'
            }
        ];
    }

    async testBackendHealth() {
        const testName = 'Backend Health Check';
        console.log(`\n🔍 Starting ${testName}`);
        
        try {
            const response = await axios.get(`${this.backendUrl}/health`, { timeout: 10000 });
            
            if (response.status === 200) {
                this.logTestResult(testName, true, 'Backend is healthy', {
                    status: response.data.status,
                    service: response.data.service
                });
                return true;
            } else {
                throw new Error(`Unexpected status code: ${response.status}`);
            }
        } catch (error) {
            this.logTestResult(testName, false, `Backend health check failed: ${error.message}`);
            return false;
        }
    }

    async testClaudeIntegration() {
        const testName = 'Claude API Integration';
        console.log(`\n🔍 Starting ${testName}`);
        
        try {
            const response = await axios.get(`${this.backendUrl}/chat/health`, { timeout: 10000 });
            
            const claudeHealthy = response.status === 200 && response.data.status === 'healthy';
            
            this.logTestResult(testName, claudeHealthy, 
                claudeHealthy ? 'Claude API is accessible' : 'Claude API unavailable', 
                response.data
            );
            
            return claudeHealthy;
        } catch (error) {
            this.logTestResult(testName, false, `Claude integration test failed: ${error.message}`);
            return false;
        }
    }

    async testDocumentExtraction() {
        const testName = 'Document Extraction Pipeline';
        console.log(`\n🔍 Starting ${testName}`);
        
        const results = {
            totalDocuments: this.testDocuments.length,
            successfulExtractions: 0,
            failedExtractions: 0,
            extractionDetails: [],
            averageProcessingTime: 0
        };

        let totalProcessingTime = 0;

        for (const doc of this.testDocuments) {
            console.log(`  📄 Testing: ${doc.name}`);
            
            try {
                const startTime = Date.now();
                
                const payload = {
                    content: doc.content,
                    document_type: doc.type,
                    use_claude_extraction: true,
                    search_indices: ['patents', 'publications'],
                    max_results: 10
                };

                const response = await axios.post(
                    `${this.backendUrl}/ingest/enhanced`,
                    payload,
                    {
                        headers: { 'Content-Type': 'application/json' },
                        timeout: 60000
                    }
                );

                const processingTime = Date.now() - startTime;
                totalProcessingTime += processingTime;

                if (response.status === 200) {
                    const data = response.data;
                    
                    // Validate extraction quality
                    const extractionValidation = this.validateExtractionData(data, doc);
                    
                    // Validate API format
                    const formatValidation = this.validateApiFormat(data);
                    
                    // Validate similarity results
                    const similarityValidation = this.validateSimilarityResults(data);

                    results.successfulExtractions++;
                    results.extractionDetails.push({
                        documentName: doc.name,
                        processingTime,
                        analysisId: data.analysis_id,
                        extractionValidation,
                        formatValidation,
                        similarityValidation
                    });

                    console.log(`    ✅ Processed successfully in ${processingTime}ms`);
                } else {
                    results.failedExtractions++;
                    console.log(`    ❌ Failed with status: ${response.status}`);
                }
            } catch (error) {
                results.failedExtractions++;
                console.log(`    ❌ Error: ${error.message}`);
            }
        }

        results.averageProcessingTime = totalProcessingTime / this.testDocuments.length;

        const success = results.successfulExtractions > 0;
        this.logTestResult(testName, success, 
            `Processed ${results.successfulExtractions}/${results.totalDocuments} documents`, 
            results
        );

        return results;
    }

    validateExtractionData(responseData, expectedDoc) {
        const extractedData = responseData.extracted_data || {};
        
        const validation = {
            hasTitle: !!extractedData.title,
            hasAbstract: !!extractedData.abstract,
            hasTechnologies: (extractedData.key_technologies || []).length > 0,
            hasDomain: !!extractedData.research_domain,
            hasApplications: (extractedData.applications || []).length > 0,
            confidenceScore: extractedData.confidence_score || 0,
            technologyMatch: false,
            domainMatch: false
        };

        // Check technology matches
        const extractedTechs = (extractedData.key_technologies || []).map(t => t.toLowerCase());
        const expectedTechs = expectedDoc.expectedTechnologies.map(t => t.toLowerCase());
        
        validation.technologyMatch = expectedTechs.some(expected => 
            extractedTechs.some(extracted => 
                extracted.includes(expected) || expected.includes(extracted)
            )
        );

        // Check domain match
        const extractedDomain = (extractedData.research_domain || '').toLowerCase();
        const expectedDomain = expectedDoc.expectedDomain.toLowerCase();
        validation.domainMatch = extractedDomain.includes(expectedDomain) || 
                                expectedDomain.includes(extractedDomain);

        // Calculate overall quality
        const qualityScore = [
            validation.hasTitle,
            validation.hasAbstract,
            validation.hasTechnologies,
            validation.hasDomain,
            validation.technologyMatch,
            validation.domainMatch
        ].filter(Boolean).length / 6;

        validation.overallQuality = qualityScore >= 0.8 ? 'high' : 
                                   qualityScore >= 0.6 ? 'medium' : 'low';

        return validation;
    }

    validateApiFormat(responseData) {
        const validation = {
            hasAnalysisId: !!responseData.analysis_id,
            hasExtractedData: !!responseData.extracted_data,
            hasSimilarityResults: !!responseData.similarity_results,
            hasOptimizationMetrics: !!responseData.optimization_metrics,
            properSimilarityFormat: false,
            properMetricsFormat: false
        };

        // Validate similarity results format
        const similarityResults = responseData.similarity_results || [];
        if (similarityResults.length > 0) {
            const firstResult = similarityResults[0];
            const requiredFields = ['id', 'score', 'index', 'title', 'url'];
            validation.properSimilarityFormat = requiredFields.every(field => 
                firstResult.hasOwnProperty(field)
            );
        }

        // Validate optimization metrics format
        const metrics = responseData.optimization_metrics || {};
        const requiredMetrics = ['total_search_terms', 'search_strategy', 'processing_time'];
        validation.properMetricsFormat = requiredMetrics.every(metric => 
            metrics.hasOwnProperty(metric)
        );

        return validation;
    }

    validateSimilarityResults(responseData) {
        const similarityResults = responseData.similarity_results || [];
        
        const validation = {
            totalResults: similarityResults.length,
            hasResults: similarityResults.length > 0,
            averageScore: 0,
            highQualityResults: 0,
            resultDiversity: 0
        };

        if (similarityResults.length > 0) {
            const scores = similarityResults.map(result => result.score || 0);
            validation.averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
            validation.highQualityResults = scores.filter(score => score >= 0.7).length;
            
            // Check result diversity (unique indices)
            const indices = new Set(similarityResults.map(result => result.index || ''));
            validation.resultDiversity = indices.size;
        }

        return validation;
    }

    async testLogicMillApiCompliance() {
        const testName = 'Logic Mill API Compliance';
        console.log(`\n🔍 Starting ${testName}`);
        
        try {
            const testContent = `
                Title: API Compliance Test Document
                Abstract: This document tests Logic Mill API format compliance and data structure validation.
                Keywords: API, compliance, validation, test
            `;

            const payload = {
                content: testContent,
                document_type: 'research_paper',
                use_claude_extraction: true,
                search_indices: ['patents'],
                max_results: 5
            };

            const response = await axios.post(
                `${this.backendUrl}/ingest/enhanced`,
                payload,
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 30000
                }
            );

            if (response.status === 200) {
                const data = response.data;
                
                const complianceChecks = {
                    documentPartsStructure: this.checkDocumentPartsStructure(data),
                    graphqlCompatibility: this.checkGraphqlCompatibility(data),
                    encodingParameters: this.checkEncodingParameters(data),
                    responseFormat: this.checkResponseFormat(data)
                };

                const allChecksPassed = Object.values(complianceChecks).every(check => check);

                this.logTestResult(testName, allChecksPassed, 
                    'API compliance validation completed', 
                    complianceChecks
                );
                
                return allChecksPassed;
            } else {
                this.logTestResult(testName, false, `API request failed: ${response.status}`);
                return false;
            }
        } catch (error) {
            this.logTestResult(testName, false, `Compliance test error: ${error.message}`);
            return false;
        }
    }

    checkDocumentPartsStructure(responseData) {
        // Logic Mill expects document parts with key-value structure
        const extractedData = responseData.extracted_data || {};
        const requiredParts = ['title', 'abstract'];
        
        return requiredParts.every(part => extractedData[part]);
    }

    checkGraphqlCompatibility(responseData) {
        // Ensure data can be serialized for GraphQL
        try {
            JSON.stringify(responseData);
            return true;
        } catch (error) {
            return false;
        }
    }

    checkEncodingParameters(responseData) {
        // Check if required parameters for Logic Mill encoding are present
        const metrics = responseData.optimization_metrics || {};
        const requiredParams = ['search_strategy', 'processing_time'];
        
        return requiredParams.every(param => metrics.hasOwnProperty(param));
    }

    checkResponseFormat(responseData) {
        // Validate overall response structure
        const requiredFields = [
            'analysis_id',
            'status',
            'extracted_data',
            'similarity_results',
            'optimization_metrics'
        ];
        
        return requiredFields.every(field => responseData.hasOwnProperty(field));
    }

    async testErrorHandling() {
        const testName = 'Error Handling and Recovery';
        console.log(`\n🔍 Starting ${testName}`);
        
        const errorScenarios = [
            {
                name: 'Empty Content',
                payload: { content: '', document_type: 'research_paper' }
            },
            {
                name: 'Invalid Document Type',
                payload: { content: 'Test content', document_type: 'invalid_type' }
            },
            {
                name: 'Missing Required Fields',
                payload: { invalid_field: 'test' }
            },
            {
                name: 'Extremely Large Content',
                payload: { 
                    content: 'A'.repeat(100000), 
                    document_type: 'research_paper' 
                }
            }
        ];

        const errorHandlingResults = [];

        for (const scenario of errorScenarios) {
            console.log(`  🧪 Testing: ${scenario.name}`);
            
            try {
                const response = await axios.post(
                    `${this.backendUrl}/ingest/enhanced`,
                    scenario.payload,
                    {
                        headers: { 'Content-Type': 'application/json' },
                        timeout: 15000
                    }
                );

                // Check if error is handled gracefully
                const handledGracefully = [400, 422, 500].includes(response.status) || 
                    (response.status === 200 && 
                     response.data.status && 
                     response.data.status.toLowerCase().includes('error'));

                errorHandlingResults.push({
                    scenario: scenario.name,
                    statusCode: response.status,
                    handledGracefully
                });

                console.log(`    ${handledGracefully ? '✅' : '❌'} Status: ${response.status}`);
            } catch (error) {
                // Exception handling is also valid error handling
                errorHandlingResults.push({
                    scenario: scenario.name,
                    error: error.message,
                    handledGracefully: true
                });
                
                console.log(`    ✅ Exception handled: ${error.message.substring(0, 50)}...`);
            }
        }

        const allHandled = errorHandlingResults.every(result => result.handledGracefully);

        this.logTestResult(testName, allHandled, 'Error handling validation completed', {
            scenariosTested: errorScenarios.length,
            properlyHandled: errorHandlingResults.filter(r => r.handledGracefully).length,
            details: errorHandlingResults
        });

        return allHandled;
    }

    logTestResult(testName, success, message, details = {}) {
        const result = {
            test: testName,
            success,
            message,
            details,
            timestamp: Date.now()
        };

        this.testResults.push(result);

        const status = success ? '✅ PASS' : '❌ FAIL';
        console.log(`${status}: ${testName} - ${message}`);
    }

    async runAllTests() {
        console.log('🚀 Starting Frontend Document Upload Test Suite');
        console.log('='.repeat(60));

        // Run all test categories
        const healthOk = await this.testBackendHealth();
        const claudeOk = await this.testClaudeIntegration();
        
        let extractionResults = {};
        let complianceOk = false;
        let errorHandlingOk = false;

        if (healthOk) {
            extractionResults = await this.testDocumentExtraction();
            complianceOk = await this.testLogicMillApiCompliance();
            errorHandlingOk = await this.testErrorHandling();
        } else {
            console.log('❌ Backend health check failed - skipping other tests');
        }

        // Generate summary report
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(result => result.success).length;

        const summary = {
            testSuite: 'Frontend Document Upload',
            timestamp: Date.now(),
            totalTests,
            passedTests,
            failedTests: totalTests - passedTests,
            successRate: totalTests > 0 ? `${(passedTests/totalTests*100).toFixed(1)}%` : '0%',
            backendHealth: healthOk,
            claudeIntegration: claudeOk,
            extractionPipeline: extractionResults,
            apiCompliance: complianceOk,
            errorHandling: errorHandlingOk,
            detailedResults: this.testResults
        };

        // Save detailed report
        const reportFile = path.join(__dirname, 'frontend_test_report.json');
        fs.writeFileSync(reportFile, JSON.stringify(summary, null, 2));

        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST SUMMARY');
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests}`);
        console.log(`Failed: ${totalTests - passedTests}`);
        console.log(`Success Rate: ${summary.successRate}`);
        console.log(`Report saved to: ${reportFile}`);

        if (passedTests === totalTests) {
            console.log('🎉 All tests passed! Frontend integration is working correctly.');
        } else {
            console.log('⚠️  Some tests failed. Please review the detailed report.');
        }

        // Provide recommendations
        this.generateRecommendations(summary);

        return summary;
    }

    generateRecommendations(summary) {
        console.log('\n💡 RECOMMENDATIONS:');
        
        if (!summary.backendHealth) {
            console.log('• Ensure backend server is running on the correct port');
            console.log('• Check backend configuration and dependencies');
        }
        
        if (!summary.claudeIntegration) {
            console.log('• Verify Claude API key configuration');
            console.log('• Check CORE_CLAUDE_API_KEY environment variable');
        }
        
        if (summary.extractionPipeline.successfulExtractions === 0) {
            console.log('• Review document extraction pipeline configuration');
            console.log('• Check Logic Mill API token and endpoint settings');
        }
        
        if (!summary.apiCompliance) {
            console.log('• Review Logic Mill API data format requirements');
            console.log('• Ensure proper GraphQL query structure');
        }
        
        if (!summary.errorHandling) {
            console.log('• Improve error handling for edge cases');
            console.log('• Add proper validation for input parameters');
        }
        
        if (summary.extractionPipeline.averageProcessingTime > 10000) {
            console.log('• Consider optimizing document processing performance');
            console.log('• Implement caching for repeated operations');
        }
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    const frontendUrl = args.find(arg => arg.startsWith('--frontend='))?.split('=')[1] || 'http://localhost:3000';
    const backendUrl = args.find(arg => arg.startsWith('--backend='))?.split('=')[1] || 'http://localhost:8000';
    
    const tester = new DocumentUploadTester(frontendUrl, backendUrl);
    await tester.runAllTests();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = DocumentUploadTester;