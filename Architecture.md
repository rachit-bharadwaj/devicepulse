# Architecture & Design

### Q1: How would you scale this system to 10,000+ devices?

*   **Asynchronous Poller Workers**: I would offload checks to distributed worker queues and scale WebSocket updates via a **Redis Pub/Sub** layer.
*   **Database connection management**: I would employ **PgBouncer** connection pooling and utilize **TimescaleDB** for storing high-frequency telemetry.

---

### Q2: How would you integrate real SNMP/ICMP checks?

*   **Async Ping & SNMP Poller**: I would run non-blocking ping checks using `aioping` (with `CAP_NET_RAW` privileges) and query system parameters using `pysnmp`.
*   **Trap Daemon Listener**: I would deploy an SNMP traps daemon on port 162 to process incoming unsolicited hardware alerts and push them directly to clients.

---

### Q3: How would you manage high-frequency alerts?

*   **Aggregation & Suppression**: I would deduplicate duplicate alert keys in Redis and suppress alerts for flapping devices that repeatedly toggle state.
*   **Triage Prioritization**: I would route alerts into high/medium/low priority queues to ensure critical device outages are processed first.

---

### Q4: What security considerations would you prioritize?

*   **Session & Endpoint Security**: I would enforce role-based access control (RBAC) on all FastAPI routes and secure session JWTs in HTTP-only cookies.
*   **Database & Traffic Safety**: I would use SQLAlchemy parameterized queries to prevent SQL injections and encrypt telemetry checks using SNMPv3.

---