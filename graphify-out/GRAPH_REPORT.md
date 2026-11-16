# Graph Report - FelicicarWeb  (2026-11-16)

## Corpus Check
- 5 files · ~4,370 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 5, .woff2 1, .css 1)

## Summary
- 33 nodes · 29 edges · 6 communities (4 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2173f8fb`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- composer.json
- graphify.yml
- steps
- update-graph

## God Nodes (most connected - your core abstractions)
1. `steps` - 5 edges
2. `push` - 3 edges
3. `update-graph` - 3 edges
4. `require` - 3 edges
5. `on` - 2 edges
6. `permissions` - 2 edges
7. `jobs` - 2 edges
8. `with` - 2 edges
9. `config` - 2 edges
10. `name` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (6 total, 2 thin omitted)

### Community 0 - "composer.json"
Cohesion: 0.22
Nodes (8): config, vendor-dir, description, name, require, php, phpmailer/phpmailer, type

### Community 2 - "graphify.yml"
Cohesion: 0.25
Nodes (7): name, on, push, permissions, contents, branches, paths-ignore

### Community 4 - "steps"
Cohesion: 0.33
Nodes (6): name, run, uses, with, steps, fetch-depth

### Community 5 - "update-graph"
Cohesion: 0.67
Nodes (3): jobs, update-graph, runs-on

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `update-graph` connect `update-graph` to `steps`?**
  _High betweenness centrality (0.139) - this node is a cross-community bridge._
- **Why does `jobs` connect `update-graph` to `graphify.yml`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **Why does `steps` connect `steps` to `update-graph`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._