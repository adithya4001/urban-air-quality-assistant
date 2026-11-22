# Local open-model comparison

Date: 2026-11-22. This is an exploratory experiment using synthetic prompts, not a clinical assessment or a representative benchmark. The outputs are not suitable for users.

## Method

- Locally tested pretrained, quantized `qwen3:0.6b` and `qwen3:4b` through Ollama on a roughly 16 GB RAM Windows machine. Both ran on CPU. Neither model was fine-tuned by this project.
- Used the 12 held-out synthetic prompts in `evaluation-cases.json` with the short source summaries in `evidence-cards.json`, the same system prompt, temperature 0, a 2,048-token context, and a 120-token output limit. These evidence cards are compact paraphrases, not a comprehensive, clinically reviewed knowledge base. The time-sensitive scenario deliberately supplies no location or forecast.
- Raw outputs are in `ollama-qwen3-0-6b-results.json` and `ollama-qwen3-4b-results.json`. They are unreviewed model text and may contain inaccurate or unsafe advice.

## Findings

- The 0.6B model failed several important cases: it did not understand the Romanized Telugu question, produced unusable Hindi, recommended opening windows during an outdoor smoke scenario, and did not respect the user's fixed work schedule. Do not deploy it for this task.
- The 4B run generated preliminary self-analysis rather than a complete user-facing response for the first 11 cases before reaching the token limit. The injection case timed out; the computer's suspended/inactive time means its elapsed time is not a reliable inference-speed measurement. Because answers were incomplete, the run does not establish whether 4B can pass the underlying safety criteria.
- A focused retest with `think: false` and `/no_think` still returned incomplete self-analysis. Subsequent investigation identified the Ollama `qwen3:4b` alias as the 4B Thinking 2507 variant, not the Instruct variant. The template experiment cannot change that model's training. The corresponding `qwen3:4b-instruct` is a separate model and must be evaluated independently. No prediction of 4B Instruct safety, multilingual quality, or response quality can be drawn from the Thinking run.
- Before the machine became inactive, the 4B cases took roughly 32–93 seconds apiece including generation and initial loading on this CPU. This setup is not currently suitable for responsive multi-user chat.
- The small synthetic intent classifier previously trained by `train_intent_baseline.py` is a separate experiment, not a trained conversational model. Its 12-case score does not establish generalization.

## Decision

Neither model is approved for use in the public assistant. No change was made to the deployed app. A next experiment should resolve the model/template configuration and record complete responses, use more representative reviewed multilingual and adversarial cases, and evaluate against actual labelled current/forecast data. It also needs a genuinely free, available public serving mechanism if the goal is to let external users access a self-hosted model. Model quality, server capacity, privacy and safety all require independent evaluation.
