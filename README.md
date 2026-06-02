```markdown
/graphify . # build graph for current folder
/graphify ./docs --update # re-extract only changed files
/graphify . --cluster-only # rerun clustering without re-extracting
/graphify . --cluster-only --resolution 1.5 # more granular communities
/graphify . --cluster-only --exclude-hubs 99 # suppress utility super-hubs from god-node rankings
/graphify . --no-viz # skip the HTML, just the report + JSON
/graphify . --wiki # build a markdown wiki from the graph
graphify export callflow-html # Mermaid architecture/call-flow HTML (auto-regenerates on every git commit if hook is installed)

/graphify query "what connects auth to the database?"
/graphify path "UserService" "DatabasePool"
/graphify explain "RateLimiter"

/graphify add https://arxiv.org/abs/1706.03762 # fetch a paper and add it
/graphify add <youtube-url> # transcribe and add a video

graphify hook install # auto-rebuild on git commit
graphify merge-graphs a.json b.json # combine two graphs

graphify prs # PR dashboard: CI state, review status, worktree mapping
graphify prs 42 # deep dive on PR #42 with graph impact
graphify prs --triage # AI ranks your review queue (uses whatever backend is configured)
graphify prs --conflicts # PRs sharing graph communities — merge-order risk
```
