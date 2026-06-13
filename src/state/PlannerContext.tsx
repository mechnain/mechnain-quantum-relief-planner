import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { PlanResult, QuantumExperimentId, QuantumResultData, Scenario } from '../types';
import { blankScenario } from '../data/sampleScenarios';

const KEYS = {
  scenario: 'mqrp.scenario.v1',
  result: 'mqrp.result.v1',
  prevResult: 'mqrp.prevResult.v1',
  quantum: 'mqrp.quantumResults.v1',
};

function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function save(key: string, value: unknown) {
  try {
    if (value === null || value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode, quota) — the app still works for the session.
  }
}

type PastedQuantum = Partial<Record<QuantumExperimentId, QuantumResultData>>;

interface PlannerContextValue {
  scenario: Scenario;
  setScenario: (s: Scenario) => void;
  result: PlanResult | null;
  prevResult: PlanResult | null;
  publishResult: (r: PlanResult) => void;
  pastedQuantum: PastedQuantum;
  setPastedQuantumResult: (r: QuantumResultData) => void;
  clearPastedQuantum: () => void;
}

const PlannerContext = createContext<PlannerContextValue | null>(null);

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [scenario, setScenarioState] = useState<Scenario>(
    () => load<Scenario>(KEYS.scenario) ?? blankScenario(),
  );
  const [result, setResult] = useState<PlanResult | null>(() => load<PlanResult>(KEYS.result));
  const [prevResult, setPrevResult] = useState<PlanResult | null>(() =>
    load<PlanResult>(KEYS.prevResult),
  );
  const [pastedQuantum, setPastedQuantum] = useState<PastedQuantum>(
    () => load<PastedQuantum>(KEYS.quantum) ?? {},
  );

  useEffect(() => save(KEYS.scenario, scenario), [scenario]);
  useEffect(() => save(KEYS.result, result), [result]);
  useEffect(() => save(KEYS.prevResult, prevResult), [prevResult]);
  useEffect(() => save(KEYS.quantum, pastedQuantum), [pastedQuantum]);

  const value = useMemo<PlannerContextValue>(
    () => ({
      scenario,
      setScenario: setScenarioState,
      result,
      prevResult,
      publishResult: (r: PlanResult) => {
        setPrevResult(result);
        setResult(r);
      },
      pastedQuantum,
      setPastedQuantumResult: (r: QuantumResultData) =>
        setPastedQuantum((prev) => ({ ...prev, [r.experiment]: r })),
      clearPastedQuantum: () => setPastedQuantum({}),
    }),
    [scenario, result, prevResult, pastedQuantum],
  );

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}

export function usePlanner(): PlannerContextValue {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error('usePlanner must be used inside PlannerProvider');
  return ctx;
}
