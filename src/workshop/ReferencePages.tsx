import { Card } from "@heroui/react";
import { Check, ArrowUpRight, ExternalLink } from "lucide-react";
import {
  gaps,
  references,
  baseNames,
  financeNames,
  extensionNames,
  chatNames,
} from "../data/catalog";
import type { Section } from "./types";
export function Audit({
  navigate,
}: {
  navigate: (s: Section, n: string) => void;
}) {
  return (
    <>
      <div className="audit-summary">
        <Card>
          <h3>39 mapped primitives</h3>
          <p className="small muted">
            Existing HeroUI Native core. Each has a browser adapter and a token
            contract.
          </p>
        </Card>
        <Card>
          <h3>33 custom components</h3>
          <p className="small muted">
            18 finance, 8 supporting and 7 chat components. No Pro dependency.
          </p>
        </Card>
        <Card>
          <h3>Native QA pending</h3>
          <p className="small muted">
            A native catalog is included. No iOS simulator is configured on this
            machine.
          </p>
        </Card>
      </div>
      <div className="audit-table">
        <table>
          <thead>
            <tr>
              <th>Capability</th>
              <th>HeroUI Native core</th>
              <th>Our addition</th>
              <th>Coverage</th>
            </tr>
          </thead>
          <tbody>
            {gaps.map((g) => (
              <tr key={g.area}>
                <th scope="row">
                  {g.area}
                  <small>{g.scope}</small>
                </th>
                <td>{g.core}</td>
                <td>{g.extension}</td>
                <td>
                  <span
                    className={`audit-state ${g.state === "Built" ? "built" : ""}`}
                  >
                    {g.state}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="section-heading">
        <h2>Component contracts</h2>
        <span className="small muted">
          Select a component to inspect its token mapping
        </span>
      </div>
      <div className="coverage-grid">
        {[...baseNames, ...financeNames, ...extensionNames, ...chatNames].map(
          (n) => (
            <button
              type="button"
              key={n}
              onClick={() =>
                navigate(
                  baseNames.includes(n)
                    ? "Primitives"
                    : financeNames.includes(n)
                      ? "Finance"
                      : extensionNames.includes(n)
                        ? "Extensions"
                        : "Chat",
                  n,
                )
              }
            >
              <Check size={13} />
              {n}
              <ArrowUpRight size={13} />
            </button>
          ),
        )}
      </div>
      <p className="note">
        This release covers wallet, remittance, card-management and everyday
        spending UI. Investment, lending and real financial integrations are
        separate scope. Official references:{" "}
        <a
          href="https://heroui.com/en/docs/native/components"
          target="_blank"
          rel="noreferrer"
        >
          Native core catalog
        </a>{" "}
        ·{" "}
        <a
          href="https://heroui.pro/docs/native/components"
          target="_blank"
          rel="noreferrer"
        >
          Native Pro catalog
        </a>
        .
      </p>
    </>
  );
}
export function Benchmarks() {
  return (
    <>
      <div className="benchmark-grid">
        {references.map((r) => (
          <Card className="benchmark-card" key={r.title}>
            <div className="row between">
              <div>
                <span className="small muted">{r.app} / iOS</span>
                <h3>{r.title}</h3>
              </div>
              <a
                className="icon-button"
                href={r.url}
                target="_blank"
                rel="noreferrer"
                aria-label={"View " + r.app + " " + r.title + " on Mobbin"}
              >
                <ExternalLink size={16} />
              </a>
            </div>
            <a href={r.url} target="_blank" rel="noreferrer">
              <img
                src={r.image}
                alt={`${r.app} ${r.title}, benchmark reference from Mobbin`}
              />
            </a>
            <h4>What we observed</h4>
            <ul>
              {r.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
            <div className="token-chips">
              {r.applied.map((n) => (
                <code key={n}>{n}</code>
              ))}
            </div>
            <a
              className="text-link"
              href={r.url}
              target="_blank"
              rel="noreferrer"
            >
              Open reference on Mobbin
              <ArrowUpRight size={13} />
            </a>
          </Card>
        ))}
      </div>
      <p className="note">
        References were retrieved through Mobbin MCP and inspected visually.
        They inform information hierarchy and component needs. Finance UI uses
        its own tokens and compositions.
      </p>
    </>
  );
}
