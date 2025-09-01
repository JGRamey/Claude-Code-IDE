import React, { useState, useCallback } from 'react';
import { AgentSettings } from './AgentSettings';
import { DockerConfig } from './DockerConfig';
import { WorkflowSettings } from './WorkflowSettings';
import { useAppStore } from '../../stores';
import { IDESettings } from '../../types';
import { 
  X, 
  Save, 
  RotateCcw, 
  Download, 
  Upload,
  Code,
  Cpu,
  Workflow,
  Palette,
  Keyboard,
  Shield,
  Zap,
  Monitor,
  HardDrive,
  Globe
} from 'lucide-react';

interface SettingsPanelProps {
  onClose: () => void;
}

type SettingsTab = 'general' | 'agents' | 'docker' | 'workflow' | 'appearance' | 'keybindings' | 'advanced';

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [tempSettings, setTempSettings] = useState<IDESettings | null>(null);
  
  const { settings, updateSettings, agents, preferences, updatePreferences } = useAppStore();

  const currentSettings = tempSettings || settings;

  const handleSettingChange = useCallback(<K extends keyof IDESettings>(
    key: K, 
    value: IDESettings[K]
  ) => {
    setTempSettings(prev => ({
      ...(prev || settings),
      [key]: value
    }));
    setHasChanges(true);
  }, [settings]);

  const handleSave = useCallback(() => {
    if (tempSettings) {
      updateSettings(tempSettings);
      setTempSettings(null);
      setHasChanges(false);
    }
  }, [tempSettings, updateSettings]);

  const handleReset = useCallback(() => {
    setTempSettings(null);
    setHasChanges(false);
  }, []);

  const handleExportSettings = useCallback(() => {
    const exportData = {
      settings: currentSettings,
      preferences,
      agents: agents.map(agent => ({
        id: agent.id,
        enabled: agent.status !== 'disabled',
        config: agent.config
      })),
      timestamp: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `claude-code-ide-settings-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }, [currentSettings, preferences, agents]);

  const tabs: Array<{ id: SettingsTab; label: string; icon: React.ReactNode }> = [
    { id: 'general', label: 'General', icon: <Monitor className="w-4 h-4" /> },
    { id: 'agents', label: 'Agents', icon: <Cpu className="w-4 h-4" /> },
    { id: 'docker', label: 'Docker', icon: <HardDrive className="w-4 h-4" /> },
    { id: 'workflow', label: 'Workflow', icon: <Workflow className="w-4 h-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
    { id: 'keybindings', label: 'Keybindings', icon: <Keyboard className="w-4 h-4" /> },
    { id: 'advanced', label: 'Advanced', icon: <Shield className="w-4 h-4" /> }
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Editor Settings</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Size
            </label>
            <input
              type="range"
              min="10"
              max="24"
              value={currentSettings.fontSize}
              onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-500 mt-1">{currentSettings.fontSize}px</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tab Size
            </label>
            <select
              value={currentSettings.tabSize}
              onChange={(e) => handleSettingChange('tabSize', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
              <option value={8}>8 spaces</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Font Family
          </label>
          <select
            value={currentSettings.fontFamily.split(',')[0]}
            onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="JetBrains Mono">JetBrains Mono</option>
            <option value="Fira Code">Fira Code</option>
            <option value="Consolas">Consolas</option>
            <option value="Monaco">Monaco</option>
          </select>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Editor Features</h3>
        
        <div className="space-y-3">
          {[
            { key: 'wordWrap', label: 'Word Wrap', description: 'Wrap long lines' },
            { key: 'minimap', label: 'Minimap', description: 'Show code minimap' },
            { key: 'lineNumbers', label: 'Line Numbers', description: 'Show line numbers' },
            { key: 'autoSave', label: 'Auto Save', description: 'Automatically save changes' },
            { key: 'formatOnSave', label: 'Format on Save', description: 'Format code when saving' },
            { key: 'livePreview', label: 'Live Preview', description: 'Real-time preview updates' },
            { key: 'hotReload', label: 'Hot Reload', description: 'Hot module replacement' }
          ].map(({ key, label, description }) => (
            <label key={key} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-700">{label}</div>
                <div className="text-xs text-gray-500">{description}</div>
              </div>
              <input
                type="checkbox"
                checked={currentSettings[key as keyof IDESettings] as boolean}
                onChange={(e) => handleSettingChange(key as keyof IDESettings, e.target.checked as any)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          ))}
        </div>

        {currentSettings.autoSave && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Auto Save Delay (ms)
            </label>
            <input
              type="number"
              min="100"
              max="5000"
              step="100"
              value={currentSettings.autoSaveDelay}
              onChange={(e) => handleSettingChange('autoSaveDelay', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Theme</h3>
        
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'dark', label: 'Dark', preview: 'bg-gray-900' },
            { value: 'light', label: 'Light', preview: 'bg-white border' },
            { value: 'auto', label: 'Auto', preview: 'bg-gradient-to-r from-gray-900 to-white' }
          ].map(({ value, label, preview }) => (
            <button
              key={value}
              onClick={() => handleSettingChange('theme', value as any)}
              className={`p-3 rounded-lg border-2 transition-colors ${
                currentSettings.theme === value 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-full h-16 rounded mb-2 ${preview}`}></div>
              <div className="text-sm font-medium text-gray-700">{label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Layout</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sidebar Width
            </label>
            <input
              type="range"
              min="200"
              max="400"
              value={preferences.workspaceLayout.sidebarWidth}
              onChange={(e) => updatePreferences({
                workspaceLayout: {
                  ...preferences.workspaceLayout,
                  sidebarWidth: parseInt(e.target.value)
                }
              })}
              className="w-full"
            />
            <div className="text-xs text-gray-500 mt-1">
              {preferences.workspaceLayout.sidebarWidth}px
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terminal Height
            </label>
            <input
              type="range"
              min="150"
              max="400"
              value={preferences.workspaceLayout.bottomPanelHeight}
              onChange={(e) => updatePreferences({
                workspaceLayout: {
                  ...preferences.workspaceLayout,
                  bottomPanelHeight: parseInt(e.target.value)
                }
              })}
              className="w-full"
            />
            <div className="text-xs text-gray-500 mt-1">
              {preferences.workspaceLayout.bottomPanelHeight}px
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderKeybindingsSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Keyboard Shortcuts</h3>
        
        <div className="space-y-3">
          {Object.entries(currentSettings.keybindings).map(([shortcut, action]) => (
            <div key={shortcut} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-700">{action.replace('-', ' ')}</div>
                <div className="text-xs text-gray-500">Trigger: {action}</div>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
                  {shortcut.replace('cmd', '⌘').replace('ctrl', 'Ctrl').replace('shift', '⇧')}
                </kbd>
                <button className="text-blue-600 hover:text-blue-700 text-xs">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAdvancedSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terminal Shell
            </label>
            <select
              value={currentSettings.terminalShell}
              onChange={(e) => handleSettingChange('terminalShell', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="bash">Bash</option>
              <option value="zsh">Zsh</option>
              <option value="fish">Fish</option>
              <option value="cmd">Command Prompt</option>
              <option value="powershell">PowerShell</option>
            </select>
          </div>

          <div className="space-y-3">
            {[
              { key: 'agentCollaboration', label: 'Agent Collaboration', description: 'Allow agents to work together on tasks' },
              { key: 'workflowAutoExecute', label: 'Auto-execute Workflows', description: 'Automatically run workflows when triggered' },
              { key: 'dockerAutoStart', label: 'Docker Auto-start', description: 'Start Docker containers automatically' }
            ].map(({ key, label, description }) => (
              <label key={key} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700">{label}</div>
                  <div className="text-xs text-gray-500">{description}</div>
                </div>
                <input
                  type="checkbox"
                  checked={currentSettings[key as keyof IDESettings] as boolean}
                  onChange={(e) => handleSettingChange(key as keyof IDESettings, e.target.checked as any)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Debug & Logging</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Log Level
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="error">Error</option>
              <option value="warn">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
              <option value="verbose">Verbose</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Debug Options
            </label>
            <div className="space-y-2">
              {[
                'Enable source maps',
                'Log agent communications',
                'Debug Docker operations',
                'Trace file system operations',
                'Monitor WebSocket connections'
              ].map((option, index) => (
                <label key={index} className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'agents':
        return <AgentSettings />;
      case 'docker':
        return <DockerConfig />;
      case 'workflow':
        return <WorkflowSettings />;
      case 'appearance':
        return renderAppearanceSettings();
      case 'keybindings':
        return renderKeybindingsSettings();
      case 'advanced':
        return renderAdvancedSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-2xl border border-gray-200 flex h-full overflow-hidden">
      {/* Settings Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
          <p className="text-sm text-gray-600">Configure your IDE environment</p>
        </div>
        
        <nav className="flex-1 p-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === tab.id 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Settings Actions */}
        <div className="p-3 border-t border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={handleExportSettings}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              <Download className="w-3 h-3" />
              Export
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              <Upload className="w-3 h-3" />
              Import
            </button>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 capitalize">
              {activeTab.replace(/([A-Z])/g, ' $1')}
            </h3>
            <p className="text-sm text-gray-600">
              {activeTab === 'general' && 'Configure editor and development settings'}
              {activeTab === 'agents' && 'Manage Claude Code agents and their behavior'}
              {activeTab === 'docker' && 'Configure Docker containers and deployment'}
              {activeTab === 'workflow' && 'Set up agent workflows and automation'}
              {activeTab === 'appearance' && 'Customize the IDE appearance and layout'}
              {activeTab === 'keybindings' && 'Configure keyboard shortcuts and commands'}
              {activeTab === 'advanced' && 'Advanced configuration and debugging options'}
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {renderTabContent()}
        </div>

        {/* Footer */}
        {hasChanges && (
          <div className="h-16 border-t border-gray-200 bg-gray-50 flex items-center justify-between px-6">
            <div className="text-sm text-gray-600">
              You have unsaved changes
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}