# Vida Coach Agent System

## Overview
The Vida Coach platform uses a modular multi-agent orchestration system to deliver personalized coaching experiences. Agents process journal entries, goals, check-ins, and user personas to provide insights, feedback, and progress tracking.

---

## Agent Roles

### 1. JournalSummarizationAgent
**Purpose:** Generate concise summaries of user journal entries.  
**Context:** Uses recent entries + user goals + personality tags.  
**Triggers:** On journal submission or admin request.  
**Output:** Summary, tone analysis, metadata (mood, sentiment).

---

### 2. GoalSuggestionAgent
**Purpose:** Recommend goals based on user trends and reflections.  
**Context:** Injects check-in patterns, recent summaries, and mood logs.  
**Triggers:** Weekly review submission or idle goal state.  
**Output:** SMART goals (Specific, Measurable, Achievable, Relevant, Timely).

---

### 3. ProgressReportingAgent
**Purpose:** Generate coaching-style feedback based on agent outputs.  
**Context:** Aggregates output from summary + goal agents.  
**Triggers:** On request (PDF export, coaching recap).  
**Output:** Narrative progress reports with reflection prompts.

---

## Orchestration Logic

- Agents are executed **in parallel** unless sequential dependency is declared.
- Output aggregation uses a scoring system:
  - Completeness
  - Clarity
  - Sentiment impact
- Admins may **override or annotate** any agent output.

---

## Agent Personalization

Each agent run is dynamically adjusted based on:
- `user.personality_traits`
- `user.previous_agent_responses`
- `user.journal_topics`
- Active subscription level (affects access to advanced agents)

---

## Logging & Monitoring

- Every agent invocation is logged with:
  - Execution time
  - Input tokens
  - Output tokens
  - Retry/failure status
- Orchestration logs are viewable in the admin dashboard.

---

## Feedback Loop

- Admins can leave star ratings + feedback on summaries.
- Users can react (e.g., 👍 / 👎) to agent responses.
- Feedback is stored and used in future prompt weighting.

---

## Future Agents (Planned)

| Name | Description |
|------|-------------|
| HabitSyncAgent | Syncs data from wearable devices and correlates with journal activity |
| ReflectionBoosterAgent | Injects prompts to help users reflect more deeply |
| ConflictResolutionAgent | Analyzes journal for tension and offers resolution strategies |

---
