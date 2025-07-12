# gcommit-ai

[![npm version](https://img.shields.io/npm/v/gcommit-ai.svg)](https://www.npmjs.com/package/gcommit-ai)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

AI-powered conventional commit message generator for your Git workflow.

## Features

* 📑 Reads staged or unstaged Git changes
* 🤖 Uses OpenAI GPT models to craft concise conventional commit messages
* 💾 Configuration via `.gcommitrc` or environment variables
* 🖥️ Cross-platform (Windows, macOS, Linux)
* ⚡ Optional `--auto` flag to commit with the generated message automatically

## Demo

```bash
# Generate a commit message from your changes
npx gcommit

# Generate and commit in one shot
npx gcommit --auto
```

## Installation

```bash
npm i -g gcommit-ai
```

## Configuration

First-time users will be prompted for an OpenAI API key:

```bash
gcommit config
```

or create a `.gcommitrc` (in project root or home directory):

```json
{
  "openai_api_key": "sk-...",
  "model": "gpt-4o-mini",
  "language": "en",
  "auto_commit": false
}
```

Environment variables are also supported:

* `OPENAI_API_KEY`
* `GCOMMIT_MODEL`
* `GCOMMIT_LANG`
* `GCOMMIT_AUTO_COMMIT`

## Usage

```
gcommit            # Generate a commit message
gcommit --auto     # Generate and commit
gcommit config     # Configure API key and preferences
gcommit --help     # CLI help
gcommit --version  # Version info
```

## Contribution

1. Fork the repo and create a feature branch.
2. Run `npm install` and `npm run build`.
3. Submit a pull request with a clear description.

## Roadmap

* Multi-language support
* Support for other LLM providers (Anthropic, Mistral)
* Commit message templates/presets
* VS Code extension

## License

MIT © 2025 Your Name

## Acknowledgements

* [OpenAI](https://openai.com/) – language models
* [Simple Git](https://github.com/steveukx/git-js) – Git integration
