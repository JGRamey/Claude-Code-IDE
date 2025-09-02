# Session Chat Log Template

## Session Information
- **Session ID**: [SESSION_ID]
- **Agent**: [AGENT_NAME]
- **Start Time**: [TIMESTAMP]
- **Status**: [ACTIVE/PAUSED/COMPLETED]

## Session Context
- **Project**: Claude Code IDE
- **Current Branch**: [GIT_BRANCH]
- **Working Directory**: /Users/grant/Documents/GitHub/Claude-Code-IDE
- **Previous Session**: [PREVIOUS_SESSION_ID] (if applicable)

## Objectives
### Primary Objectives
- [ ] [Primary objective 1]
- [ ] [Primary objective 2]

### Secondary Objectives
- [ ] [Secondary objective 1]
- [ ] [Secondary objective 2]

## Activities Log

### [TIMESTAMP] - [ACTIVITY_TYPE]
- **Action**: [DETAILED_ACTION_DESCRIPTION]
- **Files Modified**: [LIST_OF_FILES]
- **Duration**: [DURATION_MS]ms
- **Success**: [TRUE/FALSE]
- **Notes**: [ADDITIONAL_NOTES]

---

### [TIMESTAMP] - Task Assignment
- **Task**: [TASK_DESCRIPTION]
- **Assigned To**: [AGENT_NAME]
- **Priority**: [HIGH/MEDIUM/LOW]
- **Dependencies**: [DEPENDENCY_LIST]
- **Expected Completion**: [TIME_ESTIMATE]

---

### [TIMESTAMP] - Code Generation
- **Context7 Used**: [TRUE/FALSE]
- **Component/Module**: [NAME]
- **Technology**: [TECHNOLOGY_STACK]
- **Lines Generated**: [LINE_COUNT]
- **Test Coverage**: [PERCENTAGE]%
- **Performance Impact**: [IMPACT_DESCRIPTION]

---

### [TIMESTAMP] - Error Handling
- **Error Type**: [ERROR_TYPE]
- **Error Message**: [ERROR_MESSAGE]
- **Stack Trace**: 
```
[STACK_TRACE]
```
- **Resolution**: [RESOLUTION_DESCRIPTION]
- **Prevention**: [PREVENTION_STRATEGY]

---

### [TIMESTAMP] - Performance Metrics
- **Operation**: [OPERATION_NAME]
- **Response Time**: [TIME]ms
- **Memory Usage**: [MEMORY]MB
- **CPU Usage**: [CPU]%
- **Cache Hit Rate**: [PERCENTAGE]%

---

### [TIMESTAMP] - Quality Gate
- **Gate Type**: [GATE_TYPE]
- **Criteria**: [CRITERIA_LIST]
- **Result**: [PASS/FAIL]
- **Issues**: [ISSUE_LIST]
- **Actions Required**: [ACTION_LIST]

## Inter-Agent Communication

### [TIMESTAMP] - Message to [TARGET_AGENT]
- **Request Type**: [REQUEST_TYPE]
- **Context**: [CONTEXT_DESCRIPTION]
- **Expected Response**: [RESPONSE_DESCRIPTION]
- **Status**: [PENDING/RECEIVED/TIMEOUT]

### [TIMESTAMP] - Response from [SOURCE_AGENT]
- **Response**: [RESPONSE_CONTENT]
- **Action Taken**: [ACTION_DESCRIPTION]
- **Follow-up Required**: [TRUE/FALSE]

## Context Preservation

### Key Decisions Made
1. [Decision 1]: [Rationale and impact]
2. [Decision 2]: [Rationale and impact]

### Active Variables
- **Variable Name**: [Value] - [Description]
- **State Object**: [Serialized state for next session]

### Dependencies
- **Internal**: [List of internal dependencies]
- **External**: [List of external dependencies]
- **Blockers**: [Current blockers]

### File System Changes
- **Created Files**: [FILE_LIST]
- **Modified Files**: [FILE_LIST]
- **Deleted Files**: [FILE_LIST]
- **Moved Files**: [FROM_PATH] ’ [TO_PATH]

## Development Rules Compliance

### TypeScript Strict Mode
- [/] No `any` types used
- [/] No `@ts-ignore` comments
- [/] Proper error handling implemented
- [/] Resource cleanup implemented

### Performance Standards
- [/] Response times under thresholds
- [/] Memory usage within limits
- [/] Bundle size optimizations applied

### Test Coverage
- **Current Coverage**: [PERCENTAGE]%
- **Target Coverage**: 80%
- **Missing Tests**: [TEST_LIST]

## Session Handoff Preparation

### Session Summary
- **Total Duration**: [DURATION]
- **Tasks Completed**: [COMPLETED_COUNT]/[TOTAL_COUNT]
- **Major Achievements**: [ACHIEVEMENT_LIST]
- **Outstanding Issues**: [ISSUE_LIST]

### Context for Next Session
- **Priority Tasks**: [TASK_LIST]
- **Current State**: [STATE_DESCRIPTION]
- **Required Context**: [CONTEXT_ITEMS]
- **Continuation Instructions**: [INSTRUCTION_LIST]

### Cleanup Tasks
- [ ] Archive completed items
- [ ] Update project documentation
- [ ] Commit code changes
- [ ] Create session summary
- [ ] Prepare handoff document

---

**Session End Time**: [TIMESTAMP]  
**Next Session**: [NEXT_SESSION_ID]  
**Archived**: [TRUE/FALSE]