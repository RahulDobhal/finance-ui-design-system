import { useState, useEffect, useRef } from "react";
import { Button } from "@heroui/react";
import {
  Layers3,
  ChevronRight,
  Moon,
  Sun,
  Download,
  Check,
  X,
} from "lucide-react";
import tokenSource from "./design-system/tokens.json";
import { chatStates, descriptions } from "./data/catalog";
import type { Section, StoryProps } from "./workshop/types";
import { fromHash } from "./workshop/navigation";
import { Sidebar } from "./workshop/Sidebar";
import { StoryPanel } from "./workshop/StoryPanel";
import { Foundations } from "./workshop/Foundations";
import { Pattern } from "./workshop/Patterns";
import { Audit, Benchmarks } from "./workshop/ReferencePages";
function App() {
  const initial = fromHash();
  const [section, setSection] = useState<Section>(initial[0] as Section),
    [name, setName] = useState(initial[1]);
  const [theme, setTheme] = useState(
      () => localStorage.getItem("finance-ui-theme") || "light",
    ),
    [query, setQuery] = useState(""),
    [open, setOpen] = useState<Record<string, boolean>>({
      Foundations: true,
      Finance: true,
    }),
    [currency, setCurrency] = useState("USD"),
    [amount, setAmount] = useState("1000.00"),
    [state, setState] = useState(
      initial[0] === "Chat"
        ? chatStates[initial[1]]?.[0] || "default"
        : "default",
    ),
    [size, setSize] = useState<"sm" | "md" | "lg">("md"),
    [variant, setVariant] = useState("primary"),
    [hidden, setHidden] = useState(false),
    [logs, setLogs] = useState<string[]>([]),
    [toast, setToast] = useState(""),
    [sidebar, setSidebar] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const initialRoute = useRef(true);
  useEffect(() => {
    if (initialRoute.current) {
      initialRoute.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
  }, [section, name]);
  useEffect(() => {
    if (sidebar) searchRef.current?.focus();
  }, [sidebar]);
  function closeNavigation() {
    setSidebar(false);
    menuRef.current?.focus();
  }
  useEffect(() => {
    if (!sidebar) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setSidebar(false);
        menuRef.current?.focus();
      }
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [sidebar]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("finance-ui-theme", theme);
  }, [theme]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (window.matchMedia("(max-width: 760px)").matches) setSidebar(true);
        else searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", k);
    const hash = () => {
      const [s, n] = fromHash();
      setSection(s as Section);
      setName(n);
      setState(s === "Chat" ? chatStates[n]?.[0] || "default" : "default");
    };
    window.addEventListener("hashchange", hash);
    return () => {
      window.removeEventListener("keydown", k);
      window.removeEventListener("hashchange", hash);
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(id);
  }, [toast]);
  function navigate(s: Section, n: string) {
    setSection(s);
    setName(n);
    setState(s === "Chat" ? chatStates[n]?.[0] || "default" : "default");
    setOpen((v) => ({ ...v, [s]: true }));
    setSidebar(false);
    location.hash = encodeURIComponent(s + "/" + n);
    document.querySelector(".main")?.scrollTo({ top: 0 });
  }
  function notify(s: string) {
    setToast(s);
    setLogs((v) =>
      [new Date().toLocaleTimeString("en-GB") + "  " + s, ...v].slice(0, 10),
    );
  }
  const p: StoryProps = {
    currency,
    setCurrency,
    amount,
    setAmount,
    state,
    notify,
    hidden,
    setHidden,
    size,
    variant,
  };
  const exportTokens = () => {
    const u = URL.createObjectURL(
      new Blob([JSON.stringify(tokenSource, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = u;
    a.download = "finance-ui.tokens.json";
    a.click();
    URL.revokeObjectURL(u);
    notify("Token source exported");
  };
  const isStory = ["Primitives", "Finance", "Extensions", "Chat"].includes(
    section,
  );
  const title =
    section === "Foundations" && name === "Overview"
      ? "Finance UI"
      : name.replace(/([a-z])([A-Z])/g, "$1 $2");
  return (
    <div className={`workshop ${sidebar ? "nav-open" : ""}`}>
      <Sidebar
        section={section}
        name={name}
        query={query}
        setQuery={setQuery}
        open={open}
        setOpen={setOpen}
        navigate={navigate}
        searchRef={searchRef}
        onClose={closeNavigation}
      />
      {sidebar && (
        <button
          className="nav-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={closeNavigation}
        />
      )}
      <div className="workspace">
        <header className="topbar">
          <div className="row">
            <button
              type="button"
              className="icon-button mobile-nav"
              ref={menuRef}
              aria-expanded={sidebar}
              aria-controls="workshop-navigation"
              aria-label="Toggle navigation"
              onClick={() => setSidebar(!sidebar)}
            >
              <Layers3 size={19} />
            </button>
            <span className="muted">Design system</span>
            <ChevronRight size={13} />
            <span>{section}</span>
            {name !== "Overview" && (
              <>
                <ChevronRight size={13} />
                <span className="crumb-name">{name}</span>
              </>
            )}
          </div>
          <div className="row">
            <span className="adapter-label">
              <span />
              Browser catalog
            </span>
            <button
              type="button"
              className="icon-button"
              aria-label={
                theme === "light"
                  ? "Switch to dark theme"
                  : "Switch to light theme"
              }
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
            </button>
            <Button
              size="sm"
              variant="secondary"
              className="export-button"
              aria-label="Export tokens"
              onPress={exportTokens}
            >
              <Download size={14} />
              <span className="export-label">Export tokens</span>
            </Button>
          </div>
        </header>
        <main className="main">
          <div className="page-heading">
            <div className="page-kicker">{section}</div>
            <h1 ref={headingRef} tabIndex={-1}>
              {title}
            </h1>
            <p>
              {descriptions[name] ||
                (section === "Audit"
                  ? "What HeroUI provides, what we added, and where product-specific work begins."
                  : section === "References"
                    ? "Observed fintech patterns, translated into reusable components."
                    : section === "Patterns"
                      ? "Small, working compositions built from the same reusable parts."
                      : "The HeroUI foundation, mapped to finance tokens. Try its states and interactions.")}
            </p>
          </div>
          {section === "Foundations" && (
            <Foundations name={name} theme={theme} navigate={navigate} p={p} />
          )}
          {isStory && (
            <StoryPanel
              key={section + name}
              name={name}
              section={section}
              p={p}
              logs={logs}
              navigate={navigate}
              setState={setState}
              setSize={setSize}
              setVariant={setVariant}
            />
          )}
          {section === "Patterns" && <Pattern name={name} p={p} key={name} />}
          {section === "Audit" && <Audit navigate={navigate} />}
          {section === "References" && <Benchmarks />}
          <footer className="page-footer">
            <span>Finance UI · Design system 0.2</span>
            <span>HeroUI Native 1.0.11 / React 3.2.6</span>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
