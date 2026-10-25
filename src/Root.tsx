import { lazy, Suspense, useEffect, useState } from "react";
const Workshop = lazy(() => import("./App"));
const Product = lazy(() => import("./product/ProductApp"));
function isProduct() {
  try {
    return decodeURIComponent(location.hash.slice(1)).startsWith("Product/");
  } catch {
    return false;
  }
}
export default function Root() {
  const [product, setProduct] = useState(isProduct);
  useEffect(() => {
    const route = () => setProduct(isProduct());
    window.addEventListener("hashchange", route);
    return () => window.removeEventListener("hashchange", route);
  }, []);
  return (
    <Suspense
      fallback={
        <p role="status" style={{ padding: "var(--spacing-6)" }}>
          Loading…
        </p>
      }
    >
      {product ? <Product /> : <Workshop />}
    </Suspense>
  );
}
