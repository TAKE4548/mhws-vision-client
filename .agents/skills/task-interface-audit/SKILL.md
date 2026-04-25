---
name: task-interface-audit
description: "Architectural audit for BE/FE boundary consistency."
---
# Task: Interface Audit (Architect)

This task ensures the boundary between decoupled repositories remains consistent.

## 1. Audit Requirements (Script-First Extraction)
- **[MANDATORY] Surgical Extraction**: DO NOT read the entire `openapi.yaml`. Instead:
    1. Run `python ${GLOBAL_SCRIPTS}\openapi_parser.py ../mhws-vision-server/docs/system/openapi.yaml list-endpoints` to identify the target.
    2. Run `python ${GLOBAL_SCRIPTS}\openapi_parser.py ../mhws-vision-server/docs/system/openapi.yaml get-endpoint <path> <method>` to extract the specific contract.
- **Contract Compliance**: Verify that the Frontend implementation aligns with the extracted endpoint snippet.
- **Model Validation**: Verify that Backend's Pydantic schemas (from the SSoT) match the Frontend's TypeScript interfaces.
- **Endpoint Reachability**: Ensure URLs and HTTP methods in the Frontend client match the SSoT.

## 2. Non-Ideal State Audit
- **Error Payloads**: Verify that the Backend sends the standardized error JSON defined in the contract.
- **Loading UX**: Verify that the Frontend has the necessary state transitions (isScanning, progress) to handle asynchronous responses.

## 3. Evidence
- Report any "Contract Drift" as a High-priority bug in the backlog.
