import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { 
  Sparkles, 
  Flame, 
  Activity, 
  Zap, 
  Coffee, 
  Moon, 
  Clock, 
  Dumbbell, 
  BookOpen, 
  User, 
  TrendingUp, 
  CheckCircle2, 
  HelpCircle,
  Brain,
  Sliders,
  AlertCircle
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  type: string;
  energyImpact: number;
  status?: string;
  duration?: string | number;
}

interface UserProfile {
  name?: string;
  mbti_type?: string;
  energy_type?: string;
  avatar_url?: string;
}

interface EcosystemPageProps {
  tasks: Task[];
  userProfile: UserProfile | null;
}

// 2-Sided Susun AI Ecosystem Hub
export const EcosystemPage: React.FC<EcosystemPageProps> = ({ tasks, userProfile }) => {
  // Simulator states
  const [sleepHours, setSleepHours] = useState<number>(7);
  const [caffeineLevel, setCaffeineLevel] = useState<number>(1);
  const [mentalLoad, setMentalLoad] = useState<number>(5);
  const [logMood, setLogMood] = useState<string>("");
  const [activeAdviceIndex, setActiveAdviceIndex] = useState<number | null>(null);

  // Ecosystem Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [showAnalysisResult, setShowAnalysisResult] = useState<boolean>(false);
  const [isOptimized, setIsOptimized] = useState<boolean>(false);

  const triggerAnalysis = () => {
    setIsAnalyzing(true);
    setIsOptimized(false);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowAnalysisResult(true);
    }, 1000);
  };

  // Calculated Deep Analysis Results based on simulator settings
  const analysisResults = useMemo(() => {
    // 1. Metabolic Recovery (influenced by Sleep and slightly by mental load)
    const sleepQuality = Math.round((sleepHours / 8) * 100);
    const metabolicRecovery = Math.max(15, Math.min(100, Math.round(sleepQuality - (mentalLoad * 1.5))));
    
    // 2. Caffeine Half-Life & Saturation Index
    const halfLifeActive = caffeineLevel > 0 ? `${caffeineLevel * 5.7}h` : "0h";
    const saturationIndex = Math.min(100, caffeineLevel * 25);
    
    // 3. Neurological Cortisol Index (Load + low sleep multiplies strain)
    const sleepDeficitFactor = Math.max(0, 7.5 - sleepHours);
    const rawCortisol = (mentalLoad * 8) + (sleepDeficitFactor * 12);
    const cortisolIndex = Math.max(5, Math.min(100, Math.round(rawCortisol)));
    
    // 4. Overload Burnout Safety Margin
    const safetyMargin = Math.max(10, Math.min(100, Math.round(100 - (cortisolIndex * 0.8) + (caffeineLevel * 5))));

    // Determine status text & badges
    let stateLabel = "STABLE METABOLISM";
    let stateColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    let summaryRecommendation = "Your biorythmic levels indicate high baseline endurance. This is an excellent state to program complex components or organize classroom workflows.";

    if (cortisolIndex > 75) {
      stateLabel = "BURNOUT COLLAPSE RISKS DETECTED";
      stateColor = "text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse";
      summaryRecommendation = "Critical neurological fatigue detected. High cortisol with low restorative sleep. Immediately reduce scheduled workloads and execute short 20m power restoration blocks.";
    } else if (sleepHours < 5.5) {
      stateLabel = "CIRCADIAN DEBT INCOMING";
      stateColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
      summaryRecommendation = "Sleep deficit is affecting cognitive reaction speeds. Consider scheduling high-priority activities inside the peak window and taking an offline me-time recovery lap.";
    } else if (caffeineLevel >= 3) {
      stateLabel = "ADRENAL ACCELERATION";
      stateColor = "text-orange-400 bg-orange-500/10 border-orange-500/20";
      summaryRecommendation = "High caffeine saturation may cause immediate mental spikes followed by swift slump cycles. Counteract the crash with steady water hydration blocks.";
    } else if (mentalLoad > 8) {
      stateLabel = "NEUROLOGICAL STRESSED WORKLOAD";
      stateColor = "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
      summaryRecommendation = "High structured task loads are depleting your baseline mental energy quickly. Inject gamified study targets to satisfy quick cognitive wins.";
    }

    return {
      metabolicRecovery,
      halfLifeActive,
      saturationIndex,
      cortisolIndex,
      safetyMargin,
      stateLabel,
      stateColor,
      summaryRecommendation
    };
  }, [sleepHours, caffeineLevel, mentalLoad]);

  // Derive MBTI and energy type info or provide default fallback
  const mbti = userProfile?.mbti_type || "INTJ";
  const energyType = userProfile?.energy_type || "Balanced Focus";
  const userName = userProfile?.name || "Student";

  // Calculate stats from actual weekly tasks
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "completed").length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Categorize
    const counts: Record<string, number> = {
      study: 0,
      program: 0,
      class: 0,
      sport: 0,
      me_time: 0,
      personal: 0,
      custom: 0
    };
    
    let totalDrain = 0;
    let totalRecharge = 0;
    
    tasks.forEach(t => {
      if (counts[t.type] !== undefined) counts[t.type]++;
      if (t.energyImpact < 0) {
        totalDrain += Math.abs(t.energyImpact);
      } else {
        totalRecharge += t.energyImpact;
      }
    });

    return { total, completed, completionRate, counts, totalDrain, totalRecharge };
  }, [tasks]);

  // Personality Insights Dictionary
  const mbtiInsights = useMemo(() => {
    switch (mbti.toUpperCase()) {
      case "INTJ":
        return {
          desc: "Architect Energy",
          focusPeak: "9:00 AM - 12:00 PM",
          drainRisk: "Excessive social or repetitive manual tasks",
          booster: "Schedule blocks of deep isolation to program or structure theories.",
          advice: "Quiet conceptual development boosts your mental rechargeable reserves."
        };
      case "INTP":
        return {
          desc: "Logician Energy",
          focusPeak: "11:00 PM - 2:00 AM",
          drainRisk: "Highly structured meetings or rigid timelines",
          booster: "Allow 45 minutes of hyper-focus sandbox exploration.",
          advice: "Intellectual novelty acts as instant cognitive recharge."
        };
      case "ENTJ":
        return {
          desc: "Commander Energy",
          focusPeak: "8:00 AM - 11:00 AM",
          drainRisk: "Disorganized workflows or slow decision-making",
          booster: "Take command of the milestone mapping for high speed.",
          advice: "Action planning satisfies and fuels your high-drive aura."
        };
      case "ENTP":
        return {
          desc: "Debater Energy",
          focusPeak: "2:00 PM - 5:00 PM",
          drainRisk: "Repetitive execution grids without creative space",
          booster: "Brainstorm multi-dimensional alternative solutions.",
          advice: "Creative disruption fires up your adrenaline."
        };
      case "INFJ":
        return {
          desc: "Advocate Energy",
          focusPeak: "10:00 AM - 1:00 PM",
          drainRisk: "Toxic environments or highly transactional chats",
          booster: "Align task outcomes with real human impact/growth.",
          advice: "Sincere purpose grounds your psychological battery."
        };
      case "INFP":
        return {
          desc: "Mediator Energy",
          focusPeak: "4:00 PM - 7:00 PM",
          drainRisk: "Strict mechanical checklists with zero emotional value",
          booster: "Listen to lo-fi auditory synthesizers during tasks.",
          advice: "Quiet individual expression restores focus depleted by crowds."
        };
      case "ENFJ":
        return {
          desc: "Protagonist Energy",
          focusPeak: "9:00 AM - 12:00 PM",
          drainRisk: "Long periods of solitary quantitative data entry",
          booster: "Co-study or sync task outputs with classmates.",
          advice: "Shared group excitement operates as an direct energy boost."
        };
      case "ENFP":
        return {
          desc: "Campaigner Energy",
          focusPeak: "3:00 PM - 6:00 PM",
          drainRisk: "Monotonous linear routines without options",
          booster: "Inject gamified milestone goals into your workspace.",
          advice: "Spontaneous passion spikes are more reliable than rigid willpower."
        };
      default:
        return {
          desc: "Adaptive Energy Aura",
          focusPeak: "10:00 AM - 2:00 PM",
          drainRisk: "Poor sleep combined with high mental task weight",
          booster: "Take micro rests every 50 minutes of deep study.",
          advice: "Balanced schedules will sustain maximum potential."
        };
    }
  }, [mbti]);

  // Peak simulator calculation logic
  // Returns 12 temporal intervals (8 AM to 6 AM next day, at 2h hops)
  const simulationData = useMemo(() => {
    const hours = [8, 10, 12, 14, 16, 18, 20, 22, 0, 2, 4, 6];
    
    // Base sleep modifier
    const sleepFactor = (sleepHours - 7) * 8; // e.g. 5h sleep = -16, 9h sleep = +16
    const caffeineMultiplier = caffeineLevel * 12; // Caffeine spike influence
    const mentalDrain = (mentalLoad - 5) * 4; // Higher load offsets fatigue

    return hours.map((hour, idx) => {
      // Natural circadian rhythm baseline
      let base = 65;
      if (hour >= 9 && hour <= 12) base = 85;  // morning peak
      else if (hour >= 13 && hour <= 15) base = 50; // afternoon slump
      else if (hour >= 18 && hour <= 21) base = 75; // evening surge
      else if (hour >= 22 || hour <= 4) base = 35;  // night rest
      else if (hour >= 5 && hour <= 7) base = 45;   // early rise drift

      // Inject Sleep modifications
      base += sleepFactor;

      // Inject Caffeine boost (peaks soon, crashes late)
      if (caffeineLevel > 0) {
        if (idx === 1 || idx === 2) {
          base += caffeineMultiplier; // Rapid spike mid-morning
        } else if (idx >= 4 && idx <= 6) {
          base -= (caffeineLevel * 5); // caffeine crash
        }
      }

      // Inject mental load depletion
      base -= (idx * 1.5) + (mentalDrain * (idx / 11));

      // Keep in safe range 15% to 100%
      const finalVal = Math.max(15, Math.min(100, Math.round(base)));

      // Context advice for hourly coordinates
      let hourLabel = `${hour}:00`;
      if (hour === 0) hourLabel = "Midnight";
      if (hour === 12) hourLabel = "Noon";

      let recommendation = "";
      if (finalVal > 80) {
        recommendation = "Optimal cognitive zone. Crush your hardest tasks now.";
      } else if (finalVal > 60) {
        recommendation = "Steady endurance. Great for collaborative review or structured work.";
      } else if (finalVal > 40) {
        recommendation = "Waning focus. Take a 15-minute off-screen recover break.";
      } else {
        recommendation = "Survival state. Avoid critical tasks. Sleep or rest now.";
      }

      return {
        label: hourLabel,
        energy: finalVal,
        advice: recommendation,
        hour
      };
    });
  }, [sleepHours, caffeineLevel, mentalLoad]);

  // Format SVG coordinates automatically
  const svgMetrics = useMemo(() => {
    const width = 500;
    const height = 150;
    const count = simulationData.length;
    
    const points = simulationData.map((d, index) => {
      const x = (index / (count - 1)) * (width - 40) + 20;
      // Invert Y coordinate so higher energy is top
      const y = height - ((d.energy - 10) / 90) * (height - 30) - 15;
      return { x, y, energy: d.energy, label: d.label, advice: d.advice };
    });

    const pathD = points.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, "");

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return { width, height, points, pathD, areaD };
  }, [simulationData]);

  // Live Weekly AI Audit Diagnosis
  const weeklyAudit = useMemo(() => {
    const drainFactor = stats.totalDrain;
    const rechargeFactor = stats.totalRecharge;
    const taskCount = stats.total;

    let score = 90;
    let rank = "Synergistic";
    let desc = "Perfect layout. Your physical recover cycles match task strains neatly.";

    if (taskCount === 0) {
      return { score: 100, rank: "Clean Canvas", desc: "No scheduled stress items. Build your workspace!" };
    }

    // Deplete for high unbalanced drain
    if (drainFactor > rechargeFactor + 10) {
      score -= Math.min(40, (drainFactor - rechargeFactor) * 2.5);
    }
    // Boost for good recovery balance
    if (rechargeFactor >= drainFactor * 0.8) {
      score += 5;
    }
    // High volume stress penalty
    if (taskCount > 15) {
      score -= 8;
    }

    score = Math.max(10, Math.min(100, Math.round(score)));

    if (score < 40) {
      rank = "Hazard Crash";
      desc = "Critical deficit. High stress drain with almost zero rest elements found.";
    } else if (score < 65) {
      rank = "Drain Propellant";
      desc = "Moderate deficit. Your mind is burning energy faster than you replenish.";
    } else if (score < 85) {
      rank = "Stable Equilibrium";
      desc = "Sustainable loop. Good integration of energy items, keep sleep stable.";
    }

    return { score, rank, desc };
  }, [stats]);

  // Contextual immediate booster suggestions
  const moodBoosterResponse = useMemo(() => {
    if (!logMood) return null;
    switch (logMood) {
      case "perfect":
        return {
          title: "Channel the Surge",
          gradient: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30",
          text: "Phenomenal! Your bio-state is optimal. This is the ideal window to attack complex algorithms, write code documentation, or take mock exams. Do not waste this focus aura!"
        };
      case "tired":
        return {
          title: "Micro-Recovery Protocol",
          gradient: "from-amber-500/20 to-yellow-500/10 border-amber-500/30",
          text: "Circadian fatigue detected. Hydrate with 300ml of cold water, step outside for 5 mins of natural sunlight, and schedule lightweight administrative or physical tasks. Avoid caffeine overdose."
        };
      case "stressed":
        return {
          title: "Vagus Nerve Reset",
          gradient: "from-cyan-500/20 to-purple-500/10 border-cyan-500/30",
          text: "Adrenaline spike active. Try the 4-7-8 breathing system: Inhale for 4s, hold for 7s, exhale slowly for 8s. Remove distracting alerts and break your immediate goal into tiny micro-steps."
        };
      case "overloaded":
        return {
          title: "Workspace Decongestion",
          gradient: "from-rose-500/20 to-red-500/10 border-rose-500/30",
          text: "Circuit breaker warning! Purge non-critical milestones. Delay minor classes and transition immediately into 20 minutes of silent 'offline rest'. Your long-term focus capacity requires an absolute rest now."
        };
      default:
        return null;
    }
  }, [logMood]);

  return (
    <div id="ecosystem-container" className="w-full text-slate-100 font-sans relative">
      {/* Decorative localized ambient glowing backgrounds */}
      <div className="absolute top-1/4 -left-12 w-64 h-64 bg-purple-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-12 w-80 h-80 bg-pink-500/[0.03] rounded-full blur-[140px] pointer-events-none" />

      {/* Header Info Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest mb-2">
            <Sparkles size={11} className="animate-pulse" /> Live Telemetry
          </div>
          <h2 className="text-2xl font-black text-white hover:text-purple-300 transition-colors uppercase tracking-tight font-sans">
            Susun AI Performance Ecosystem
          </h2>
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mt-1.5">
            Bio-Rhythmic Intelligence Mapping for <span className="text-purple-300">{userName}</span>
          </p>
        </div>
        
        {/* Rapid Status Badges */}
        <div className="flex items-center gap-2 bg-zinc-950/60 p-2.5 rounded-2xl border border-zinc-900/60 self-start md:self-center">
          <div className="flex flex-col px-3 border-r border-zinc-850">
            <span className="text-[9px] font-bold text-zinc-500 uppercase">Ecosystem Type</span>
            <span className="text-xs font-black text-white flex items-center gap-1.5 mt-0.5">
              <Zap className="w-3.5 h-3.5 text-yellow-400 animate-pulse" /> {energyType}
            </span>
          </div>
          <div className="flex flex-col px-3">
            <span className="text-[9px] font-bold text-zinc-500 uppercase">MBTI Alignment</span>
            <span className="text-xs font-black text-purple-400 mt-0.5">{mbti}</span>
          </div>
        </div>
      </div>

      {/* 2-SIDE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* ==========================================
            SIDE 1: INTEL & PROFILE HARMONY (LEFT COLUMN)
           ========================================== */}
        <div id="side-intel-harmony" className="space-y-6">
          
          {/* Section Heading Badge */}
          <div className="flex items-center justify-between pb-1.5 border-b border-zinc-900 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-1 h-3.5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">
                Biorythmic Compatibility & Analysis
              </h3>
            </div>
            
            <button
              id="analysis-trigger-button"
              onClick={triggerAnalysis}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 active:scale-95 border border-purple-500/30 text-[10px] font-black uppercase tracking-wider text-purple-300 transition-all cursor-pointer shadow-md select-none shrink-0"
            >
              <Activity size={12} className={isAnalyzing ? "animate-spin" : "animate-pulse"} />
              <span>{isAnalyzing ? "Scanning..." : "Analysis"}</span>
            </button>
          </div>

          {/* 1. Animated Biometric scanner active state */}
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card className="bg-[#0e0d12]/70 border border-purple-500/30 relative overflow-hidden p-6 rounded-3xl min-h-[160px] flex flex-col justify-center items-center shadow-lg shadow-purple-500/5">
                {/* Real-time slider metrics scanned readout */}
                <motion.div 
                  className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_12px_#c084fc]"
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                />
                <div className="absolute inset-0 bg-purple-500/[0.01] bg-[linear-gradient(rgba(18,16,24,0)_95%,rgba(168,85,247,0.15)_95%)] bg-[size:100%_12px] opacity-25" />
                <Activity size={24} className="text-purple-400 animate-spin mb-3" />
                <span className="text-[10px] font-black uppercase text-purple-300 tracking-widest animate-pulse">
                  AI Core: Compiling Biometric Diagnostics...
                </span>
                <p className="text-[9px] text-zinc-500 font-mono mt-1.5">
                  Analyzing (Sleep: {sleepHours}h • Caffeine: {caffeineLevel}c • Mental Load: {mentalLoad})
                </p>
              </Card>
            </motion.div>
          )}

          {/* 2. Interactive Analysis Report Results Card */}
          {showAnalysisResult && !isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden"
            >
              <Card className="bg-[#0f0d14]/80 border border-purple-500/20 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden relative group/analysis transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/[0.05] blur-3xl rounded-full pointer-events-none" />
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-purple-400 via-pink-500 to-cyan-400" />
                
                <CardHeader className="p-5 pb-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] uppercase font-black text-purple-400 tracking-wider">AI Biometric Diagnostic</span>
                      <CardTitle className="text-base font-black text-white flex items-center gap-2 mt-0.5 font-sans">
                        <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" /> Circadian & Stamina Analysis
                      </CardTitle>
                    </div>
                    <button 
                      onClick={() => setShowAnalysisResult(false)}
                      className="text-zinc-500 hover:text-zinc-300 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-zinc-800 hover:border-zinc-700 bg-zinc-950 transition-colors cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </CardHeader>
                
                <CardContent className="p-5 pt-1 space-y-4 text-xs">
                  {/* Active Analysis Status Pill */}
                  <div className={`p-2.5 rounded-xl border text-[9px] font-black uppercase tracking-wider flex items-center gap-2 ${analysisResults.stateColor}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                    <span>State Index: {analysisResults.stateLabel}</span>
                  </div>

                  <p className="text-zinc-400 leading-relaxed text-[11px]">
                    {analysisResults.summaryRecommendation}
                  </p>

                  {/* Grid of Micro-Gauges & Calculated Scores */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Metabolic Recovery Quotient */}
                    <div className="p-3 bg-zinc-950/60 border border-zinc-900/80 rounded-2xl">
                      <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider block">Metabolic Recovery Q.</span>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-base font-black text-white font-mono">{analysisResults.metabolicRecovery}%</span>
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400">
                          {analysisResults.metabolicRecovery > 75 ? "Excellent" : analysisResults.metabolicRecovery > 45 ? "Compensated" : "Depleted"}
                        </span>
                      </div>
                      <div className="h-1 bg-zinc-900 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="h-full bg-indigo-400 transition-all duration-300"
                          style={{ width: `${analysisResults.metabolicRecovery}%` }}
                        />
                      </div>
                    </div>

                    {/* Cortisol & Neurological Load Index */}
                    <div className="p-3 bg-zinc-950/60 border border-zinc-900/80 rounded-2xl">
                      <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider block">Cortisol / Strain Load</span>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-base font-black text-white font-mono">{analysisResults.cortisolIndex}%</span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider ${analysisResults.cortisolIndex > 70 ? "bg-red-500/10 text-red-400" : "bg-cyan-500/10 text-cyan-400"}`}>
                          {analysisResults.cortisolIndex > 70 ? "Critical Strain" : "Adaptive"}
                        </span>
                      </div>
                      <div className="h-1 bg-zinc-900 rounded-full mt-2 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${analysisResults.cortisolIndex > 70 ? "bg-red-400" : "bg-cyan-400"}`}
                          style={{ width: `${analysisResults.cortisolIndex}%` }}
                        />
                      </div>
                    </div>

                    {/* Caffeine Saturation half-life */}
                    <div className="p-3 bg-zinc-950/60 border border-zinc-900/80 rounded-2xl">
                      <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider block">Caffeine half-life</span>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-sm font-black text-white font-sans">{analysisResults.halfLifeActive}</span>
                        <span className="text-[8px] font-mono text-zinc-500">Saturation: {analysisResults.saturationIndex}%</span>
                      </div>
                      <div className="h-1 bg-zinc-900 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400 transition-all duration-300"
                          style={{ width: `${analysisResults.saturationIndex}%` }}
                        />
                      </div>
                    </div>

                    {/* Brain Burnout Safety Margin */}
                    <div className="p-3 bg-zinc-950/60 border border-zinc-900/80 rounded-2xl">
                      <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider block">Burnout Safety margin</span>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-base font-black text-white font-mono">{analysisResults.safetyMargin}%</span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider ${analysisResults.safetyMargin < 35 ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                          {analysisResults.safetyMargin < 35 ? "Danger" : "Secure"}
                        </span>
                      </div>
                      <div className="h-1 bg-zinc-900 rounded-full mt-2 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${analysisResults.safetyMargin < 35 ? "bg-rose-400" : "bg-emerald-400"}`}
                          style={{ width: `${analysisResults.safetyMargin}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Curated Booster Auto-aligner Button */}
                  <div className="p-3 bg-purple-500/[0.02] border border-purple-500/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 mt-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="text-purple-400 w-4 h-4 shrink-0 animate-pulse" />
                      <div className="text-left">
                        <span className="text-[9px] font-black uppercase tracking-wider text-purple-300 block">AI Self-Correction Module</span>
                        <p className="text-[9px] text-zinc-500">Syncs parameters to return circadian peak stability.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsOptimized(true);
                        setSleepHours(8);
                        setCaffeineLevel(1);
                        setMentalLoad(4);
                      }}
                      disabled={isOptimized || (sleepHours === 8 && caffeineLevel === 1 && mentalLoad === 4)}
                      className="px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-600 active:scale-95 disabled:opacity-50 disabled:scale-100 text-white font-black uppercase text-[8px] tracking-wider transition-all cursor-pointer shadow-md shadow-purple-500/10 shrink-0"
                    >
                      {isOptimized ? "Telemetry Optimized ✓" : "Optimize Settings"}
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* 1. MBTI Deep Dive Diagnostic Card */}
          <Card className="bg-[#0e0d12]/50 border border-zinc-850 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden relative group/mbti hover:border-purple-500/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/[0.03] blur-3xl rounded-full pointer-events-none group-hover/mbti:scale-125 transition-transform duration-500" />
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-pink-500 via-purple-500 to-cyan-500" />
            
            <CardHeader className="p-6 pb-2">
              <span className="text-[9px] uppercase font-black text-zinc-500 tracking-wider">Psychological Diagnostic</span>
              <CardTitle className="text-lg font-black text-white flex items-center gap-2 mt-0.5 font-sans">
                <Brain className="w-5 h-5 text-pink-400" /> {mbtiInsights.desc} Profile ({mbti})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-4 text-xs">
              <p className="text-zinc-400 leading-relaxed">
                Your Myers-Briggs personality dictates how mental fatigue accumulates. Your schedule composition dictates how your brain recharges.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3.5 pt-2">
                <div className="p-3.5 bg-zinc-950/60 border border-zinc-900/80 rounded-2xl relative">
                  <div className="text-[9px] font-black uppercase tracking-wider text-pink-400 flex items-center gap-1">
                    <Clock size={11} /> Cognitive Peak Window
                  </div>
                  <p className="text-sm font-black text-white mt-1.5 font-sans">{mbtiInsights.focusPeak}</p>
                </div>

                <div className="p-3.5 bg-zinc-950/60 border border-zinc-900/80 rounded-2xl relative">
                  <div className="text-[9px] font-black uppercase tracking-wider text-red-400 flex items-center gap-1">
                    <AlertCircle size={11} /> High Depletion Hazard
                  </div>
                  <p className="text-zinc-300 font-bold mt-1.5 line-clamp-2">{mbtiInsights.drainRisk}</p>
                </div>
              </div>

              <div className="p-4 bg-purple-500/[0.02] border border-purple-500/10 rounded-2xl mt-2 flex gap-3">
                <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-300 block">AI Booster Prescription</span>
                  <p className="text-zinc-400 leading-relaxed mt-1">{mbtiInsights.booster}</p>
                  <em className="text-[10px] text-zinc-500 mt-2 block font-medium">💡 Alignment advice: {mbtiInsights.advice}</em>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Live Weekly Balance Diagnostic Meter & Gauge */}
          <Card className="bg-[#0e0d12]/50 border border-zinc-850 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden relative">
            <CardHeader className="p-6 pb-2">
              <span className="text-[9px] uppercase font-black text-zinc-500 tracking-wider">Dynamic Schedule Balance Summary</span>
              <CardTitle className="text-lg font-black text-white flex items-center gap-2 mt-0.5 font-sans">
                <Activity className="w-5 h-5 text-purple-400 animate-pulse" /> Weekly Health Audit
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-5">
              {/* Score gauge header */}
              <div className="flex items-center justify-between gap-4 p-4 bg-zinc-950/40 rounded-2xl border border-zinc-900">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">AI Harmony Rating</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-white">{weeklyAudit.score}</span>
                    <span className="text-zinc-500 text-xs font-bold font-sans">/ 100</span>
                    <span className="ml-2.5 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider bg-purple-500/10 border border-purple-500/20 text-purple-400 animate-none">
                      {weeklyAudit.rank}
                    </span>
                  </div>
                </div>
                {/* Micro visual indicator */}
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg className="w-14 h-14 transform -rotate-95">
                    <circle cx="28" cy="28" r="24" className="stroke-zinc-900 fill-none" strokeWidth="4" />
                    <circle 
                      cx="28" 
                      cy="28" 
                      r="24" 
                      className="stroke-purple-500 fill-none transition-all duration-1000" 
                      strokeWidth="4" 
                      strokeDasharray={`${2 * Math.PI * 24}`} 
                      strokeDashoffset={`${2 * Math.PI * 24 * (1 - weeklyAudit.score / 100)}`}
                    />
                  </svg>
                  <span className="absolute text-[11px] font-black text-white">{weeklyAudit.score}%</span>
                </div>
              </div>

              <p className="text-zinc-400 text-xs leading-relaxed">
                {weeklyAudit.desc} Calculated from your direct weekly tasks, comparing structural stress loads against physical me-time blocks.
              </p>

              {/* Progress meters for key bio areas */}
              <div className="space-y-3.5">
                {/* 1. Technical / Logical (Study, Program) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-black uppercase text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3 h-3 text-cyan-400" /> Cognitive Intensity (Study/Prog)
                    </span>
                    <span>{stats.counts.study + stats.counts.program} tasks</span>
                  </div>
                  <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-400 transition-all duration-1000" 
                      style={{ width: `${Math.min(100, ((stats.counts.study + stats.counts.program) / Math.max(1, stats.total)) * 100)}%` }} 
                    />
                  </div>
                </div>

                {/* 2. Physical Vitality (Sport/Hydrate) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-black uppercase text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Dumbbell className="w-3 h-3 text-emerald-400" /> Physical Vitality (Sports)
                    </span>
                    <span>{stats.counts.sport} tasks</span>
                  </div>
                  <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-400 transition-all duration-1000" 
                      style={{ width: `${Math.min(100, (stats.counts.sport / Math.max(1, stats.total)) * 100)}%` }} 
                    />
                  </div>
                </div>

                {/* 3. Parasympathetic Recovery (Me Time, Offline sleep, rest) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-black uppercase text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Moon className="w-3 h-3 text-pink-400" /> Recovery Buffer (Me-Time)
                    </span>
                    <span>{stats.counts.me_time} tasks</span>
                  </div>
                  <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-pink-400 transition-all duration-1000" 
                      style={{ width: `${Math.min(100, (stats.counts.me_time / Math.max(1, stats.total)) * 100)}%` }} 
                    />
                  </div>
                </div>
              </div>

              {/* Advice pill */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-950/70 border border-zinc-900 text-[11px] text-zinc-500 font-medium">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                <span>
                  {stats.counts.me_time === 0 
                    ? "Warning: No Recovery task is registered for today! Consider adding 'Me Time' to improve score." 
                    : "Telemetry analysis suggests stable vital balance. Excellent."
                  }
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ==========================================
            SIDE 2: INTERACTIVE BIO-ENERGY CURVE SIMULATOR (RIGHT COLUMN)
           ========================================== */}
        <div id="side-interactive-simulator" className="space-y-6">
          
          {/* Section Heading Badge */}
          <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-900">
            <div className="w-1 h-3.5 bg-gradient-to-b from-cyan-500 to-indigo-500 rounded-full" />
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">
              Interactive Bio-Energy Peak Simulator
            </h3>
          </div>

          <Card className="bg-[#0e0d12]/50 border border-zinc-850 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden relative">
            <CardHeader className="p-6 pb-2">
              <span className="text-[9px] uppercase font-black text-zinc-500 tracking-wider">Dynamic Circadian Graph</span>
              <CardTitle className="text-lg font-black text-white flex items-center justify-between mt-0.5 font-sans">
                <span className="flex items-center gap-2">
                  <TrendingUp className="text-emerald-400 w-5 h-5" /> Projected 24h Energy Curve
                </span>
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider float-right">
                  Interactive Simulator
                </span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6 pt-2 space-y-6">
              
              {/* Dynamic SVG Area Chart */}
              <div className="relative bg-zinc-950/80 border border-zinc-900/60 rounded-2xl p-4 overflow-hidden shadow-inner">
                {/* Grids / Axes labels inside chart */}
                <div className="absolute top-2 left-4 text-[9px] uppercase tracking-wider font-extrabold text-zinc-600 flex items-center gap-1">
                  <Zap size={10} className="text-yellow-400" /> Bio-Charge (%)
                </div>
                
                {/* Actual Custom SVG graph representing the energy projection points */}
                <div className="w-full h-[160px] pointer-events-auto">
                  <svg 
                    viewBox={`0 0 ${svgMetrics.width} ${svgMetrics.height}`} 
                    className="w-full h-full overflow-visible"
                  >
                    <defs>
                      <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c084fc" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#18181b" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Background Grid Lines */}
                    <line x1="20" y1="15" x2="480" y2="15" stroke="rgba(255,255,255,0.02)" strokeDasharray="4 4" />
                    <line x1="20" y1="52.5" x2="480" y2="52.5" stroke="rgba(255,255,255,0.02)" strokeDasharray="4 4" />
                    <line x1="20" y1="90" x2="480" y2="90" stroke="rgba(255,255,255,0.02)" strokeDasharray="4 4" />
                    <line x1="20" y1="127.5" x2="480" y2="127.5" stroke="rgba(255,255,255,0.02)" strokeDasharray="4 4" />

                    {/* Chart Gradient Shading Fill */}
                    <path d={svgMetrics.areaD} fill="url(#areaGlow)" />

                    {/* Line Stroke */}
                    <path 
                      d={svgMetrics.pathD} 
                      fill="none" 
                      stroke="url(#lineGradient)" 
                      strokeWidth="3" 
                      strokeLinecap="round"
                    />
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>

                    {/* Interactive dot plot points */}
                    {svgMetrics.points.map((p, idx) => (
                      <g 
                        key={idx} 
                        className="cursor-pointer group/dot"
                        onClick={() => setActiveAdviceIndex(idx)}
                      >
                        <circle 
                          cx={p.x} 
                          cy={p.y} 
                          r={activeAdviceIndex === idx ? "7" : "4.5"} 
                          className={`fill-zinc-950 stroke-current text-purple-400 group-hover/dot:text-pink-400 group-hover/dot:r-7 transition-all duration-200`} 
                          strokeWidth="2.5" 
                        />
                        <circle 
                          cx={p.x} 
                          cy={p.y} 
                          r={activeAdviceIndex === idx ? "12" : "8"} 
                          className="stroke-purple-500/20 fill-none opacity-0 group-hover/dot:opacity-100" 
                          strokeWidth="1" 
                        />
                      </g>
                    ))}
                  </svg>
                </div>

                {/* X Axis Labels under SVG */}
                <div className="flex justify-between px-3 mt-1 text-[8px] font-black text-zinc-500 uppercase tracking-widest font-mono">
                  <span>8a</span>
                  <span>12p</span>
                  <span>4p</span>
                  <span>8p</span>
                  <span>12a</span>
                  <span>4a</span>
                  <span>6a</span>
                </div>
              </div>

              {/* Informative advice for active index */}
              <div className="min-h-[58px] p-3.5 bg-zinc-950/40 border border-zinc-900 rounded-2xl flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0" />
                <div>
                  <span className="text-[9px] uppercase font-black text-zinc-500 tracking-wider">
                    {activeAdviceIndex !== null ? `Hour Analysis: ${simulationData[activeAdviceIndex].label}` : "Point Advisor"}
                  </span>
                  <p className="text-zinc-300 text-xs mt-0.5">
                    {activeAdviceIndex !== null 
                      ? `Projected Energy is @ ${simulationData[activeAdviceIndex].energy}%. Recommendation: ${simulationData[activeAdviceIndex].advice}`
                      : "Tap any point on the Energy Curve above to view deep diagnostic hour-level recommendations."
                    }
                  </p>
                </div>
              </div>

              {/* Interactive Multi-Coordinate Range Sliders */}
              <div className="p-4 bg-[#09090c]/70 border border-zinc-900/80 rounded-2xl space-y-4 shadow-sm">
                <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-900 mb-1">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span className="text-[10px] font-black uppercase text-zinc-300 tracking-widest">
                    Circadian Simulation Parameters
                  </span>
                </div>

                {/* Slider 1: Sleep Hours */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
                      <Moon className="w-3.5 h-3.5 text-indigo-300" /> Sleep Last Night
                    </span>
                    <span className="font-mono text-[10px] font-black text-white bg-indigo-500/20 px-2 py-0.5 rounded-md border border-indigo-500/30">
                      {sleepHours} Hours
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="4" 
                    max="10" 
                    step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 h-1 rounded-full cursor-pointer bg-zinc-900"
                  />
                  <div className="flex justify-between text-[8px] text-zinc-500 font-bold uppercase tracking-widest px-0.5">
                    <span>Deficit (4h)</span>
                    <span>Stable (7.5h)</span>
                    <span>Surplus (10h)</span>
                  </div>
                </div>

                {/* Slider 2: Coffee / Caffeine */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
                      <Coffee className="w-3.5 h-3.5 text-yellow-500" /> Caffeine/Energy Intake
                    </span>
                    <span className="font-mono text-[10px] font-black text-white bg-yellow-500/20 px-2 py-0.5 rounded-md border border-yellow-500/30">
                      {caffeineLevel} Cups
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="4" 
                    step="1"
                    value={caffeineLevel}
                    onChange={(e) => setCaffeineLevel(parseInt(e.target.value))}
                    className="w-full accent-yellow-500 h-1 rounded-full cursor-pointer bg-zinc-900"
                  />
                  <div className="flex justify-between text-[8px] text-zinc-500 font-bold uppercase tracking-widest px-0.5">
                    <span>Clean (0c)</span>
                    <span>Moderate (2c)</span>
                    <span>Hyper (4c)</span>
                  </div>
                </div>

                {/* Slider 3: Mental Loading */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
                      <Activity className="w-3.5 h-3.5 text-pink-400" /> Planned Weekly Mental Stress (Load)
                    </span>
                    <span className="font-mono text-[10px] font-black text-white bg-pink-500/20 px-2 py-0.5 rounded-md border border-pink-500/30">
                      Level {mentalLoad}/10
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={mentalLoad}
                    onChange={(e) => setMentalLoad(parseInt(e.target.value))}
                    className="w-full accent-pink-500 h-1 rounded-full cursor-pointer bg-zinc-900"
                  />
                  <div className="flex justify-between text-[8px] text-zinc-500 font-bold uppercase tracking-widest px-0.5">
                    <span>Sedentary (1)</span>
                    <span>Balanced (5)</span>
                    <span>Intense (10)</span>
                  </div>
                </div>
              </div>

              {/* Instant Mood & Energy Booster Trigger Controls */}
              <div className="p-4 bg-zinc-950/40 border border-zinc-900/60 rounded-2xl space-y-4">
                <span className="text-[9px] uppercase font-black text-zinc-500 tracking-wider block">
                  Rapid Response Booster Deck
                </span>
                
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Feeling immediate depletion? Select your active state block below to retrieve curated performance guideline overrides.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => setLogMood("perfect")}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-200 ${
                      logMood === "perfect" 
                        ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-md shadow-emerald-500/5" 
                        : "bg-zinc-950 border-white/5 text-zinc-400 hover:border-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    <Zap size={14} className={logMood === "perfect" ? "animate-bounce" : ""} />
                    <span className="text-[9px] uppercase font-black tracking-widest">Energetic</span>
                  </button>

                  <button
                    onClick={() => setLogMood("tired")}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-200 ${
                      logMood === "tired" 
                        ? "bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-md shadow-amber-500/5" 
                        : "bg-zinc-950 border-white/5 text-zinc-400 hover:border-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    <Coffee size={14} className={logMood === "tired" ? "animate-pulse" : ""} />
                    <span className="text-[9px] uppercase font-black tracking-widest">Fatigued</span>
                  </button>

                  <button
                    onClick={() => setLogMood("stressed")}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-200 ${
                      logMood === "stressed" 
                        ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-md shadow-cyan-500/5" 
                        : "bg-zinc-950 border-white/5 text-zinc-400 hover:border-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    <Activity size={14} className={logMood === "stressed" ? "animate-pulse" : ""} />
                    <span className="text-[9px] uppercase font-black tracking-widest">Agitated</span>
                  </button>

                  <button
                    onClick={() => setLogMood("overloaded")}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-200 ${
                      logMood === "overloaded" 
                        ? "bg-rose-500/10 border-rose-500/50 text-rose-400 shadow-md shadow-rose-500/5" 
                        : "bg-zinc-950 border-white/5 text-zinc-400 hover:border-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    <AlertCircle size={14} className={logMood === "overloaded" ? "animate-bounce" : ""} />
                    <span className="text-[9px] uppercase font-black tracking-widest">Burnt</span>
                  </button>
                </div>

                {/* Curved Booster Result Output */}
                {moodBoosterResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 border rounded-2xl bg-gradient-to-br flex gap-3 ${moodBoosterResponse.gradient}`}
                  >
                    <Sparkles className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5 animate-spin" style={{ animationDuration: '4s' }} />
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase text-white tracking-widest block">
                        {moodBoosterResponse.title} Curated Prescription
                      </span>
                      <p className="text-zinc-300 text-xs leading-relaxed">
                        {moodBoosterResponse.text}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

            </CardContent>
          </Card>

        </div>

      </div>

      {/* Decorative Spacer bottom to avoid mobile elements */}
      <div className="h-28" />
    </div>
  );
};

// Simple clean Card subcomponents to avoid shadcn installation dependencies
export const Card: React.FC<{ children: React.ReactNode; className?: string; id?: string }> = ({ children, className = "", id }) => (
  <div id={id} className={`rounded-3xl bg-[#0e0d12]/60 border border-zinc-850/80 backdrop-blur-md shadow-xl ${className}`}>
    {children}
  </div>
);

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`p-6 pb-2 ${className}`}>{children}</div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <h4 className={`text-base font-black uppercase tracking-widest text-[#f4f4f5] ${className}`}>{children}</h4>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`p-6 pt-2 ${className}`}>{children}</div>
);
