# Project File Analysis

Generated on: C:\Users\zochr\Desktop\GitHub\claude-code-IDE

## Summary

- **Files with code:** 119
- **Files without code/empty:** 21
- **Total non-empty lines:** 12,226

## Files with Code

| File Path | Lines (non-empty) | Total Lines | Size (bytes) |
|-----------|------------------|-------------|-------------|
| .claude/MCP-Servers | 9 | 14 | 265 |
| .claude/agent_docs/backend-architect.md | 44 | 48 | 2,615 |
| .claude/agent_docs/database-specialist.md | 63 | 67 | 3,206 |
| .claude/agent_docs/devops-specialist.md | 71 | 75 | 3,751 |
| .claude/agent_docs/documentor.md | 85 | 89 | 4,668 |
| .claude/agent_docs/evaluator.md | 97 | 101 | 5,859 |
| .claude/agent_docs/frontend-architect.md | 43 | 47 | 2,446 |
| .claude/agent_docs/orchestrator.md | 108 | 112 | 6,924 |
| .claude/agent_docs/structure-updater.md | 1 | 1 | 29 |
| .claude/agent_docs/test-architect.md | 53 | 56 | 2,993 |
| .claude/agent_docs/ui-ux.md | 113 | 136 | 6,749 |
| .claude/agents/README.md | 136 | 172 | 5,318 |
| .claude/agents/backend-architect.md | 18 | 21 | 1,070 |
| .claude/agents/database-specialist.md | 32 | 37 | 2,104 |
| .claude/agents/devops-specialist.md | 24 | 27 | 1,325 |
| .claude/agents/documentor.md | 22 | 25 | 1,527 |
| .claude/agents/evaluator.md | 32 | 37 | 2,868 |
| .claude/agents/frontend-architect.md | 16 | 18 | 1,013 |
| .claude/agents/orchestrator.md | 115 | 139 | 5,919 |
| .claude/agents/structure-updater.md | 7 | 8 | 335 |
| .claude/agents/test-architect.md | 18 | 21 | 1,188 |
| .claude/agents/ui-ux.md | 25 | 29 | 3,208 |
| .claude/memory.json | 3 | 3 | 273 |
| .claude/settings.local.json | 82 | 82 | 7,030 |
| .gitattributes | 2 | 2 | 66 |
| .serena/project.yml | 62 | 68 | 4,575 |
| CLAUDE.md | 99 | 125 | 4,367 |
| README.md | 279 | 344 | 10,865 |
| analyze_project.py | 124 | 154 | 6,204 |
| claude-chat.md | 62 | 81 | 2,742 |
| claude-code/claude-code.config.js | 440 | 470 | 11,895 |
| directory_structure.md | 133 | 133 | 4,847 |
| docker/.dockerignore | 9 | 9 | 84 |
| docker/Dockerfile | 85 | 115 | 2,599 |
| docker/docker-compose.yml | 96 | 102 | 2,766 |
| package.json | 74 | 74 | 2,393 |
| postcss.config.js | 31 | 31 | 930 |
| scripts/setup.sh | 211 | 248 | 6,461 |
| src/App.tsx | 118 | 131 | 4,266 |
| src/components/AgentStatus/AgentCard.tsx | 1 | 1 | 23 |
| src/components/AgentStatus/AgentStatus.tsx | 1 | 1 | 25 |
| src/components/AgentStatus/StatusIndicator.tsx | 1 | 1 | 29 |
| src/components/AgentStatus/index.ts | 1 | 1 | 23 |
| src/components/ChatPanel/AgentIndicator.tsx | 1 | 1 | 28 |
| src/components/ChatPanel/ChatInput.tsx | 1 | 1 | 23 |
| src/components/ChatPanel/ChatPanel.tsx | 444 | 488 | 17,356 |
| src/components/ChatPanel/MessageBubble.tsx | 1 | 1 | 27 |
| src/components/ChatPanel/index.ts | 1 | 1 | 21 |
| src/components/Editor/CodeEditor.tsx | 345 | 388 | 12,707 |
| src/components/Editor/EditorToolbar.tsx | 1 | 1 | 26 |
| src/components/Editor/FileTab.tsx | 1 | 1 | 20 |
| src/components/Editor/index.ts | 1 | 1 | 17 |
| src/components/FileExplorer/ContextMenu.tsx | 1 | 1 | 24 |
| src/components/FileExplorer/FileExplorer.tsx | 208 | 227 | 7,293 |
| src/components/FileExplorer/FileNode.tsx | 198 | 213 | 6,297 |
| src/components/FileExplorer/FileTree.tsx | 124 | 137 | 4,618 |
| src/components/FileExplorer/index.ts | 361 | 399 | 9,942 |
| src/components/Layout/Header.tsx | 230 | 234 | 7,285 |
| src/components/Layout/Sidebar.tsx | 1 | 1 | 21 |
| src/components/Layout/SplitPanel.tsx | 1 | 1 | 24 |
| src/components/Layout/TabBar.tsx | 1 | 1 | 20 |
| src/components/Layout/index.ts | 1 | 1 | 18 |
| src/components/Preview/BrowserFrame.tsx | 1 | 1 | 25 |
| src/components/Preview/DeviceSimulator.tsx | 1 | 1 | 28 |
| src/components/Preview/PreviewPanel.tsx | 335 | 366 | 14,137 |
| src/components/Preview/index.ts | 1 | 1 | 18 |
| src/components/Settings/AgentSettings.tsx | 1 | 1 | 27 |
| src/components/Settings/DockerConfig.tsx | 1 | 1 | 26 |
| src/components/Settings/SettingsPanel.tsx | 480 | 522 | 19,873 |
| src/components/Settings/WorkflowSettings.tsx | 1 | 1 | 30 |
| src/components/Settings/index.ts | 1 | 1 | 20 |
| src/components/Terminal/CommandInput.tsx | 1 | 1 | 25 |
| src/components/Terminal/Terminal.tsx | 618 | 676 | 25,564 |
| src/components/Terminal/TerminalOutput.tsx | 1 | 1 | 27 |
| src/components/Terminal/index.ts | 1 | 1 | 19 |
| src/components/UI/Button.tsx | 1 | 1 | 20 |
| src/components/UI/Input.tsx | 1 | 1 | 19 |
| src/components/UI/Modal.tsx | 1 | 1 | 19 |
| src/components/UI/Tooltip.tsx | 1 | 1 | 21 |
| src/components/UI/index.ts | 1 | 1 | 14 |
| src/components/WorkflowEditor/AgentNode.tsx | 1 | 1 | 23 |
| src/components/WorkflowEditor/ConnectionLine.tsx | 1 | 1 | 28 |
| src/components/WorkflowEditor/WorkflowCanvas.tsx | 1 | 1 | 28 |
| src/components/WorkflowEditor/WorkflowEditor.tsx | 618 | 676 | 24,889 |
| src/components/WorkflowEditor/index.ts | 1 | 1 | 26 |
| src/globals.css | 703 | 822 | 17,732 |
| src/hooks/index.ts | 1 | 1 | 17 |
| src/hooks/useClaudeCode.ts | 274 | 297 | 9,602 |
| src/hooks/useDockerStatus.ts | 230 | 265 | 8,574 |
| src/hooks/useFileSystem.ts | 383 | 438 | 12,513 |
| src/hooks/useTerminal.ts | 250 | 292 | 8,103 |
| src/hooks/useWebSocket.ts | 220 | 261 | 8,100 |
| src/hooks/useWorkflow.ts | 1 | 1 | 20 |
| src/index.tsx | 46 | 55 | 2,208 |
| src/services/claudeCodeCLI.ts | 316 | 370 | 9,755 |
| src/services/dockerService.ts | 555 | 642 | 18,594 |
| src/services/fileService.ts | 453 | 519 | 15,858 |
| src/services/index.ts | 1 | 1 | 20 |
| src/services/websocketService.ts | 1 | 1 | 28 |
| src/services/workflowService.ts | 1 | 1 | 27 |
| src/stores/agentStore.ts | 1 | 1 | 20 |
| src/stores/fileStore.ts | 1 | 1 | 19 |
| src/stores/index.ts | 274 | 297 | 9,602 |
| src/stores/settingsStore.ts | 1 | 1 | 23 |
| src/stores/workflowStore.ts | 1 | 1 | 23 |
| src/types/agents.ts | 1 | 1 | 16 |
| src/types/chat.ts | 1 | 1 | 14 |
| src/types/docker.ts | 1 | 1 | 16 |
| src/types/fileSystem.ts | 1 | 1 | 20 |
| src/types/index.ts | 316 | 370 | 9,755 |
| src/types/workflow.ts | 1 | 1 | 18 |
| src/utils/agentHelpers.ts | 1 | 1 | 24 |
| src/utils/constants.ts | 1 | 1 | 21 |
| src/utils/dockerHelpers.ts | 1 | 1 | 25 |
| src/utils/fileHelpers.ts | 701 | 849 | 20,462 |
| src/utils/index.ts | 1 | 1 | 17 |
| tailwind.config.js | 230 | 234 | 7,518 |
| tsconfig.json | 92 | 99 | 2,439 |
| vite.config.ts | 127 | 138 | 3,318 |

## Files Missing Code or Empty

| File Path | Status |
|-----------|--------|
| .gitignore | Empty file |
| claude-code/config/agents.json | Empty file |
| claude-code/config/settings.json | Empty file |
| claude-code/config/workflow.json | Empty file |
| claude-code/scripts/deploy.sh | Empty file |
| claude-code/scripts/setup-environment.sh | Empty file |
| claude-code/scripts/start-claude-code.sh | Empty file |
| docker/docker-compose.dev.yml | Empty file |
| docs/API.md | Empty file |
| docs/CLAUDE_CODE_INTEGRATION.md | Empty file |
| docs/README.md | Empty file |
| docs/SETUP.md | Empty file |
| docs/UPDATE.md | Empty file |
| file_list.md | Empty file |
| package-lock.json | Empty file |
| public/index.html | Empty file |
| public/manifest.json | Empty file |
| scripts/build.sh | Empty file |
| scripts/claude-setup.sh | Empty file |
| scripts/dev.sh | Empty file |
| scripts/docker-build.sh | Empty file |

## File Type Distribution

| Extension | File Count | Total Lines |
|-----------|------------|-------------|
| .ts | 40 | 4,487 |
| .tsx | 38 | 3,790 |
| .md | 25 | 1,696 |
| .css | 1 | 703 |
| .js | 3 | 701 |
| .json | 4 | 251 |
| .sh | 1 | 211 |
| .yml | 2 | 158 |
| .py | 1 | 124 |
| no extension | 4 | 105 |
