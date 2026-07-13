export type DayPlan = {
  day: string;
  date: string;
  tone: "quiet" | "focus" | "flex";
  items: Array<{
    time: string;
    label: string;
    kind: "meal" | "move" | "prep" | "care";
    note?: string;
  }>;
};

export type Constraints = {
  wednesday: boolean;
  budget: boolean;
  oneCook: boolean;
  pain: boolean;
  lowEnergy: boolean;
  family: boolean;
};

export const initialConstraints: Constraints = {
  wednesday: false,
  budget: false,
  oneCook: false,
  pain: false,
  lowEnergy: false,
  family: false,
};

export const patient = {
  name: "Elena M.",
  age: 52,
  pronouns: "she / her",
  occupation: "outpatient physical therapist",
  clinical: "Obesity, prediabetes, elevated LDL-C, treated hypertension, intermittent knee pain",
  goals: "Begin a plant-strong eating pattern, increase low-impact activity, and reduce cardiometabolic risk without adding treatment burden.",
  values: "I want enough energy to be present at dinner and keep up with my granddaughter. I am not willing to turn food into a second job.",
};

export const clinicalImperatives = [
  {
    title: "Nutrition quality",
    detail: "Increase legumes, whole grains, vegetables, fruit, nuts, and seeds.",
    invariant: "Preserve adequate protein and medication-aware meal timing.",
    strength: 92,
  },
  {
    title: "Progressive movement",
    detail: "Build repeatable moderate activity without provoking the knee.",
    invariant: "Stop and reassess for swelling, instability, or escalating pain.",
    strength: 84,
  },
  {
    title: "Blood pressure safety",
    detail: "Keep sodium and medication timing visible during the transition.",
    invariant: "No medication changes without the prescribing clinician.",
    strength: 78,
  },
];

export const livedConstraints = [
  { title: "Time", detail: "Late clinic Tuesday; caregiving Wednesday; one reliable prep block." },
  { title: "Money", detail: "$65 weekly grocery ceiling; one store within a short drive." },
  { title: "Body", detail: "Knee pain varies after long days on her feet; sleep is inconsistent." },
  { title: "Home", detail: "Family dinner matters; spouse prefers familiar food and will walk together." },
];

export const agentFindings = [
  {
    id: "01",
    agent: "Clinical fidelity",
    short: "Keep",
    finding: "The cardiometabolic intent is sound; protein adequacy and knee-symptom monitoring cannot be lost.",
    evidence: "Clinician goal + medication list",
  },
  {
    id: "02",
    agent: "Behavior change",
    short: "Reduce",
    finding: "The original plan asks for 18 new decisions and offers no miss protocol or bad-day fallback.",
    evidence: "Prior reset: abandoned on day 3",
  },
  {
    id: "03",
    agent: "Time + logistics",
    short: "Move",
    finding: "Tuesday’s dinner and walk do not exist. Elena is still at the clinic, and Wednesday is unavailable.",
    evidence: "Four-week calendar pattern",
  },
  {
    id: "04",
    agent: "Affordability",
    short: "Swap",
    finding: "The first grocery draft costs $91.84 and assumes fresh variety instead of repeatable components.",
    evidence: "Synthetic basket + $65 ceiling",
  },
  {
    id: "05",
    agent: "Patient values",
    short: "Protect",
    finding: "A separate diet dinner solves a nutrient problem by creating a family problem.",
    evidence: "Patient narrative",
  },
  {
    id: "06",
    agent: "Safety skeptic",
    short: "Clarify",
    finding: "Knee thresholds and workplace access are assumptions; medication changes stay out of scope.",
    evidence: "Problem list + missing context",
  },
];

export const actions = [
  {
    number: "01",
    title: "Build the base once",
    body: "Sunday, 4:30–5:40 p.m.: make one pot of lentil–black bean chili, brown rice, roasted vegetables, and four oat jars.",
    cue: "Stop when the timer ends. Unfinished garnishes are optional.",
  },
  {
    number: "02",
    title: "One anchor meal daily",
    body: "Protect one named meal made from beans or lentils, whole grains, and produce. Tuesday’s is packed on Sunday.",
    cue: "Pack it when the coffee starts.",
  },
  {
    number: "03",
    title: "Two walks that count",
    body: "Walk 12 level minutes with Luis after dinner Monday and Thursday—only if the knee is at baseline.",
    cue: "Shoes stay beside the garage door.",
  },
];

export const groceryBase = [
  { item: "Oats + brown rice", qty: "18 oz / 2 lb", price: 6.78, essential: true },
  { item: "Dry lentils", qty: "1 lb", price: 1.69, essential: true },
  { item: "Low-sodium beans", qty: "5 cans", price: 6.45, essential: true },
  { item: "No-salt tomatoes", qty: "2 cans", price: 2.58, essential: true },
  { item: "Whole-wheat tortillas", qty: "10 count", price: 3.49, essential: true },
  { item: "Frozen vegetables", qty: "5 bags", price: 8.05, essential: true },
  { item: "Spinach + sweet potatoes", qty: "10 oz / 3 lb", price: 6.78, essential: true },
  { item: "Onions, bananas, apples", qty: "one week", price: 9.23, essential: true },
  { item: "Salsa + hummus", qty: "16 oz / 10 oz", price: 5.98, essential: true },
  { item: "Soy milk + peanut butter", qty: "64 oz / 18 oz", price: 5.78, essential: true },
  { item: "Frozen berries + lemons", qty: "12 oz / 2", price: 4.49, essential: false },
];

const baselineWeek: DayPlan[] = [
  {
    day: "Monday",
    date: "JUL 13",
    tone: "focus",
    items: [
      { time: "7:10", label: "Oats + berries", kind: "meal" },
      { time: "12:25", label: "Lentil-grain bowl", kind: "meal" },
      { time: "6:15", label: "Sheet-pan vegetables", kind: "prep", note: "Cook 1 of 3" },
    ],
  },
  {
    day: "Tuesday",
    date: "JUL 14",
    tone: "flex",
    items: [
      { time: "6:50", label: "Pack anchor lunch", kind: "care" },
      { time: "5:25", label: "Clinic chili bowl", kind: "meal" },
      { time: "7:45", label: "12-min walk with Luis", kind: "move", note: "Collides with late clinic" },
    ],
  },
  {
    day: "Wednesday",
    date: "JUL 15",
    tone: "quiet",
    items: [
      { time: "7:00", label: "Oats + banana", kind: "meal" },
      { time: "5:45", label: "Bean tacos", kind: "prep", note: "Cook 2 of 3" },
      { time: "7:10", label: "12-min walk", kind: "move" },
    ],
  },
  {
    day: "Thursday",
    date: "JUL 16",
    tone: "focus",
    items: [
      { time: "12:30", label: "Lentil-grain bowl", kind: "meal" },
      { time: "6:35", label: "12-min walk with Luis", kind: "move", note: "Reassess knee after" },
    ],
  },
  {
    day: "Friday",
    date: "JUL 17",
    tone: "quiet",
    items: [
      { time: "12:15", label: "Hummus crunch wrap", kind: "meal" },
      { time: "6:10", label: "Vegetable chili", kind: "prep", note: "Cook 3 of 3" },
    ],
  },
  {
    day: "Saturday",
    date: "JUL 18",
    tone: "quiet",
    items: [
      { time: "1:00", label: "Chili + rice", kind: "meal" },
      { time: "1:15", label: "Two-minute check-in", kind: "care" },
    ],
  },
  {
    day: "Sunday",
    date: "JUL 19",
    tone: "focus",
    items: [
      { time: "4:30", label: "Batch prep", kind: "prep", note: "70-minute stop rule" },
      { time: "6:15", label: "Family chili dinner", kind: "meal" },
    ],
  },
];

export function compileWeek(constraints: Constraints): DayPlan[] {
  const week = baselineWeek.map((day) => ({ ...day, items: day.items.map((item) => ({ ...item })) }));

  if (constraints.oneCook) {
    week[0].items = week[0].items.filter((item) => item.kind !== "prep");
    week[2].items = week[2].items.filter((item) => item.kind !== "prep");
    week[4].items = week[4].items.map((item) =>
      item.kind === "prep" ? { time: "6:10", label: "Batch-prepped chili", kind: "meal", note: "Reheat, do not recook" } : item,
    );
    week[6].items = week[6].items.map((item) =>
      item.kind === "prep" ? { ...item, label: "One-pot batch prep", note: "Rice, lentils + chili · 70 min" } : item,
    );
  }

  if (constraints.wednesday) {
    week[2].items = [
      { time: "12:30", label: "Chickpea-hummus wrap", kind: "meal" },
      { time: "5:30", label: "Caregiving · no plan task", kind: "care", note: "Protected, intentionally blank" },
    ];
  }

  if (constraints.pain) {
    [0, 3].forEach((index) => {
      week[index].items = week[index].items.map((item) =>
        item.kind === "move" ? { ...item, label: "Pause + symptom check", note: "Route meaningful change to clinician" } : item,
      );
    });
  }

  if (constraints.lowEnergy) {
    [0, 3].forEach((index) => {
      week[index].items = week[index].items.map((item) =>
        item.kind === "move" ? { ...item, label: "5-min indoor loop", note: "Today’s floor still counts" } : item,
      );
    });
  }

  if (constraints.family) {
    week[4].items = [
      { time: "3:20", label: "School pickup snack", kind: "care" },
      { time: "6:00", label: "Family taco bowls", kind: "meal", note: "Shared base, no separate dinner" },
      { time: "6:45", label: "Granddaughter-led block walk", kind: "move" },
    ];
  }

  if (constraints.budget) {
    week[0].items = week[0].items.map((item) => item.label === "Oats + berries" ? { ...item, label: "Oats + banana" } : item);
  }

  return week;
}

export function planMetrics(constraints: Constraints) {
  const active = Object.values(constraints).filter(Boolean).length;
  return {
    budget: constraints.budget ? 40 : constraints.oneCook ? 61.3 : 91.84,
    cookSessions: constraints.oneCook ? 1 : 3,
    burden: Math.max(116, 218 - active * 17 - (constraints.oneCook ? 34 : 0)),
    resilience: Math.min(96, 62 + active * 5 + (constraints.oneCook ? 8 : 0)),
  };
}

export function tradeoffs(constraints: Constraints) {
  const changed: string[] = [];
  const traded: string[] = [];
  if (constraints.wednesday) changed.push("Wednesday becomes a protected no-task evening.");
  if (constraints.budget) changed.push("Berries and hummus become optional; oats, bananas, lentils, and rice take the lead.");
  if (constraints.oneCook) changed.push("Three cooking sessions collapse into one Sunday batch.");
  if (constraints.pain) changed.push("Walking pauses; the plan routes a meaningful symptom change to the clinician.");
  if (constraints.lowEnergy) changed.push("Duration drops, but the after-dinner cue remains intact.");
  if (constraints.family) changed.push("Friday movement becomes a family walk after shared taco bowls.");
  if (constraints.budget) traded.push("Less fresh variety this week in exchange for budget honesty.");
  if (constraints.oneCook) traded.push("More repetition in exchange for two reclaimed evenings.");
  if (constraints.pain) traded.push("Lower movement dose until knee symptoms are reassessed.");
  if (!changed.length) changed.push("No new constraints yet. Add reality to watch the plan recompile.");
  if (!traded.length) traded.push("The baseline plan favors variety over simplicity.");
  return {
    preserved: [
      "One daily plant-strong anchor",
      "Two symptom-aware movement opportunities",
      "Medication continuity",
      "Family dinner and the grocery ceiling",
    ],
    changed,
    traded,
  };
}
