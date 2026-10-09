# @ryangarber/prisma-orm-extension-pgvector

Embedding columns and vector similarity search for Prisma 8 on PostgreSQL, powered by [pgvector](https://github.com/pgvector/pgvector).

```bash
pnpm add @prisma/orm-extension-pgvector@npm:@ryangarber/prisma-orm-extension-pgvector
```

Keep `@prisma/orm-extension-pgvector` as the dependency key and use the `npm:` target to select this fork. Prisma's contract emitter intentionally generates imports from the canonical package name, so the alias makes those imports resolve to this package without rewriting generated files. Application imports should use the canonical name for the same reason:

```ts
import pgvector from '@prisma/orm-extension-pgvector/control';
```

## About this fork

The original extension doesn't support embeddings with variable dimensions. This package adds support for a plain `Vector()` type on top of the original `Vector(N)`.

It is intended for this fork to stay as close as possible to the original until the Prisma team (hopefully) introduces this support officially.

Versions are matched to the latest official version, plus an optional letter in the case of patches specific to the fork:

|    RC 1    | RC 1 Patch 1 |
| ---------- | ------------ |
| 8.0.0-rc.1 | 8.0.0-rc.1+1 |

## Entrypoints

| Namespace | Surface |
| --- | --- |
| `/pack` | the extension pack an application composes into `extensions: [...]` — pure, no runtime imports |
| `/column-types` | the `vector()` or `vector(n)` column author |
| `/codec-types`, `/operation-types` | types emitted contracts reference |
| `/runtime` | the runtime extension that registers the codec and operations |
| `/control` | the control descriptor and baseline migration that install the server extension |

## Responsibilities

Variable or fixed-dimension vector storage and search: the `pg/vector@1` codec (`number[]` at runtime, `Vector<N>` in `contract.d.ts`), similarity operations such as `cosineDistance`, and a baseline migration that runs `CREATE EXTENSION IF NOT EXISTS vector` when the pack is composed into an application.
