import { useEffect, useRef, useState } from "react";
import { Button } from "@heroui/react";
import {
  ArrowLeftRight,
  ArrowUpRight,
  ChartNoAxesColumn,
  CreditCard,
  Layers3,
  MessageSquare,
  Moon,
  Sun,
} from "lucide-react";
import { ConversationScreen } from "./ConversationScreen";
import { ActivityScreen } from "./ActivityScreen";
import { CardsScreen } from "./CardsScreen";
import { productScreens, type ProductScreen } from "./model";
import "./product.css";

const navigation = [
  {
    name: "Assistant",
    Icon: MessageSquare,
  },
  {
    name: "Spending",
    Icon: ChartNoAxesColumn,
  },
  {
    name: "Transfer",
    Icon: ArrowUpRight,
  },
  {
    name: "Activity",
    Icon: ArrowLeftRight,
  },
  { name: "Cards", Icon: CreditCard },
] as const;
function screenFromHash(): ProductScreen {
  try {
    const value = decodeURIComponent(location.hash.slice(1)).split("/")[1];
    return productScreens.find((screen) => screen === value) || "Assistant";
  } catch {
    return "Assistant";
  }
}
export default function ProductApp() {
  const [screen, setScreen] = useState(screenFromHash);
  const [visited, setVisited] = useState<ProductScreen[]>([screen]);
  const [theme, setTheme] = useState(() =>
    localStorage.getItem("finance-ui-theme") === "dark" ? "dark" : "light",
  );
  const heading = useRef<HTMLHeadingElement>(null);
  const main = useRef<HTMLElement>(null);
  const initial = useRef(true);
  useEffect(() => {
    const change = () => {
      const next = screenFromHash();
      setScreen(next);
      setVisited((current) =>
        current.includes(next) ? current : [...current, next],
      );
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    if (initial.current) {
      initial.current = false;
      return;
    }
    heading.current?.focus({ preventScroll: true });
  }, [screen]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("finance-ui-theme", theme);
  }, [theme]);
  function navigate(next: ProductScreen) {
    location.hash = encodeURIComponent(`Product/${next}`);
  }
  return (
    <div className="product-app">
      <a
        className="product-skip"
        href="#product-content"
        onClick={(event) => {
          event.preventDefault();
          main.current?.focus();
        }}
      >
        Skip to content
      </a>
      <header className="product-brand">
        <a
          href="#Product%2FAssistant"
          aria-label="Alex Morgan · assistant home"
        >
          <span className="product-avatar" aria-hidden="true">
            AM
          </span>
          <strong>Alex Morgan</strong>
        </a>
        <div className="product-header-actions">
          <Button
            type="button"
            isIconOnly
            variant="ghost"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            onPress={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? <Moon /> : <Sun />}
          </Button>
        </div>
      </header>
      <nav className="product-nav" aria-label="Product navigation">
        {navigation.map(({ name, Icon }) => (
          <a
            key={name}
            href={`#Product%2F${name}`}
            aria-current={screen === name ? "page" : undefined}
          >
            <Icon aria-hidden="true" />
            <span>{name}</span>
          </a>
        ))}
        <div className="product-nav-footer">
          <span className="small muted">
            Interactive preview
            <br />
            Fictional account · no money moves
          </span>
          <a href="#Foundations%2FOverview">
            <Layers3 aria-hidden="true" />
            Component library
          </a>
        </div>
      </nav>
      <main
        ref={main}
        className="product-main"
        id="product-content"
        tabIndex={-1}
      >
        <div className="product-page-heading">
          <h1 ref={heading} tabIndex={-1}>
            {screen === "Assistant" ? "Good evening, Alex" : screen}
          </h1>
        </div>
        {visited.map((name) => (
          <div key={name} hidden={screen !== name} className="product-screen">
            {name === "Activity" ? (
              <ActivityScreen />
            ) : name === "Cards" ? (
              <CardsScreen />
            ) : (
              <ConversationScreen screen={name} navigate={navigate} />
            )}
          </div>
        ))}
        <p className="product-demo-note">
          Sample account. Actions stay in this preview.
        </p>
      </main>
    </div>
  );
}
