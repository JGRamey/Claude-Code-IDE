claude-code-ide/
├── 📁 src/
│   ├── 📁 components/
│   │   ├── 📁 Editor/
│   │   │   ├── CodeEditor.tsx
│   │   │   ├── FileTab.tsx
│   │   │   ├── EditorToolbar.tsx
│   │   │   └── index.ts
│   │   ├── 📁 FileExplorer/
│   │   │   ├── FileExplorer.tsx
│   │   │   ├── FileTree.tsx
│   │   │   ├── FileNode.tsx
│   │   │   ├── ContextMenu.tsx
│   │   │   └── index.ts
│   │   ├── 📁 Preview/
│   │   │   ├── PreviewPanel.tsx
│   │   │   ├── BrowserFrame.tsx
│   │   │   ├── DeviceSimulator.tsx
│   │   │   └── index.ts
│   │   ├── 📁 Terminal/
│   │   │   ├── Terminal.tsx
│   │   │   ├── TerminalOutput.tsx
│   │   │   ├── CommandInput.tsx
│   │   │   └── index.ts
│   │   ├── 📁 WorkflowEditor/
│   │   │   ├── WorkflowEditor.tsx
│   │   │   ├── AgentNode.tsx
│   │   │   ├── ConnectionLine.tsx
│   │   │   ├── WorkflowCanvas.tsx
│   │   │   └── index.ts
│   │   ├── 📁 ChatPanel/
│   │   │   ├── ChatPanel.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── AgentIndicator.tsx
│   │   │   └── index.ts
│   │   ├── 📁 AgentStatus/
│   │   │   ├── AgentStatus.tsx
│   │   │   ├── AgentCard.tsx
│   │   │   ├── StatusIndicator.tsx
│   │   │   └── index.ts
│   │   ├── 📁 Layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TabBar.tsx
│   │   │   ├── SplitPanel.tsx
│   │   │   └── index.ts
│   │   ├── 📁 Settings/
│   │   │   ├── SettingsPanel.tsx
│   │   │   ├── AgentSettings.tsx
│   │   │   ├── DockerConfig.tsx
│   │   │   ├── WorkflowSettings.tsx
│   │   │   └── index.ts
│   │   └── 📁 UI/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Tooltip.tsx
│   │       └── index.ts
│   ├── 📁 hooks/
│   │   ├── useFileSystem.ts
│   │   ├── useDockerStatus.ts
│   │   ├── useClaudeCode.ts
│   │   ├── useWorkflow.ts
│   │   ├── useTerminal.ts
│   │   ├── useWebSocket.ts
│   │   └── index.ts
│   ├── 📁 services/
│   │   ├── claudeCodeCLI.ts
│   │   ├── dockerService.ts
│   │   ├── fileService.ts
│   │   ├── workflowService.ts
│   │   ├── websocketService.ts
│   │   └── index.ts
│   ├── 📁 types/
│   │   ├── fileSystem.ts
│   │   ├── agents.ts
│   │   ├── workflow.ts
│   │   ├── docker.ts
│   │   ├── chat.ts
│   │   └── index.ts
│   ├── 📁 utils/
│   │   ├── fileHelpers.ts
│   │   ├── dockerHelpers.ts
│   │   ├── agentHelpers.ts
│   │   ├── constants.ts
│   │   └── index.ts
│   ├── 📁 stores/
│   │   ├── fileStore.ts
│   │   ├── agentStore.ts
│   │   ├── workflowStore.ts
│   │   ├── settingsStore.ts
│   │   └── index.ts
│   ├── App.tsx
│   ├── index.tsx
│   └── globals.css
├── 📁 public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── 📁 docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   └── .dockerignore
├── 📁 claude-code/
│   ├── 📁 config/
│   │   ├── agents.json
│   │   ├── workflow.json
│   │   └── settings.json
│   ├── 📁 scripts/
│   │   ├── start-claude-code.sh
│   │   ├── setup-environment.sh
│   │   └── deploy.sh
│   └── claude-code.config.js
├── 📁 scripts/
│   ├── build.sh
│   ├── dev.sh
│   ├── docker-build.sh
│   └── claude-setup.sh
├── 📁 docs/
│   ├── README.md
│   ├── SETUP.md
│   ├── CLAUDE_CODE_INTEGRATION.md
│   └── API.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
├── .env.example
├── .gitignore
└── README.md