import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { useDialogFocus } from '../utils/useDialogFocus';

type Context = {
  city: string;
  activities: string;
  sensitivities: string;
  workplace: string;
  days: string;
  hours: string;
  commute: string;
};

const blankContext: Context = {
  city: '',
  activities: '',
  sensitivities: '',
  workplace: '',
  days: '',
  hours: '',
  commute: '',
};

const CONTEXT_STORAGE_KEY = 'vaayudootha.daily-context';

interface DailySetupProps {
  close: () => void;
  complete: () => void;
}

export function DailySetup({ close, complete }: DailySetupProps) {
  const [step, setStep] = useState(0);
  const [context, setContext] = useState<Context>(() => {
    try {
      const saved = localStorage.getItem(CONTEXT_STORAGE_KEY);
      return saved ? { ...blankContext, ...JSON.parse(saved) } : blankContext;
    } catch {
      return blankContext;
    }
  });
  const dialogRef = useDialogFocus(close);

  useEffect(() => {
    if (step > 0) {
      dialogRef.current
        ?.querySelector<HTMLElement>('[data-dialog-step-focus]')
        ?.focus();
    }
  }, [dialogRef, step]);

  const updateField = (key: keyof Context, value: string) => {
    setContext((current) => ({ ...current, [key]: value }));
  };

  const renderField = (key: keyof Context, label: string, placeholder: string) => (
    <label className="daily-field" key={key}>
      {label}
      <input
        value={context[key]}
        placeholder={placeholder}
        onChange={(event) => updateField(key, event.target.value)}
      />
    </label>
  );

  const handleContinue = () => {
    if (step === 0) {
      setStep(1);
      return;
    }

    localStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(context));
    complete();
  };

  const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) close();
  };

  return (
    <div className="daily-modal-backdrop" onMouseDown={handleBackdropMouseDown}>
      <section
        ref={dialogRef}
        className="daily-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="daily-setup-title"
        aria-describedby="daily-setup-description"
        tabIndex={-1}
      >
        <button type="button" className="daily-modal-close" onClick={close} aria-label="Close">
          ×
        </button>
        <p className="daily-eyebrow">PERSONAL AIR PLAN · {step + 1} / 2</p>
        <h2
          id="daily-setup-title"
          tabIndex={-1}
          data-dialog-initial-focus
          data-dialog-step-focus
        >
          {step === 0 ? 'Your life and location' : 'Your workday'}
        </h2>
        <p id="daily-setup-description">Share the details that help shape a realistic daily routine.</p>

        <div className="daily-fields">
          {step === 0 ? (
            <>
              {renderField('city', 'City or location', 'e.g. Hyderabad')}
              {renderField('activities', 'Hobbies and outdoor activities', 'Running, gardening…')}
              {renderField('sensitivities', 'Health sensitivities (optional)', 'Asthma, allergies, none')}
            </>
          ) : (
            <>
              {renderField('workplace', 'Work location', 'Office, campus, home…')}
              {renderField('days', 'Work days', 'Monday to Friday')}
              {renderField('hours', 'Work hours', '9 AM – 5 PM')}
              {renderField('commute', 'Commute', 'Metro, bus, walking…')}
            </>
          )}
        </div>

        <div className="daily-modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => (step === 0 ? close() : setStep(0))}
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </button>
          <button type="button" className="primary-button" onClick={handleContinue}>
            {step === 0 ? 'Continue to workday →' : 'Open agent chat'}
          </button>
        </div>
      </section>
    </div>
  );
}
