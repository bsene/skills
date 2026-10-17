# Storage Engines and Encoding

## Two engine families

| Aspect          | B-tree (update in place)                 | LSM-tree (append, merge)                       |
| --------------- | ---------------------------------------- | ---------------------------------------------- |
| Writes          | Random page writes, WAL for crash safety | Sequential: memtable, flush to sorted files    |
| Reads           | Predictable, one lookup path             | May check several files; Bloom filters help    |
| Background work | Page splits                              | Compaction can compete with foreground I/O     |
| Space           | Some fragmentation                       | Better compression, stale copies until merged  |
| Transactions    | Key ranges easy to lock                  | Possible, but engine specific                  |
| Seen in         | PostgreSQL, most relational              | HBase, Riak (Bitcask/LevelDB backends), others |

Measure write amplification (bytes written to disk per byte written by the app) when SSDs or heavy writes matter.

## Indexes

- Primary index orders data; secondary indexes point to it. Each extra index slows every write.
- Composite indexes follow leftmost-prefix rules. Put equality columns first, range column last.
- Covering index includes needed columns so the table is never touched.
- Specialized: full-text, geospatial, partial/expression indexes, in-memory-only structures (Redis).
- Check the query plan (`EXPLAIN`) before adding an index; confirm it is used.

## OLTP vs OLAP

| Property | OLTP            | OLAP                                   |
| -------- | --------------- | -------------------------------------- |
| Access   | Few rows by key | Scans of millions of rows, few columns |
| Layout   | Row-oriented    | Column-oriented, compressed            |
| Users    | App end users   | Analysts, reports                      |
| Feeding  | Source of truth | ETL/CDC copy into a warehouse          |

Keep analytics queries off the OLTP primary; use a replica or warehouse.

## Encoding formats

| Format            | Schema                                  | Compact | Evolves well | Note                                            |
| ----------------- | --------------------------------------- | ------- | ------------ | ----------------------------------------------- |
| JSON/XML/CSV      | Implicit                                | No      | Fragile      | Number precision and binary data pitfalls       |
| Protobuf / Thrift | Tagged fields                           | Yes     | Yes          | Field tags are identity; never reuse a tag      |
| Avro              | Writer + reader schema resolved at read | Yes     | Yes          | Good for dumps and logs; fields matched by name |

## Compatibility rules

- **Backward**: new code reads old data. **Forward**: old code reads new data (ignores unknown fields). Rolling deploys need both.
- Add only optional fields or fields with defaults; never change a field's type or remove a required one.
- Never reuse a removed field's identity (tag number or name).
- Data outlives code: stored records may be years older than the running binary.
- Database migrations: expand, migrate, contract (three deploys), not one breaking change.
- For RPC and REST, treat servers as upgraded before clients and keep old versions alive until clients move.
