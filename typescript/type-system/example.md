```typescript
// Type system example: discriminated union
interface Success {
  type: "success";
  data: string;
}
interface Failure {
  type: "failure";
  error: Error;
}
type Result = Success | Failure;

function handle(result: Result) {
  if (result.type === "success") {
    console.log(result.data);
  } else {
    console.error(result.error);
  }
}
```
