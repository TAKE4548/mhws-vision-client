---
name: task-interface-audit
description: "Architectural audit for BE/FE boundary consistency."
---
# Task: Interface Audit (Architect)

This task ensures the boundary between decoupled repositories remains consistent.

## 1. Audit Requirements
- **Contract Drift**: Compare `API_CONTRACT.md` in both repositories. They MUST be identical.
- **Model Validation**: Verify that Backend's Pydantic schemas exactly match the Frontend's TypeScript interfaces.
- **Endpoint Reachability**: Ensure URLs and HTTP methods in the Frontend client match the Backend routers.

## 2. Non-Ideal State Audit
- **Error Payloads**: Verify that the Backend sends the standardized error JSON defined in the contract.
- **Loading UX**: Verify that the Frontend has the necessary state transitions (isScanning, progress) to handle asynchronous responses.

## 3. Evidence
- Report any "Contract Drift" as a High-priority bug in the backlog.
