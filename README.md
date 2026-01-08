# 🏀 NBABot 🤖

**NBA Analytics & Learning Tool for Discord**

⚠️ **Disclaimer**
NBABot is an **educational analytics tool only**.
It does **not** provide betting advice, predictions, or guarantees.

---

## 🚀 What NBABot Does

NBABot generates **sample-based NBA parlays** and explains them transparently.

The bot focuses on:

* **sample size awareness**
* **games hit vs games played** (not percentages)
* **structured risk modes**
* **clear reasoning**
* **AI explanations without decision power**

---

## 🎯 Supported Pick Types

NBABot evaluates **all picks using the same logic**, regardless of type.

### Pick Types

* **Player Props**

  * Points, rebounds, assists, 3PTs, etc.
* **Team Picks**

  * Team totals (Over / Under)
  * Team spreads
* **Game Picks**

  * Full game spreads
  * Game totals (O/U)

Each pick includes:

* Sample window (5 / 10 / 15 games)
* Hit rate shown as games (e.g. `8/10`)
* Mode-based classification
* Confidence score
* Optional AI insights

---

## 🎮 Commands

### `/parlay` — Generate a Parlay

```text
/parlay legs:<number> mode:<safe|normal|moonshot> window:<5|10|15>
```

### Parameters

| Parameter | Description                   | Required           |
| --------- | ----------------------------- | ------------------ |
| `legs`    | Number of picks in the parlay | ✅                  |
| `mode`    | Risk mode                     | ✅                  |
| `window`  | Sample size in games          | ❌ (defaults to 10) |

---

## ✅ Command Examples

### Safe, Large Sample

```text
/parlay legs:3 mode:safe window:10
```

### Normal, Short-Term Form

```text
/parlay legs:4 mode:normal window:5
```

### Moonshot, High Upside

```text
/parlay legs:5 mode:moonshot window:5
```

### Default Behavior

```text
/parlay legs:4 mode:normal
```

➡ Uses last **10 games**

---

## 📊 Sample Windows Explained

| Window   | Meaning                      |
| -------- | ---------------------------- |
| 5 games  | Recent form, high volatility |
| 10 games | Balanced                     |
| 15 games | Long-term stability          |

NBABot **always displays hit rate as games**:

```
Hit Rate: 8 / 10 games
```

Percentages are intentionally avoided.

---

## ❌ GLOBAL BAD PICKS (BLOCKED IN ALL MODES)

These hit rates are considered **statistically weak** and are **never allowed**:

| Window   | Blocked  |
| -------- | -------- |
| 5 games  | 1–2 / 5  |
| 10 games | 1–5 / 10 |
| 15 games | 1–6 / 15 |

### ❌ Example (Blocked Everywhere)

```
Pick: Player O 28.5 Points
Hit Rate: 2 / 5

Result: ❌ REJECTED
Reason: Global bad pick
```

---

## 🟢 SAFE MODE — High Consistency Only

Safe mode includes **only the most consistent picks**.

### SAFE Thresholds

| Window   | SAFE       |
| -------- | ---------- |
| 5 games  | 4–5 / 5    |
| 10 games | 8–10 / 10  |
| 15 games | 13–15 / 15 |

Safe mode:

* avoids volatility
* ignores odds
* prioritizes consistency

---

### 🟢 SAFE MODE — EXAMPLES

#### Example 1 (SAFE – 10 games)

```
Pick: Player O 28.5 Points
Hit Rate: 9 / 10

Result: 🟢 SAFE
Reason: Meets 8–10 / 10 threshold
```

#### Example 2 (NOT SAFE – Drops to Normal)

```
Pick: Player O 30.5 Points
Hit Rate: 7 / 10

Result: 🟠 NORMAL
Reason: Below safe threshold
```

---

## 🟠 NORMAL MODE — Balanced Risk

Normal mode allows **moderate volatility** while still enforcing data quality.

### NORMAL Ranges

| Window   | NORMAL    |
| -------- | --------- |
| 5 games  | 3–5 / 5   |
| 10 games | 6–10 / 10 |
| 15 games | 8–15 / 15 |

---

### 🟠 NORMAL MODE — EXAMPLES

#### Example 1 (NORMAL – 5 games)

```
Pick: Player O 6.5 Rebounds
Hit Rate: 3 / 5

Result: 🟠 NORMAL
Reason: Volatile but acceptable
```

#### Example 2 (NORMAL – 15 games)

```
Pick: Team O 114.5 Points
Hit Rate: 10 / 15

Result: 🟠 NORMAL
Reason: Long-term trend with variance
```

---

## 🚀 MOONSHOT MODE — High Upside, Controlled Risk

Moonshot mode targets **high-odds outcomes** where:

* the player/team has shown **recent capability**
* the sample is **volatile**
* the odds **justify the risk**

Moonshot risk = **odds + variance**, not bad data.

---

### 🚀 Moonshot Eligibility Rules

A pick is Moonshot-eligible if **ALL** are true:

1️⃣ **Not a Global Bad Pick**

2️⃣ **Shows Recent Capability**

| Window   | Minimum  |
| -------- | -------- |
| 5 games  | ≥ 3 / 5  |
| 10 games | ≥ 6 / 10 |
| 15 games | ≥ 8 / 15 |

3️⃣ **Odds Requirement**

```
Odds ≥ +100
```

---

### 🚀 MOONSHOT MODE — EXAMPLES

#### ✅ GOOD Moonshot (Player Prop)

```
Pick: Player O 3.5 Three-Pointers
Hit Rate: 3 / 5
Odds: +125

Result: 🚀 MOONSHOT
Reason:
• Recent proof of ability
• Volatile sample
• Odds justify risk
```

#### ❌ BAD Moonshot (Rejected)

```
Pick: Player O 3.5 Three-Pointers
Hit Rate: 2 / 5
Odds: +180

Result: ❌ REJECTED
Reason: Global bad pick
```

#### ✅ GOOD Moonshot (Team Spread)

```
Pick: Team -7.5
Hit Rate: 6 / 10
Odds: +110

Result: 🚀 MOONSHOT
Reason:
• Recent covers
• Not consistent enough for safe
• Odds compensate variance
```

---

## 🧮 Confidence Scores (Descriptive Only)

Confidence is derived from hit rate and sample size:

```
confidence = (hits / games) * 100
```

Adjustments:

* Larger samples slightly increase confidence
* Smaller samples slightly reduce confidence
* Confidence is clamped to avoid false precision

Confidence **does not predict outcomes**.

---

## 🧠 AI Insights (Explanation Only)

AI is used **only to explain picks**, never to select them.

### AI Explains:

* Recent hit trends
* Sample stability vs volatility
* Lineup / injury context
* On/off impact with teammates
* Season vs past years
* Regression risk

### AI NEVER:

* Picks players
* Changes confidence
* Predicts outcomes
* Guarantees success

---

## 🔘 Discord UX

After `/parlay`, NBABot displays buttons:

* 🧠 **Insights** — explains *why these picks could hit today*
* 📊 **History** — shows past slips and hit rates

---

## 📚 Design Philosophy

* Sample size > hype
* Games > percentages
* Odds risk ≠ data quality
* AI explains, logic decides
* Transparency over certainty

---
# NBABot 🏀🤖

NBA Analytics & Learning Tool for Discord
Built for transparency, education, and long-term learning — not hype.

⚠️ Disclaimer: This is an educational analytics tool only. Nothing generated by this bot should be considered betting advice.

## 🚀 Quick Start

```bash
npm install
npm run cli
```

Try:

```
/parlay --legs 3 --mode safe
/parlay --legs 5 --mode moonshot
/pickoftheday
/help
```

## ✨ Core Features

- 🎯 `/parlay` — Multi-leg analytical parlays

- 🏆 `/pickoftheday` — Strongest single pick

- 🔍 `/why` — Explain why a pick was chosen

- 📊 `/insights` — Raw historical context

- 📝 `/grade` — Mark slips as win or loss

- 📜 `/history` — View past results

- 📈 Mode & leg-level performance tracking

- 🎨 Color-coded confidence & risk

- 🤖 AI-assisted explanations with fallback

- 🧠 Education-first design philosophy

## 🎮 Commands Overview

/parlay --legs 3 --mode normal
/pickoftheday
/why 1
/insights 1
/grade slip:latest result:win
/history

## 🖥️ Discord Output Design

NBABot responses are delivered as clean Discord embeds, optimized for readability and learning.

**🎯 Parlay Embed Example**

**📊 NBABot — Normal Parlay (3 Legs)**

1️⃣ Stephen Curry — Over 28.5 POINTS

Confidence: 63% 🟢
Hit Rate: 6 / 10 games

2️⃣ Giannis Antetokounmpo — Over 11.5 REBOUNDS

Confidence: 58% 🟠
Hit Rate: 5 / 9 games

3️⃣ Jayson Tatum — Over 2.5 THREES

Confidence: 55% 🟠
Hit Rate: 4 / 7 games

Mode: NORMAL
Overall Risk: Moderate


Color indicators:

🟢 Strong historical support

🟠 Moderate volatility

🔴 High volatility

🚀 Moonshot risk

**🏆 Pick of the Day Embed**
🏆 Pick of the Day

Stephen Curry — Over 28.5 POINTS

Confidence: 63% 🟢
Risk Level: Moderate
Hit Rate: 6 / 10 games

Key Insights:
• Exceeded this line in 6 of his last 10 games
• Shot volume increases in close matchups
• Opponent allows above-average perimeter scoring

**🔍 /why Command Embed**
🔍 Why This Pick?

Stephen Curry — Over 28.5 POINTS

• Most high-output games occur in 3–5 game stretches
• Performs better when secondary scorer usage is reduced
• Shot attempts increase in competitive matchups
• Multi-season trend shows gradual scoring increase
• Recent performance driven by stable usage, not a single spike

**📊 /insights (Raw Context)**
📊 Historical Insights

• Hit in 6 / 10 recent games
• Usage increases when Player X is inactive
• Performance dips first game after rest
• Production trend improving year-over-year
• Small volatility detected after peak games


No opinions. No predictions. Just context.

## 🤖 AI-Assisted Explanations

Model: GPT-4.1-mini

Purpose: Explanation & insight generation only

AI Guardrails

The AI:

✅ Explains historical patterns

✅ Identifies volatility & stability

✅ Analyzes on/off-court impact

✅ Reviews multi-season trends

The AI does NOT:

❌ Pick players

❌ Predict outcomes

❌ Generate odds

❌ Modify confidence or risk

If AI is unavailable, NBABot automatically falls back to a rule-based explanation system.

## 🧠 Advanced Player Context Analysis

The AI is instructed to analyze:

**Performance Windows**

Short-term bursts (3–5 games)

Unsustained hot streaks

Post-peak regression patterns

**On / Off Court Impact**

Usage changes when teammates are missing

Efficiency drops with ball-dominant players

Role shifts when starters return

**Season & Career Trends**

Year-over-year improvement or decline

Expanding roles and variance

Stability vs volatility across seasons

**Contextual Performance**

Regular season vs situational usage

Competitive vs low-pressure games

The AI explains what has happened, not what will happen.

## 📊 Confidence Score System

Confidence reflects signal agreement, not certainty.

**Formula**
Baseline (50)
+ Recent Hit Rates
+ Context & Usage
+ Matchup Stability
- Line Inflation
- Volatility Risk

**Example**
Baseline:                  50
Recent Hit Rate (4 / 5):   +8
Last 10 Hit Rate (6 / 10): +6
Usage Increase:            +6
Line Inflation Risk:       −8
------------------------------
Final Confidence:          62%


Confidence is not a probability.

## 📈 Hit Rate Display

Hit rates are always shown as:

Hit Rate: 6 / 10 games


Why:

Shows sample size

Avoids misleading precision

Highlights volatility

## 📝 Grading & History Tracking
Grade a Slip
/grade slip:latest result:win

View History
/history


**Example:**

📜 History (Last 5)

NORMAL | 3 Legs | WIN
Hit Rate: 2 / 3

MOONSHOT | 5 Legs | LOSS
Hit Rate: 3 / 5

Overall (Last 10 Picks):
Hits: 6 / 10

## 📊 Mode Performance Tracking

Performance is tracked by mode and by leg.

Example
SAFE Parlays:     6 / 8
NORMAL Parlays:   4 / 10
MOONSHOT Parlays: 2 / 12

SAFE Legs:     18 / 20
NORMAL Legs:   24 / 36
MOONSHOT Legs: 31 / 60


Moonshot parlays are expected to hit less frequently due to higher variance.

## 🎯 Design Philosophy

NBABot exists to:

explain volatility

discourage hype

promote learning

show real performance

build long-term trust

Past performance does not predict future outcomes.

## 📄 License

MIT

## 📘 SAMPLE RULES (Developer Reference)

+2 per hit in last 5 games

+1 per hit in last 10 games

-6 first game back from injury

-4 back-to-back games

-5 to −10 line inflation

Larger samples weighted more heavily

✅ Final Result

With these updates, NBABot now delivers:

professional Discord embeds

explainable AI insights

transparent performance tracking

real analytics credibility

