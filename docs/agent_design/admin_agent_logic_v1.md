## Admin Agent Orchestration Logic
- Accepts natural language queries from Admin
- Uses rule-based initial logic, expands into LLM query parsing
- Handles: audit logs, user subscription, behavioral metrics, churn analysis
- Accesses multiple database models across Users, Sessions, Journals, Goals, Subscriptions
- Full audit logging of admin queries for compliance
- Security: Admin-only role-based access
