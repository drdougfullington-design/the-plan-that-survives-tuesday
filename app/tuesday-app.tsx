"use client";

import { useEffect, useMemo, useState } from "react";
import {
  actions,
  agentFindings,
  clinicalImperatives,
  compileWeek,
  groceryBase,
  initialConstraints,
  livedConstraints,
  patient,
  planMetrics,
  tradeoffs,
  type Constraints,
  type DayPlan,
} from "./demo-data";

const chapters = [
  { short: "Context", title: "Meet Elena" },
  { short: "Whole person", title: "What must fit" },
  { short: "Tuesday test", title: "Where it breaks" },
  { short: "Playground", title: "Change reality" },
  { short: "Livable week", title: "A week she can live" },
];

const recommendedConstraints: Constraints = {
  ...initialConstraints,
  wednesday: true,
  oneCook: true,
};

const constraintLabels: Array<{
  key: keyof Constraints;
  title: string;
  detail: string;
  primary?: boolean;
}> = [
  {
    key: "wednesday",
    title: "Wednesday evening unavailable",
    detail: "Caregiving added · 5:30–8:30 p.m.",
    primary: true,
  },
  {
    key: "budget",
    title: "Grocery ceiling falls to $40",
    detail: "No silent overspend",
    primary: true,
  },
  {
    key: "oneCook",
    title: "Only one cook session",
    detail: "Sunday window · 70 minutes",
    primary: true,
  },
  {
    key: "pain",
    title: "Knee symptoms changed",
    detail: "Pause and route to clinician",
  },
  {
    key: "lowEnergy",
    title: "Energy is unusually low",
    detail: "Shorter fallback, same cue",
  },
  {
    key: "family",
    title: "Friday pickup added",
    detail: "Family demand · 3:15–5:30 p.m.",
  },
];

const loadByDay = [
  { day: "M", work: 48, family: 16, plan: 24 },
  { day: "T", work: 72, family: 18, plan: 28 },
  { day: "W", work: 58, family: 42, plan: 31 },
  { day: "T", work: 50, family: 18, plan: 23 },
  { day: "F", work: 44, family: 27, plan: 20 },
  { day: "S", work: 8, family: 34, plan: 16 },
  { day: "S", work: 0, family: 28, plan: 35 },
];

const sourceFolios = [
  {
    label: "Clinical record",
    metric: "6 years · 42 encounters",
    excerpt: "Cardiometabolic risk, stable prescriptions, level walking cleared if knee remains at baseline.",
    evidence: ["A1c 6.2%", "Losartan + atorvastatin unchanged", "Knee baseline 3/10"],
  },
  {
    label: "Calendar",
    metric: "4 weeks · 7 late-clinic risks",
    excerpt: "Tuesday closes late. Wednesday evening is caregiving. Sunday is the only reliable prep window.",
    evidence: ["Tuesday until 7:30", "Wednesday blocked", "Sunday 4:30–5:40 open"],
  },
  {
    label: "Food + budget",
    metric: "$65/week · 1 cooking window",
    excerpt: "Beans, lentils, oats, and taco bowls are familiar. Separate diet food is a nonstarter.",
    evidence: ["Pantry basics confirmed", "One nearby store", "Family accepts shared base meals"],
  },
  {
    label: "In her words",
    metric: "Priorities · failures · strengths",
    excerpt: "Small changes work. A disrupted evening usually turns a plan into an all-or-nothing reset.",
    evidence: ["Family dinner protected", "Luis will walk", "Fallbacks have worked before"],
  },
];

function WeekCanvas({
  week,
  compact = false,
  compare = false,
}: {
  week: DayPlan[];
  compact?: boolean;
  compare?: boolean;
}) {
  return (
    <div className={`week-canvas ${compact ? "week-canvas--compact" : ""} ${compare ? "is-comparing" : ""}`}>
      {week.map((day) => (
        <article className={`day-column day-column--${day.tone}`} key={day.day}>
          <header>
            <span>{day.date}</span>
            <h4>{day.day}</h4>
          </header>
          <div className="day-items">
            {day.items.map((item, index) => (
              <div className="plan-strip" data-kind={item.kind} key={`${item.time}-${item.label}-${index}`}>
                <span className="plan-time">{item.time}</span>
                <strong>{item.label}</strong>
                {item.note ? <small>{item.note}</small> : null}
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function BoundaryNote() {
  return (
    <div className="boundary-note" role="note">
      <span>Prototype boundary</span>
      Synthetic case · clinician-approved plan translation only · no diagnosis · no medication changes
    </div>
  );
}

export default function TuesdayApp() {
  const [view, setView] = useState(0);
  const [expandedFolio, setExpandedFolio] = useState<number | null>(null);
  const [tested, setTested] = useState(false);
  const [visibleFindings, setVisibleFindings] = useState(0);
  const [constraints, setConstraints] = useState<Constraints>(initialConstraints);
  const [compiled, setCompiled] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [compileStage, setCompileStage] = useState(0);
  const [showMoreConstraints, setShowMoreConstraints] = useState(false);
  const [compare, setCompare] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [modal, setModal] = useState<"patient" | "clinician" | null>(null);
  const [copied, setCopied] = useState(false);
  const [engineSource, setEngineSource] = useState<"demo" | "openai" | null>(null);
  const [engineNote, setEngineNote] = useState("Baseline application compiler");
  const [liveLedger, setLiveLedger] = useState<{ preserved: string[]; traded: string[]; changed: string[] } | null>(null);

  const activeCount = Object.values(constraints).filter(Boolean).length;
  const appliedConstraints = view === 4 && !compiled ? recommendedConstraints : compiled ? constraints : initialConstraints;
  const week = useMemo(() => compileWeek(appliedConstraints), [appliedConstraints]);
  const metrics = planMetrics(appliedConstraints);
  const ledger = liveLedger ?? tradeoffs(appliedConstraints);
  const planStatus = compiling ? "recompiling" : view >= 4 || compiled ? "workable" : tested ? "strained" : "fragile";

  const navigate = (target: number) => {
    setView(Math.max(0, Math.min(4, target)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target.tagName)) return;
      if (event.key >= "1" && event.key <= "5") navigate(Number(event.key) - 1);
      if (event.key === "ArrowRight") navigate(view + 1);
      if (event.key === "ArrowLeft") navigate(view - 1);
      if (event.key.toLowerCase() === "r" && view === 3 && activeCount > 0) void recompile();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const runTuesdayTest = () => {
    if (tested) return;
    setVisibleFindings(0);
    let count = 0;
    const timer = window.setInterval(() => {
      count += 1;
      setVisibleFindings(count);
      if (count === agentFindings.length) {
        window.clearInterval(timer);
        window.setTimeout(() => setTested(true), 180);
      }
    }, 150);
  };

  const toggleConstraint = (key: keyof Constraints) => {
    setConstraints((current) => ({ ...current, [key]: !current[key] }));
    setCompiled(false);
    setCompare(false);
    setLiveLedger(null);
    setEngineSource(null);
    setEngineNote("Reality changed again");
  };

  async function recompile() {
    if (!activeCount || compiling) return;
    setCompiling(true);
    setCompileStage(0);
    setEngineNote("Requesting multi-perspective synthesis");
    const synthesis = fetch("/api/tuesday-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenarioId: "tuesday-demo-v1", constraints }),
    })
      .then(async (response) => ({ response, body: await response.json() as { ok?: boolean; source?: "demo" | "openai"; plan?: { preserved?: string[]; traded?: string[]; changed?: string[] } } }))
      .catch(() => null);
    const pause = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));
    await pause(400);
    setCompileStage(1);
    await pause(500);
    setCompileStage(2);
    await pause(550);
    const result = await synthesis;
    if (result?.response.ok && result.body.ok && result.body.plan) {
      setEngineSource(result.body.source ?? "demo");
      setEngineNote(result.body.source === "openai" ? "Live GPT-5.6 Sol · multi-agent beta" : "Deterministic demo mode · API key not configured");
      if (result.body.plan.preserved && result.body.plan.traded && result.body.plan.changed) {
        setLiveLedger({ preserved: result.body.plan.preserved, traded: result.body.plan.traded, changed: result.body.plan.changed });
      }
    } else {
      setEngineSource(null);
      setEngineNote("Live synthesis unavailable · showing local compiler");
    }
    setCompiled(true);
    setCompiling(false);
    setCompileStage(3);
  }

  const resetPlan = () => {
    setConstraints(initialConstraints);
    setCompiled(false);
    setCompare(false);
    setCompileStage(0);
    setEngineSource(null);
    setEngineNote("Baseline application compiler");
    setLiveLedger(null);
  };

  const copyWeek = async () => {
    const summary = week
      .map((day) => `${day.day}: ${day.items.map((item) => `${item.time} ${item.label}`).join(" · ")}`)
      .join("\n");
    await navigator.clipboard.writeText(`THE PLAN THAT SURVIVES TUESDAY\n\n${summary}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const downloadCsv = () => {
    const rows = [["Day", "Time", "Action", "Type", "Note"]];
    week.forEach((day) => day.items.forEach((item) => rows.push([day.day, item.time, item.label, item.kind, item.note ?? ""])));
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "elena-livable-week.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="app-shell">
      <header className="masthead">
        <button className="wordmark" onClick={() => navigate(0)} aria-label="Return to the beginning">
          <span>THE PLAN THAT</span>
          <strong>SURVIVES TUESDAY</strong>
        </button>
        <nav className="chapter-nav" aria-label="Prototype chapters">
          {chapters.map((chapter, index) => (
            <button aria-current={view === index ? "step" : undefined} key={chapter.short} onClick={() => navigate(index)}>
              <span>0{index + 1}</span> {chapter.short}
            </button>
          ))}
        </nav>
        <div className="masthead-tools">
          <span className="synthetic-label">Synthetic case</span>
          <button className="text-button" onClick={() => setGuideOpen(true)}>90-sec guide</button>
        </div>
      </header>
      <div className="progress-rule" aria-hidden="true">
        <span style={{ width: `${((view + 1) / chapters.length) * 100}%` }} />
      </div>
      {view > 0 ? (
        <div className="patient-strip">
          <span>{patient.name}</span><i /> <span>{patient.age}</span><i /> <span>Cardiometabolic risk</span><i />
          <span>Plan status: <strong data-status={planStatus}>{planStatus}</strong></span>
        </div>
      ) : null}

      {view === 0 ? (
        <section className="chapter chapter--context" aria-labelledby="context-title">
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">A synthetic case · GPT-5.6 Sol prototype</p>
              <h1 id="context-title">
                <span>This plan is</span>
                <span>medically reasonable.</span>
                <span>It will probably fail</span>
                <span className="rust-line">by Tuesday.</span>
              </h1>
              <p className="hero-lede">Most plans do not fail in the clinic. They fail when advice meets late work, a tight budget, pain, caregiving, and dinner.</p>
              <div className="hero-actions">
                <button className="primary-button" onClick={() => document.getElementById("person")?.scrollIntoView({ behavior: "smooth" })}>
                  Introduce the person <span>↓</span>
                </button>
                <button className="link-button" onClick={() => navigate(3)}>Jump to the magic moment →</button>
              </div>
            </div>
            <div className="care-plan-specimen" aria-label="Conventional care plan with feasibility annotations">
              <div className="paper-clip" aria-hidden="true" />
              <header>
                <span>AFTER-VISIT PLAN / 07.09.26</span>
                <strong>Clinician-approved goals</strong>
              </header>
              <ol>
                <li><span>01</span><div><strong>150 minutes</strong><small>moderate activity weekly</small></div><em>competes with clinic close</em></li>
                <li><span>02</span><div><strong>Plant-forward meals</strong><small>prepare 4× weekly</small></div><em>4 sessions ≠ 1 available</em></li>
                <li><span>03</span><div><strong>7–8 hours</strong><small>sleep nightly</small></div><em>caregiving not included</em></li>
                <li><span>04</span><div><strong>Track daily</strong><small>medications + weight</small></div><em>adds burden, not insight</em></li>
              </ol>
              <div className="fragile-stamp">Medically sound · behaviorally fragile</div>
            </div>
          </div>
          <div className="thesis-ribbon">The question is not “What should Elena do?” <span>The question is “What can this Tuesday hold?”</span></div>

          <div className="person-section" id="person">
            <aside className="patient-intro">
              <div className="monogram" aria-hidden="true">EM</div>
              <p className="eyebrow">The person in the plan</p>
              <h2>{patient.name}</h2>
              <p>{patient.age} · {patient.occupation}<br />{patient.pronouns}</p>
              <blockquote>“{patient.values}”</blockquote>
            </aside>
            <div className="source-area">
              <div className="section-heading">
                <div><p className="eyebrow">Whole-person context compiler</p><h2>Four records. One actual life.</h2></div>
                <span>All data synthetic</span>
              </div>
              <div className="folio-grid">
                {sourceFolios.map((folio, index) => (
                  <button className={`folio ${expandedFolio === index ? "is-expanded" : ""}`} key={folio.label} onClick={() => setExpandedFolio(expandedFolio === index ? null : index)} aria-expanded={expandedFolio === index}>
                    <span className="folio-number">0{index + 1}</span>
                    <small>{folio.metric}</small>
                    <h3>{folio.label}</h3>
                    <p>{folio.excerpt}</p>
                    <div className="folio-evidence">
                      {folio.evidence.map((item) => <span key={item}>{item}</span>)}
                    </div>
                    <strong className="reviewed">Reviewed <span>{expandedFolio === index ? "−" : "+"}</span></strong>
                  </button>
                ))}
              </div>
              <label className="chart-cannot-tell">
                <span>One thing the chart cannot tell us</span>
                <input defaultValue="I can manage small changes, but I stop when every day feels like a test." aria-label="One thing the chart cannot tell us" />
              </label>
              <div className="chapter-actions"><span /><button className="primary-button" onClick={() => navigate(1)}>Compile the whole-person map →</button></div>
            </div>
          </div>
          <BoundaryNote />
        </section>
      ) : null}

      {view === 1 ? (
        <section className="chapter" aria-labelledby="map-title">
          <div className="chapter-header">
            <div><p className="eyebrow">Whole-person map</p><h1 id="map-title">A plan has to fit two truths.</h1></div>
            <p>The medical intent is real. So are the hours, dollars, symptoms, and relationships it must move through.</p>
          </div>
          <div className="truth-grid">
            <section className="truth-column truth-column--clinical">
              <header><span>01</span><h2>Clinical intent</h2><small>What must be preserved</small></header>
              {clinicalImperatives.map((item, index) => (
                <article key={item.title}>
                  <span>0{index + 1}</span><div><h3>{item.title}</h3><p>{item.detail}</p><small>{item.invariant}</small></div>
                  <i style={{ "--strength": `${item.strength}%` } as React.CSSProperties} />
                </article>
              ))}
            </section>
            <div className="tension-rail" aria-label="Where clinical intent and life constraints collide">
              <span>same 6–7 PM hour</span><i /><span>requires 3× her capacity</span><i /><span>pain fallback missing</span>
              <blockquote><small>Her definition of success</small>More energy at dinner. Fewer all-or-nothing weeks.</blockquote>
            </div>
            <section className="truth-column truth-column--life">
              <header><span>02</span><h2>Lived reality</h2><small>What the chart cannot overrule</small></header>
              {livedConstraints.map((item, index) => (
                <article key={item.title}><span>0{index + 1}</span><div><h3>{item.title}</h3><p>{item.detail}</p></div></article>
              ))}
            </section>
          </div>
          <div className="synthesis-strip">
            <p><span>Six agents agree on the medical intent.</span> They disagree on how much change this week can hold.</p>
            <button className="primary-button" onClick={() => navigate(2)}>Hear their findings →</button>
          </div>
          <div className="chapter-actions"><button className="link-button" onClick={() => navigate(0)}>← Back</button><button className="link-button" onClick={() => navigate(2)}>Continue · Tuesday Test →</button></div>
          <BoundaryNote />
        </section>
      ) : null}

      {view === 2 ? (
        <section className="chapter" aria-labelledby="test-title">
          <div className="chapter-header test-header">
            <div><p className="eyebrow">The Tuesday Test</p><h1 id="test-title">This is where the attractive plan meets the actual week.</h1></div>
            <div className="run-test-box"><span>6 analyses · 1 synthesis</span><button className="primary-button" onClick={runTuesdayTest}>{tested ? "Test complete ✓" : visibleFindings ? "Agents working…" : "Run Tuesday Test"}</button></div>
          </div>
          <div className="capacity-chart" aria-label="Weekly burden compared with available capacity">
            <div className="capacity-line"><span>available capacity</span></div>
            {loadByDay.map((day, index) => (
              <div className={`load-day ${index === 1 ? "is-tuesday" : ""}`} key={`${day.day}-${index}`}>
                <div className="load-bar"><i style={{ height: `${day.plan}%` }} data-kind="plan" /><i style={{ height: `${day.family}%` }} data-kind="family" /><i style={{ height: `${day.work}%` }} data-kind="work" /></div>
                <span>{day.day}</span>{index === 1 ? <em>First break</em> : null}
              </div>
            ))}
            <div className="load-legend"><span>work</span><span>family</span><span>plan</span></div>
          </div>
          <div className="test-results">
            <section className="failure-report">
              <header><p className="eyebrow">Failure report</p><span>Evidence, not chain-of-thought</span></header>
              {agentFindings.map((finding, index) => (
                <article className={index < visibleFindings || tested ? "is-visible" : ""} key={finding.id}>
                  <span>{finding.id}</span><div><small>{finding.agent} · {finding.short}</small><p>{finding.finding}</p><em>{finding.evidence}</em></div>
                </article>
              ))}
            </section>
            <aside className="agent-chorus">
              <p className="eyebrow">Agent chorus</p>
              {agentFindings.map((finding, index) => (
                <div className={index < visibleFindings || tested ? "is-visible" : ""} key={finding.agent}>
                  <span>{finding.short}</span><p><strong>{finding.agent}</strong>{finding.finding}</p>
                </div>
              ))}
              <div className={`synthesis-card ${tested ? "is-visible" : ""}`}>
                <small>Sol synthesis</small>
                <strong>Remove seven obligations. Preserve three intentions.</strong>
                <p>The smaller plan is not less clinical. It is more honest about where care has to happen.</p>
              </div>
            </aside>
          </div>
          <div className="chapter-actions"><button className="link-button" onClick={() => navigate(1)}>← Back</button><button className="primary-button" onClick={() => navigate(3)}>Change one thing about reality →</button></div>
          <BoundaryNote />
        </section>
      ) : null}

      {view === 3 ? (
        <section className="chapter chapter--playground" aria-labelledby="playground-title">
          <div className="chapter-header playground-header">
            <div><p className="eyebrow">Constraint playground</p><h1 id="playground-title">Reality changed. The plan should, too.</h1></div>
            <p>Change time, money, energy, pain, or family demand. Clinical intent stays visible while implementation moves.</p>
          </div>
          <div className="playground-grid">
            <aside className="constraint-rail">
              <header><span>Reality layer</span><strong>{activeCount} active</strong></header>
              {constraintLabels.filter((item) => item.primary).map((item) => (
                <button className="constraint-toggle" role="switch" aria-checked={constraints[item.key]} key={item.key} onClick={() => toggleConstraint(item.key)}>
                  <i aria-hidden="true"><b /></i><span><strong>{item.title}</strong><small>{item.detail}</small></span>
                </button>
              ))}
              <button className="more-constraints" onClick={() => setShowMoreConstraints(!showMoreConstraints)} aria-expanded={showMoreConstraints}>
                {showMoreConstraints ? "Hide" : "Add"} pain, energy, or family <span>{showMoreConstraints ? "−" : "+"}</span>
              </button>
              {showMoreConstraints ? (
                <div className="secondary-constraints">
                  {constraintLabels.filter((item) => !item.primary).map((item) => (
                    <button className="constraint-toggle" role="switch" aria-checked={constraints[item.key]} key={item.key} onClick={() => toggleConstraint(item.key)}>
                      <i aria-hidden="true"><b /></i><span><strong>{item.title}</strong><small>{item.detail}</small></span>
                    </button>
                  ))}
                </div>
              ) : null}
              <button className="primary-button recompile-button" disabled={!activeCount || compiling} onClick={() => void recompile()}>
                {compiling ? "Recompiling…" : compiled ? "Plan recompiled ✓" : "Recompile week"}
              </button>
              <p className="load-summary">{activeCount ? `${activeCount} change${activeCount === 1 ? "" : "s"} will alter ${5 + activeCount * 2} plan elements.` : "Add a real constraint to make the reasoning visible."}</p>
              <button className="link-button reset-button" onClick={resetPlan}>Reset original plan</button>
            </aside>
            <div className="week-workspace">
              <div className="workspace-topline">
                <div><span>Seven-day implementation</span><strong>{compiled ? "Recompiled" : "Original plan"}</strong><small className={`engine-note ${engineSource ? `engine-note--${engineSource}` : ""}`}>{engineNote}</small></div>
                <div className="metric-row">
                  <span><small>Grocery</small><strong>${metrics.budget.toFixed(metrics.budget % 1 ? 2 : 0)}</strong></span>
                  <span><small>Cook</small><strong>{metrics.cookSessions}×</strong></span>
                  <span><small>Burden</small><strong>{metrics.burden}m</strong></span>
                </div>
              </div>
              {compiling ? (
                <div className="compile-message" aria-live="polite">
                  <span className="compile-mark" />
                  <strong>{["Protecting clinical intent", "Resolving calendar collisions", "Rebalancing cost and prep"][compileStage]}</strong>
                  <small>Clinical goals and safety boundaries remain locked.</small>
                </div>
              ) : null}
              <div className={compiling ? "is-recompiling" : compiled ? "is-compiled" : ""}>
                <WeekCanvas week={week} compare={compare} />
              </div>
              {compiled ? (
                <div className="decision-area" aria-live="polite">
                  <div className="decision-intro"><div><p className="eyebrow">Decision ledger</p><h2>The goal did not get smaller. The friction did.</h2></div><span>Resilience <strong>{metrics.resilience}/100</strong></span></div>
                  <div className="decision-ledger">
                    <section><small>Preserved</small>{ledger.preserved.map((item) => <p key={item}>{item}</p>)}</section>
                    <section><small>Traded</small>{ledger.traded.map((item) => <p key={item}>{item}</p>)}</section>
                    <section><small>Changed</small>{ledger.changed.map((item) => <p key={item}>{item}</p>)}</section>
                  </div>
                  <div className="compare-actions"><button className="link-button" onClick={() => setCompare(!compare)}>{compare ? "Hide original" : "Compare with original"}</button><button className="primary-button" onClick={() => navigate(4)}>See the livable week →</button></div>
                </div>
              ) : null}
            </div>
          </div>
          <div className="chapter-actions"><button className="link-button" onClick={() => navigate(2)}>← Back</button>{!compiled ? <span>Choose reality, then recompile.</span> : null}</div>
          <BoundaryNote />
        </section>
      ) : null}

      {view === 4 ? (
        <section className="chapter chapter--livable" aria-labelledby="livable-title">
          <div className="livable-hero">
            <div><p className="eyebrow">The livable week</p><h1 id="livable-title">Three essentials. One fallback. Room for a life.</h1></div>
            <div className="workable-stamp">Workable · robust to one disruption</div>
          </div>
          <div className="livable-grid">
            <div className="final-week"><WeekCanvas week={week} compact /></div>
            <aside className="essential-aside">
              <p className="eyebrow">This week’s three essentials</p>
              {actions.map((action) => (
                <article key={action.number}><span>{action.number}</span><div><h3>{action.title}</h3><p>{action.body}</p><small>{action.cue}</small></div></article>
              ))}
              <div className="plan-b"><span>Plan B</span><p>If the clinic runs late and the knee is at baseline: five minutes indoors with Luis. If knee symptoms meaningfully change, pause and contact the clinician. There is no make-up debt.</p></div>
            </aside>
          </div>
          <div className="details-grid">
            <details open>
              <summary><span>01</span>Grocery + prep <strong>$61.30 estimated</strong></summary>
              <div className="grocery-table">
                {groceryBase.map((item) => <div key={item.item}><span>{item.item}<small>{item.qty}</small></span><strong>${item.price.toFixed(2)}</strong></div>)}
                <div className="grocery-total"><span>Illustrative synthetic total</span><strong>$61.30</strong></div>
              </div>
            </details>
            <details>
              <summary><span>02</span>Shared-decision agenda <strong>5 unresolved</strong></summary>
              <ol>
                <li>Confirm the current knee status and the stop/reassessment rule.</li>
                <li>Check tolerance for the planned bean and lentil frequency.</li>
                <li>Validate the home blood-pressure cuff and technique.</li>
                <li>Confirm Tuesday’s break, refrigerator, and microwave access.</li>
                <li>Reprice the cart if pantry basics are missing.</li>
              </ol>
            </details>
            <details>
              <summary><span>03</span>What would change this plan? <strong>Named in advance</strong></summary>
              <div className="change-plan-list">
                <p><strong>Knee changes</strong>Pause walking and route to the clinician; keep the nutrition anchor.</p>
                <p><strong>Sunday window disappears</strong>Activate the 48-hour no-cook bridge; do not move prep debt to Wednesday.</p>
                <p><strong>Budget falls under $40</strong>Reprice and simplify before approval; do not silently exceed it.</p>
                <p><strong>Medication changes</strong>Display the updated clinician-supplied list and rerun safety review.</p>
              </div>
            </details>
          </div>
          <div className="deliverable-bar">
            <span>Prototype handoffs</span>
            <button onClick={() => setModal("patient")}>Patient handout</button>
            <button onClick={() => setModal("clinician")}>Clinician summary</button>
            <button onClick={() => void copyWeek()}>{copied ? "Copied ✓" : "Copy week"}</button>
            <button onClick={downloadCsv}>Download CSV</button>
            <button onClick={() => window.print()}>Print</button>
          </div>
          <div className="final-thesis">
            <p>AI has become very good at telling people what they should do.</p>
            <h2>This asks whether it can help create something they could actually do.</h2>
            <span>The clinician supplies judgment. Elena supplies reality. The model helps both occupy the same plan.</span>
          </div>
          <div className="chapter-actions"><button className="link-button" onClick={() => navigate(3)}>← Return to playground</button><span /></div>
          <BoundaryNote />
        </section>
      ) : null}

      {guideOpen ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setGuideOpen(false)}>
          <section className="guide-sheet" role="dialog" aria-modal="true" aria-labelledby="guide-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setGuideOpen(false)} aria-label="Close guided demo">×</button>
            <p className="eyebrow">90-second guided demo</p><h2 id="guide-title">Make the intelligence visible.</h2>
            <ol>
              <li><span>0:00</span><p><strong>Land the problem.</strong> “This plan is medically reasonable. It will probably fail by Tuesday.”</p></li>
              <li><span>0:15</span><p><strong>Add the person.</strong> Show time, budget, knee pain, family dinner, and the prior failure pattern.</p></li>
              <li><span>0:30</span><p><strong>Run the Tuesday Test.</strong> Six concise findings. No hidden chain-of-thought.</p></li>
              <li><span>0:50</span><p><strong>Change reality.</strong> Toggle Wednesday and one cook session; recompile.</p></li>
              <li><span>1:10</span><p><strong>Show the ledger.</strong> What stayed, what moved, and what was honestly traded.</p></li>
              <li><span>1:25</span><p><strong>Land the thesis.</strong> A plan a person can actually do.</p></li>
            </ol>
            <button className="primary-button" onClick={() => { setGuideOpen(false); navigate(0); }}>Start at the hook →</button>
          </section>
        </div>
      ) : null}

      {modal ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setModal(null)}>
          <section className="handoff-sheet" role="dialog" aria-modal="true" aria-labelledby="handoff-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal(null)} aria-label="Close handoff preview">×</button>
            {modal === "patient" ? (
              <>
                <p className="eyebrow">Patient handout · prototype preview</p><h2 id="handoff-title">Your plan is deliberately small.</h2>
                <p className="sheet-lede">We kept the parts your clinician asked you to begin. We removed the parts your week did not have room for.</p>
                {actions.map((action) => <div className="sheet-action" key={action.number}><span>{action.number}</span><p><strong>{action.title}</strong>{action.body}</p></div>)}
                <blockquote>Missing one action does not erase the week. Use the fallback, then return to the next scheduled step.</blockquote>
              </>
            ) : (
              <>
                <p className="eyebrow">For clinician review · implementation summary</p><h2 id="handoff-title">A smaller week that preserves the clinical intent.</h2>
                <p className="sheet-lede">The original implementation required three cooking sessions, multiple exercise appointments, and a $91.84 grocery draft. The revision uses one Sunday prep, seven named anchor meals, and two symptom-aware 12-minute walks.</p>
                <div className="clinician-grid"><div><small>Preserved</small><p>Plant-strong transition</p><p>Level walking if knee is stable</p><p>Medication continuity</p></div><div><small>Review needed</small><p>Knee symptom threshold</p><p>Bean/lentil tolerance</p><p>Workplace access assumptions</p></div></div>
                <blockquote>No diagnosis or medication recommendation was generated. Final implementation requires clinician review.</blockquote>
              </>
            )}
            <button className="primary-button" onClick={() => window.print()}>Print this preview</button>
          </section>
        </div>
      ) : null}
    </main>
  );
}
