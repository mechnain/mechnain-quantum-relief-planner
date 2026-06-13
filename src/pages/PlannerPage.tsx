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
        Enter what you have and where it needs to go. Choose a fairness rule, and the planner
        computes a deterministic, explainable allocation. Your inputs stay in your browser.
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
