import type { Dispatch, SetStateAction, RefObject } from "react";
import {
  Layers3,
  Search,
  ChevronDown,
  Box,
  ShieldCheck,
  Grid2X2,
  ExternalLink,
  X,
} from "lucide-react";
import { groups, iconMap } from "./navigation";
import type { Section } from "./types";
export function Sidebar({
  section,
  name,
  query,
  setQuery,
  open,
  setOpen,
  navigate,
  searchRef,
  onClose,
}: {
  section: Section;
  name: string;
  query: string;
  setQuery: (value: string) => void;
  open: Record<string, boolean>;
  setOpen: Dispatch<SetStateAction<Record<string, boolean>>>;
  navigate: (section: Section, name: string) => void;
  searchRef: RefObject<HTMLInputElement | null>;
  onClose: () => void;
}) {
  return (
    <aside className="sidebar" id="workshop-navigation">
      <button
        type="button"
        className="icon-button nav-close"
        aria-label="Close navigation panel"
        onClick={onClose}
      >
        <X size={20} />
      </button>
      <button
        type="button"
        className="brand"
        onClick={() => navigate("Foundations", "Overview")}
      >
        <span className="brand-mark">
          <Layers3 size={21} />
        </span>
        <span>
          Finance UI<small>Design system</small>
        </span>
      </button>
      <div className="library-version">
        <span className="version-dot" />
        HeroUI Native foundation<span>v0.2</span>
      </div>
      <div className="nav-search">
        <Search size={15} />
        <input
          ref={searchRef}
          placeholder="Find a component…"
          aria-label="Find a component"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <kbd>⌘ K</kbd>
      </div>
      <nav aria-label="Component navigation">
        {groups.map(([group, names]) => {
          const filtered = names.filter(
            (n) => !query || n.toLowerCase().includes(query.toLowerCase()),
          );
          if (!filtered.length) return null;
          return (
            <div className="nav-group" key={group}>
              <button
                type="button"
                className="nav-group-title"
                aria-expanded={!!open[group] || !!query}
                onClick={() => setOpen((v) => ({ ...v, [group]: !v[group] }))}
              >
                <ChevronDown
                  size={13}
                  className={!open[group] && !query ? "closed" : ""}
                />
                {group}
                <span>{names.length}</span>
              </button>
              {(open[group] || query) &&
                filtered.map((n) => {
                  const Icon = iconMap[n] || Box;
                  return (
                    <button
                      type="button"
                      key={n}
                      className={`nav-item ${section === group && name === n ? "active" : ""}`}
                      aria-current={
                        section === group && name === n ? "page" : undefined
                      }
                      onClick={() => navigate(group, n)}
                    >
                      <Icon size={14} />
                      <span>{n.replace(/([a-z])([A-Z])/g, "$1 $2")}</span>
                    </button>
                  );
                })}
            </div>
          );
        })}
        <div className="nav-divider" />
        <button
          type="button"
          className={`nav-item ${section === "Audit" ? "active" : ""}`}
          onClick={() => navigate("Audit", "Finance coverage")}
        >
          <ShieldCheck size={15} />
          Finance coverage
        </button>
        <button
          type="button"
          className={`nav-item ${section === "References" ? "active" : ""}`}
          onClick={() => navigate("References", "Benchmarks")}
        >
          <Grid2X2 size={15} />
          Mobbin benchmarks
        </button>
      </nav>
      <div className="sidebar-bottom">
        <span className="mini-avatar">H</span>
        <div>
          Built on HeroUI<small>Shared tokens · composable parts</small>
        </div>
        <ExternalLink size={13} />
      </div>
    </aside>
  );
}
