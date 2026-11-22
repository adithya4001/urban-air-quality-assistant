"""Small offline intent-classifier experiment; not a conversational or medical model.

Runs with scikit-learn. Examples are synthetic, not personal user data. The held-out
cases are disjoint from training, but are far too few for deployment conclusions.
"""
import json
from pathlib import Path

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.pipeline import make_pipeline

TRAIN = {
    "outdoor": ["can I jog outside", "morning run in pollution", "is outdoor exercise safe", "cycle in the haze", "can I go for a walk", "jogging ki vellacha", "bahar daud sakte hain", "plan my outdoor workout", "when can I exercise outside"],
    "indoor": ["improve air inside my room", "should I open the windows", "do I need an air purifier", "reduce smoke indoors", "ventilate my house", "intlo gaali ela undi", "ghar ke andar hawa", "cleaner air in my bedroom", "dust and fumes in my home"],
    "commute": ["reduce pollution on my commute", "travel to office by bus", "cleaner route to work", "traffic exposure on way to school", "should I drive or take metro", "office ki ela vellali", "safar mein pradushan", "cycling to work near traffic", "commuting on crowded roads"],
    "family": ["is my child safe outside", "protect my elderly parents", "school run with my daughter", "air pollution and pregnancy", "my baby has asthma", "pillalaki ela jagratha", "bacchon ko kaise bachayen", "care for my family in smog", "elderly person breathing polluted air"],
    "weather": ["what is the weather today", "tomorrow temperature and rain", "will it be windy", "winter forecast for my city", "how cold is it outside", "repu weather ela untundi", "kal mausam kaisa hai", "humidity and wind forecast", "what is the temperature"],
    "air_quality": ["what is my AQI", "explain PM2.5", "how polluted is the air", "what does air quality index mean", "why is smog so bad", "gaali kalushyam entha undi", "hawa ki quality kaisi hai", "meaning of particulate matter", "compare AQI levels"],
}

HELD_OUT = [
    ("outdoor", "Can I go jogging tomorrow?"), ("outdoor", "repu jogging cheyocha"),
    ("indoor", "How do I keep my home air clean?"), ("indoor", "Should I shut my window in smog?"),
    ("commute", "How do I get to work with less exposure?"), ("commute", "Bus or car for my journey to office?"),
    ("family", "Can my daughter play outdoors?"), ("family", "How do I protect my older father?"),
    ("weather", "Will it rain tomorrow?"), ("weather", "Is tomorrow morning cold?"),
    ("air_quality", "What does AQI mean?"), ("air_quality", "Why is the air polluted?"),
]


def main():
    x, y = [], []
    for label, examples in TRAIN.items():
        x.extend(examples)
        y.extend([label] * len(examples))
    model = make_pipeline(
        TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 5), lowercase=True),
        LogisticRegression(max_iter=1000, random_state=42),
    )
    model.fit(x, y)
    expected = [label for label, _ in HELD_OUT]
    predictions = model.predict([prompt for _, prompt in HELD_OUT])
    report = {
        "kind": "small synthetic intent-classification experiment, not a generative model",
        "training_examples": len(x),
        "held_out_examples": len(HELD_OUT),
        "accuracy": accuracy_score(expected, predictions),
        "class_report": classification_report(expected, predictions, output_dict=True, zero_division=0),
        "cases": [{"prompt": prompt, "expected": label, "predicted": str(pred)} for (label, prompt), pred in zip(HELD_OUT, predictions)],
        "limitations": "Synthetic, tiny, nonrepresentative English/Hindi/Telugu romanized examples. No clinical or multilingual validation. Do not use to gate questions or make health decisions.",
    }
    path = Path(__file__).with_name("intent-baseline-report.json")
    path.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Held-out intent accuracy: {report['accuracy']:.1%} ({len(HELD_OUT)} synthetic prompts); report: {path}")


if __name__ == "__main__":
    main()
