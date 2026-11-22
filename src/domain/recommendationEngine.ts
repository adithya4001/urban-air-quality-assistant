import {
  AirQualitySnapshot,
  DataSource,
  DailyPlan,
  HealthCondition,
  Location,
  Recommendation,
  RiskLevel,
  UserProfile,
  WeatherSnapshot,
} from './types';

/**
 * Explicit medical safety boundary notice attached to high-risk guidance.
 */
export const MEDICAL_DISCLAIMER =
  'Notice: This application provides general environmental health and exposure reduction guidance based on public air quality indices. It does not provide medical diagnosis, clinical treatment plans, or emergency intervention. Always follow physician advice for respiratory or cardiovascular conditions.';

/**
 * Checks if user is in a vulnerable category based on health conditions or age.
 */
export function isUserVulnerable(profile: UserProfile): boolean {
  const sensitiveConditions: HealthCondition[] = [
    'asthma',
    'copd',
    'cardiovascular',
    'pregnancy',
  ];
  const hasSensitiveCondition = profile.healthConditions.some((c) =>
    sensitiveConditions.includes(c)
  );
  const isVulnerableAge =
    profile.ageGroup === 'infant_child' || profile.ageGroup === 'older_adult';

  return hasSensitiveCondition || isVulnerableAge;
}

/**
 * Computes composite effective risk level considering both ambient AQI and user vulnerabilities.
 */
export function calculateEffectiveRiskLevel(
  aqiSnapshot: AirQualitySnapshot,
  profile: UserProfile
): RiskLevel {
  const base = aqiSnapshot.riskLevel;
  const vulnerable = isUserVulnerable(profile);

  if (!vulnerable) {
    return base;
  }

  // Elevate risk by one notch for vulnerable populations in moderate to unhealthy ranges
  switch (base) {
    case 'moderate':
      return 'unhealthy_sensitive';
    case 'unhealthy_sensitive':
      return 'unhealthy';
    case 'unhealthy':
      return 'very_unhealthy';
    case 'very_unhealthy':
    case 'hazardous':
      return 'hazardous';
    default:
      return base;
  }
}

/**
 * Deterministic generator for outdoor activity recommendations.
 */
function evaluateOutdoorActivity(
  effectiveRisk: RiskLevel,
  aqiSnapshot: AirQualitySnapshot,
  weather: WeatherSnapshot,
  profile: UserProfile
): Recommendation {
  const isSensitive = isUserVulnerable(profile);

  if (effectiveRisk === 'hazardous' || effectiveRisk === 'very_unhealthy') {
    return {
      id: 'rec-outdoor-hazardous',
      category: 'outdoor_activity',
      priority: 'critical',
      title: 'Eliminate Non-Essential Outdoor Exposure',
      summary:
        'Poor air quality can affect everyone. Consider reducing outdoor exposure, especially during strenuous activity.',
      actionItems: [
        'Cancel outdoor workouts, runs, and walks; switch to indoor stretching or light aerobics.',
        isSensitive
          ? 'Keep any prescribed inhalers or other medication accessible and follow your existing care plan.'
          : 'Minimize outdoor transit time; avoid prolonged exertion outside.',
        weather.inversionRisk === 'severe'
          ? 'Stagnant weather may allow pollutants to accumulate; check current local updates.'
          : 'Check updated air-quality forecasts before rearranging outdoor activities.',
      ],
      healthImpact:
        'Reduces inhaled fine particles and may lower exposure-related irritation during a severe smog episode.',
      environmentalImpact:
        'Postponing outdoor recreational travel reduces peak-hour congestion and localized micro-emissions.',
      safetyNotice: isSensitive
        ? 'If breathing difficulty or chest pain occurs, follow the person’s care plan and seek urgent local medical help.'
        : undefined,
      sourceGuidance: 'WHO 2021 Air Quality Guidelines & EPA Air Quality Index',
    };
  }

  if (effectiveRisk === 'unhealthy' || effectiveRisk === 'unhealthy_sensitive') {
    return {
      id: 'rec-outdoor-elevated',
      category: 'outdoor_activity',
      priority: 'high',
      title: 'Curtail High-Intensity Outdoor Exertion',
      summary:
        'Elevated particle concentrations can irritate the respiratory system, especially during heavy breathing.',
      actionItems: [
        'Shift jogging or cycling indoors, or replace with low-intensity walking.',
        'Check the hourly air-quality forecast and choose a cleaner time when practical.',
        isSensitive
          ? 'Reduce exposure duration where practical and follow your clinician’s advice if symptoms occur.'
          : 'Take breaks indoors if the air or exertion causes discomfort.',
      ],
      healthImpact:
        'Lower-intensity and shorter outdoor activity generally reduces the amount of polluted air inhaled compared with vigorous exercise.',
      environmentalImpact:
        'Encourages clustered errands, reducing vehicular trips during high-smog periods.',
      sourceGuidance: 'EPA AirNow Activity Recommendations',
    };
  }

  return {
    id: 'rec-outdoor-acceptable',
    category: 'outdoor_activity',
    priority: 'low',
    title: 'Outdoor Activities Favorable',
    summary:
      'Air quality is within acceptable limits for most residents. Normal outdoor routines may proceed.',
    actionItems: [
      'Enjoy outdoor walks, commuting, and recreational sports.',
      'Maintain awareness if cold weather worsens or localized smoke plumes appear.',
    ],
    healthImpact:
      'Supports normal activity while keeping particulate exposure lower under the current scenario.',
    environmentalImpact:
      'Promotes active mobility (walking/biking) which lowers city carbon footprint.',
    sourceGuidance: 'EPA Air Quality Index Standards',
  };
}

/**
 * Deterministic generator for commute and travel choices.
 */
function evaluateCommute(
  effectiveRisk: RiskLevel,
  profile: UserProfile,
  weather: WeatherSnapshot
): Recommendation {
  const currentMode = profile.lifestyle.commuteMode;

  if (effectiveRisk === 'hazardous' || effectiveRisk === 'very_unhealthy') {
    return {
      id: 'rec-commute-hazardous',
      category: 'commute',
      priority: 'critical',
      title: 'Adopt Closed-Cabin Transit or Remote Routine',
      summary:
        'Active commuting (walking/cycling) along traffic corridors exposes commuters to direct tailpipe emissions compounded by winter smog.',
      actionItems: [
        currentMode === 'cycling' || currentMode === 'walking'
          ? 'Switch from walking/cycling to subway/bus, carpool, or work remotely if permitted.'
          : 'Keep vehicle ventilation on internal recirculation mode to block roadside particulate intake.',
        'If travelling on foot or public platforms, wear a snug-fitting N95/FFP2 respirator.',
      ],
      healthImpact:
        'Reduces time in roadside pollution hotspots where concentrations can be higher than the area average.',
      environmentalImpact:
        'Choosing mass transit over single-occupancy driving prevents adding combustion exhaust to an already trapped cold inversion layer.',
      sourceGuidance: 'Clean Air Asia & International Council on Clean Transportation (ICCT)',
    };
  }

  if (currentMode === 'car') {
    return {
      id: 'rec-commute-sustainable',
      category: 'commute',
      priority: 'medium',
      title: 'Shift from Driving to Sustainable Mass Transit',
      summary:
        'Single-occupancy vehicle idling and cold starts significantly exacerbate winter urban smog pockets.',
      actionItems: [
        'Use subway, metro, or electric buses for regular commuter legs.',
        'Combine short vehicle trips into a single warm-engine errand if driving is necessary.',
        'Avoid prolonged idling while warming up cars in morning frost.',
      ],
      healthImpact:
        'Reduces community NOx and carbon monoxide accumulation outside residential zones.',
      environmentalImpact:
        'Avoiding unnecessary vehicle kilometres can reduce fuel use and local combustion emissions.',
      sourceGuidance: 'European Environment Agency (EEA) Urban Transport Guidelines',
    };
  }

  return {
    id: 'rec-commute-standard',
    category: 'commute',
    priority: 'low',
    title: 'Maintain Eco-Friendly Commute',
    summary:
      'Your commute strategy supports both your personal wellbeing and lower community emissions.',
    actionItems: [
      'Continue utilizing active travel or electrified mass transit.',
      weather.temperatureC < 5
        ? 'Dress in windproof thermal layers to preserve respiratory tract temperature.'
        : 'Stay hydrated during morning travel.',
    ],
    healthImpact: 'Maintains daily physical activity benchmarks.',
    environmentalImpact: 'Active travel and shared transport can reduce direct tailpipe emissions for the trip.',
    sourceGuidance: 'WHO Healthy Mobility Protocol',
  };
}

/**
 * Deterministic generator for indoor air quality and home routines.
 */
function evaluateIndoorAir(
  effectiveRisk: RiskLevel,
  aqiSnapshot: AirQualitySnapshot,
  profile: UserProfile,
  weather: WeatherSnapshot
): Recommendation {
  const hasPurifier = profile.hasAirPurifier;
  const isBiomassHeating = profile.lifestyle.homeHeatingType === 'wood_biomass';

  const actionItems: string[] = [];

  if (hasPurifier) {
    actionItems.push(
      'Run HEPA air purifiers continuously on medium/high in bedrooms and living rooms.'
    );
  } else {
    actionItems.push(
      'Consider installing a certified True HEPA filtration unit or a low-cost DIY Corsi-Rosenthal box.'
    );
  }

  if (effectiveRisk === 'hazardous' || effectiveRisk === 'very_unhealthy') {
    actionItems.push(
      'Keep exterior windows and balcony doors tightly shut to prevent smog infiltration.'
    );
    actionItems.push(
      'Perform wet mopping or damp dusting rather than dry sweeping to prevent particulate resuspension.'
    );
    actionItems.push('Avoid indoor combustion: do not burn candles, incense, or fry foods without an exhaust hood.');
  } else if (effectiveRisk === 'low' || effectiveRisk === 'moderate') {
    actionItems.push(
      'Ventilate when outdoor air is cleaner, while keeping indoor temperatures safe.'
    );
  }

  if (isBiomassHeating) {
    actionItems.push(
      'Wood stoves and fireplaces produce heavy indoor soot; switch to electric heat pump or central radiator where possible.'
    );
  }

  return {
    id: 'rec-indoor-air',
    category: 'indoor_air',
    priority: effectiveRisk === 'hazardous' || effectiveRisk === 'very_unhealthy' ? 'high' : 'medium',
    title: 'Optimize Indoor Air Purification & Seal Integrity',
    summary:
      'Indoor air can quickly deteriorate during winter smog due to infiltration and internal combustion sources.',
    actionItems,
    healthImpact:
      'Appropriately sized particle filtration can reduce indoor particle exposure; results depend on the room and equipment.',
    environmentalImpact:
      'Limiting supplemental wood burning reduces soot and fine-particle emissions in the local airshed.',
    sourceGuidance: 'EPA Indoor Air Quality Building Guidelines & CDC Smog Protocols',
  };
}

/**
 * Deterministic generator for community emission reduction actions.
 */
function evaluateEmissionReduction(
  profile: UserProfile,
  weather: WeatherSnapshot
): Recommendation {
  const heating = profile.lifestyle.homeHeatingType;

  return {
    id: 'rec-emission-reduction',
    category: 'emission_reduction',
    priority: 'medium',
    title: 'Neighborhood Winter Smog Mitigation',
    summary:
      'During some winter conditions, stagnant air can allow pollution to accumulate.',
    actionItems: [
      heating === 'wood_biomass'
        ? 'Avoid using wood-burning fireplaces or fire pits during stagnant smog advisories.'
        : 'Save energy when practical while keeping indoor temperatures safe and comfortable.',
      'Report illicit waste burning or construction dust infractions to municipal environmental hotlines.',
      weather.inversionRisk !== 'none'
        ? 'Refrain from vehicle idling in driveways and school drop-off zones.'
        : 'Practice smooth, eco-friendly driving to minimize tire wear and brake dust particulates.',
    ],
    healthImpact:
      'Lowering primary combustion emissions reduces ground-level secondary aerosol formation.',
    environmentalImpact:
      'Cuts black carbon and sulfur dioxide emissions, improving regional airshed resilience.',
    sourceGuidance: 'UNEP Urban Air Pollution Mitigation Framework',
  };
}

/**
 * Deterministic generator for personal protective equipment (PPE).
 */
function evaluateProtectiveEquipment(
  effectiveRisk: RiskLevel,
  profile: UserProfile
): Recommendation {
  const needsRespirator =
    effectiveRisk === 'unhealthy' ||
    effectiveRisk === 'very_unhealthy' ||
    effectiveRisk === 'hazardous';

  if (!needsRespirator) {
    return {
      id: 'rec-ppe-not-needed',
      category: 'protective_equipment',
      priority: 'low',
      title: 'Protective Masks Not Required',
      summary: 'Air quality levels do not warrant particulate-filtering respirators at this time.',
      actionItems: ['No specialized respiratory protection required for ambient air.'],
      healthImpact: 'Allows unrestricted natural breathing.',
      environmentalImpact: 'Conserves disposable PPE supplies, reducing solid waste.',
      sourceGuidance: 'WHO Personal Protection Guidance',
    };
  }

  return {
    id: 'rec-ppe-respirator',
    category: 'protective_equipment',
    priority: effectiveRisk === 'hazardous' ? 'critical' : 'high',
    title: 'Wear Certified Particulate Respirator (N95 / FFP2 / KF94)',
    summary:
      'A well-fitting certified respirator can reduce particle exposure; loose-fitting masks generally provide less protection.',
    actionItems: [
      'Don a certified N95, FFP2, or KF94 respirator before stepping outdoors.',
      'Ensure a secure, gap-free seal around the bridge of the nose and chin.',
      profile.hasN95Masks
        ? 'Replace disposable respirators when damaged, dirty, damp, or difficult to breathe through, following manufacturer guidance.'
        : 'Procure NIOSH-approved or CE-certified respirators from authorized pharmacies.',
      'Cloth masks, scarves, and loose surgical masks generally provide less protection from fine particles.',
    ],
    healthImpact:
      'Certified respirators are designed to filter fine particles when correctly selected, fitted, and worn.',
    environmentalImpact:
      'Reusable elastomeric or correctly maintained respirators reduce single-use plastic waste.',
    safetyNotice:
      'Individuals with severe chronic respiratory or cardiac conditions should confirm with their physician before wearing tightly-sealed respirators, as they may increase breathing resistance.',
    sourceGuidance: 'CDC / NIOSH Respiratory Protection Protocols',
  };
}

/**
 * Main deterministic recommendation engine entry point.
 * Aggregates all environmental factors and user profile settings to construct a comprehensive DailyPlan.
 */
export function generateDailyPlan(
  location: Location,
  profile: UserProfile,
  aqiSnapshot: AirQualitySnapshot,
  weather: WeatherSnapshot,
  fallbackActive = false,
  fallbackReason?: string,
  dataSource: DataSource = fallbackActive ? 'fallback' : 'scenario',
  dataAttribution?: string,
): DailyPlan {
  const effectiveRisk = calculateEffectiveRiskLevel(aqiSnapshot, profile);

  const recommendations: Recommendation[] = [
    evaluateOutdoorActivity(effectiveRisk, aqiSnapshot, weather, profile),
    evaluateCommute(effectiveRisk, profile, weather),
    evaluateIndoorAir(effectiveRisk, aqiSnapshot, profile, weather),
    evaluateProtectiveEquipment(effectiveRisk, profile),
    evaluateEmissionReduction(profile, weather),
  ];

  return {
    date: new Date().toISOString().split('T')[0],
    location,
    userProfile: profile,
    overallRisk: effectiveRisk,
    weather,
    airQuality: aqiSnapshot,
    recommendations,
    fallbackActive,
    fallbackReason,
    dataSource,
    dataAttribution,
    generatedAt: new Date().toISOString(),
  };
}
