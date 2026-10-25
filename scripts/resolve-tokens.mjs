// Resolve semantic aliases before generating either platform's artifacts.
export function resolveTokens(source) {
  const lookup = (path) =>
    path.split(".").reduce((value, key) => value?.[key], source);
  const walk = (value, chain = []) => {
    if (typeof value === "string" && /^\{[^}]+\}$/.test(value)) {
      const path = value.slice(1, -1);
      if (chain.includes(path))
        throw new Error(
          "Circular token alias: " + [...chain, path].join(" → "),
        );
      const target = lookup(path);
      if (target === undefined) throw new Error("Unknown token alias: " + path);
      return walk(target, [...chain, path]);
    }
    if (Array.isArray(value)) return value.map((v) => walk(v, chain));
    if (value && typeof value === "object")
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, walk(v, chain)]),
      );
    return value;
  };
  return walk(source);
}
