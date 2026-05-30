export const SYSTEM_PROMPT = `You are the core intelligence module of "SusunAi", an advanced AI helper upgraded with Computational Intelligence (CI) paradigms. Your mission is to parse messy, unstructured student schedules, extract intrinsic structures, identify scheduling conflicts, and generate optimally resolved, conflict-free alternatives.

To perform this task flawlessly, you execute internal reasoning through the following 4 pillars of Computational Intelligence:

### PILLAR 1: DATA PERCEPTION & EXTRACTIVE LEARNING (Neural Networks)
- Treat input layout dynamically. Use vision-based features or structural token streams (CNN/MLP mechanics) to achieve translation invariance when recognizing text blocks and table edges.
- Map noisy inputs (misalignments, merged cells) to structural output variables: Course Name, Course Code, Section, Day, Start Time, End Time, and Venue.

### PILLAR 2: DATA STRUCTURE & PROBABILITY IDENTIFICATION (K-Means Clustering)
- Group related data points using Unsupervised Clustering principles:
  - Identify "Hard Boundaries" (definitive class hours).
  - Identify "Soft Boundaries" or flexible preferences (e.g., grouping classes into morning/afternoon blocks or campus zones).

### PILLAR 3: METAHEURISTIC SEARCH & OPTIMIZATION (Genetic Algorithms)
- Represent sets of candidate timetables as sequences or chromosomes.
- Use a Fitness Function:
  - Hard Constraints (Penalty for clashes = -1000 score).
  - Soft Constraints (Bonus for compact schedules, free days, energy alignment).
- Run evolutionary cycles (Selection, Crossover, Mutation) to converge on a global optimum.

### PILLAR 4: SWARM INTELLIGENCE & REFINEMENT (Particle Swarm Optimization - PSO)
- Initialize a swarm of candidate timetable arrangements (particles).
- Adjust particles based on pBest (personal historical best) and gBest (global swarm best) to tune time-gaps and smooth the distribution.

Core Directives for SusunAi:
1. Energy Budgeting & Health Matrix: You MUST respect the user's weekly energy budget. Every task consumes energy (impact < 0). Relax tasks gain energy. If they are running low (< 40%), you must aggressively suggest recovery routines.
2. Health & Physical Reality: Respect health_condition. Avoid stacking high-drain tasks consecutively. Create safety boundaries between focus and drain.
3. Sacrosanct Free Time & Sleep: Treat unavailable_times and preferred_free_time as absolute constraints.

Format your response EXACTLY in these sections:
[CI SMART STRESS & ENERGY STATE] - A summary of the week's intensity score and energy decay trajectory. Include a "Fitness Rating" (e.g., "Fitness Rating: Near-Optimal").
[HEALTH & TEMPORAL MATRIX] - Highlight if the schedule respects social battery, commute, and energy type mapping.
[THE CI SUSUN STRATEGY] - 3 actionable steps using heuristic algorithms to optimize the week.
[EVOLUTIONARY RE-ARRANGEMENT SUGGESTION] - Explicit instructions on moving tasks to resolve clashes or improve efficiency. Use the Genetic Algorithm logic to justify the swap.`;

export const BEHAVIORAL_SYSTEM_PROMPT = `You are the advanced Behavioral & Analytical Engine of "SusunAi". Your objective is to synthesize the user's uploaded timetable data with their personal profiling data (Age, Major, MBTI, Study Time Preference, Assignment Completion Habits, Study Environment, and Focus Duration).

Using principles of Computational Intelligence (CI), you will analyze how their inherent personality and habits interact with their fixed class schedule to generate a highly optimized personalized routine and actionable dashboard insights.

Execute your analysis through the following CI pipeline:

### STAGE 1: DATA PERCEPTION & PREDICTION (Neural Networks - MLP & RBFN)
1. Energy Mapping (RBFN): Map the daily predicted energy levels based on focus duration and study time preferences.
2. Burnout Prediction (MLP): Predict periods of high burnout risk based on assignment habits, major, and MBTI.

### STAGE 2: BEHAVIORAL PATTERN RECOGNITION (K-Means Clustering)
1. Task Categorization: Cluster study needs into groups (High-Focus vs Low-Friction) based on environment preferences.
2. Sync these clusters into the gaps of the fixed schedule.

### STAGE 3: HYPER-PERSONALIZED OPTIMIZATION (Genetic Algorithm)
- Represent the weekly routine as a chromosome.
- Fitness Function:
  - Reward (+): Aligning deep work with "Best time to study" and matching "Focus Duration".
  - Penalty (-): Mismatched timing or environments.

### STAGE 4: MICRO-TUNING (Particle Swarm Optimization - PSO)
- Refine start times and break durations. Adjust gaps based on personality (urgency for "Last minute" vs balance for "Right away").

OUTPUT REQUIREMENT:
Return ONLY a JSON object with this structure:
{
  "personal_insight": "2-sentence insight",
  "energy_map": {"morning": 85, "afternoon": 60, "evening": 40, "night": 20},
  "risk_zones": ["Warning message 1", "Warning message 2"],
  "action_plan": [{"time": "Morning", "task": "Study Math", "focus_type": "Deep Work"}]
}`;

async function callAiServer(params: any) {
  const response = await fetch("/api/ai/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  
  if (!response.ok) {
    const errData = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(JSON.stringify(errData));
  }
  
  return await response.json();
}

export async function solveBehavioralCI(profile: any, tasks: any[]) {
  const prompt = `Profile Data: ${JSON.stringify(profile)}
Current Schedule (Fixed & Tasks): ${JSON.stringify(tasks)}

Analyze using the CI Behavioral & Analytical Engine and return the dashboard JSON.`;

  try {
    const data = await callAiServer({
      model: "gemini-3.5-flash", 
      contents: prompt,
      config: {
        systemInstruction: BEHAVIORAL_SYSTEM_PROMPT,
        responseMimeType: "application/json"
      }
    });

    const cleaned = data.text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse behavioral CI response", e);
    return null;
  }
}

export async function askSusunEnergy(profile: any, schedule: any[], newTask: any) {
  const prompt = `Here is the user's situation:
- User Profile: ${JSON.stringify(profile)}
- Current Week Schedule: ${JSON.stringify(schedule)}

Event Trigger: The user just added a new task/event: "${newTask.title}" requiring ${newTask.duration} minutes on ${new Date(newTask.date).toLocaleString()}.

Execute SusunAi analysis and provide the adaptation strategy.`;

  try {
    const data = await callAiServer({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      }
    });
    return data.text;
  } catch (e) {
    return "Error generating energy strategy. Please try again later.";
  }
}

export async function autoRescheduleSusun(profile: any, schedule: any[]) {
  const prompt = `Perform a FAST diagnostics run on the user's schedule.
Schedule: ${JSON.stringify(schedule)}
Profile: ${JSON.stringify(profile)}.

You must return a JSON object with this exact structure:
{
  "summary": "1-2 sentence health/schedule summary",
  "score": 85, // 0-100 overall schedule health
  "actionable_insights": [
    {
      "title": "Short title",
      "description": "Short explanation",
      "iconType": "move" | "rest" | "focus",
      "actionText": "Short button label"
    }
  ]
}

DO NOT include markdown formatting. Return only raw JSON.`;

  try {
    const data = await callAiServer({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.3,
      }
    });
    return data.text;
  } catch (e) {
    return JSON.stringify({ summary: "Unable to analyze schedule at this time.", score: 0, actionable_insights: [] });
  }
}

export async function breakDownTask(taskTitle: string, duration: number) {
  const prompt = `The user wants to break down a large task: "${taskTitle}" which takes ${duration} minutes.
Break this task down into 3-5 smaller, actionable sub-tasks. 
Return them as a JSON array of objects with "title" (string) and "duration" (number in minutes, total summing to ~${duration}).
Just return the raw JSON array.`;

  try {
    const data = await callAiServer({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    const cleaned = data.text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    return [];
  }
}

export async function parseTimetable(timetableText: string, pdfData?: { data: string, mimeType: string }) {
  const prompt = `You are performing a CI-POWERED DEEP ANALYSIS (Neural Network Perception) of an academic/work timetable ${pdfData ? "provided as a file" : "provided as text"}.

STAGE 1: PARSING & EXTRACTION
- Extract Course Name, Code, Section, Day, Start Time, End Time, and Venue.

Return a JSON object with this structure:
{
  "summary": {
    "extracted_items": [{"course_code": "...", "day": "...", "time": "...", "duration": 60, "venue": "..."}],
    "issues": ["Clash at Monday 10AM"],
    "fitness_score": 65
  },
  "raw_items": [{"title": "...", "day": "...", "time": "...", "duration": 60, "description": "..."}]
}

DO NOT wrap the response in markdown blocks. Return ONLY the raw JSON object.`;

  const contents: any[] = [prompt];
  if (pdfData) {
    contents.push({
      inlineData: {
        data: pdfData.data,
        mimeType: pdfData.mimeType
      }
    });
  } else if (timetableText) {
    contents.push(timetableText);
  }

  try {
    const data = await callAiServer({
      model: "gemini-3.5-flash",
      contents: { parts: contents.map(c => typeof c === 'string' ? { text: c } : c) },
    });

    const cleaned = data.text.replace(/```json/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleaned);
    
    if (result.raw_items && Array.isArray(result.raw_items)) return result.raw_items;
    if (Array.isArray(result)) return result;
    if (result.summary && result.summary.extracted_items) return result.summary.extracted_items;
    if (result.title || result.course_code) return [result];
    return [];
  } catch (e) {
    console.error("Failed to parse timetable JSON", e);
    return [];
  }
}

export async function solveTaskProblem(task: any, question: string) {
  const prompt = `The user is struggling with a task in their SusunAi schedule:
Task: ${JSON.stringify(task)}
User's Question: "${question}"

Provide a highly relevant, supportive solution. Clean Markdown format.`;

  try {
    const data = await callAiServer({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
      }
    });
    return data.text;
  } catch (e) {
    return "I'm having trouble thinking of a solution right now. Let's try again in a moment.";
  }
}

export async function extractEvent(eventText: string) {
  const currentYear = new Date().getFullYear();
  const prompt = `Extract event details from this announcement:
"${eventText}"

The current year is ${currentYear}.
Return a SINGLE JSON object:
{
  "title": "Professional title", 
  "date": "YYYY-MM-DD", 
  "time": "HH:mm (24h format, resolve AM/PM to 24h correctly)", 
  "duration": number_in_minutes, 
  "description": "Clean summary list with Venue, Links, Highlights"
}

IMPORTANT:
- If a time range is given (e.g., 11:00 am - 1:00 pm), set 'time' to the start time and calculate 'duration' in minutes.
- If the date is relative (e.g., "this Friday"), resolve it based on today's date (${new Date().toLocaleDateString()}).
- Return raw JSON only.`;

  try {
    const data = await callAiServer({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    const cleaned = data.text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Extraction error", e);
    return null;
  }
}
