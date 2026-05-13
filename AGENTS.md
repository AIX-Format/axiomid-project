# AGENTS.md — Operating Manual for AI Coding Agents

> 📜 **Stack-wide protocol rules**: read [`AXIOM.md`](https://github.com/Moeabdelaziz007/aix-format/blob/main/AXIOM.md) first. This file complements it with repo-local operating instructions for the AxiomID project.

## Repository overview

`axiomid-project` is the **proprietary** authority surface for `axiomid.app`. It hosts the Human Authorization Protocol and the identity-verification flows that the rest of the Sovereign Stack relies on. The repository is marked `private: true` and ships a proprietary "All Rights Reserved" `LICENSE`; agents MUST NOT propose changes that loosen the license declaration or remove the `private` flag.

## Conventions

- **License**: Proprietary — All Rights Reserved. See `LICENSE`. `package.json#license` is `SEE LICENSE IN LICENSE`.
- **Privacy**: any user data is treated as PII unless explicitly tagged otherwise. PII MUST NOT appear in logs, error messages, or commit bodies.
- **Branches**: kebab-case (`feat/...`, `fix/...`, `chore/...`).
- **Conventional Commits** preferred.
- **No external publication**: this repo is not published to npm or any public registry.

## What to read before opening a PR

1. [`AXIOM.md`](https://github.com/Moeabdelaziz007/aix-format/blob/main/AXIOM.md) — the stack-wide constitution (root authority section is binding).
2. `LICENSE` — the proprietary terms.
3. The neighbouring code in the same directory as the change.

## Relationship to the Sovereign Stack

AxiomID is the **root authority** referenced by every `did:axiom:axiomid.app:<id>` issued in the open stack. Changes that affect the authority's public surface (well-known endpoints, signing keys, attestation flows) MUST be coordinated with `aix-format` and `iqra` maintainers before merge.
