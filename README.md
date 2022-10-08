# useQuery

Another lightweight custom hook fetch wrapper for React.

![Package size](https://badgen.net/bundlephobia/minzip/@jkominovic/use-query)
![Dependencies](https://badgen.net/bundlephobia/dependency-count/@jkominovic/use-query)
![Treeshakable](https://badgen.net/bundlephobia/tree-shaking/@jkominovic/use-query)

## Features

- 💡 Auto caching (5 minutes by default).
- 🕑 Auto-retry (only 3 instances).
- 🎯 Some (just a little bit) of type safety (at least I tried).
- ⛔ Abortable request.
- 👀 Automatic re-fetching when URL changes.
- 👌 Refetch function to programmatically refetch the last request.
- ⚡ Faster first fetch (because we don't use useEffect, fetch fires before first render starts).

## Usage

Import the package from `@jkominovic/use-query`

```jsx
import useQuery from "@jkominovic/use-query";
```

or

```jsx
const useQuery = require("@jkominovic/use-query");
```

## Examples

### Setup

Use the hook everywhere.

```tsx
import useQuery from "@jkominovic/use-query";

const Example = () => {
  const { response, refetch, abort, error, idle, isLoading } = useQuery<any>(
    "https://pokeapi.co/api/v2/pokemon/charmander"
  );
  return (
    <>
      <div>{response?.data.name}</div> // Charmander
    </>
  );
};
```

### Type the response you expect

If you are using Typescript you can declare the shape of the data you expect to receive.

```diff
import useQuery from "@jkominovic/use-query";

+type Pokemon = {
+ id: number;
+ name: string;
+ base_experience: number;
+ height: number;
+ is_default: boolean;
+ order: number;
+ weight: number;
+ abilities: Ability[];
+};

const Example = () => {
  const { response, refetch, abort, error, idle, isLoading } =
+    useQuery<Pokemon>("https://pokeapi.co/api/v2/pokemon/charmander");
  return (
    <>
      <div>{response?.data.name}</div> // Charmander
    </>
  );
};

export default Example;

```

Now useQuery knows what kind of data you expect and Typescript will allow you to use autocomplete.

```tsx
type Pokemon = {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  is_default: boolean;
  order: number;
  weight: number;
  abilities: Ability[];
};

const Example = () => {
  const { response, refetch, abort, error, idle, isLoading } =
    useQuery<Pokemon>("https://pokeapi.co/api/v2/pokemon/charmander");
  return (
    <>
      <div>{response?.data.name}</div> // Charmander
    </>
  );
};

export default Example;
```

### Get request status

The prop `isLoading` let you know when your request is in progress.

```diff
import useQuery from "@jkominovic/use-query";

type Pokemon = {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  is_default: boolean;
  order: number;
  weight: number;
  abilities: Ability[];
};

const Example = () => {
  const { response, refetch, abort, error, idle, isLoading } =
  useQuery<Pokemon>("https://pokeapi.co/api/v2/pokemon/charmander");
+  if (isLoading) return <p>Loading...</p>;
  return (
    <>
      <div>{response?.data.name}</div> // Charmander
    </>
  );
};

export default Example;

```

Now while your request is loading we will see the "Loading..." message.

```tsx
import useQuery from "@jkominovic/use-query";

type Pokemon = {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  is_default: boolean;
  order: number;
  weight: number;
  abilities: Ability[];
};

const Example = () => {
  const { response, refetch, abort, error, idle, isLoading } =
    useQuery<Pokemon>("https://pokeapi.co/api/v2/pokemon/charmander");
  if (isLoading) return <p>Loading...</p>;
  return (
    <>
      <div>{response?.data.name}</div> // Charmander
    </>
  );
};

export default Example;
```

### Catch the errors!

In case your request drops in error state useQuery will return it.

```diff
import useQuery from "@jkominovic/use-query";

type Pokemon = {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  is_default: boolean;
  order: number;
  weight: number;
  abilities: Ability[];
};

const Example = () => {
  const { response, refetch, abort, error, idle, isLoading } =
  useQuery<Pokemon>("https://pokeapi.co/api/v2/pokemon/charmander");
+  if (error)
+    return (
+      <>
+        <h2>
+          {error.error} - {error.statusCode}
+        </h2>{" "}
+        // NOT FOUND - 404
+        <p>{error.message}</p> // Route /fake-route not found.
+      </>
+    );
  if (isLoading) return <p>Loading...</p>;

  return (
    <>
      <div>{response?.data.name}</div> // Charmander
    </>
  );
};

export default Example;

```

Error object is always the same, so you don't have to worry about error shape.

```tsx
import useQuery from "@jkominovic/use-query";

type Pokemon = {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  is_default: boolean;
  order: number;
  weight: number;
  abilities: Ability[];
};

const Example = () => {
  const { response, refetch, abort, error, idle, isLoading } =
    useQuery<Pokemon>("https://pokeapi.co/api/v2/pokemon/not-found");
  if (error)
    return (
      <>
        <h2>
          {error.error} - {error.statusCode}
        </h2>{" "}
        // NOT FOUND - 404
        <p>{error.message}</p> // Route /fake-route not found.
      </>
    );
  if (isLoading) return <p>Loading...</p>;
  return (
    <>
      <div>{response?.data.name}</div> // Charmander
    </>
  );
};

export default Example;
```

### Dynamic URL automatic refetching

```diff
import useQuery from "@jkominovic/use-query";

type Pokemon = {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  is_default: boolean;
  order: number;
  weight: number;
  abilities: Ability[];
};

const Example = () => {
+  const [pokemon,setNewPokemonName]=useState("charizard") // FIRST RENDER => charizard - SECOND RENDER (AFTER BUTTON CLICK) => pikachu
  const { response, refetch, abort, error, idle, isLoading } =
+-    useQuery<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);

  if (error)
    return (
      <>
        <h2>
          {error.error} - {error.statusCode}
        </h2>{" "}
        // NOT FOUND - 404
        <p>{error.message}</p> // Route /fake-route not found.
      </>
    );
  if (isLoading) return <p>Loading...</p>;
  return (
    <>
-      <div>{response?.data.name}</div> // Charmander
+      <div>{response?.data.name}</div> // Pikachu

+      <button onClick={()=>setNewPokemonName("Pikachu")}>I want another POKEMON!</button>
    </>
  );
};

export default Example;
```

So you don't have to worry about manually triggering another refetch every time you want another pokemon.

```tsx
import useQuery from "@jkominovic/use-query";

type Pokemon = {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  is_default: boolean;
  order: number;
  weight: number;
  abilities: Ability[];
};

const Example = () => {
  const [pokemon, setNewPokemonName] = useState("charizard");
  const { response, refetch, abort, error, idle, isLoading } =
    useQuery<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);

  if (error)
    return (
      <>
        <h2>
          {error.error} - {error.statusCode}
        </h2>{" "}
        // NOT FOUND - 404
        <p>{error.message}</p> // Route /fake-route not found.
      </>
    );
  if (isLoading) return <p>Loading...</p>;
  return (
    <>
      <div>{response?.data.name}</div> // Pikachu
      <button onClick={() => setNewPokemonName("Pikachu")}>
        I want another POKEMON!
      </button>
    </>
  );
};

export default Example;
```

### Altering the natural flow

There are two function you must know:

- `refetch()`

  > Executing this function allows you to refetch the current URL stored in useQuery.

- `abort()`
  > Executing this function allows you to cancel only the request useQuery is actually waiting or processing.
