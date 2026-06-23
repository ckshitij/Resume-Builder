import type { ATSCheck } from '../types/resume';
import { atsScore } from '../utils/ats';

interface Props {
  checks: ATSCheck[];
}

export function ATSPanel({ checks }: Props) {
  const score = atsScore(checks);
  const scoreClass = score >= 80 ? 'good' : score >= 50 ? 'warn' : 'bad';

  return (
    <div className="panel ats-panel">
      <div className="panel-header">
        <h3>ATS Compatibility</h3>
        <span className={`ats-score ${scoreClass}`}>{score}%</span>
      </div>
      <p className="panel-desc">
        Applicant Tracking Systems parse plain-text resumes. Follow these checks before exporting.
      </p>
      <ul className="ats-checks">
        {checks.map((check) => (
          <li key={check.id} className={check.passed ? 'pass' : 'fail'}>
            <span className="check-icon">{check.passed ? '✓' : '!'}</span>
            <div>
              <strong>{check.label}</strong>
              {!check.passed && <p>{check.tip}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
