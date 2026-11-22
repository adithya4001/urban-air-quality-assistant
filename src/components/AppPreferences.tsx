import { useState } from 'react';
import type { MouseEvent } from 'react';
import { defaultPreferences, usePreferences } from '../domain/preferences';
import { useDialogFocus } from '../utils/useDialogFocus';

type Section = 'appearance' | 'weather' | 'assistant' | 'navigation';

const sections: { id: Section; label: string; icon: string }[] = [
  { id: 'appearance', label: 'Appearance', icon: '◐' },
  { id: 'weather', label: 'Weather & air', icon: '☁' },
  { id: 'assistant', label: 'Assistant', icon: '✦' },
  { id: 'navigation', label: 'Navigation', icon: '☰' },
];

interface AppPreferencesProps {
  userId: string;
  close: () => void;
}

export function AppPreferences({ close }: AppPreferencesProps) {
  const { prefs, update } = usePreferences();
  const [section, setSection] = useState<Section>('appearance');
  const dialogRef = useDialogFocus(close);

  const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) close();
  };

  return (
    <div className="profile-modal-backdrop" onMouseDown={handleBackdropMouseDown}>
      <section
        ref={dialogRef}
        className="settings-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="preferences-title"
        tabIndex={-1}
      >
        <header className="settings-header">
          <div>
            <span className="daily-eyebrow">YOUR VAAYUDOOTHA</span>
            <h2 id="preferences-title" tabIndex={-1} data-dialog-initial-focus>
              Settings
            </h2>
          </div>
          <button type="button" className="settings-close" onClick={close} aria-label="Close settings">
            ×
          </button>
        </header>

        <div className="settings-layout">
          <nav className="settings-nav" aria-label="Settings sections">
            {sections.map((item) => (
              <button
                type="button"
                key={item.id}
                className={item.id === section ? 'active' : ''}
                aria-current={item.id === section ? 'page' : undefined}
                onClick={() => setSection(item.id)}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="settings-content">
            {section === 'appearance' && (
              <>
                <h3>Appearance</h3>
                <p>Make the workspace comfortable to read.</p>
                <label className="settings-row">
                  <span><strong>Text size</strong><small>Change the size of workspace text.</small></span>
                  <select
                    value={prefs.textSize}
                    onChange={(event) => update({ textSize: event.target.value as 'normal' | 'large' })}
                  >
                    <option value="normal">Normal</option>
                    <option value="large">Large</option>
                  </select>
                </label>
                <label className="settings-row">
                  <span><strong>Reduce motion</strong><small>Pause decorative animations in the workspace.</small></span>
                  <input
                    type="checkbox"
                    checked={prefs.reduceMotion}
                    onChange={(event) => update({ reduceMotion: event.target.checked })}
                  />
                </label>
                <label className="settings-row">
                  <span><strong>Compact cards</strong><small>Use less spacing in the workspace.</small></span>
                  <input
                    type="checkbox"
                    checked={prefs.compact}
                    onChange={(event) => update({ compact: event.target.checked })}
                  />
                </label>
              </>
            )}

            {section === 'weather' && (
              <>
                <h3>Weather & air</h3>
                <p>Choose how your saved places display forecasts.</p>
                <label className="settings-row">
                  <span><strong>Temperature unit</strong><small>For the saved-places weather cards.</small></span>
                  <select
                    value={prefs.temperature}
                    onChange={(event) => update({ temperature: event.target.value as 'c' | 'f' })}
                  >
                    <option value="c">°C</option>
                    <option value="f">°F</option>
                  </select>
                </label>
                <label className="settings-row">
                  <span><strong>Wind speed unit</strong><small>For the saved-places weather cards.</small></span>
                  <select
                    value={prefs.wind}
                    onChange={(event) => update({ wind: event.target.value as 'kmh' | 'mph' })}
                  >
                    <option value="kmh">km/h</option>
                    <option value="mph">mph</option>
                  </select>
                </label>
                <label className="settings-row">
                  <span><strong>Time format</strong><small>Hourly forecast labels.</small></span>
                  <select
                    value={prefs.clock}
                    onChange={(event) => update({ clock: event.target.value as '24' | '12' })}
                  >
                    <option value="24">24-hour</option>
                    <option value="12">12-hour</option>
                  </select>
                </label>
                <label className="settings-row">
                  <span><strong>Default forecast graph</strong><small>First metric shown for each place.</small></span>
                  <select
                    value={prefs.weatherMetric}
                    onChange={(event) => update({ weatherMetric: event.target.value as 'temperature' | 'precipitation' | 'wind' })}
                  >
                    <option value="temperature">Temperature</option>
                    <option value="precipitation">Rain chance</option>
                    <option value="wind">Wind</option>
                  </select>
                </label>
                <label className="settings-row">
                  <span><strong>Graph interval</strong><small>Spacing between hourly forecast values.</small></span>
                  <select
                    value={prefs.chartInterval}
                    onChange={(event) => update({ chartInterval: event.target.value as '3' | '6' })}
                  >
                    <option value="3">3 hours</option>
                    <option value="6">6 hours</option>
                  </select>
                </label>
                <label className="settings-row">
                  <span><strong>Air plan refresh</strong><small>Refresh conditions while the app is open.</small></span>
                  <select
                    value={prefs.refreshMinutes}
                    onChange={(event) => update({ refreshMinutes: event.target.value as '15' | '30' | '60' | 'off' })}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="off">Manual only</option>
                  </select>
                </label>
              </>
            )}

            {section === 'assistant' && (
              <>
                <h3>Assistant</h3>
                <p>Choose how conversations appear and sound.</p>
                <label className="settings-row">
                  <span><strong>Suggested question focus</strong><small>Choose the kind of prompts you see. The assistant stays focused on air and weather.</small></span>
                  <select
                    value={prefs.assistantFocus}
                    onChange={(event) => update({ assistantFocus: event.target.value as 'general' | 'commute' | 'outdoor' | 'indoor' })}
                  >
                    <option value="general">General</option>
                    <option value="commute">Commute</option>
                    <option value="outdoor">Outdoor activity</option>
                    <option value="indoor">Indoor air</option>
                  </select>
                </label>
                <label className="settings-row">
                  <span><strong>Suggested questions</strong><small>Show quick prompts above the chat.</small></span>
                  <input
                    type="checkbox"
                    checked={prefs.quickQuestions}
                    onChange={(event) => update({ quickQuestions: event.target.checked })}
                  />
                </label>
                <label className="settings-row">
                  <span><strong>Expanded explanations</strong><small>Show actions, reasoning and source details in replies.</small></span>
                  <input
                    type="checkbox"
                    checked={prefs.replyDetails}
                    onChange={(event) => update({ replyDetails: event.target.checked })}
                  />
                </label>
                <label className="settings-row">
                  <span><strong>Read answers aloud</strong><small>Use your browser’s voice after an assistant reply.</small></span>
                  <input
                    type="checkbox"
                    checked={prefs.autoRead}
                    onChange={(event) => update({ autoRead: event.target.checked })}
                  />
                </label>
                <p className="settings-footnote">The assistant provider and model depend on server configuration.</p>
              </>
            )}

            {section === 'navigation' && (
              <>
                <h3>Navigation</h3>
                <p>Choose how your next session starts.</p>
                <label className="settings-row">
                  <span><strong>Sidebar on sign-in</strong><small>Applied when you next sign in or reload.</small></span>
                  <select
                    value={prefs.sidebarDefault}
                    onChange={(event) => update({ sidebarDefault: event.target.value as 'open' | 'closed' })}
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </label>
              </>
            )}
          </div>
        </div>

        <footer className="settings-footer">
          <p>Saved for this account in this browser.</p>
          <div>
            <button type="button" className="secondary-button" onClick={() => update(defaultPreferences)}>
              Reset settings
            </button>
            <button type="button" className="primary-button" onClick={close}>
              Done
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
