# TeXlyre

A **[local-first](https://www.inkandswitch.com/essay/local-first/)** AI-enhanced [LaTeX](https://www.latex-project.org/) and [Typst](https://typst.app) editor with complete offline capabilities. Built with React and TypeScript, TeXlyre runs entirely in your browser—no server required.

[![GitHub Pages](https://img.shields.io/badge/🟢%20Live-GitHub%20Pages-181717.svg?logo=github)](https://texlyre.github.io/texlyre)
[![Tests](https://img.shields.io/github/actions/workflow/status/texlyre/texlyre/test.yml?label=tests)](https://github.com/texlyre/texlyre/actions)
[![Deploy](https://img.shields.io/github/actions/workflow/status/texlyre/texlyre/deploy.yml?label=deploy)](https://github.com/texlyre/texlyre/actions)
[![Crowdin](https://badges.crowdin.net/texlyre/localized.svg)](https://crowdin.com/project/texlyre)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)

![Main editor interface showing split view with LaTeX code on left, compiled PDF on right](showcase/main_showcase_dark.png)

## Features

### 🤖 AI Assistant (LLM Pipeline)

**Experimental**: TeXlyre includes a powerful **AI Assistant Plugin**. Configurable to work with **OpenRouter**, **Ollama**, or any OpenAI-compatible API, this tool directly streams AI-generated LaTeX or Typst code into your editor.

* **Secure Secrets**: API keys are encrypted and stored safely in your browser's local storage (AES-GCM). They are never sent to our servers.
* **Context Aware**: The assistant inserts code directly where you need it.
* **Model Agnostic**: Bring your own model endpoint.

### 🔒 Local-first Architecture

TeXlyre prioritizes data ownership and privacy. We have transitioned to a **strict local-first** model:

* **No Servers**: All documents live in your browser's **IndexedDB**.
* **Offline Ready**: Continue editing without an internet connection.
* **Direct Sync**: Use the **File System Access API** to sync projects directly to your local hard drive (and from there to Dropbox, Drive, or Git).

**Note**: Previous real-time collaboration features (WebRTC) have been deprecated to focus on individual productivity and data privacy.

### 📄 LaTeX Compilation

The platform integrates **[SwiftLaTeX](https://github.com/SwiftLaTeX/SwiftLaTeX) WASM engines** to provide in-browser LaTeX compilation without server dependencies. Currently supports **pdfTeX** and **XeTeX** engines for document processing. Includes real-time syntax highlighting, error detection, and an integrated PDF viewer with synctex support.

<p align="center">
<img src="showcase/error_parser_zoomed_latex.png" alt="LaTeX compilation in progress with error panel and PDF output" width="600">
</p>

### 📝 Typst Compilation

The platform integrates **[typst.ts](https://github.com/Myriad-Dreamin/typst.ts)** to provide in-browser [Typst](https://github.com/typst/typst) compilation. Supports PDF, SVG, and canvas compilation for instant preview updates.

<p align="center">
<img src="showcase/error_parser_zoomed_typst.png" alt="Typst compilation in progress" width="600">
</p>

### 📂 File Management

The platform includes a file explorer supporting drag-and-drop operations for LaTeX sources, Typst sources, images, and data files. **Document linking** creates connections between documents and static files, enabling seamless reference management.

![Project dashboard with file explorer and project cards](showcase/project_viewer_zoomed.png)

## Quick Start

Installation requires Node.js 20+ and a modern browser with File System Access API support:

```bash
git clone https://github.com/TeXlyre/texlyre.git
cd texlyre
npm install
npm run start
```

Navigate to `http://localhost:4173` to access the application. Create a new project to start editing.

## Architecture

TeXlyre's architecture emphasizes **local-first principles**. The React frontend communicates with documents stored in IndexedDB, providing offline-first functionality. **[SwiftLaTeX](https://github.com/SwiftLaTeX/SwiftLaTeX) WASM engines** and **[typst.ts](https://github.com/Myriad-Dreamin/typst.ts)** handle compilation entirely in the browser main thread or web workers.

The **plugin system** allows extensibility through custom viewers, renderers, and backup providers.

## Privacy & Data

TeXlyre is privacy-focused by design:

* **Local-first**: All your data stays in your browser.
* **No Remote Storage**: We do not host your files.
* **No Tracking**: No analytics cookies or data collection.

### Repository Backup Integration

The optional GitHub, GitLab, Gitea, and Forgejo (Codeberg) integration only activates when you explicitly enable them and provide your own token side-loaded into the app.

## Acknowledgments

TeXlyre builds upon several key technologies:

### Core Technologies

- **[SwiftLaTeX](https://github.com/SwiftLaTeX/SwiftLaTeX)** - WASM-based LaTeX compilation engine
* **[typst.ts](https://github.com/Myriad-Dreamin/typst.ts)** - WASM-based Typst compilation engine
* **[CodeMirror](https://codemirror.net/)** - Extensible code editor
* **[Yjs](https://github.com/yjs/yjs)** - CRDTs for robust local data management

### Editor Extensions

- **[codemirror-vim](https://github.com/replit/codemirror-vim)** - Vim keybindings for CodeMirror
* **[codemirror-lang-typst](https://github.com/kxxt/codemirror-lang-typst)** - Typst language support for CodeMirror

### Runtime

- **[WebPerl](https://github.com/haukex/webperl)** - Perl interpreter compiled to WebAssembly
* **[wasm-bindgen](https://github.com/wasm-bindgen/wasm-bindgen)** - Rust/Wasm interoperability

Development led by **Anthropic Claude** and **Google Gemini** agents.

---

**Ready to start editing?**
[Get started with TeXlyre](https://texlyre.github.io/texlyre/)
