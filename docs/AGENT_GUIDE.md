# Vida Coach Agent Guide

This document outlines the core agents in the Vida Coach system, how prompts are orchestrated, and where to find logs and memory state.

## Agent Roles

### 🧠 Core Coach Agent
- **Role:** Central router for all user prompts.
- **Functions:** Breaks down requests, delegates to domain agents, and merges responses.

### 💼 Career Coach Agent
- **Role:** Offers career development guidance.
- **Functions:** Resume review, job search strategy, and career planning tips.

### 💰 Financial Coach Agent
- **Role:** Provides personal finance support.
- **Functions:** Budgeting help, goal tracking, and basic investing education.

### 🧘 Wellness Coach Agent
- **Role:** Focuses on physical and mental wellbeing.
- **Functions:** Workout ideas, nutrition reminders, and mindfulness prompts.

### ❤️ Relationship Coach Agent
- **Role:** Supports communication and emotional intelligence.
- **Functions:** Conflict resolution, emotional check-ins, and empathy training.

### 🧑‍💼 Admin Agent *(internal only)*
- **Role:** Enables admin access for audits and debugging.
- **Functions:** Database queries, agent state overrides, and orchestration log review.

## Orchestration Flow
1. **User prompt received** via API or web UI.
2. **Core Coach Agent** checks user history and goals.
3. **Relevant domain agents** run in parallel.
4. **Core Coach Agent** aggregates outputs with scoring based on completeness and tone.
5. **Final response** returned to the user and stored in logs.

The [architecture/system_architecture.md](architecture/system_architecture.md) diagram shows the high‑level data flow.

## Prompt Examples
```text
"Help me prepare for a promotion interview."  ➜ Career Coach Agent
"How can I save more for a house down payment?"  ➜ Financial Coach Agent
"Suggest a quick mindfulness exercise."  ➜ Wellness Coach Agent
```

See [agent_design/orchestration_prompt_template.md](agent_design/orchestration_prompt_template.md) for more template examples.

## Logs and Overrides
- Execution logs for each agent run are stored and accessible through the admin dashboard. See [docs/agent.md](agent.md#logging--monitoring).
- Admins can override or annotate responses. Details are in [agent.md](agent.md#orchestration-logic).

## Memory State
Agent activation and history are tracked in the `AgentState` model. The possible states are outlined in [AGENTS.md](../AGENTS.md#agent-state-management).
