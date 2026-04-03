# Lessons Learned

- **[ARCH]** Claude Code and Copilot CLI plugin.json manifests have NO files/include/exclude field — the entire plugin directory is copied on install. To control distribution, use git-subdir source, npm source with files field, or a build script that assembles clean packages into a separate directory.
- **[ARCH]** VS Code supports `.vscodeignore` (blacklist) and `package.json` `files` field (whitelist) for controlling VSIX contents. Use `vsce package --ignoreFile` for multiple variants from the same repo.
- **[DX]** When distributing a plugin repo to multiple targets, always use a whitelist approach (include only what's needed) rather than a blacklist (exclude what's not needed). Whitelists are safer — new files won't accidentally leak into distributions.
