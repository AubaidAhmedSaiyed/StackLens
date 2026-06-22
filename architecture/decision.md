

# ARCHITECTURAL_DECISION.md

## Project: Codebase Dependency Intelligence Engine

---

# 1. Goal of the System

We are building a lightweight static analysis engine that:

* Scans a JavaScript/TypeScript repository
* Parses source files using AST
* Extracts module dependencies
* Builds a dependency graph
* Computes change impact analysis
* Visualizes architecture interactively

---

# 2. Core Design Philosophy

We optimize for:

* correctness over completeness
* clarity over over-engineering
* explainability over hidden magic
* modular pipeline over monolith
* MVP first, extensibility later

This system is NOT designed as a production-scale enterprise tool.

It is a **developer intelligence prototype engine**.

---

# 3. System Architecture Options

We evaluated multiple approaches for each layer.

---

# 3.1 Repository Scanning

## Option A: Manual fs Recursive Traversal

### Pros:

* Full control
* Educational (learn recursion deeply)
* No dependencies

### Cons:

* boilerplate heavy
* error-prone edge cases
* slower development

---

## Option B: fast-glob based scanning

### Pros:

* extremely fast development
* battle-tested
* handles recursion internally
* supports ignore patterns easily

### Cons:

* abstraction hides traversal logic

---

## Decision: Use fast-glob

### Reason:

MVP prioritizes speed and correctness of scanning over learning recursion internals.

We still conceptually understand traversal, but avoid reinventing it.

---

# 3.2 AST Parsing Strategy

## Option A: Regex-based parsing

### Pros:

* fast to implement
* no dependencies

### Cons:

* incorrect for complex syntax
* breaks easily
* cannot handle edge cases (dynamic imports, multiline, etc.)

---

## Option B: Full language compiler (TypeScript Compiler API)

### Pros:

* highly accurate
* production-grade AST

### Cons:

* heavy setup
* slower iteration
* unnecessary complexity for MVP

---

## Option C: Babel AST Parser

### Pros:

* lightweight
* widely used in tooling
* supports JS/TS syntax
* easy traversal APIs

### Cons:

* slightly less strict than TS compiler API

---

## Decision: Babel Parser

### Reason:

Best balance between:

* accuracy
* simplicity
* ecosystem support

---

# 3.3 Dependency Extraction Strategy

## Option A: Static import-only extraction

We only analyze:

```js
import x from "module"
```

### Pros:

* simple
* deterministic
* fast

### Cons:

* misses dynamic requires

---

## Option B: Full semantic analysis

Track runtime imports, eval, dynamic loading

### Pros:

* complete accuracy

### Cons:

* extremely complex
* not needed for MVP

---

## Decision: Static import-only

### Reason:

Static imports cover majority of real-world architecture understanding needs.

---

# 3.4 Graph Representation

## Option A: Adjacency List (In-memory)

```js
file -> [dependencies]
```

### Pros:

* simple
* fast traversal
* easy to build impact analysis

### Cons:

* no persistence

---

## Option B: Graph Database (Neo4j etc.)

### Pros:

* powerful querying
* scalable relationships

### Cons:

* heavy infrastructure
* unnecessary for MVP
* slows development

---

## Option C: PostgreSQL relational model

### Pros:

* persistent storage
* structured

### Cons:

* not ideal for graph traversal logic

---

## Decision: In-memory adjacency list

### Reason:

We need fast traversal for impact analysis, not persistence.

---

# 3.5 Change Impact Analysis Strategy

## Option A: Direct dependency lookup

Only show immediate imports.

### Pros:

* simple

### Cons:

* shallow insights

---

## Option B: Full graph traversal (BFS/DFS)

Compute:

* direct dependencies
* indirect dependencies
* transitive closure

### Pros:

* accurate impact analysis
* realistic devtools behavior

### Cons:

* slightly more logic

---

## Decision: BFS + reverse dependency graph

### Reason:

This enables real “what breaks if I change this file” functionality.

---

# 3.6 Visualization Layer

## Option A: Static diagram rendering

### Pros:

* simple
* fast

### Cons:

* not interactive

---

## Option B: Interactive graph visualization

(using React-based graph rendering)

### Pros:

* clickable nodes
* highlight dependencies
* professional devtools feel

### Cons:

* slightly more frontend work

---

## Decision: Interactive graph visualization

### Reason:

Visualization is key product value.

---

# 4. System Data Flow (Final Design)

```text
Repository Input
      ↓
File Scanner (fast-glob)
      ↓
AST Parser (Babel)
      ↓
Dependency Extractor
      ↓
Graph Builder (Adjacency List)
      ↓
Impact Analysis Engine (BFS traversal)
      ↓
API Layer (Node/Express)
      ↓
Frontend Visualization (React Flow)
```

---

# 5. Key Data Structures

## File Node

```js
{
  id: "src/app.js",
  imports: ["react", "./utils"],
  importedBy: []
}
```

---

## Graph Representation

```js
{
  "src/app.js": ["src/utils.js", "src/api.js"]
}
```

---

## Reverse Graph (for impact analysis)

```js
{
  "src/utils.js": ["src/app.js"]
}
```

---

# 6. Key Algorithms

## 6.1 Dependency Extraction

* AST traversal
* extract ImportDeclaration nodes

---

## 6.2 Graph Construction

* build adjacency list
* build reverse adjacency list

---

## 6.3 Impact Analysis

* BFS on reverse graph
* collect all reachable nodes

---

# 7. Tradeoff Summary

| Decision | Choice          | Reason                    |
| -------- | --------------- | ------------------------- |
| Scanning | fast-glob       | speed + simplicity        |
| Parsing  | Babel AST       | balance of accuracy       |
| Storage  | in-memory graph | fast traversal            |
| Analysis | BFS traversal   | transitive impact         |
| UI       | React Flow      | interactive visualization |

---

# 8. What We Are NOT Building (Intentional Scope Cuts)

We explicitly avoid:

* AI semantic analysis
* multi-language support
* database persistence
* auth / users / teams
* real-time syncing
* cloud deployment complexity

Reason:
keep system focused on **core intelligence engine**

---

# 9. Why This Architecture Wins (Interview Answer)

This design demonstrates:

* understanding of static analysis systems
* graph-based modeling of software
* AST parsing fundamentals
* tradeoff-driven engineering decisions
* modular system design
* separation of concerns

---

# 10. Final Engineering Statement

This system is intentionally designed as:

> a simplified model of how real developer tooling systems understand and reason about codebases using static analysis and graph theory.



