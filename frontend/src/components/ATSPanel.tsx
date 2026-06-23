import type { ATSCheck } from '../types/resume';
import { atsScore } from '../utils/ats';

interface Props {
  checks: ATSCheck[];
}

export function ATSPanel({ checks }: Props) {
  const score = atsScore(checks);
  const scoreClass = score >= 80 ? 'good' : score >= 50 ? 'warn' : 'bad';
  const passed = checks.filter((c) => c.passed).length;

  return (
    <div className="ats-panel">
      <div className="ats-hero">
        <div className={`ats-ring ${scoreClass}`}>
          <svg viewBox="0 0 36 36" className="ats-ring-svg">
            <path
              className="ats-ring-bg"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="ats-ring-fill"
              strokeDasharray={`${score}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="ats-ring-text">{score}%</span>
        </div>
        <div className="ats-hero-text">
          <h3>ATS Score</h3>
          <p>{passed} of {checks.length} checks passed</p>
        </div>
      </div>

      <p className="panel-hint">
        Applicant tracking systems read plain-text resumes. Fix failed checks before applying.
      </p>

      <ul className="ats-checks">
        {checks.map((check) => (
          <li key={check.id} className={`ats-check ${check.passed ? 'pass' : 'fail'}`}>
            <span className="check-badge">{check.passed ? '✓' : '!'}</span>
            <div className="check-content">
              <strong>{check.label}</strong>
              {!check.passed && <p>{check.tip}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
