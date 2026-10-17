# Data Models and Query Languages

## Model comparison

| Model       | Strength                                         | Weakness                                | Typical engines  |
| ----------- | ------------------------------------------------ | --------------------------------------- | ---------------- |
| Relational  | Joins, constraints, many-to-many, ad hoc queries | Impedance mismatch with object graphs   | PostgreSQL       |
| Document    | Locality, flexible shape, one-to-many trees      | Weak joins, duplication on many-to-many | MongoDB, CouchDB |
| Key-value   | Simplest, fast, easy to distribute               | Query only by key (or pre-built index)  | Riak, Redis      |
| Wide column | Sparse huge tables, range scans by row key       | Query patterns fixed by key design      | HBase            |
| Graph       | Variable-depth relationships                     | Bulk analytics, partitioning            | Neo4j            |

## Rules of thumb

- **Document** when records are loaded whole and the tree shape is natural (profile with positions). **Relational** when entities reference each other from many places.
- Many-to-many pushes you toward relational or graph. Documents force either duplication or application-side joins.
- "Schemaless" means **schema-on-read**: the schema still exists, enforced by app code. Choose schema-on-write when all records share a shape.
- Normalize to avoid inconsistent copies; denormalize deliberately for read speed and accept write-time fan-out.
- Store IDs, not human-readable text, for values that may be renamed (region, category).
- Do not update a large document in place often: most engines rewrite it whole.

## Query styles

| Style                | Idea                                       | Note                                              |
| -------------------- | ------------------------------------------ | ------------------------------------------------- |
| Declarative (SQL)    | State what you want; the planner picks how | Optimizer can improve without app changes         |
| Imperative API       | You write the loops                        | Hard to parallelize or optimize automatically     |
| MapReduce            | Map and reduce functions over documents    | Must be pure; aggregation pipelines are easier    |
| Graph (Cypher, etc.) | Pattern match on nodes and edges           | Variable-length paths are one clause, not N joins |

## Graph example

```cypher
MATCH (a:Person {name:'Ada'})-[:KNOWS*1..3]->(b:Person)
RETURN DISTINCT b.name
```

The equivalent recursive SQL (`WITH RECURSIVE`) works but is far longer. Use a graph store only when traversal depth is variable or dominant.

## Modeling checklist

1. List the top queries and their frequencies.
2. Identify entity relationships: 1-1, 1-N, N-N.
3. Choose the model whose primary access matches (see table).
4. Decide per field: reference or embed? embed if always read together and bounded in size.
5. Plan the key (row key, partition key, document id) before anything else in key-based stores.
