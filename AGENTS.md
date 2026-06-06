# AGENTS.md

## RTK Token Optimization

所有通过 bash 工具执行的 CLI 命令必须使用 `rtk` 前缀，节省 60-90% token 消耗。

| 原始命令 | RTK 等效命令 |
|---------|-------------|
| `git status` / `git log` / `git diff` | `rtk git status` |
| `grep "pattern" src/` | `rtk grep "pattern" src/` |
| `ls src/` | `rtk ls src/` |
| `find "*.rs" .` | `rtk find "*.rs" .` |
| `tsc --noEmit` | `rtk tsc --noEmit` |
| `pnpm test` / `npm test` | `rtk pnpm test` |
| `cargo test` | `rtk cargo test` |
| `docker ps` | `rtk docker ps` |
| `eslint src/` | `rtk lint src/` |
| 大文件 `cat` → `read_file` 工具（已原生优化，无需 rtk） |

### 强制规则

```
❌ WRONG: bash: "git status"
✅ RIGHT: bash: "rtk git status"

❌ WRONG: bash: "grep 'export' src/"
✅ RIGHT: bash: "rtk grep 'export' src/"

❌ WRONG: bash: "tsc --noEmit"
✅ RIGHT: bash: "rtk tsc --noEmit"
```

### 例外（不需要 rtk 前缀）

- `read_file` / `grep` / `glob` / `edit_file` / `write_file` 工具（已原生优化）
- git 提交操作
- `web_fetch` / `web_search`
