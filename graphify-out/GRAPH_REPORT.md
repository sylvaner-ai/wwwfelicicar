# Graph Report - wwwfelicicar  (2026-11-16)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 36 nodes · 31 edges · 7 communities (4 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `be8571d9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- composer.json
- graphify.yml
- steps
- update-graph

## God Nodes (most connected - your core abstractions)
1. `steps` - 6 edges
2. `require` - 3 edges
3. `update-graph` - 3 edges
4. `push` - 3 edges
5. `config` - 2 edges
6. `env` - 2 edges
7. `with` - 2 edges
8. `jobs` - 2 edges
9. `permissions` - 2 edges
10. `on` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (7 total, 3 thin omitted)

### Community 0 - "composer.json"
Cohesion: 0.22
Nodes (8): config, vendor-dir, description, name, require, php, phpmailer/phpmailer, type

### Community 1 - "graphify.yml"
Cohesion: 0.25
Nodes (8): GRAPHIFY_FORCE, env, name, run, uses, with, steps, fetch-depth

### Community 2 - "steps"
Cohesion: 0.29
Nodes (6): jobs, update-graph, name, permissions, contents, runs-on

### Community 4 - "update-graph"
Cohesion: 0.50
Nodes (4): on, push, branches, paths-ignore

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `steps` connect `graphify.yml` to `steps`?**
  _High betweenness centrality (0.161) - this node is a cross-community bridge._
- **Why does `update-graph` connect `steps` to `graphify.yml`?**
  _High betweenness centrality (0.150) - this node is a cross-community bridge._