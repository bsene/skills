```typescript
// UserDTO example
export type UserDTO = { user_id: string; display_name: string; created_at: string };

export type User = { id: string; name: string; createdAt: Date };

export function toDomain(dto: UserDTO): User {
  return {
    id: dto.user_id,
    name: dto.display_name,
    createdAt: new Date(dto.created_at),
  };
}
```
