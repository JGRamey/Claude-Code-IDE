import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserFrame } from './BrowserFrame';
import { DeviceSimulator } from './DeviceSimulator';
import { useAppStore } from '../../stores';
import { useWebSocket } from '../../hooks/useWebSocket';
import { 
  RefreshCw, 
  ExternalLink, 
  Smartphone, 
  Tablet, 
  Monitor,
  Settings,
  Maximize2,
  Minimize2,
  RotateCcw,
  Share,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';

interface PreviewPanelProps {
  fullscreen?: boolean;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';
type OrientationType = 'portrait' | 'landscape';

const deviceDimensions = {
  desktop: { width: '100%', height: '100%' },
  tablet: { width: '768px', height: '1024px' },
  mobile: { width: '375px', height: '667px' }
};

export function PreviewPanel({ fullscreen = false }: PreviewPanelProps) {
  const [currentDevice, setCurrentDevice] = useState<DeviceType>('desktop');
  const [orientation, setOrientation] = useState<OrientationType>('portrait');
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('http://localhost:3000');
  const [isResponsiveMode, setIsResponsiveMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showDevTools, setShowDevTools] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { isRunning, dockerStatus, containerMetrics } = useAppStore();
  const { isConnected } = useWebSocket();

  // Auto-refresh when container status changes
  useEffect(() => {
    if (dockerStatus === 'running' && isRunning) {
      handleRefresh();
    }
  }, [dockerStatus, isRunning]);

  // WebSocket connection for live reload
  useEffect(() => {
    if (isConnected) {
      const ws = new WebSocket('ws://localhost:3001');
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'file-changed' || data.type === 'hot-reload') {
          handleRefresh();
        }
      };

      return () => ws.close();
    }
  }, [isConnected]);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const handleDeviceChange = useCallback((device: DeviceType) => {
    setCurrentDevice(device);
    setIsResponsiveMode(device !== 'desktop');
  }, []);

  const handleOrientationToggle = useCallback(() => {
    setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait');
  }, []);

  const handleZoomChange = useCallback((delta: number) => {
    setZoomLevel(prev => Math.max(25, Math.min(200, prev + delta)));
  }, []);

  const handleOpenExternal = useCallback(() => {
    window.open(previewUrl, '_blank');
  }, [previewUrl]);

  const getCurrentDimensions = () => {
    const dims = deviceDimensions[currentDevice];
    if (currentDevice === 'desktop') return dims;
    
    if (orientation === 'landscape') {
      return { width: dims.height, height: dims.width };
    }
    return dims;
  };

  const dimensions = getCurrentDimensions();

  return (
    <div className={`h-full bg-gray-100 flex flex-col ${fullscreen ? 'w-full' : ''}`}>
      {/* Preview Toolbar */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Device Selector */}
          <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => handleDeviceChange('desktop')}
              className={`p-1.5 rounded transition-colors ${
                currentDevice === 'desktop' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeviceChange('tablet')}
              className={`p-1.5 rounded transition-colors ${
                currentDevice === 'tablet' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
              title="Tablet View"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeviceChange('mobile')}
              className={`p-1.5 rounded transition-colors ${
                currentDevice === 'mobile' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
              title="Mobile View"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Orientation Toggle */}
          {currentDevice !== 'desktop' && (
            <button
              onClick={handleOrientationToggle}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title={`Switch to ${orientation === 'portrait' ? 'landscape' : 'portrait'}`}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 text-sm">
            <button
              onClick={() => handleZoomChange(-25)}
              className="p-1 hover:bg-gray-100 rounded"
              disabled={zoomLevel <= 25}
            >
              <Minimize2 className="w-3 h-3" />
            </button>
            <span className="w-12 text-center text-gray-600">{zoomLevel}%</span>
            <button
              onClick={() => handleZoomChange(25)}
              className="p-1 hover:bg-gray-100 rounded"
              disabled={zoomLevel >= 200}
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* URL and Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 border">
            <div className={`w-2 h-2 rounded-full ${
              isRunning && dockerStatus === 'running' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <input
              type="text"
              value={previewUrl}
              onChange={(e) => setPreviewUrl(e.target.value)}
              className="bg-transparent text-sm text-gray-700 w-48 focus:outline-none"
              placeholder="Preview URL"
            />
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
            title="Refresh Preview"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={handleOpenExternal}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Open in New Tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowDevTools(!showDevTools)}
            className={`p-2 rounded transition-colors ${
              showDevTools ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
            }`}
            title="Toggle Developer Tools"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 flex">
        {/* Main Preview Area */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
          {isRunning && dockerStatus === 'running' ? (
            <div 
              className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300"
              style={{
                width: dimensions.width,
                height: dimensions.height,
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'center center'
              }}
            >
              <BrowserFrame
                url={previewUrl}
                onRefresh={handleRefresh}
                isLoading={isLoading}
              >
                <iframe
                  ref={iframeRef}
                  src={previewUrl}
                  className="w-full h-full border-0"
                  title="App Preview"
                  onLoad={() => setIsLoading(false)}
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                />
              </BrowserFrame>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Preview Not Available</h3>
              <p className="text-sm mb-4">
                {!isRunning 
                  ? 'Start the development server to see your app preview'
                  : dockerStatus !== 'running' 
                    ? 'Docker container is not running'
                    : 'Connecting to preview server...'
                }
              </p>
              {!isRunning && (
                <button
                  onClick={() => useAppStore.getState().toggleRunning()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Development Server
                </button>
              )}
            </div>
          )}
        </div>

        {/* Developer Tools Panel */}
        {showDevTools && (
          <div className="w-80 border-l border-gray-200 bg-white flex flex-col">
            <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center px-3">
              <span className="text-sm font-medium text-gray-700">Developer Tools</span>
            </div>
            
            <div className="flex-1 overflow-auto">
              {/* Console Output */}
              <div className="p-3 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Console</h4>
                <div className="bg-black rounded p-2 h-32 overflow-auto font-mono text-xs">
                  {consoleOutput.length === 0 ? (
                    <div className="text-gray-500">No console output</div>
                  ) : (
                    consoleOutput.map((line, index) => (
                      <div key={index} className="text-green-400">
                        {line}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Network Tab */}
              <div className="p-3 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Network</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">GET /</span>
                    <span className="text-green-600">200</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">GET /static/js/main.js</span>
                    <span className="text-green-600">200</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">GET /static/css/main.css</span>
                    <span className="text-green-600">200</span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              {containerMetrics && (
                <div className="p-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Performance</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">CPU Usage:</span>
                      <span className="text-blue-600">{containerMetrics.cpuUsage.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Memory:</span>
                      <span className="text-purple-600">
                        {(containerMetrics.memoryUsage / 1024 / 1024).toFixed(1)} MB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Network I/O:</span>
                      <span className="text-green-600">
                        ↓{(containerMetrics.networkRx / 1024).toFixed(1)} KB/s
                        ↑{(containerMetrics.networkTx / 1024).toFixed(1)} KB/s
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Live Reload Indicator */}
      {isConnected && isRunning && (
        <div className="absolute top-4 left-4 bg-green-100 border border-green-300 rounded-lg px-3 py-1 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live Reload Active</span>
          </div>
        </div>
      )}

      {/* Device Frame Overlay */}
      {isResponsiveMode && currentDevice !== 'desktop' && (
        <DeviceSimulator
          device={currentDevice}
          orientation={orientation}
          onOrientationChange={setOrientation}
        />
      )}
    </div>
  );
}