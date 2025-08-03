# Public Readiness and Demo Scope

This document clarifies the purpose and limitations of this demo repository.

## Why This Demo Repository Exists
This repository was created as a **static, non-running showcase** of the Playable Character Cards architecture. Its primary purpose is to serve as a portfolio piece that demonstrates advanced concepts in:
-   **System Design**: A headless, scalable, and secure API architecture.
-   **API Contract Design**: Clear, intuitive, and robust API endpoints.
-   **AI Integration Patterns**: The modular and resilient AI Adapter Pattern.
-   **Agentic Development Workflows**: A structured, AI-driven process for building and maintaining software.

It was created as a clean, safe alternative to the original private repository, which contains sensitive history, secrets, and production configurations not suitable for public exposure.

## What Is Intentionally Excluded
To ensure this repository is safe and focused, the following have been **intentionally omitted**:
-   **No Secrets or API Keys**: There are no real credentials for Supabase, Google AI, or any other service.
-   **No Backend or Runtime**: There is no runnable code. All `.ts` and `.js` files are illustrative pseudo-code.
-   **No Supabase Project Link**: This demo is not connected to any live Supabase instance.
-   **No Build or Deployment Scripts**: There are no CI/CD pipelines, build tools, or deployment configurations.
-   **No User Data**: The repository contains no user-generated content or personal information.

## How a Real Deployment Would Differ
A production version of this project would require several additional components not included in this demo:
1.  **Infrastructure Setup**: A live Supabase project with a PostgreSQL database and Storage buckets configured.
2.  **Secret Management**: Secure storage and injection of environment variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GCP_API_KEY`, `ADMIN_SECRET_KEY`, etc.) into the Edge Function runtime.
3.  **CI/CD Pipeline**: Automated workflows for linting, testing, building, and deploying Edge Functions to Supabase.
4.  **Robust Error Handling & Logging**: Integration with a logging service for monitoring and alerting.
5.  **Admin Interface**: A real, functional admin UI for managing cards, instead of just illustrative pseudo-code.
6.  **Comprehensive Test Suite**: A full suite of integration and regression tests that run against a real test database and live AI APIs.
