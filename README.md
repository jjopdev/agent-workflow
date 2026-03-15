# Agent Workflow Repository

Repository for defining an agent workflow in GitHub Copilot, focused on orchestration, reusable skills, specialized agents, and operational documentation.

## Objective

This project is not a web application or a runtime library. Its purpose is to maintain a clear, reusable configuration for working with agents inside VS Code and GitHub Copilot.

## Structure

- `.github/agents/`: definitions of specialized agents such as `orchestrator`, `implementer`, `reviewer`, and `tester`.
- `.github/skills/`: project skills for navigation, orchestration, security, and skill creation.
- `.github/instructions/`: active repository instructions.
- `.github/tasks/`: workflow operating state and lessons learned.
- `workflow-model-strategy.md`: model strategy and cost/quality criteria for the workflow.

## Expected Usage

This repository is used as a configuration base so Copilot and the agents can work with a consistent flow:

1. The orchestrator analyzes the task and decides whether to delegate.
2. The subagents use skills specific to the repository.
3. Lessons learned are recorded in `.github/tasks/lessons.md`.
4. Workflow documentation is maintained alongside the configuration.

## Compatibility

Some tools and agents depend on the current VS Code environment, installed integrations, and, in some cases, optional MCP servers. The workflow does not assume MCP is always available: if an integration or tool is not installed in the active environment, some optional capabilities may not appear or may not run.

## Maintenance Criteria

- Keep the instructions aligned with the actual contents of the repository.
- Avoid rules for stacks that do not exist in the project.
- Make changes small and easy to verify.
- Prioritize operational clarity in agents, skills, and documentation.

## Key Files

- `.github/copilot-instructions.md`
- `.github/instructions/tech-lead-workflow.instructions.md`
- `.github/agents/orchestrator.agent.md`
- `.github/skills/workflow-orchestrator/SKILL.md`
- `workflow-model-strategy.md`

## Current Status

The repository is currently centered on workflow configuration and documentation. If application code is added in the future, the instructions and the `README.md` should be adjusted to match that new scope.