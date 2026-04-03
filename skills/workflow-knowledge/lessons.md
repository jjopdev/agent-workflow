# Lessons Learned

- **[ARCH]** Claude Code and Copilot CLI plugin.json manifests have NO files/include/exclude field — the entire plugin directory is copied on install. To control distribution, use git-subdir source, npm source with files field, or a build script that assembles clean packages into a separate directory.
- **[ARCH]** VS Code supports `.vscodeignore` (blacklist) and `package.json` `files` field (whitelist) for controlling VSIX contents. Use `vsce package --ignoreFile` for multiple variants from the same repo.
- **[DX]** When distributing a plugin repo to multiple targets, always use a whitelist approach (include only what's needed) rather than a blacklist (exclude what's not needed). Whitelists are safer — new files won't accidentally leak into distributions.
- **[ARCH]** For VS Code multi-variant builds from a single repo, use `--ignoreFile` flag with separate `.vscodeignore.<variant>` files and swap `package.json` temporarily before `vsce package`. Always backup and restore originals.
- **[DX]** Separate dev hooks from consumer hooks. Ship empty hook templates to consumers (`hooks/hooks.json` with empty arrays), keep dev-specific hooks in `hooks/hooks.dev.json`. The `.claude/settings.json` inline hooks serve as the dev runtime.
- **[ARCH]** Eliminate canonical source duplication early. Having agents/ and skills/ duplicated in both root and .claude/ creates maintenance burden and drift risk. Single source of truth at root, .claude/ only for rules and settings.
