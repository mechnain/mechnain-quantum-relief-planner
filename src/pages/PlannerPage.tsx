import { useNavigate } from 'react-router-dom';
import { usePlanner } from '../state/PlannerContext';
import { computePlan } from '../lib/planner';
import { ScenarioForm } from '../components/ScenarioForm';

export function PlannerPage() {
  const { scenario, setScenario, publishResult } = usePlanner();
  const navigate = useNavigate();

  return (
    <main id="main" className="page">
      <p className="kicker">Planner</p>
      <h1>Describe your scenario</h1>
      <p className="lede">
        Enter what you have and where it needs to go, then pick a fairness rule. You’ll get a clear
        allocation with a reason for every number — and the same inputs always give the same plan.
        Nothing leaves your browser. New here? Load a sample below and press calculate.
      </p>
      <hr className="divider" />
      <ScenarioForm
        scenario={scenario}
        onChange={setScenario}
        onSubmit={(s) => {
          publishResult(computePlan(s));
          navigate('/results');
        }}
      />
    </main>
  );
}
