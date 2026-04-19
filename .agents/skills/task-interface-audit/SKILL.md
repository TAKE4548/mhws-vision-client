---
name: task-interface-audit
description: "Architectural audit for BE/FE boundary consistency."
---
# Task: Interface Audit (Architect)

This task ensures the boundary between decoupled repositories remains consistent.

## 1. Audit Requirements
- **Source of Truth (SSoT)**: All system designs and API contracts are governed by the Server repository.
  - **Path**: `../mhws-vision-server/docs/system`
- **Contract Compliance**: Verify that the Frontend implementation aligns with the `openapi.yaml` located in the SSoT.
- **Model Validation**: Verify that Backend's Pydantic schemas (defined in the SSoT/Server repo) exactly match the Frontend's TypeScript interfaces.
- **Endpoint Reachability**: Ensure URLs and HTTP methods in the Frontend client match the Backend routers specified in the SSoT.

## 2. Non-Ideal State Audit
- **Error Payloads**: Verify that the Backend sends the standardized error JSON defined in the contract.
- **Loading UX**: Verify that the Frontend has the necessary state transitions (isScanning, progress) to handle asynchronous responses.

## 3. Evidence
- Report any "Contract Drift" as a High-priority bug in the backlog.
