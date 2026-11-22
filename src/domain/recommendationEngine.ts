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
  weather: WeatherSnapshot,
  profile: UserProfile
): Recommendation {
  const isSensitive = isUserVulnerable(profile);
  const activityLevel = profile.lifestyle.outdoorActivityLevel;

  if (effectiveRisk === 'hazardous' || effectiveRisk === 'very_unhealthy') {
    return {
      id: 'rec-outdoor-hazardous',
      category: 'outdoor_activity',
      priority: 'critical',
      title: 'Eliminate Non-Essential Outdoor Exposure',
      summary:
        'Poor air quality can affect everyone. Consider reducing outdoor exposure, especially during strenuous activity.',
      actionItems: [
        activityLevel === 'high'
          ? 'Move runs, cycling workouts, and other strenuous exercise indoors until air improves.'
          : activityLevel === 'moderate'
            ? 'Replace planned outdoor walks or exercise with a shorter, gentle indoor activity.'
            : 'Keep essential outdoor time brief; skip optional outdoor recreation until air improves.',
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
        activityLevel === 'high'
          ? 'Move vigorous workouts indoors or shorten them and reduce intensity.'
          : activityLevel === 'moderate'
            ? 'Choose an easier, shorter walk and avoid vigorous outdoor exercise.'
            : 'Before a longer outdoor activity, check the hourly forecast and choose a cleaner period.',
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
    title: weather.inversionRisk === 'none'
      ? 'Outdoor Activities Favorable'
      : 'Outdoor Activities Favorable · Recheck Conditions',
    summary: weather.inversionRisk === 'none'
      ? 'Air quality is within acceptable limits for most residents. Normal outdoor routines may proceed.'
      : 'The current AQI is within acceptable limits for most residents, but stagnant winter conditions can change. Check the latest local air update before strenuous activity.',
    actionItems: [
      weather.inversionRisk === 'none'
        ? 'Enjoy outdoor walks, commuting, and recreational sports.'
        : 'Continue comfortable outdoor routines and recheck the hourly air-quality forecast before strenuous activity.',
      'Check again if conditions change or you notice a nearby smoke or dust source.',
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

  if (currentMode === 'wfh') {
    return {
      id: 'rec-commute-remote',
      category: 'commute',
      priority: effectiveRisk === 'hazardous' || effectiveRisk === 'very_unhealthy' ? 'high' : 'low',
      title: 'Keep Today’s Routine Remote',
      summary: 'Your work-from-home routine already avoids a commute; keep unnecessary trips flexible around local air conditions.',
      actionItems: [
        effectiveRisk === 'hazardous' || effectiveRisk === 'very_unhealthy'
          ? 'If an essential trip is needed, shorten time outdoors and check the latest local air update first.'
          : 'Combine errands into one trip when practical.',
        'Keep indoor smoke sources low and ventilate when outdoor air is cleaner.',
      ],
      healthImpact: 'Avoiding a required commute can reduce time spent near traffic emissions.',
      environmentalImpact: 'Skipping an unnecessary vehicle trip avoids its local exhaust emissions.',
      sourceGuidance: 'Open-Meteo modelled air-quality context and EPA activity guidance',
    };
  }

  if ((effectiveRisk === 'unhealthy' || effectiveRisk === 'unhealthy_sensitive')
    && (currentMode === 'walking' || currentMode === 'cycling')) {
    return {
      id: 'rec-commute-active-elevated',
      category: 'commute',
      priority: 'high',
      title: 'Reduce Exposure on an Active Commute',
      summary: 'Keep essential travel practical while limiting strenuous effort and time beside busy roads.',
      actionItems: [
        'Consider public transit or a shared ride for the longest part of the trip, if available.',
        'Choose a quieter route and avoid hard cycling or brisk walking when air quality is elevated.',
        'Check the hourly air-quality forecast before choosing an outdoor time window.',
      ],
      healthImpact: 'Reducing exertion and roadside time can lower the amount of polluted air inhaled.',
      environmentalImpact: 'Using shared transport for part of a trip can reduce single-occupant vehicle emissions.',
      sourceGuidance: 'EPA AirNow activity recommendations and local modelled air-quality forecast',
    };
  }

  if ((effectiveRisk === 'unhealthy' || effectiveRisk === 'unhealthy_sensitive')
    && (currentMode === 'car' || currentMode === 'transit')) {
    const isCar = currentMode === 'car';
    return {
      id: isCar ? 'rec-commute-car-elevated' : 'rec-commute-transit-elevated',
      category: 'commute',
      priority: 'high',
      title: isCar ? 'Limit Traffic Exposure on Your Drive' : 'Reduce Roadside Waiting on Transit',
      summary: isCar
        ? 'Keep necessary travel practical and limit time in slow or congested traffic while air quality is elevated.'
        : 'Keep the shared-transit commute, while reducing time waiting beside busy roads when practical.',
      actionItems: isCar
        ? [
            'Avoid unnecessary trips and prolonged idling; combine essential stops when practical.',
            'Use cabin recirculation briefly in heavy traffic if safe, then allow fresh air periodically to avoid stale cabin air.',
            'Check the hourly air-quality forecast before choosing a longer travel window.',
          ]
        : [
            'Wait indoors or farther from traffic where practical, and board promptly rather than waiting beside a busy road.',
            'Choose a less traffic-exposed walking route to and from stops when practical.',
            'Check the hourly air-quality forecast before a longer outdoor wait or walk.',
          ],
      healthImpact: 'Reducing time close to traffic and limiting unnecessary exposure can lower the amount of polluted air inhaled.',
      environmentalImpact: isCar
        ? 'Combining essential stops and avoiding idling can reduce avoidable fuel use and local exhaust.'
        : 'Shared transit carries multiple passengers per trip and can reduce per-person travel emissions.',
      sourceGuidance: 'EPA AirNow activity guidance and local modelled air-quality forecast',
    };
  }

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
          : 'In heavy traffic, use cabin recirculation briefly if safe; periodically allow fresh air to avoid stale cabin air.',
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
      currentMode === 'transit'
        ? 'Continue using shared transit where it suits your route; limit time waiting beside busy roads.'
        : 'Use a lower-traffic route and keep outdoor effort comfortable for the current air conditions.',
      weather.temperatureC < 5
        ? 'Dress warmly for the cold and wind; clothing does not filter polluted air.'
        : 'Check the latest air update before a longer outdoor trip.',
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
  profile: UserProfile
): Recommendation {
  const hasPurifier = profile.hasAirPurifier;
  const isBiomassHeating = profile.lifestyle.homeHeatingType === 'wood_biomass';

  const actionItems: string[] = [];

  if (hasPurifier) {
    actionItems.push('Use a portable HEPA air cleaner in occupied rooms and follow its sizing and filter instructions.');
  } else {
    actionItems.push('If feasible, consider a correctly sized portable HEPA air cleaner or a safely built DIY Corsi-Rosenthal box.');
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
    title: 'Keep Indoor Air as Clean as Practical',
    summary:
      'Indoor air can quickly deteriorate during winter smog due to infiltration and internal combustion sources.',
    actionItems,
    healthImpact:
      'Appropriately sized particle filtration can reduce indoor particle exposure; results depend on the room and equipment.',
    environmentalImpact:
      'Limiting supplemental wood burning reduces soot and fine-particle emissions in the local airshed.',
    sourceGuidance: 'US EPA indoor air quality and air-cleaner guidance',
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
  aqiSnapshot: AirQualitySnapshot,
  profile: UserProfile
): Recommendation {
  const elevatedRisk = ['unhealthy', 'very_unhealthy', 'hazardous'].includes(effectiveRisk);
  const particulatePollution = aqiSnapshot.primaryPollutant === 'PM2.5'
    || aqiSnapshot.primaryPollutant === 'PM10';

  if (!elevatedRisk || !particulatePollution) {
    const gasLedAqi = elevatedRisk && aqiSnapshot.primaryPollutant;
    return {
      id: 'rec-ppe-not-needed',
      category: 'protective_equipment',
      priority: 'low',
      title: 'No AQI-Based Particulate Respirator Advice',
      summary: gasLedAqi
        ? `${aqiSnapshot.primaryPollutant} is the reported primary pollutant. Particulate respirators filter particles, not gases; follow local public-health advice and reduce exposure using the AQI guidance.`
        : 'The current AQI alone does not indicate a need for additional particulate respiratory protection.',
      actionItems: [gasLedAqi
        ? 'Do not rely on an N95/FFP2 to protect against gases; follow the local AQI advice and reduce exposure.'
        : 'No additional particulate-respirator step is indicated by the current AQI alone.'],
      healthImpact: 'Keeps protective-equipment advice matched to the reported pollutant and current AQI.',
      environmentalImpact: 'Conserves disposable PPE supplies, reducing solid waste.',
      sourceGuidance: 'EPA AirNow AQI guidance; CDC/NIOSH particulate-respirator guidance',
    };
  }

  return {
    id: 'rec-ppe-respirator',
    category: 'protective_equipment',
    priority: effectiveRisk === 'hazardous' ? 'high' : 'medium',
    title: 'Consider a Well-Fitting Particulate Respirator',
    summary:
      'When particle pollution is elevated and outdoor exposure cannot be avoided, a well-fitting certified N95/FFP2 may reduce particle exposure. It does not filter gases and does not replace reducing time outdoors.',
    actionItems: [
      'Follow local health advice; if you choose to wear one, use a certified particulate respirator that fits closely over the nose and under the chin.',
      'Check the fit each time and follow the manufacturer’s use and replacement instructions.',
      profile.hasN95Masks
        ? 'Replace it when damaged, dirty, damp, or difficult to breathe through, following manufacturer guidance.'
        : 'If you need one, buy from a reputable supplier and check the certification marking and fit.',
    ],
    healthImpact:
      'A correctly selected and fitted particulate respirator can reduce particle exposure; performance varies with fit and use.',
    environmentalImpact:
      'Reusable elastomeric or correctly maintained respirators reduce single-use plastic waste.',
    safetyNotice: isUserVulnerable(profile)
      ? 'If you have a heart or lung condition, follow your clinician’s advice before using a tight-fitting respirator. Seek cleaner air and follow local AQI guidance first.'
      : undefined,
    sourceGuidance: 'EPA AirNow AQI guidance; CDC/NIOSH particulate-respirator guidance',
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
    evaluateOutdoorActivity(effectiveRisk, weather, profile),
    evaluateCommute(effectiveRisk, profile, weather),
    evaluateIndoorAir(effectiveRisk, profile),
    evaluateProtectiveEquipment(effectiveRisk, aqiSnapshot, profile),
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
