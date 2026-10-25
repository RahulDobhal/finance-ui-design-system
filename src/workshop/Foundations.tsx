import { useState } from "react";
import { Button, Card } from "@heroui/react";
import { ArrowRight, ArrowUpRight, ShieldCheck, Copy, Zap } from "lucide-react";
import { tokens } from "../design-system/tokens";
import { contrast } from "../design-system/money.mjs";
import type { Section, StoryProps } from "./types";
import { iconMap } from "./navigation";
import { Phone, AccountHome } from "./Patterns";
const typeStyles = (name: string) => {
  const s = tokens.typography[name as keyof typeof tokens.typography];
  return {
    fontSize: s.size,
    lineHeight: s.lineHeight + "px",
    fontWeight: s.weight,
    letterSpacing: s.letterSpacing,
  };
};

export function Foundations({
  name,
  theme,
  navigate,
  p,
}: {
  name: string;
  theme: string;
  navigate: (s: Section, n: string) => void;
  p: StoryProps;
}) {
  const colors = tokens.themes[theme as "light" | "dark"];
  const [animate, setAnimate] = useState(false);
  const copy = (s: string) =>
    navigator.clipboard
      .writeText(s)
      .then(() => p.notify(s + " copied"))
      .catch(() => p.notify("Select the value to copy it"));
  if (name === "Overview")
    return (
      <>
        <div className="overview-layout">
          <section>
            <div className="foundation-summary">
              <span className="section-label">Foundations</span>
              <h2>
                Finance and chat.
                <br />
                One component system.
              </h2>
              <p>
                Green primary actions, contrasting secondary actions, neutral
                surfaces. Compact padding with space between sections.
              </p>
              <div className="architecture">
                <span>Tokens</span>
                <ArrowRight size={14} />
                <span>Primitives</span>
                <ArrowRight size={14} />
                <span>Finance</span>
              </div>
            </div>
            <div className="foundation-grid">
              {[
                ["Colors", "Purposeful, semantic roles"],
                ["Typography", "5 sizes · 3 weights"],
                ["Spacing", "A consistent 4-point scale"],
                ["Radius", "6–10 px component corners"],
              ].map(([n, d]) => {
                const Icon = iconMap[n];
                return (
                  <button
                    type="button"
                    key={n}
                    className="foundation-tile"
                    onClick={() => navigate("Foundations", n)}
                  >
                    <div className="row between">
                      <span className="tile-icon">
                        <Icon size={18} />
                      </span>
                      <ArrowUpRight size={16} />
                    </div>
                    <h3>{n}</h3>
                    <p>{d}</p>
                    {n === "Colors" ? (
                      <div className="mini-swatches">
                        {[
                          "accent",
                          "accent-soft",
                          "foreground",
                          "surface-tertiary",
                          "warning",
                        ].map((c) => (
                          <span
                            key={c}
                            style={{
                              background: colors[c as keyof typeof colors],
                            }}
                          />
                        ))}
                      </div>
                    ) : n === "Typography" ? (
                      <div className="type-specimen">
                        Aa <span>0123456789</span>
                      </div>
                    ) : n === "Spacing" ? (
                      <div className="mini-spacing">
                        {[8, 16, 24, 32, 48].map((v) => (
                          <span key={v} style={{ width: v }} />
                        ))}
                      </div>
                    ) : (
                      <div className="mini-radii">
                        {[4, 8, 12, 16].map((v) => (
                          <span key={v} style={{ borderRadius: v }} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
          <aside className="live-preview">
            <div className="row between">
              <span className="section-label">Preview</span>
              <span className="small muted">Mobile / {theme}</span>
            </div>
            <Phone>
              <AccountHome
                p={p}
                onSend={() => navigate("Patterns", "Send money")}
              />
            </Phone>
            <p className="preview-caption">
              <span className="version-dot" />
              Shared tokens · light and dark
            </p>
          </aside>
        </div>
        <div className="scope-strip">
          <div>
            <b>39</b>
            <span>HeroUI primitives</span>
          </div>
          <div>
            <b>18</b>
            <span>Finance components</span>
          </div>
          <div>
            <b>8</b>
            <span>Extended primitives</span>
          </div>
          <div>
            <b>7</b>
            <span>Chat components</span>
          </div>
          <div>
            <b>6</b>
            <span>UI patterns</span>
          </div>
          <Button
            variant="ghost"
            onPress={() => navigate("Audit", "Finance coverage")}
          >
            Explore coverage
            <ArrowRight size={15} />
          </Button>
        </div>
        <div className="foundation-note">
          <ShieldCheck size={19} />
          <p>
            <strong>A mobile system, with a browser workshop.</strong>
            <br />
            Shared tokens power both implementations. Native source is included;
            browser interaction checks are not a substitute for iOS and Android
            device QA.
          </p>
        </div>
      </>
    );
  if (name === "Colors")
    return (
      <>
        <div className="section-heading">
          <h2>Semantic colors</h2>
          <span className="small muted">
            {Object.keys(colors).length} roles · {theme} theme · click to copy
          </span>
        </div>
        <div className="color-grid">
          {Object.entries(colors).map(([n, v]) => (
            <button
              type="button"
              className="color-token"
              key={n}
              onClick={() => copy(v)}
            >
              <span className="color-swatch" style={{ background: v }} />
              <strong>{n}</strong>
              <code>{v}</code>
            </button>
          ))}
        </div>
        <div className="section-heading">
          <h2>Primitive palette</h2>
          <span className="small muted">Raw colors become semantic roles</span>
        </div>
        {Object.entries(tokens.primitives).map(([n, values]) => (
          <div className="palette-row" key={n}>
            <strong>{n}</strong>
            <div>
              {Object.entries(values).map(([step, v]) => (
                <button key={step} onClick={() => copy(v)}>
                  <span style={{ background: v }} />
                  <small>{step}</small>
                  <code>{v}</code>
                </button>
              ))}
            </div>
          </div>
        ))}
        <p className="note">
          Use <code>success</code> and <code>danger</code> for direction. Status
          always includes a text label or icon; color carries supporting
          meaning.
        </p>
      </>
    );
  if (name === "Typography")
    return (
      <div className="type-table">
        {Object.entries(tokens.typography).map(([n, s]) => (
          <div className="type-row" key={n}>
            <div>
              <strong>{n}</strong>
              <code>
                {s.size} / {s.lineHeight} · {s.weight}
              </code>
            </div>
            <div style={typeStyles(n)}>
              {["display", "balance"].includes(n)
                ? "$12,845.00"
                : "Clarity in every transaction."}
            </div>
            <button
              type="button"
              className="icon-button"
              aria-label={"Copy " + n + " token"}
              onClick={() => copy("typography." + n)}
            >
              <Copy size={14} />
            </button>
          </div>
        ))}
        <p className="note">
          Inter on web and native. Small amounts, account references and numeric
          controls use Geist Mono. Large balances use Inter with tabular
          figures. Five sizes: 12, 14, 16, 24 and 32. Three weights: 400, 500
          and 600. Roles share sizes; weight establishes hierarchy.
        </p>
      </div>
    );
  if (name === "Spacing")
    return (
      <div className="space-table">
        {Object.entries(tokens.spacing).map(([n, v]) => (
          <div key={n}>
            <code>spacing.{n}</code>
            <span className="small muted">{v} px</span>
            <span className="space-visual" style={{ width: v * 4 || 2 }} />
          </div>
        ))}
        <p className="note">
          4 px base rhythm. Use 8–12 px within a control, 16 px between related
          content, 16 px for card padding, and 32 px between sections. Fields
          use 12/18 px padding. Buttons derive 14/21 px padding from their 20 px
          label line and 48 px target (1.5× text side).
        </p>
      </div>
    );
  if (name === "Radius")
    return (
      <div className="radius-grid">
        {Object.entries(tokens.radius).map(([n, v]) => (
          <div className="shape-token" key={n}>
            <span style={{ borderRadius: v }} />
            <h3>{n}</h3>
            <code>{v === 9999 ? "Pill / circular" : v + " px"}</code>
            <p>
              {n === "full"
                ? "Status dots and radio indicators only"
                : n === "lg"
                  ? "Cards and surfaces"
                  : n === "md"
                    ? "Fields and controls"
                    : n === "xl"
                      ? "Sheets and dialogs"
                      : "Fine detail and small surfaces"}
            </p>
          </div>
        ))}
      </div>
    );
  if (name === "Elevation")
    return (
      <div className="radius-grid">
        {Object.entries(tokens.elevation).map(([n, v]) => (
          <div className="shape-token" key={n}>
            <span style={{ boxShadow: v, borderRadius: tokens.radius.md }} />
            <h3>{n}</h3>
            <code>{v}</code>
            <p>
              {n === "overlay"
                ? "Dialogs and floating panels"
                : "Surface tone provides distinction; no decorative shadow."}
            </p>
          </div>
        ))}
      </div>
    );
  if (name === "Motion")
    return (
      <>
        <div className="motion-grid">
          {Object.entries(tokens.motion)
            .filter(([, v]) => typeof v === "number")
            .map(([n, v]) => (
              <div className="motion-token" key={n}>
                <h3>{n}</h3>
                <code>{v} ms</code>
                <div className="motion-track">
                  <span
                    style={{
                      transform: `translateX(${animate ? 160 : 0}px)`,
                      transitionDuration: v + "ms",
                    }}
                  />
                </div>
              </div>
            ))}
        </div>
        <Button onPress={() => setAnimate(!animate)}>
          Replay transitions
          <Zap size={15} />
        </Button>
        <p className="note">
          Reduced motion disables custom animations and transitions. Loading
          remains explained with text. No decorative movement is required to
          understand a financial state.
        </p>
      </>
    );
  return (
    <>
      <div className="section-heading">
        <h2>Text contrast</h2>
        <span className="small muted">Calculated from the current theme</span>
      </div>
      <div className="contrast-grid">
        {[
          ["foreground", "background"],
          ["muted", "surface"],
          ["accent-foreground", "accent"],
          ["secondary-foreground", "secondary"],
          ["foreground", "surface-tertiary"],
          ["surface", "success"],
          ["surface", "warning"],
          ["surface", "danger"],
          ["foreground", "surface-secondary"],
        ].map(([fg, bg]) => {
          const ratio = contrast(
            colors[fg as keyof typeof colors],
            colors[bg as keyof typeof colors],
          );
          return (
            <div className="contrast-token" key={fg + bg}>
              <span
                style={{
                  color: colors[fg as keyof typeof colors],
                  background: colors[bg as keyof typeof colors],
                }}
              >
                Aa
              </span>
              <div>
                <strong>{fg}</strong>
                <small>on {bg}</small>
              </div>
              <b className={ratio >= 4.5 ? "positive" : "danger"}>
                {ratio.toFixed(2)}:1 {ratio >= 4.5 ? "AA" : "Review"}
              </b>
            </div>
          );
        })}
      </div>
      <div className="a11y-grid">
        {[
          [
            "48 × 48",
            "Shared touch target; covers iOS 44 pt and Android 48 dp",
          ],
          ["Visible focus", "Keyboard focus uses the focus token"],
          ["Text + color", "Pending, complete and failed have labels"],
          [
            "Integer money",
            "No binary floating-point arithmetic for stored amounts",
          ],
          ["Privacy", "Balances can be masked before sharing"],
          ["Reduced motion", "Follows prefers-reduced-motion"],
        ].map(([a, b]) => (
          <Card key={a}>
            <h3>{a}</h3>
            <p className="small muted">{b}</p>
          </Card>
        ))}
      </div>
    </>
  );
}
