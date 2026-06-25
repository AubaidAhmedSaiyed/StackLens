<div align="center">
  <img src="https://img.shields.io/badge/StackLens-Codebase_Intelligence-2f81f7?style=for-the-badge" alt="StackLens Logo" />
  <h1>StackLens</h1>
  <p><strong>A Full-Stack Repo Dependency Visualization Engine</strong></p>
</div>

StackLens takes any GitHub repository, parses its abstract syntax trees (ASTs), and generates a stunning, interactive dependency graph. It helps software engineers quickly map out unfamiliar codebases, detect architectural anti-patterns, and visualize the "blast radius" of code changes.

---

## 🚀 Core Features

- **GitHub Repository Ingestion**: Instantly fetch and analyze repositories directly from GitHub without cloning them locally.
- **Hierarchical Visualization**: Automatically layouts tangled dependencies into a clean, readable Left-to-Right flowchart using Dagre and React Flow.
- **Change Impact Analysis**: Click any file on the graph to instantly highlight every downstream file that relies on it (the blast radius).
- **Code Health Metrics**: Automatically detects Circular Dependencies, Dead Code, and Heavy Modules.

---

## 📂 Project Structure & File Deep-Dive

The project is split into a **Node.js Express Backend** (for heavy AST parsing) and a **React + Vite Frontend** (for interactive rendering).

### ⚙️ Backend Structure (`/server`)

The backend is responsible for fetching code, parsing it, building graphs, and calculating metrics.

#### 1. Entry & Routing
- **`server.js`**
  - *What it does*: The main entry point for the Express application. Sets up CORS, JSON parsing, and mounts the API routes.
  - *Impact*: Bootstraps the entire server layer.
- **`server/routes/analyze.js`**
  - *What it does*: The core orchestrator endpoint (`POST /api/analyze`). It takes a GitHub URL, coordinates the fetching, parsing, graph building, and analysis, and returns the final payload to the frontend.
  - *Impact*: Acts as the controller connecting all the isolated services together.

#### 2. Services & Parsing
- **`server/services/githubService.js`**
  - *What it does*: Uses the GitHub API to fetch the repository tree and then concurrently downloads the raw text content of `.js`/`.ts` files.
  - *Impact*: Keeps the backend stateless by avoiding local Git clones, though it is bound by GitHub's API rate limits.
- **`server/parser/extractDependencies.js`**
  - *What it does*: Takes a raw string of JavaScript/TypeScript code, parses it into an Abstract Syntax Tree (AST) using `@babel/parser`, and extracts all `import` and `require` statements.
  - *Impact*: The most crucial and CPU-intensive file in the system. It ensures 100% accurate dependency extraction compared to brittle Regex.

#### 3. Graph Construction
- **`server/graph/buildgraph.js`**
  - *What it does*: Iterates over the extracted imports and builds an Adjacency List (a map where `File -> [Dependencies]`).
  - *Impact*: Creates the foundational data structure used by all other analyzers and the frontend.
- **`server/graph/buildReverseGraph.js`**
  - *What it does*: Inverts the edges of the primary graph. Instead of showing what a file imports, it maps what files *import it*.
  - *Impact*: Unlocks the ability to do O(V+E) instant Change Impact Analysis.
- **`utils/resolvePath.js`**
  - *What it does*: Translates relative import statements (like `./utils/math`) back into the absolute file paths provided by the GitHub tree.
  - *Impact*: Crucial for linking edges correctly in the graph. Without this, nodes would be disconnected.

#### 4. Architecture Analyzers
- **`server/analysis/circular.js`**
  - *What it does*: Uses a Depth-First Search (DFS) algorithm to detect cycles in the graph (e.g., A -> B -> C -> A).
  - *Impact*: Highlights dangerous architectural loops that cause memory leaks or bundling errors.
- **`server/analysis/dead.js`**
  - *What it does*: Scans the reverse graph for files that have zero incoming edges (nobody imports them).
  - *Impact*: Identifies unused code that can be safely deleted.
- **`server/analysis/heavy.js`**
  - *What it does*: Scans for files that have an excessive number of outgoing dependencies.
  - *Impact*: Flags "God Modules" that likely violate the Single Responsibility Principle.
- **`server/analysis/impact.js`**
  - *What it does*: Performs a Breadth-First Search (BFS) on the reverse graph starting from a target file.
  - *Impact*: Returns the exact list of files that will break if the target file is modified.

#### 5. Utilities
- **`server/visualization/transformGraph.js`**
  - *What it does*: Converts the backend Adjacency List into the specific `{ nodes, edges }` array format required by React Flow.
- **`server/metrics/collector.js`**
  - *What it does*: A scoped class instantiated per-request to accurately track scanning time, graph building time, and total node/edge counts.

---

### 🎨 Frontend Structure (`/client/src`)

The frontend is a Vite-powered React application featuring a premium "Glassmorphism" design system and Framer Motion animations.

- **`App.jsx`**
  - *What it does*: The main layout component. Manages application state (loading, error, data), handles the GitHub URL form submission, and displays the loading animations.
  - *Impact*: The central hub for the user interface.
- **`GraphContainer.jsx`**
  - *What it does*: The heart of the visualization. It takes the node/edge data, runs it through the `dagre` layout engine to calculate exact X/Y coordinates for a tree layout, and renders the interactive canvas using `@xyflow/react`. It also contains the logic to highlight paths red when a user clicks a node (Impact Analysis).
  - *Impact*: Provides the "Wow" factor of the application, turning JSON data into an interactive architecture map.
- **`MetricsPanel.jsx`**
  - *What it does*: Renders the sidebar dashboard. It displays the codebase health statistics (Circular, Dead, Heavy) returned by the backend analyzers.
  - *Impact*: Translates complex algorithmic results into an easy-to-read, polished UI panel.
- **`index.css`**
  - *What it does*: The global design system. Contains the CSS variables for the dark mode palette, backdrop blurs (glassmorphism), custom scrollbars, and React Flow overrides.
  - *Impact*: Gives the application its highly professional, premium, and cohesive aesthetic.
- **`main.jsx`**
  - *What it does*: Standard Vite entry point that mounts the React tree to the DOM.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, Axios, Babel (AST Parsing)
- **Frontend**: React, Vite, Framer Motion, React Flow (`@xyflow/react`), Dagre (Graph Layout)

## 🏃‍♂️ How to Run Locally

1. **Start the Backend:**
   ```bash
   # From the root directory
   npm install
   npm start
   # Server runs on http://localhost:5000
   ```

2. **Start the Frontend:**
   ```bash
   cd client
   npm install
   npm run dev
   # App runs on http://localhost:5173
   ```

Open your browser to `http://localhost:5173` and start analyzing!
