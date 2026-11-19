import React from 'react';
import {
  AgeGroup,
  CommuteMode,
  HealthCondition,
  HomeHeatingType,
  UserProfile,
} from '../domain/types';

interface UserProfileEditorProps {
  profile: UserProfile;
  onChange: (updated: UserProfile) => void;
}

export const UserProfileEditor: React.FC<UserProfileEditorProps> = ({ profile, onChange }) => {
  const handleConditionToggle = (condition: HealthCondition) => {
    let nextConditions: HealthCondition[];
    if (condition === 'none') {
      nextConditions = ['none'];
    } else {
      const active = profile.healthConditions.filter((c) => c !== 'none');
      if (active.includes(condition)) {
        nextConditions = active.filter((c) => c !== condition);
        if (nextConditions.length === 0) nextConditions = ['none'];
      } else {
        nextConditions = [...active, condition];
      }
    }
    onChange({ ...profile, healthConditions: nextConditions });
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">2. Resident Profile & Lifestyle</h2>
      </div>

      <div className="form-group">
        <label htmlFor="user-name" className="form-label">
          Resident / Profile Name
        </label>
        <input
          id="user-name"
          className="form-input"
          type="text"
          value={profile.name}
          onChange={(e) => onChange({ ...profile, name: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label htmlFor="user-age-group" className="form-label">
          Age Category
        </label>
        <select
          id="user-age-group"
          className="form-select"
          value={profile.ageGroup}
          onChange={(e) => onChange({ ...profile, ageGroup: e.target.value as AgeGroup })}
        >
          <option value="infant_child">Infant / Child (&lt; 14 yrs) - Vulnerable</option>
          <option value="teen_adult">Teen / Adult (15 - 64 yrs)</option>
          <option value="older_adult">Older Adult (65+ yrs) - Vulnerable</option>
        </select>
      </div>

      <fieldset className="form-group" style={{ border: 'none', padding: 0 }}>
        <legend className="form-label">Medical & Sensitivity Considerations</legend>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={profile.healthConditions.includes('asthma')}
              onChange={() => handleConditionToggle('asthma')}
            />
            <span>Asthma / Bronchial Hyperreactivity</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={profile.healthConditions.includes('copd')}
              onChange={() => handleConditionToggle('copd')}
            />
            <span>COPD / Chronic Respiratory Disease</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={profile.healthConditions.includes('cardiovascular')}
              onChange={() => handleConditionToggle('cardiovascular')}
            />
            <span>Cardiovascular / Hypertension History</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={profile.healthConditions.includes('pregnancy')}
              onChange={() => handleConditionToggle('pregnancy')}
            />
            <span>Pregnancy</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={profile.healthConditions.includes('none')}
              onChange={() => handleConditionToggle('none')}
            />
            <span>No specific pre-existing sensitivities</span>
          </label>
        </div>
      </fieldset>

      <div className="form-group">
        <label htmlFor="user-commute-mode" className="form-label">
          Usual Daily Commute Mode
        </label>
        <select
          id="user-commute-mode"
          className="form-select"
          value={profile.lifestyle.commuteMode}
          onChange={(e) =>
            onChange({
              ...profile,
              lifestyle: { ...profile.lifestyle, commuteMode: e.target.value as CommuteMode },
            })
          }
        >
          <option value="walking">Walking (Direct Ambient Exposure)</option>
          <option value="cycling">Cycling (Vigorous Outdoor Exertion)</option>
          <option value="transit">Mass Transit / Metro / Bus</option>
          <option value="car">Personal Automobile / Driving</option>
          <option value="wfh">Work From Home / Remote</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="user-heating" className="form-label">
          Primary Home Heating Source
        </label>
        <select
          id="user-heating"
          className="form-select"
          value={profile.lifestyle.homeHeatingType}
          onChange={(e) =>
            onChange({
              ...profile,
              lifestyle: {
                ...profile.lifestyle,
                homeHeatingType: e.target.value as HomeHeatingType,
              },
            })
          }
        >
          <option value="electric_heatpump">Electric Heat Pump (Cleanest)</option>
          <option value="district_steam">Central District Steam / Hydronic</option>
          <option value="natural_gas">Natural Gas Furnace</option>
          <option value="wood_biomass">Wood Stove / Biomass Fireplace (High Soot)</option>
        </select>
      </div>

      <fieldset className="form-group" style={{ border: 'none', padding: 0 }}>
        <legend className="form-label">Available Home Equipment</legend>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={profile.hasAirPurifier}
              onChange={(e) => onChange({ ...profile, hasAirPurifier: e.target.checked })}
            />
            <span>True HEPA Air Purifier Operational at Home</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={profile.hasN95Masks}
              onChange={(e) => onChange({ ...profile, hasN95Masks: e.target.checked })}
            />
            <span>Certified N95 / FFP2 / KF94 Respirators Available</span>
          </label>
        </div>
      </fieldset>
    </div>
  );
};
