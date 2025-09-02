# Agent Evaluation Template

## Evaluation Information
- **Agent**: [AGENT_NAME]
- **Session ID**: [SESSION_ID]
- **Evaluation Date**: [TIMESTAMP]
- **Evaluator**: [EVALUATOR_AGENT]
- **Evaluation Type**: [PERFORMANCE/QUALITY/FINAL]

## Performance Metrics

### Task Completion
- **Total Tasks Assigned**: [COUNT]
- **Tasks Completed**: [COUNT]
- **Tasks In Progress**: [COUNT]
- **Tasks Failed**: [COUNT]
- **Completion Rate**: [PERCENTAGE]%

### Time Management
- **Average Task Duration**: [DURATION]ms
- **Fastest Task**: [DURATION]ms - [TASK_NAME]
- **Slowest Task**: [DURATION]ms - [TASK_NAME]
- **SLA Compliance**: [PERCENTAGE]%

### Quality Metrics
- **Code Quality Score**: [SCORE]/100
- **Test Coverage**: [PERCENTAGE]%
- **Documentation Coverage**: [PERCENTAGE]%
- **Error Rate**: [PERCENTAGE]%
- **Defect Density**: [COUNT] defects per KLOC

## Technical Performance

### Frontend Architect Specific
- **Component Render Time**: [TIME]ms (Target: <100ms)
- **Bundle Size**: [SIZE]KB (Target: <800KB)
- **Accessibility Score**: [SCORE]% (Target: >95%)
- **TypeScript Compliance**: [PERCENTAGE]%
- **Monaco Editor Integration**: [PASS/FAIL]

### Backend Architect Specific
- **API Response Time P95**: [TIME]ms (Target: <200ms)
- **Database Query Time**: [TIME]ms (Target: <10ms)
- **WebSocket Latency**: [TIME]ms (Target: <10ms)
- **Cache Hit Rate**: [PERCENTAGE]% (Target: >90%)
- **Uptime**: [PERCENTAGE]% (Target: >99.99%)

### CLI Integrator Specific
- **Command Execution Time**: [TIME]ms (Target: <200ms)
- **Process Restart Success**: [PERCENTAGE]%
- **Error Recovery Rate**: [PERCENTAGE]% (Target: >95%)
- **WebSocket Connection Stability**: [PERCENTAGE]%

### Orchestrator Specific
- **Task Distribution Efficiency**: [SCORE]/100
- **Agent Utilization**: [PERCENTAGE]%
- **Conflict Resolution Time**: [TIME]ms
- **Quality Gate Pass Rate**: [PERCENTAGE]%

## Code Quality Analysis

### Adherence to Development Rules
- **TypeScript Strict Mode**: [PASS/FAIL]
  - No `any` types: [/]
  - No `@ts-ignore`: [/]
  - Proper error handling: [/]
- **Component Structure**: [PASS/FAIL]
- **Performance Budgets**: [PASS/FAIL]
- **File Size Limits**: [PASS/FAIL]

### Context7 Integration
- **Context7 Usage Rate**: [PERCENTAGE]%
- **Pattern Compliance**: [SCORE]/100
- **Code Generation Quality**: [SCORE]/100
- **Performance Impact**: [POSITIVE/NEUTRAL/NEGATIVE]

### Best Practices
- **Error Boundaries**: [IMPLEMENTED/NOT_IMPLEMENTED]
- **Memory Management**: [SCORE]/100
- **Security Compliance**: [SCORE]/100
- **Accessibility Standards**: [SCORE]/100

## Session Continuity Analysis

### Chat Log Quality
- **Log Completeness**: [PERCENTAGE]%
- **Context Preservation**: [SCORE]/100
- **Handoff Clarity**: [SCORE]/100
- **Error Documentation**: [SCORE]/100

### Knowledge Transfer
- **Decision Rationale**: [DOCUMENTED/MISSING]
- **State Preservation**: [COMPLETE/PARTIAL/INCOMPLETE]
- **Dependency Tracking**: [COMPLETE/PARTIAL/INCOMPLETE]
- **Continuation Instructions**: [CLEAR/UNCLEAR/MISSING]

## Communication Analysis

### Inter-Agent Communication
- **Response Time**: [TIME]ms
- **Message Clarity**: [SCORE]/100
- **Context Sharing**: [SCORE]/100
- **Conflict Resolution**: [SCORE]/100

### Documentation Quality
- **Technical Accuracy**: [SCORE]/100
- **Completeness**: [SCORE]/100
- **Clarity**: [SCORE]/100
- **Usefulness**: [SCORE]/100

## Issues and Improvements

### Critical Issues
1. **Issue**: [ISSUE_DESCRIPTION]
   - **Impact**: [HIGH/MEDIUM/LOW]
   - **Resolution**: [RESOLUTION_PLAN]
   - **Timeline**: [TIMEFRAME]

### Performance Issues
1. **Issue**: [PERFORMANCE_ISSUE]
   - **Metric**: [METRIC_NAME]
   - **Current**: [CURRENT_VALUE]
   - **Target**: [TARGET_VALUE]
   - **Action Plan**: [ACTION_PLAN]

### Quality Issues
1. **Issue**: [QUALITY_ISSUE]
   - **Category**: [CATEGORY]
   - **Severity**: [HIGH/MEDIUM/LOW]
   - **Remediation**: [REMEDIATION_PLAN]

## Recommendations

### Immediate Actions (Next Session)
1. [Action 1]: [Description and rationale]
2. [Action 2]: [Description and rationale]

### Short-term Improvements (Next 3 sessions)
1. [Improvement 1]: [Description and expected impact]
2. [Improvement 2]: [Description and expected impact]

### Long-term Optimizations
1. [Optimization 1]: [Description and strategic value]
2. [Optimization 2]: [Description and strategic value]

## Scoring Summary

### Overall Performance Score: [SCORE]/100

#### Breakdown:
- **Task Completion**: [SCORE]/25
- **Code Quality**: [SCORE]/25  
- **Performance**: [SCORE]/25
- **Communication**: [SCORE]/25

### Rating: [EXCELLENT/GOOD/SATISFACTORY/NEEDS_IMPROVEMENT/POOR]

### Trend Analysis
- **Previous Score**: [SCORE]/100
- **Change**: [+/-][CHANGE] points
- **Trend**: [IMPROVING/STABLE/DECLINING]

## Action Items

### For Agent
- [ ] [Action item 1]
- [ ] [Action item 2]
- [ ] [Action item 3]

### For Orchestrator
- [ ] [Coordination action 1]
- [ ] [Resource allocation action]
- [ ] [Process improvement]

### For System
- [ ] [Infrastructure improvement]
- [ ] [Tool/process update]
- [ ] [Documentation update]

## Follow-up Schedule

- **Next Evaluation**: [TIMESTAMP]
- **Performance Review**: [TIMESTAMP]
- **Quality Audit**: [TIMESTAMP]
- **Process Review**: [TIMESTAMP]

---

**Evaluation Completed**: [TIMESTAMP]  
**Evaluator Signature**: [EVALUATOR_AGENT]  
**Next Evaluation Due**: [NEXT_EVAL_DATE]