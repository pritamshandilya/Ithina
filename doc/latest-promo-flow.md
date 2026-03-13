## Latest Promo Flow – Retail Campaign Builder

This document describes the **latest end‑to‑end flow** for the Retail Campaign Builder promo experience, matching the updated sequence diagrams shared by your senior. It is organised into four main phases: **Smart Data Staging**, **Creative Generation**, **Refinement**, and **Publish**.

### Actors / Systems

- **User**: Retail marketer using the promo builder.
- **UI (React + Redux)**: Frontend app where the user interacts with the promo builder.
- **API (FastAPI Gateway)**: Single backend entrypoint that exposes REST endpoints for campaign operations.
- **Orch (Python Orchestrator)**: Central workflow engine/state machine that coordinates agents, DB, and external systems.
- **Agents (Python Agent Runner)**: Specialized AI/automation agents for copy, layout, image generation, and rule validation.
- **DB (Postgres/Redis)**: Stores campaign data, inventory/price data, state machine state, and audit logs.
- **RDOS (RDOS API)**: Downstream system that receives final creative assets and layout assignments for tags.
- **DCS (Display API)**: Digital signage/display controller that reports player status and syncs published content.

### Phase 1 – Smart Data Staging

1. **User submits a promo brief** in the UI, e.g. `"Clearance on Suns"`.
2. UI calls **`POST /api/campaign/predict`** on the API.
3. API forwards the request to **Orch**, which **initializes a state machine** and creates a campaign draft.
4. Orch queries **DB** for **live inventory and pricing** for relevant SKUs.
5. Orch invokes **Agents** to run **compliance rules, retail rules, and margin/format checks** on candidate SKUs.
6. Agents return **staged SKUs with margin/compliance flags** back to Orch.
7. Orch sends the staged data and rule results back to **API**, which returns it to the **UI**.
8. UI updates its state and **shows a staged grid** of SKUs and margin checks to the user.

### Phase 2 – Creative Generation

1. User clicks **“Design Creative”** in the UI for a staged campaign.
2. UI calls **`POST /api/campaign/generate`**.
3. API instructs **Orch** to start the **creative generation workflow** for the current campaign state.
4. Orch fans out work to **multiple Agents**:
   - **Agent 1**: Generates **text and copy JSON** for the creative.
   - **Agent 2**: Proposes **layout metadata** (zones, placements, sizes).
   - **Agent 3**: Fetches or selects **images/promos** for assets.
   - **Agent 4**: Produces **banner/LCD-specific variants** when needed.
5. Agents return **layout JSON variants + assets** to Orch.
6. Orch aggregates results and sends them back through **API → UI**.
7. UI updates the page and **renders multiple creative variants (e.g. A/B)** for the user to compare.

### Phase 3 – Refinement

1. User **selects a preferred variant** (e.g. Variant B) in the UI.
2. User enters a **refinement chat prompt**, e.g. `"Make header larger"`.
3. UI calls **`POST /api/campaign/refine`** with the selected variant and refinement prompt.
4. API passes the request to **Orch**, which updates the current workflow context.
5. Orch calls **Agents** to:
   - **Adjust layout JSON** (e.g. header size, font, positioning).
   - **Regenerate images** when needed using the **Python image renderer**.
   - **Re-run compliance validation** to ensure updated layout still passes rules.
6. Agents return **PASS/FAIL plus updated assets/layout**.
7. Orch persists any necessary state and sends updated layout + assets back via **API → UI**.
8. UI **re-renders the creative** and shows a **visual diff** of the previous vs refined design to the user.

### Phase 4 – Publish

1. After reviewing the refined creative, the user clicks **“Approve & Publish”**.
2. UI calls **`POST /api/campaign/publish`**.
3. API instructs **Orch** to **transition the campaign to a publishing state**.
4. Orch:
   - Persists **campaign status** in **DB** (e.g. `PENDING`, then `APPROVED`).
   - Writes an **audit log entry** for governance and traceability.
5. Orch exports a **flat BMP or other render output** and **uploads it to RDOS**, receiving an image/reference URL.
6. Orch uses **RDOS** to **assign the layout to all tag IDs** / endpoints that should display the creative.
7. RDOS confirms with a **200 OK** indicating the creative is **queued for transmission** to devices.
8. Orch periodically **polls DCS** (e.g. `GET /displayers`) to check **player statuses and sync state**.
9. Orch updates campaign progress and status and returns this back to **API**.
10. API responds to the UI with **progress updates** (e.g. `98% complete`) and final **“Publishing” / “Live”** status.
11. UI surfaces this status in dashboards so the user can **monitor publishing progress** end‑to‑end.

### Mermaid Sequence Diagram (Latest Flow)

Use the following Mermaid definition to render the latest promo flow diagram:

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant UI as UI (React + Redux)
    participant API as API (FastAPI Gateway)
    participant Orch as Orch (Python Orchestrator)
    participant Agents as Agents (Python Agent Runner)
    participant DB as DB (Postgres/Redis)
    participant RDOS as RDOS (RDOS API)
    participant DCS as DCS (Display API)

    %% Phase 1 – Smart Data Staging
    rect rgb(236,248,255)
        note over User,DB: Phase 1 – Smart Data Staging
        User->>UI: Submit prompt "Clearance on Suns"
        UI->>API: POST /api/campaign/predict
        API->>Orch: Initialize state machine\nCreate campaign draft
        Orch->>DB: Fetch live inventory & price data
        DB-->>Orch: Inventory SKUs + prices
        Orch->>Agents: Run compliance, retail rules,\nmargin & format checks
        Agents-->>Orch: Staged SKUs + flags
        Orch-->>API: Staged SKUs + margin info
        API-->>UI: Return staged data + margin checks
        UI-->>User: Show staged grid
    end

    %% Phase 2 – Creative Generation
    rect rgb(243,255,236)
        note over User,DB: Phase 2 – Creative Generation
        User->>UI: Click "Design Creative"
        UI->>API: POST /api/campaign/generate
        API->>Orch: Start creative generation workflow
        Orch->>Agents: Trigger Agent 1 (Text JSON)
        Orch->>Agents: Trigger Agent 2 (Layout / Meta)
        Orch->>Agents: Trigger Agent 3 (Fetch images / promos)
        Orch->>Agents: Trigger Agent 4 (Promo banner / LCD ads)
        Agents-->>Orch: Layout JSON variants + assets
        Orch-->>API: Return JSON variants + assets
        API-->>UI: Update React state\nRender creative variants
        UI-->>User: Show A/B variants
    end

    %% Phase 3 – Refinement
    rect rgb(255,245,236)
        note over User,DB: Phase 3 – Refinement
        User->>UI: Select Variant B
        User->>UI: Enter chat input "Make header larger"
        UI->>API: POST /api/campaign/refine
        API->>Orch: Pass refinement prompt to Orch
        Orch->>Agents: Update layout JSON
        Orch->>Agents: Trigger Python image renderer
        Orch->>Agents: Run compliance validation
        Agents-->>Orch: PASS/FAIL + updated assets
        Orch-->>API: Updated layout + assets
        API-->>UI: Update UI with refined layout
        UI-->>User: Show updated visual diff
    end

    %% Phase 4 – Publish
    rect rgb(255,236,245)
        note over User,DCS: Phase 4 – Publish
        User->>UI: Click "Approve & Publish"
        UI->>API: POST /api/campaign/publish
        API->>Orch: Request publish
        Orch->>DB: Save campaign state (PENDING, APPROVED)
        Orch->>DB: Write to audit log
        Orch->>RDOS: Upload flat BMP\nReturn image/reference URL
        Orch->>RDOS: Assign layout to all tag IDs
        RDOS-->>Orch: 200 OK (queued for transmission)
        Orch->>DCS: Poll DCS API (GET /displayers)
        DCS-->>Orch: Return player statuses
        Orch-->>API: Update status to "Publishing"
        API-->>UI: Return progress\n(e.g. 98% complete)
        UI-->>User: Show dashboard progress
    end
```

