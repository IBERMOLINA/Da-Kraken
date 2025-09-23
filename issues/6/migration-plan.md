# Task: Migrate from `react-beautiful-dnd` and Upgrade to React 19

**Date**: September 23, 2025

## Problem

The `xomni` sub-project has 3 moderate severity vulnerabilities originating from the `react-syntax-highlighter` package. These vulnerabilities cannot be patched automatically because `react-syntax-highlighter` and its dependencies require React 19.

The upgrade to React 19 is blocked by the `react-beautiful-dnd` package, which is not compatible with React 19 and is no longer actively maintained.

## Proposed Solution

To resolve the security vulnerabilities and modernize the stack, a manual migration is required.

### Migration Steps

1.  **Create a dedicated branch** for this migration to avoid disrupting the `main` branch.
    ```bash
    git checkout -b feat/react19-migration
    ```

2.  **Replace `react-beautiful-dnd`**:
    *   Identify a suitable, modern drag-and-drop library that is compatible with React 19 (e.g., `dnd-kit`).
    *   Remove `react-beautiful-dnd` from `xomni/package.json`.
    *   Refactor all components that currently use `react-beautiful-dnd` to use the new library.

3.  **Upgrade Core Dependencies**:
    *   Upgrade React, React-DOM, and all related packages to their latest versions.
    ```bash
    npm install react@latest react-dom@latest @react-three/drei@latest @react-three/fiber@latest @testing-library/react@latest framer-motion@latest vite-plugin-pwa@latest react-syntax-highlighter@latest
    ```

4.  **Run Security Audit**:
    *   After the upgrades, run `npm audit` to confirm that the vulnerabilities have been resolved.
    ```bash
    npm audit
    ```

5.  **Thoroughly Test the Application**:
    *   Start the development server and test all features, paying close attention to the areas that were refactored.
    *   Run any existing unit or end-to-end tests to catch regressions.

6.  **Merge the branch** into `main` once all tests pass and the application is stable.
