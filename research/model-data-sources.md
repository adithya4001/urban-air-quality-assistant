# VaayuDootha model and evidence sources

This is a source inventory and evaluation starting point, not a trained model or a claim of clinical validation. Consult each provider's current licence and terms before downloading, redistributing or training on its content. Do not include real chat histories, names, precise locations or health records in a training dataset without appropriate consent and review.

## Live and forecast data

- [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api): modelled current and hourly air-quality forecasts. Attribute Open-Meteo and CAMS as required; distinguish forecasts from measurements, record the location, timestamp and AQI scale, and disclose missing or stale data.
- [Open-Meteo Weather API](https://open-meteo.com/en/docs): current and forecast weather. [Free API terms](https://open-meteo.com/en/terms) restrict the free service to non-commercial use and impose limits.
- [India CPCB National AQI](https://www.cpcb.nic.in/displaypdf.php?id=bmF0aW9uYWwtYWlyLXF1YWxpdHktaW5kZXgvQWJvdXRfQVFJLnBkZg): national index and categories. Do not label US AQI data as Indian AQI or apply one scale's bands to another.

## Health and practical guidance

- [WHO global air quality guidelines](https://www.who.int/publications/i/item/9789240034228): pollutant concentrations and evidence, not a personalized diagnosis. WHO lists licence restrictions on its publication page; check them before reuse.
- [AirNow AQI basics](https://www.airnow.gov/aqi/aqi-basics/): US AQI categories and public-health communication; identify the scale explicitly.
- [US EPA indoor air filtration](https://www.epa.gov/wildfires/indoor-air-filtration): filtration options for indoor particle pollution. Guidance is smoke-specific; do not generalize without context or suggest that particle filters remove all gases.

## Evaluation and training

`evaluation-cases.json` contains hand-authored prompts and review criteria for a held-out evaluation; it is not a scored benchmark or a training dataset. Reviewers must compare answers with the supplied conditions and sources, manually assess safety and language quality, and record errors and latency. Do not train on this evaluation set. A genuine fine-tuning run additionally requires a licensed, reviewed training corpus, a train/validation/test split, model weights and licence, GPU capacity, a training run with recorded configuration, and before/after results on held-out cases.

Text, image, and video generation require different model capabilities. A local model on a developer laptop does not automatically provide an available public inference service. Public serving requires separate infrastructure, capacity limits and a budget. Prompted topic boundaries and health safeguards are not guarantees; they require ongoing testing.
