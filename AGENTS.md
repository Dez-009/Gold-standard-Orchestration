# Vida Coach Agent Architecture 
## Overview

Vida Coach uses a modular, multi-agent orchestration system to help users across different areas of life. Each "agent" specializes in a domain such as career, finance, wellness, or relationships. The orchestration pipeline routes user prompts to the appropriate agent(s) based on context, state, and goals.

## Primary Agents

### 1. 🧠 Core Coach Agent
- Role: Acts as the central routing logic
- Functions:
  - Decomposes complex prompts
  - Delegates tasks to relevant domain-specific agents
  - Aggregates and summarizes results

### 2. 💼 Career Coach Agent
- Role: Guides users through career development
- Functions:
  - Resume feedback
  - Career planning
  - Job search advice

### 3. 💰 Financial Coach Agent
- Role: Helps users manage personal finances
- Functions:
  - Budgeting tips
  - Financial goals tracking
  - Basic investment education

### 4. 🧘 Wellness Coach Agent
- Role: Supports physical and mental health goals
- Functions:
  - Exercise and nutrition plans
  - Meditation and mindfulness suggestions
  - Sleep and stress tracking

### 5. ❤️ Relationship Coach Agent
- Role: Assists with communication and emotional intelligence
- Functions:
  - Conflict resolution support
  - Relationship goal setting
  - Empathy training

### 6. 🧑‍💼 Admin Agent *(Internal Use Only)*
- Role: Enables internal tools for system oversight
- Functions:
  - Fetch data from DB for admin views
  - Trigger or simulate orchestration flows
  - Monitor agent state and override execution

## Agent State Management

Each agent attached to a user has a `state` stored in the `AgentState` model:

- `active`: Ready to respond
- `paused`: Temporarily disabled by user
- `error`: Failing or unstable
- `suspended`: Blocked by admin
- `retired`: Deprecated and replaced

## Orchestration Logic (High-Level)

1. **User submits prompt**
2. **Orchestration engine:**
   - Retrieves relevant goals, history, and states
   - Selects agents based on scope
3. **Agents respond individually**
4. **Core Coach Agent:**
   - Merges responses
   - Sends final message back to user

## Future Considerations

- Agent personality customization per domain
- Confidence scoring + fallback agent selection
- Agent-to-agent delegation chains
- User-assigned feedback loops for self-optimizing agents

---

_Last updated: June 2025_
