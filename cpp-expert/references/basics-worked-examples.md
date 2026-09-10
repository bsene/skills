# C++ Basics — Worked Examples

These are the canonical examples for each construct — use them as the reference shape when writing or reviewing C++.

## Hello, World!

```cpp
#include <iostream>

int main()
{
    std::cout << "Hello, World!\n";
}
```

- `#include <iostream>` brings in the standard stream I/O declarations.
- `<<` ("put to") writes its second argument onto its first — here the string literal onto `std::cout`.
- `\n` in a string literal is the newline character.
- `std::` says `cout` lives in the standard-library namespace.
- Every program has exactly one global `main()`. A nonzero return indicates failure (Linux/Unix honor it; Windows rarely does).

## Functions

```cpp
#include <iostream>
using namespace std;   // make std names visible without std::

double square(double x) { return x*x; }

void print_square(double x)
{
    cout << "the square of " << x << " is " << square(x) << "\n";
}

int main()
{
    print_square(1.234);   // print: the square of 1.234 is 1.52276
}
```

- `void` return type means the function returns nothing.
- Declarations: `Elem* next_elem();` (no arg, returns `Elem*`), `void exit(int);`, `double sqrt(double);`.
- Argument passing has the semantics of **initialization**: types are checked, implicit conversions applied. `double s3 = sqrt("three");` is an error.
- Argument names in a declaration are ignored by the compiler unless it's also a definition.

### Overloading

```cpp
void print(int);
void print(double);
void print(string);

void user()
{
    print(42);          // print(int)
    print(9.65);        // print(double)
    print("Barcelona"); // print(string)
}
```

`print(0, 0)` with `void print(int,double); void print(double,int);` is **ambiguous** — an error.

## Types and arithmetic

```cpp
bool b = true;      // Boolean
char c = 'a';       // character
int i = 42;         // integer
double d = 3.14;    // double-precision float
unsigned u = 999;   // non-negative integer (use for bitwise ops)
```

- Literals: `0b10101010` binary, `0xBAD1234` hex, `0334` octal, `3.14159'26535'89793` with digit separators.
- Usual arithmetic conversions compute at the highest precision of operands.

```cpp
void some_function()
{
    double d = 2.2;
    int i = 7;
    d = d + i;   // assign sum to d
    i = d * i;   // beware: truncates double d*i to int
}
```

## Initialization

```cpp
double d1 = 2.3;      // C-style
double d2 {2.3};      // preferred — rejects narrowing
double d3 = {2.3};    // = optional with {}

int i1 = 7.8;         // i1 becomes 7 (silent narrowing!)
int i2 {7.8};         // error: floating-point to integer conversion

auto b = true;        // bool
auto ch = 'x';        // char
auto i = 123;         // int
auto d = 1.2;         // double
```

## Scope and lifetime

```cpp
vector<int> vec;      // vec is global

struct Record {
    string name;      // name is a member of Record
};

void fct(int arg)     // fct is global; arg is local
{
    string motto {"Who dares wins"};  // motto is local
    auto p = new Record{"Hume"};      // p points to an unnamed Record (new)
}
```

## Constants

```cpp
constexpr int dmv = 17;              // compile-time constant
int var = 17;
const double sqv = sqrt(var);        // run-time constant, may be computed at run time

double sum(const vector<double>&);   // sum will not modify its argument

constexpr double square(double x) { return x*x; }
constexpr double max1 = 1.4*square(17);   // OK: constant expression
constexpr double max2 = 1.4*square(var);  // error: var is not a constant expression
const double max3 = 1.4*square(var);      // OK: may be evaluated at run time
```

A `constexpr` function can have loops and local variables but no side effects and can only use its arguments:

```cpp
constexpr double nth(double x, int n)   // assume 0<=n
{
    double res = 1;
    int i = 0;
    while (i < n) { res *= x; ++i; }
    return res;
}
```

## Pointers, arrays, references

```cpp
char v[6];        // array of 6 characters
char* p;          // pointer to character

char* p = &v[3];  // p points to v's fourth element
char x = *p;      // *p is the object p points to
```

Copying an array with a loop, and range-for:

```cpp
void copy_fct()
{
    int v1[10] = {0,1,2,3,4,5,6,7,8,9};
    int v2[10];
    for (auto i = 0; i != 10; ++i) v2[i] = v1[i];
}

void print()
{
    int v[] = {0,1,2,3,4,5,6,7,8,9};
    for (auto x : v) cout << x << '\n';   // copy of each element
}

void increment()
{
    int v[] = {0,1,2,3,4,5,6,7,8,9};
    for (auto& x : v) ++x;                // reference — modifies elements
}
```

References for function arguments:

```cpp
void sort(vector<double>& v);        // sorts the actual argument, no copy
double sum(const vector<double>&);   // read-only, no copy
```

### Null pointer

```cpp
double* pd = nullptr;
int x = nullptr;   // error: nullptr is a pointer, not an integer
```

```cpp
int count_x(const char* p, char x)
{
    if (p == nullptr) return 0;
    int count = 0;
    while (*p) { if (*p == x) ++count; ++p; }
    return count;
}
```

## Tests

```cpp
bool accept()
{
    cout << "Do you want to proceed (y or n)?\n";
    char answer = 0;
    cin >> answer;
    if (answer == 'y') return true;
    return false;
}
```

`switch` with `case` labels and `default`:

```cpp
switch (answer) {
case 'y': return true;
case 'n': return false;
default:  cout << "I'll take that for a no.\n"; return false;
}
```

`if` with initializer (keeps the test variable scoped):

```cpp
void do_something(vector<int>& v)
{
    if (auto n = v.size(); n != 0) {
        // ... we get here if n != 0 ...
    }
}
```

## Assignment vs initialization

```cpp
int x = 2;
int y = 3;
x = y;          // x becomes 3; x and y are independent objects
```

```cpp
int x = 2, y = 3;
int* p = &x;
int* q = &y;
p = q;          // p becomes &y; now p == q, so *p == *q
```

```cpp
int x = 2, y = 3;
int& r = x;     // r refers to x
int& r2 = y;
r = r2;         // read through r2, write through r: x becomes 3
```

Assignment to a reference does **not** reseat it — it assigns through it to the referenced object.
