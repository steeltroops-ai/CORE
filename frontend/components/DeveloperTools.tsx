"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Code,
  Activity,
  Database,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Copy,
  Eye,
  EyeOff,
  Terminal,
  Server,
  Wifi,
  WifiOff,
  Timer,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Info,
  Bug,
  Settings,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface APICall {
  id: string;
  endpoint: string;
  method: string;
  status: number;
  duration: number;
  timestamp: number;
  requestHeaders?: Record<string, string>;
  requestBody?: any;
  responseHeaders?: Record<string, string>;
  responseBody?: any;
  error?: string;
}

interface PerformanceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  slowestRequest: APICall | null;
  fastestRequest: APICall | null;
  totalDataTransferred: number;
  requestsPerMinute: number;
}

interface SystemInfo {
  userAgent: string;
  viewport: { width: number; height: number };
  connection: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  };
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  timing: {
    domContentLoaded: number;
    loadComplete: number;
    firstPaint?: number;
    firstContentfulPaint?: number;
  };
}

interface DeveloperToolsProps {
  analysisId?: string | null;
  isVisible: boolean;
  onToggle: () => void;
}

const DeveloperTools: React.FC<DeveloperToolsProps> = ({
  analysisId,
  isVisible,
  onToggle,
}) => {
  const [apiCalls, setApiCalls] = useState<APICall[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    slowestRequest: null,
    fastestRequest: null,
    totalDataTransferred: 0,
    requestsPerMinute: 0,
  });
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [selectedCall, setSelectedCall] = useState<APICall | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [consoleMessages, setConsoleMessages] = useState<Array<{
    level: 'log' | 'warn' | 'error' | 'info';
    message: string;
    timestamp: number;
  }>>([]);

  // Intercept fetch requests to monitor API calls
  useEffect(() => {
    if (!isVisible) return;

    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const [url, options = {}] = args;
      const method = options.method || 'GET';
      
      const callId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Clone response to read body without consuming it
        const responseClone = response.clone();
        let responseBody;
        try {
          responseBody = await responseClone.json();
        } catch {
          responseBody = await responseClone.text();
        }
        
        const apiCall: APICall = {
          id: callId,
          endpoint: typeof url === 'string' ? url : url.toString(),
          method,
          status: response.status,
          duration,
          timestamp: Date.now(),
          requestHeaders: options.headers as Record<string, string>,
          requestBody: options.body,
          responseHeaders: Object.fromEntries(response.headers.entries()),
          responseBody,
        };
        
        setApiCalls(prev => [apiCall, ...prev.slice(0, 99)]); // Keep last 100 calls
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        const apiCall: APICall = {
          id: callId,
          endpoint: typeof url === 'string' ? url : url.toString(),
          method,
          status: 0,
          duration,
          timestamp: Date.now(),
          requestHeaders: options.headers as Record<string, string>,
          requestBody: options.body,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        
        setApiCalls(prev => [apiCall, ...prev.slice(0, 99)]);
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [isVisible]);

  // Intercept console messages
  useEffect(() => {
    if (!isVisible) return;

    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
    };

    const interceptConsole = (level: 'log' | 'warn' | 'error' | 'info') => {
      console[level] = (...args) => {
        originalConsole[level](...args);
        setConsoleMessages(prev => [
          {
            level,
            message: args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' '),
            timestamp: Date.now(),
          },
          ...prev.slice(0, 99)
        ]);
      };
    };

    Object.keys(originalConsole).forEach(level => 
      interceptConsole(level as keyof typeof originalConsole)
    );

    return () => {
      Object.assign(console, originalConsole);
    };
  }, [isVisible]);

  // Calculate performance metrics
  useEffect(() => {
    const successful = apiCalls.filter(call => call.status >= 200 && call.status < 300);
    const failed = apiCalls.filter(call => call.status >= 400 || call.error);
    
    const avgResponseTime = apiCalls.length > 0 
      ? apiCalls.reduce((sum, call) => sum + call.duration, 0) / apiCalls.length 
      : 0;
    
    const slowest = apiCalls.reduce((prev, current) => 
      (prev && prev.duration > current.duration) ? prev : current, null as APICall | null
    );
    
    const fastest = apiCalls.reduce((prev, current) => 
      (prev && prev.duration < current.duration) ? prev : current, null as APICall | null
    );
    
    // Calculate requests per minute
    const oneMinuteAgo = Date.now() - 60000;
    const recentCalls = apiCalls.filter(call => call.timestamp > oneMinuteAgo);
    
    setPerformanceMetrics({
      totalRequests: apiCalls.length,
      successfulRequests: successful.length,
      failedRequests: failed.length,
      averageResponseTime: avgResponseTime,
      slowestRequest: slowest,
      fastestRequest: fastest,
      totalDataTransferred: 0, // Would need to calculate from response sizes
      requestsPerMinute: recentCalls.length,
    });
  }, [apiCalls]);

  // Collect system information
  useEffect(() => {
    if (!isVisible) return;

    const collectSystemInfo = () => {
      const nav = navigator as any;
      const perf = performance as any;
      
      const info: SystemInfo = {
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        connection: {
          effectiveType: nav.connection?.effectiveType,
          downlink: nav.connection?.downlink,
          rtt: nav.connection?.rtt,
        },
        memory: nav.memory ? {
          usedJSHeapSize: nav.memory.usedJSHeapSize,
          totalJSHeapSize: nav.memory.totalJSHeapSize,
          jsHeapSizeLimit: nav.memory.jsHeapSizeLimit,
        } : undefined,
        timing: {
          domContentLoaded: perf.timing?.domContentLoadedEventEnd - perf.timing?.navigationStart || 0,
          loadComplete: perf.timing?.loadEventEnd - perf.timing?.navigationStart || 0,
          firstPaint: perf.getEntriesByType?.('paint')?.[0]?.startTime,
          firstContentfulPaint: perf.getEntriesByType?.('paint')?.[1]?.startTime,
        },
      };
      
      setSystemInfo(info);
    };

    collectSystemInfo();
    
    if (autoRefresh) {
      const interval = setInterval(collectSystemInfo, 5000);
      return () => clearInterval(interval);
    }
  }, [isVisible, autoRefresh]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportData = () => {
    const data = {
      apiCalls,
      performanceMetrics,
      systemInfo,
      consoleMessages,
      timestamp: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `developer-tools-${analysisId || 'session'}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-4 left-4 z-40 rounded-full w-12 h-12 shadow-lg"
        variant="outline"
        aria-label="Open developer tools"
      >
        <Code className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 w-96 max-h-[80vh] bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4" />
          <span className="font-medium text-sm">Developer Tools</span>
          <Badge variant="outline" className="text-xs">
            {apiCalls.length} calls
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className={`h-3 w-3 ${autoRefresh ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-6 w-6 p-0"
          >
            {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggle}
            className="h-6 w-6 p-0"
          >
            <EyeOff className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <div className="h-96 overflow-y-auto">
          <Tabs defaultValue="api" className="w-full">
            <TabsList className="grid w-full grid-cols-4 text-xs">
              <TabsTrigger value="api" className="text-xs">API</TabsTrigger>
              <TabsTrigger value="performance" className="text-xs">Perf</TabsTrigger>
              <TabsTrigger value="console" className="text-xs">Console</TabsTrigger>
              <TabsTrigger value="system" className="text-xs">System</TabsTrigger>
            </TabsList>

            <TabsContent value="api" className="p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium">Recent API Calls</span>
                <Button size="sm" variant="outline" onClick={exportData} className="h-6 text-xs">
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
              </div>
              
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {apiCalls.map((call) => (
                  <div
                    key={call.id}
                    className="p-2 border rounded text-xs cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedCall(selectedCall?.id === call.id ? null : call)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={call.status >= 200 && call.status < 300 ? "default" : "destructive"}
                          className="text-xs px-1 py-0"
                        >
                          {call.method}
                        </Badge>
                        <span className="font-mono text-xs truncate max-w-32">
                          {call.endpoint.split('/').pop()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`text-xs ${
                          call.status >= 200 && call.status < 300 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {call.status || 'ERR'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDuration(call.duration)}
                        </span>
                      </div>
                    </div>
                    
                    {selectedCall?.id === call.id && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <div className="space-y-1">
                          <div><strong>URL:</strong> {call.endpoint}</div>
                          <div><strong>Status:</strong> {call.status}</div>
                          <div><strong>Duration:</strong> {formatDuration(call.duration)}</div>
                          {call.error && (
                            <div className="text-red-600"><strong>Error:</strong> {call.error}</div>
                          )}
                          {call.responseBody && (
                            <div>
                              <strong>Response:</strong>
                              <pre className="mt-1 p-1 bg-white border rounded text-xs overflow-auto max-h-20">
                                {JSON.stringify(call.responseBody, null, 2)}
                              </pre>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(JSON.stringify(call.responseBody, null, 2))}
                                className="h-5 text-xs mt-1"
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="performance" className="p-3 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-green-50 rounded">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="font-medium">Success</span>
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    {performanceMetrics.successfulRequests}
                  </div>
                </div>
                
                <div className="p-2 bg-red-50 rounded">
                  <div className="flex items-center gap-1">
                    <XCircle className="h-3 w-3 text-red-600" />
                    <span className="font-medium">Failed</span>
                  </div>
                  <div className="text-lg font-bold text-red-600">
                    {performanceMetrics.failedRequests}
                  </div>
                </div>
                
                <div className="p-2 bg-blue-50 rounded">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-blue-600" />
                    <span className="font-medium">Avg Time</span>
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    {formatDuration(performanceMetrics.averageResponseTime)}
                  </div>
                </div>
                
                <div className="p-2 bg-purple-50 rounded">
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3 text-purple-600" />
                    <span className="font-medium">Req/Min</span>
                  </div>
                  <div className="text-lg font-bold text-purple-600">
                    {performanceMetrics.requestsPerMinute}
                  </div>
                </div>
              </div>
              
              {performanceMetrics.slowestRequest && (
                <div className="p-2 border rounded">
                  <div className="text-xs font-medium mb-1">Slowest Request</div>
                  <div className="text-xs text-gray-600">
                    {performanceMetrics.slowestRequest.endpoint.split('/').pop()} - 
                    {formatDuration(performanceMetrics.slowestRequest.duration)}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="console" className="p-3">
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {consoleMessages.map((msg, index) => (
                  <div key={index} className="p-1 text-xs border-l-2 pl-2" style={{
                    borderLeftColor: {
                      log: '#6b7280',
                      info: '#3b82f6',
                      warn: '#f59e0b',
                      error: '#ef4444',
                    }[msg.level]
                  }}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {msg.level}
                      </Badge>
                    </div>
                    <pre className="text-xs mt-1 whitespace-pre-wrap">{msg.message}</pre>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="system" className="p-3 space-y-2">
              {systemInfo && (
                <div className="space-y-2 text-xs">
                  <div>
                    <strong>Viewport:</strong> {systemInfo.viewport.width}x{systemInfo.viewport.height}
                  </div>
                  
                  {systemInfo.connection.effectiveType && (
                    <div>
                      <strong>Connection:</strong> {systemInfo.connection.effectiveType}
                      {systemInfo.connection.downlink && ` (${systemInfo.connection.downlink} Mbps)`}
                    </div>
                  )}
                  
                  {systemInfo.memory && (
                    <div>
                      <strong>Memory:</strong> {formatBytes(systemInfo.memory.usedJSHeapSize)} / 
                      {formatBytes(systemInfo.memory.jsHeapSizeLimit)}
                    </div>
                  )}
                  
                  <div>
                    <strong>DOM Ready:</strong> {formatDuration(systemInfo.timing.domContentLoaded)}
                  </div>
                  
                  <div>
                    <strong>Load Complete:</strong> {formatDuration(systemInfo.timing.loadComplete)}
                  </div>
                  
                  {systemInfo.timing.firstContentfulPaint && (
                    <div>
                      <strong>First Paint:</strong> {formatDuration(systemInfo.timing.firstContentfulPaint)}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default DeveloperTools;