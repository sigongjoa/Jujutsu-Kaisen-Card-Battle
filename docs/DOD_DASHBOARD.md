# Feature DoD: Production Ready Checklist

This document defines the **Definition of Done (DoD)** for the Jujutsu Kaisen Card Battle project. A feature is NOT done until it meets these criteria. This checklist ensures that we are not just building a "toy" but a robust, production-ready service.

## 📋 Checklist Criteria

| Category | Criteria | Notes |
| :--- | :--- | :--- |
| **Functionality** | - All requirements defined in the spec are met.<br>- Unit tests for **Edge Cases** (null, boundary values) pass.<br>- **Failure Paths** are tested and handled gracefully. | Happy Path is not enough. |
| **Observability** | - All critical events (errors, state changes) are logged in **Structured JSON**.<br>- Logs include `trace_id`, `user_id`, and `game_id`.<br>- Business metrics (e.g., card usage) are sent to monitoring (Prometheus/StatsD). | "No Logs, No Merge." |
| **Resilience** | - Server handles DB/Redis disconnections gracefully (no crash).<br>- External API calls have **Timeouts** and **Retry** policies. | Resilience testing required. |
| **Performance** | - **Race Conditions** are handled (Data Integrity guaranteed).<br>- Key API Latency is under **200ms (P99)**. | Load test results required. |
| **Security** | - Strict **Server-Side Validation** for all user payloads.<br>- **Fog of War**: Sensitive data (opponent's hand) is sanitized/masked. | Verify sanitization logic. |
| **Documentation** | - API Docs (Swagger/OAS) are synced with code.<br>- Operations Guide updated with new error codes/troubleshooting. | Keep docs living. |

## 🚀 Release Gate

Before deploying to production, verify:
1.  [ ] All P0/P1 bugs are resolved.
2.  [ ] CI/CD pipeline passes (Build, Test, Lint).
3.  [ ] Database migrations are tested and reversible.
4.  [ ] Feature flags are configured correctly.
