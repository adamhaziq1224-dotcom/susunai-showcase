import { useState, useEffect, useRef, useMemo } from "react";
import { auth } from "./firebase";
import { getThemeCss } from "./lib/themeHelper";
import {
  getUserProfile,
  updateUserProfile,
  subscribeToTasks,
  Task,
  addTask,
  addTasks,
  deleteTasks,
  updateTaskStatus,
  deleteTask,
  resetUserData,
  getAllUsers,
  getUserTasks,
  adminUpdateUser,
  UserProfile,
  logUserActivity,
  getUserActivities,
  adminUpdateStudentTask,
  adminDeleteStudentTask,
  UserActivity,
} from "./lib/db";
import {
  askSusunEnergy,
  autoRescheduleSusun,
  breakDownTask,
  parseTimetable,
  extractEvent,
  solveTaskProblem,
  solveBehavioralCI,
} from "./lib/susun-ai";
import { EcosystemPage } from "./components/EcosystemPage";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  format,
  isSameDay,
  parseISO,
  startOfWeek,
  addDays,
  isPast,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  parse,
  differenceInWeeks,
} from "date-fns";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Plus,
  Sparkles,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Calendar as CalendarIcon,
  Loader2,
  User,
  LayoutList,
  Play,
  Square,
  Settings2,
  SplitSquareHorizontal,
  ChevronLeft,
  ChevronRight,
  CalendarClock,
  MessageSquarePlus,
  Bell,
  FileUp,
  Trash2,
  Zap,
  Target,
  Battery,
  Activity,
  Coffee,
  Moon,
  Smartphone,
  Brain,
  UserCheck,
  ArrowUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import { FileText, MapPin, Link as LinkIcon, Info, ShieldCheck, Search, Users, SlidersHorizontal, RefreshCw, Flame, Award, Terminal, AlertTriangle, Edit } from "lucide-react";

type Tab = "dashboard" | "calendar" | "ai" | "profile" | "admin" | "ecosystem";

const MBTI_TYPES = [
  { id: "INTJ", name: "INTJ", desc: "The Architect - Strategic, big-picture thinker." },
  { id: "INTP", name: "INTP", desc: "The Logician - Analytical, flexible problem-solver." },
  { id: "ENTJ", name: "ENTJ", desc: "The Commander - Bold leader, organizes everything." },
  { id: "ENTP", name: "ENTP", desc: "The Debater - Smart thinker, loves challenges." },
  { id: "INFJ", name: "INFJ", desc: "The Advocate - Quiet visionary, deep values." },
  { id: "INFP", name: "INFP", desc: "The Mediator - Idealist, stays true to themselves." },
  { id: "ENFJ", name: "ENFJ", desc: "The Protagonist - Inspiring leader, helps others." },
  { id: "ENFP", name: "ENFP", desc: "The Campaigner - Enthusiastic spirit, loves people." },
  { id: "ISTJ", name: "ISTJ", desc: "The Logistician - Reliable, focuses on facts." },
  { id: "ISFJ", name: "ISFJ", desc: "The Defender - Dedicated worker, protects others." },
  { id: "ESTJ", name: "ESTJ", desc: "The Executive - Efficient administrator, tradition-focused." },
  { id: "ESFJ", name: "ESFJ", desc: "The Consul - Helpful, loves social harmony." },
  { id: "ISTP", name: "ISTP", desc: "The Virtuoso - Master of tools, bold experimenter." },
  { id: "ISFP", name: "ISFP", desc: "The Adventurer - Creative artist, stays in the moment." },
  { id: "ESTP", name: "ESTP", desc: "The Entrepreneur - Energetic, loves taking risks." },
  { id: "ESFP", name: "ESFP", desc: "The Entertainer - Spontaneous worker, full of life." },
];

export interface TaskBiometrics {
  cognitive: number; // 0 - 100
  physical: number; // 0 - 100
  recovery: number; // 0 - 100
  cognitiveDesc: string;
  physicalDesc: string;
  recoveryDesc: string;
}

export function getTaskBiometrics(taskType: string, energyImpact: number = -1, duration: number = 30): TaskBiometrics {
  let cognitive = 10;
  let physical = 10;
  let recovery = 10;
  
  let cognitiveDesc = "Minimal focus required.";
  let physicalDesc = "Stationary posture or passive task.";
  let recoveryDesc = "Neutral effect on restorative balance.";

  const typeLower = taskType?.toLowerCase() || "";

  if (typeLower === "study") {
    cognitive = Math.min(95, Math.max(50, 40 + duration * 0.3));
    physical = 15;
    recovery = 5;
    cognitiveDesc = "High cognitive focus. Depletes neurological memory registers. Ideal for active studying and revision.";
    physicalDesc = "Sedentary focus. Try incorporating quick baseline stretching cycles between blocks.";
    recoveryDesc = "Mentally fatiguing. Requires restorative me-time after execution to prevent speed slumps.";
  } else if (typeLower === "program") {
    cognitive = Math.min(100, Math.max(60, 50 + duration * 0.4));
    physical = 20;
    recovery = 5;
    cognitiveDesc = "Extreme problem solving & analytical focus. Heavy activation of prefrontal cortex neural lanes.";
    physicalDesc = "Sedentary desk work. High eye-strain risk from heavy code tracing.";
    recoveryDesc = "Funnels high baseline mental reserves. High sleep / me-time payoff required to balance adrenal activity.";
  } else if (typeLower === "class") {
    cognitive = Math.min(85, Math.max(40, 30 + duration * 0.2));
    physical = 25;
    recovery = 10;
    cognitiveDesc = "Active listening and group participation. Requires structured reading speed.";
    physicalDesc = "Light motor involvement (classroom transit, typing, active posture).";
    recoveryDesc = "Standard mental workload. Balanced social energy burn.";
  } else if (typeLower === "sport") {
    cognitive = 20;
    physical = Math.min(100, Math.max(60, 50 + duration * 0.5));
    recovery = Math.min(70, Math.max(20, 10 + duration * 0.4));
    cognitiveDesc = "High hand-eye coordination but resets cognitive strain. Enhances alpha-wave flow state.";
    physicalDesc = "Outstanding physical activation! Increases cardiovascular rate, metabolic burn, and physical stamina.";
    recoveryDesc = "Promotes massive biochemical recovery: spikes endorphins, resets mental logs, and primes better circadian sleep stages.";
  } else if (typeLower === "me_time") {
    cognitive = 10;
    physical = 10;
    recovery = Math.min(100, Math.max(60, 40 + Math.abs(energyImpact || 0) * 8));
    cognitiveDesc = "Mentally refreshing. Lowers stress and allows cognitive tracks to idle, restoring focus capacity.";
    physicalDesc = "Low physical efforts. Restores muscles and skeletal frame.";
    recoveryDesc = "Premium restorative block! Recharges bio-batteries, decreases cortisol index, and heals stress logs.";
  } else if (typeLower === "personal") {
    cognitive = 40;
    physical = 40;
    recovery = 25;
    cognitiveDesc = "Moderate daily-life organization and multi-tasking.";
    physicalDesc = "Active task (errands, domestic management, transport).";
    recoveryDesc = "Aids in reducing backlog stress, giving mild cognitive relief.";
  } else {
    cognitive = 30;
    physical = 30;
    recovery = 20;
    cognitiveDesc = "Standard cognitive engagement for routine daily administration.";
    physicalDesc = "Moderate body utility.";
    recoveryDesc = "Standard restorative or neutral impact.";
  }

  // Adjust by energyImpact factor
  const impact = Number(energyImpact);
  if (!isNaN(impact)) {
    if (impact > 0) {
      recovery = Math.min(100, recovery + (impact * 4));
      cognitive = Math.max(5, cognitive - (impact * 2));
    } else if (impact < 0) {
      cognitive = Math.min(100, cognitive + (Math.abs(impact) * 2));
      physical = Math.min(100, physical + (Math.abs(impact) * 1.5));
      recovery = Math.max(0, recovery - (Math.abs(impact) * 3));
    }
  }

  return {
    cognitive: Math.round(cognitive),
    physical: Math.round(physical),
    recovery: Math.round(recovery),
    cognitiveDesc,
    physicalDesc,
    recoveryDesc
  };
}

const FOCUS_OPTIONS = [
  { value: 15, label: "15m: Micro-Sprint", risk: "Low risk. Best for beating procrastination. Risk: May end right as you get into flow.", color: "text-emerald-400" },
  { value: 25, label: "25m: Classic Pomodoro", risk: "Balanced. Scientifically proven for focus. Risk: Can feel too short for complex coding or long essays.", color: "text-blue-400" },
  { value: 50, label: "50m: Deep Work Lite", risk: "High productivity. Best for hard subjects. Risk: High mental drain; skipping breaks will cause instant burnout.", color: "text-purple-400" },
  { value: 90, label: "90m: The Ultra-Focus", risk: "Peak mastery. For deep flow states. Risk: Extreme drain. Requires at least 20 mins recovery after.", color: "text-rose-400" },
];

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [energyType, setEnergyType] = useState("Balanced");
  const [currentTheme, setCurrentTheme] = useState<string>("dark");
  const [showEnergyExplainer, setShowEnergyExplainer] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [inlineAiLoading, setInlineAiLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isMobileDashboardOpen, setIsMobileDashboardOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isPurgeDialogOpen, setIsPurgeDialogOpen] = useState(false);
  const [tasksToPurgeIds, setTasksToPurgeIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [slideDirection, setSlideDirection] = useState(1);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [activeBiometricTab, setActiveBiometricTab] = useState<"cognitive" | "physical" | "recovery" | null>(null);

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // New Task Form
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [duration, setDuration] = useState("60");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reminderMinutes, setReminderMinutes] = useState("0");
  const [energyImpact, setEnergyImpact] = useState<number>(-1);
  const [description, setDescription] = useState("");

  const [pendingTask, setPendingTask] = useState<any>(null);
  const [rescheduleResponse, setRescheduleResponse] = useState<any>(null);

  // Admin State
  const [adminUsers, setAdminUsers] = useState<(UserProfile & { id: string })[]>([]);
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);
  const [adminSelectedUser, setAdminSelectedUser] = useState<(UserProfile & { id: string }) | null>(null);
  const [adminSelectedUserTasks, setAdminSelectedUserTasks] = useState<Task[]>([]);
  const [adminSelectedUserTasksLoading, setAdminSelectedUserTasksLoading] = useState(false);
  const [adminSelectedUserActivities, setAdminSelectedUserActivities] = useState<UserActivity[]>([]);
  const [adminSelectedUserActivitiesLoading, setAdminSelectedUserActivitiesLoading] = useState(false);
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [adminFilterRole, setAdminFilterRole] = useState("all");

  const [customType, setCustomType] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState<
    boolean | null
  >(null);
  const [preferences, setPreferences] = useState<any>({});

  // Onboarding Wizard State
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [newPrefs, setNewPrefs] = useState({
    sleepTime: "23:00",
    wakeTime: "07:00",
    meals: "3",
    sport: "1",
    role: "Student",
    credit_hours: 0,
    semester_end_date: "",
    health_condition: "Excellent",
    unavailable_times: "",
    preferred_free_time: "",
    commute_time: "30 mins",
    social_battery: "Medium",
    study_environment: "Quiet",
  });

  // Focus Mode State
  const [studyEnvironment, setStudyEnvironment] = useState("Personal");
  const [socialBatteryType, setSocialBatteryType] = useState<
    "options" | "custom"
  >("options");
  const [socialBatteryCustom, setSocialBatteryCustom] = useState("50");

  // Breakdown State
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  // Timetable & Event AI State
  const [timetableInput, setTimetableInput] = useState("");
  const [repeatWeeks, setRepeatWeeks] = useState("15");
  const [announcementInput, setAnnouncementInput] = useState("");
  const [timetableFile, setTimetableFile] = useState<File | null>(null);
  const [isTimetableLoading, setIsTimetableLoading] = useState(false);
  const [isEventLoading, setIsEventLoading] = useState(false);
  const [extractedEventData, setExtractedEventData] = useState<any>(null);
  const [repeatWeeksEvent, setRepeatWeeksEvent] = useState("1");

  // AI Problem Solver State
  const [problemInput, setProblemInput] = useState("");
  const [problemResponse, setProblemResponse] = useState("");
  const [isProblemLoading, setIsProblemLoading] = useState(false);
  const [selectedTaskIdForProblem, setSelectedTaskIdForProblem] =
    useState<string>("");
  const [selectedTaskDetails, setSelectedTaskDetails] = useState<Task | null>(
    null,
  );

  // Behavioral CI State
  const [isBehavioralLoading, setIsBehavioralLoading] = useState(false);
  const [behavioralResponse, setBehavioralResponse] = useState<any>(null);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"list" | "weekly">("weekly");
  const [calendarView, setCalendarView] = useState<"year" | "month" | "day">(
    "month",
  );
  const [calendarSearchQuery, setCalendarSearchQuery] = useState("");
  const [tasksHidden, setTasksHidden] = useState(false);
  const [taskCountMode, setTaskCountMode] = useState<"week" | "total">("week");

  // Metrics Calculations
  const metrics = useMemo(() => {
    const now = new Date();
    // Calculate based on the currently viewed week via weekOffset
    const weekStartCurrent = startOfWeek(addWeeks(now, weekOffset), {
      weekStartsOn: 1,
    });
    const weekEndCurrent = addDays(weekStartCurrent, 6);

    // Filter tasks for the selected week to calculate energy
    const weeklyTasksArray = tasks.filter((t) => {
      const d = parseISO(t.date);
      const weekEndCurrent = endOfWeek(weekStartCurrent, { weekStartsOn: 1 });
      return d >= weekStartCurrent && d <= weekEndCurrent;
    });

    const weeklyTasks = weeklyTasksArray.length;
    const totalTasks = tasks.length;

    // Weekly Energy Budget: Starts at a base dependent on health and load
    let baseEnergy = 100;

      // Adjusted by health condition
      if (userProfile?.health_condition === "Excellent") baseEnergy += 10;
      if (userProfile?.health_condition === "Fatigued") baseEnergy -= 20;
      if (userProfile?.health_condition === "Injured") baseEnergy -= 40;
      if (userProfile?.health_condition === "Low Energy") baseEnergy -= 15;
      if (userProfile?.health_condition === "Recovery") baseEnergy -= 25;

      let weeklyEnergyLeft = baseEnergy;
      weeklyTasksArray.forEach((t) => {
        // Enforce -1 energy impact for classes and assignments (especially imported ones)
        let impact = t.energyImpact;
        if (t.type === "class" || t.type === "assignment") {
          impact = -1;
        } else if (impact === undefined || impact === null || impact === 0) {
          impact = -1;
        }

        // Specific override for exams
        if (t.type === "exam") impact = -15;

        weeklyEnergyLeft += impact;
      });

    // Lifestyle bonuses from preferences
    try {
      if (userProfile?.preferences) {
        const p = JSON.parse(userProfile.preferences);
        const meals = parseInt(p.meals || "3");
        const sport = parseFloat(p.sport || "0");

        if (meals >= 3) weeklyEnergyLeft += 5;
        if (meals < 2) weeklyEnergyLeft -= 10;
        if (sport >= 1) weeklyEnergyLeft += 7;
        if (sport === 0) weeklyEnergyLeft -= 5;
      }
    } catch (e) {}

    // clamp to 0-100
    weeklyEnergyLeft = Math.max(0, Math.min(100, weeklyEnergyLeft));

    // Smart Stress Analysis Model (Rule-Based Neural-like weights)
    let stressScore = 0; // out of 100
    // Density (compactness)
    stressScore += Math.min(weeklyTasks * 4, 40); // up to 40 points from task count

    // Load stress
    stressScore += (userProfile?.credit_hours || 0) * 0.8;

    // Daily routine/sleep factor
    try {
      if (userProfile?.preferences) {
        const p = JSON.parse(userProfile.preferences);
        const sleep = p.sleepTime || "23:00";
        const wake = p.wakeTime || "07:00";
        // Calculate sleep hours roughly
        const sh = parseInt(sleep.split(":")[0]);
        const wh = parseInt(wake.split(":")[0]);
        let hours = wh - sh;
        if (hours < 0) hours += 24;
        if (hours < 6)
          stressScore += 25; // High penalty for low sleep
        else if (hours < 7) stressScore += 10;
        else if (hours > 9) stressScore += 5; // Slight penalty for oversleeping

        const meals = parseInt(p.meals || "3");
        if (meals < 2) stressScore += 10;
      }
    } catch (e) {}

    // Health hit to stress
    if (userProfile?.health_condition === "Fatigued") stressScore += 15;
    if (
      userProfile?.health_condition === "Injured" ||
      userProfile?.health_condition === "Recovery"
    )
      stressScore += 20;
    if (userProfile?.health_condition === "ADHD") stressScore += 10;

    // Energy left factor
    if (weeklyEnergyLeft < 20) stressScore += 30;
    else if (weeklyEnergyLeft < 50) stressScore += 15;

    // Energy type alignment (Morning bird working late = stress)
    // Simplified: check if they have tasks outside preferred bounds
    let outOfBoundsTasks = 0;
    weeklyTasksArray.forEach((t) => {
      const h = parseISO(t.date).getHours();
      if (userProfile?.energy_type === "Morning Bird" && h >= 18)
        outOfBoundsTasks++;
      if (userProfile?.energy_type === "Night Owl" && h < 10)
        outOfBoundsTasks++;
    });
    stressScore += Math.min(outOfBoundsTasks * 5, 20);

    // Clamp
    stressScore = Math.max(0, Math.min(100, stressScore));

    let stress = "Calm";
    let stressColor = "text-emerald-400";
    if (stressScore > 80) {
      stress = "Extreme";
      stressColor = "text-rose-400";
    } else if (stressScore > 60) {
      stress = "High";
      stressColor = "text-orange-400";
    } else if (stressScore > 30) {
      stress = "Moderate";
      stressColor = "text-purple-400";
    }

    // Energy Level heuristic based on current hour and profile (for right now)
    const hour = now.getHours();
    let energy = "Moderate";
    let energyColor = "text-purple-400";

    if (userProfile?.energy_type === "Morning Bird") {
      if (hour >= 6 && hour < 12) {
        energy = "Peak";
        energyColor = "text-emerald-400";
      } else if (hour >= 20 || hour < 6) {
        energy = "Low";
        energyColor = "text-rose-400";
      }
    } else if (userProfile?.energy_type === "Night Owl") {
      if (hour >= 18 || hour < 2) {
        energy = "Peak";
        energyColor = "text-emerald-400";
      } else if (hour >= 6 && hour < 12) {
        energy = "Low";
        energyColor = "text-rose-400";
      }
    } else {
      if (hour >= 9 && hour < 17) {
        energy = "Peak";
        energyColor = "text-emerald-400";
      } else if (hour >= 22 || hour < 7) {
        energy = "Low";
        energyColor = "text-rose-400";
      }
    }

    // Quick Insight Generation logic (updates instantly)
    let quickInsight =
      "Your schedule looks balanced. Keep up the consistent pace!";
    if (weeklyEnergyLeft < 30) {
      quickInsight =
        "Energy levels critically low. Prioritize rest and delegate non-essential tasks immediately.";
    } else if (outOfBoundsTasks > 2) {
      quickInsight = `Detected ${outOfBoundsTasks} tasks conflicting with your ${userProfile?.energy_type} profile. Try shifting them to your peak hours.`;
    } else if (stressScore > 70) {
      quickInsight =
        "High stress detected. Use 'Break Down' on large tasks to manage the cognitive load.";
    } else if (weeklyTasks > 10 && weeklyEnergyLeft > 70) {
      quickInsight =
        "High productivity week! You have enough energy for deep focus sessions.";
    }

    return {
      weeklyTasks,
      totalTasks,
      stress,
      stressColor,
      stressScore,
      energy,
      energyColor,
      weeklyEnergyLeft,
      quickInsight,
    };
  }, [tasks, userProfile, weekOffset]);

  const injectThemeCss = useMemo(() => {
    return getThemeCss(currentTheme, metrics.energy);
  }, [currentTheme, metrics.energy]);

  // Custom setter for Date selection that formats it to current date input
  const handleDateSelect = (newDate: Date | undefined) => {
    setSelectedDate(newDate);
    if (newDate) {
      setDate(format(newDate, "yyyy-MM-dd"));
      setTasksHidden(false);

      // Calculate week offset between selected date and today's week
      const offset = differenceInWeeks(
        startOfWeek(newDate, { weekStartsOn: 1 }),
        startOfWeek(new Date(), { weekStartsOn: 1 }),
      );
      setWeekOffset(offset);
    } else {
      setDate("");
    }
  };

  const handleShowAllTasks = () => {
    setSelectedDate(undefined);
    setTasksHidden(false);
    toast.info("Showing all tasks");
  };

  const toggleTasksVisibility = () => {
    setTasksHidden((prev) => !prev);
  };

  useEffect(() => {
    if (selectedDate) setDate(format(selectedDate, "yyyy-MM-dd"));
  }, []);

  useEffect(() => {
    getUserProfile().then((profile) => {
      if (profile) {
        setUserProfile(profile);
        setEnergyType(profile.energy_type);
        if (profile.theme) {
          setCurrentTheme(profile.theme);
        }
        setOnboardingCompleted(profile.onboardingCompleted);
        try {
          setPreferences(JSON.parse(profile.preferences || "{}"));
        } catch (e) {}
      }
      setProfileLoading(false);
    });

    const unsubscribe = subscribeToTasks(async (fetchedTasks) => {
      setTasks(fetchedTasks);
    });

    return () => {
      unsubscribe.then((unsub) => unsub());
    };
  }, []);

  const aggregateStats = useMemo(() => {
    if (!adminUsers || !adminUsers.length) return { energy: {}, mbti: {}, study: {}, majors: {} };
    const energy: Record<string, number> = {};
    const mbti: Record<string, number> = {};
    const study: Record<string, number> = {};
    const majors: Record<string, number> = {};

    adminUsers.forEach((u) => {
      const e = u.energy_type || "Balanced";
      energy[e] = (energy[e] || 0) + 1;

      const m = u.mbti || "Unknown";
      mbti[m] = (mbti[m] || 0) + 1;

      const s = u.assignment_habits || "Standard";
      study[s] = (study[s] || 0) + 1;

      const maj = u.major || "Undecided";
      majors[maj] = (majors[maj] || 0) + 1;
    });

    return { energy, mbti, study, majors };
  }, [adminUsers]);

  const isUserAdmin = userProfile?.role === "Admin" || auth.currentUser?.email === "adamhaziq1224@gmail.com";

  // Load all users for admin
  const loadAdminUsers = async () => {
    if (!isUserAdmin) return;
    setAdminUsersLoading(true);
    try {
      const allUsers = await getAllUsers();
      setAdminUsers(allUsers);
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to fetch user list for admin: " + e.message);
    } finally {
      setAdminUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "admin" && isUserAdmin) {
      loadAdminUsers();
    }
  }, [activeTab, isUserAdmin]);

  // Load tasks and activities for a selected user
  const loadSelectedUserTasks = async (userId: string) => {
    setAdminSelectedUserTasksLoading(true);
    try {
      const userTasks = await getUserTasks(userId);
      setAdminSelectedUserTasks(userTasks);
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to load user tasks: " + e.message);
    } finally {
      setAdminSelectedUserTasksLoading(false);
    }
  };

  const loadSelectedUserActivities = async (userId: string) => {
    setAdminSelectedUserActivitiesLoading(true);
    try {
      const activities = await getUserActivities(userId);
      setAdminSelectedUserActivities(activities);
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to load user activities: " + e.message);
    } finally {
      setAdminSelectedUserActivitiesLoading(false);
    }
  };

  useEffect(() => {
    if (adminSelectedUser) {
      loadSelectedUserTasks(adminSelectedUser.id);
      loadSelectedUserActivities(adminSelectedUser.id);
    } else {
      setAdminSelectedUserTasks([]);
      setAdminSelectedUserActivities([]);
    }
  }, [adminSelectedUser]);

  const handleAdminUpdateTaskStatus = async (userId: string, taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "completed" ? "pending" : "completed";
    try {
      await adminUpdateStudentTask(userId, taskId, { status: nextStatus });
      toast.success(`Marked task status of student as ${nextStatus}`);
      setAdminSelectedUserTasks(prev =>
        prev.map(t => t.id === taskId ? { ...t, status: nextStatus } : t)
      );
      loadSelectedUserActivities(userId);
    } catch (e: any) {
      toast.error("Admin override failed: " + e.message);
    }
  };

  const handleAdminDeleteTask = async (userId: string, taskId: string) => {
    if (!userId || !taskId) return;
    try {
      await adminDeleteStudentTask(userId, taskId);
      toast.success("Student task audited & deleted");
      setAdminSelectedUserTasks(prev => prev.filter(t => t.id !== taskId));
      loadSelectedUserActivities(userId);
    } catch (e: any) {
      toast.error("Admin override failed: " + e.message);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await adminUpdateUser(userId, { role: newRole });
      toast.success(`Updated role to ${newRole}`);
      // Refresh the local users list
      setAdminUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      if (adminSelectedUser?.id === userId) {
        setAdminSelectedUser((prev) => (prev ? { ...prev, role: newRole } : null));
      }
    } catch (e: any) {
      toast.error("Failed to update user role: " + e.message);
    }
  };

  // Focus timer effect removed

  // Task Reminders Effect
  const notifiedTasks = useRef(new Set<string>());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      tasks.forEach((task) => {
        if (
          task.status === "completed" ||
          !task.reminderMinutes ||
          task.reminderMinutes === 0
        )
          return;
        if (notifiedTasks.current.has(task.id!)) return;

        const taskDate = new Date(task.date);
        const reminderTime = new Date(
          taskDate.getTime() - task.reminderMinutes * 60000,
        );

        // If current time is past reminder time but not past task start time
        if (now >= reminderTime && now < taskDate) {
          toast(`Reminder: ${task.title}`, {
            description: `Starts in ${task.reminderMinutes} minutes`,
            icon: <Bell className="h-4 w-4 text-indigo-400" />,
            duration: 10000,
          });
          notifiedTasks.current.add(task.id!);

          // Play a small sound if enabled
          const soundUrls: any = {
            success:
              "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=success-1-6297.mp3",
            chime:
              "https://cdn.pixabay.com/download/audio/2022/03/10/audio_f5e610d321.mp3?filename=chime-notice-101157.mp3",
            bell: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c350866657.mp3?filename=bell-notification-99378.mp3",
          };
          const audio = new Audio(
            soundUrls[preferences.focusSound] || soundUrls.chime,
          );
          audio.play().catch((e) => console.error(e));
        }
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [tasks, preferences]);

  const handleEnergyChange = async (val: string) => {
    setEnergyType(val);
    await updateUserProfile({ energy_type: val });
    toast.success("Energy profile updated");
  };

  const finishOnboarding = async () => {
    setOnboardingCompleted(true);
    const finalPrefs = {
      sleepTime: newPrefs.sleepTime,
      wakeTime: newPrefs.wakeTime,
      meals: newPrefs.meals,
      sport: newPrefs.sport,
    };
    const profileUpdates = {
      onboardingCompleted: true,
      energy_type: energyType,
      role: newPrefs.role,
      credit_hours: newPrefs.credit_hours,
      semester_end_date: newPrefs.semester_end_date,
      health_condition: newPrefs.health_condition,
      unavailable_times: newPrefs.unavailable_times,
      preferred_free_time: newPrefs.preferred_free_time,
      commute_time: newPrefs.commute_time,
      social_battery: newPrefs.social_battery,
      study_environment: newPrefs.study_environment,
      preferences: JSON.stringify(finalPrefs),
    };
    await updateUserProfile(profileUpdates);
    setUserProfile({ ...userProfile, ...profileUpdates });
    setPreferences(finalPrefs);
    toast.success("Welcome aboard!");
  };

  const handleSusunAnalysis = async () => {
    const finalType = type === "custom" ? customType : type;
    if (!title || !finalType || !duration || !date || !time) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsAiLoading(true);
    setAiResponse("");

    const datetime = new Date(`${date}T${time}`).toISOString();
    const newTaskObj = {
      title,
      type: finalType,
      duration: parseInt(duration),
      date: datetime,
      status: "pending",
      description,
      reminderMinutes: parseInt(reminderMinutes),
      energyImpact: energyImpact,
    };

    try {
      const resp = await askSusunEnergy(userProfile, tasks, newTaskObj);
      setAiResponse(resp);
      setPendingTask(newTaskObj);
      await logUserActivity("AI Consultation", `Asked Gemini to evaluate schedule alignment for study block: "${title}" (${duration} mins)`);
    } catch (e: any) {
      toast.error("AI Analysis failed: " + e.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const confirmAddTask = async () => {
    let taskToSave = pendingTask;

    if (!taskToSave) {
      const finalType = type === "custom" ? customType : type;
      if (!title || !finalType || !duration || !date || !time) {
        toast.error("Please fill in all fields");
        return;
      }

      const datetime = new Date(`${date}T${time}`).toISOString();
      taskToSave = {
        title,
        type: finalType,
        duration: parseInt(duration),
        date: datetime,
        status: "pending",
        description,
        reminderMinutes: parseInt(reminderMinutes),
        energyImpact: energyImpact,
      };
    }

    try {
      await addTask(taskToSave);
      toast.success("Task added successfully!");
      resetForm();
    } catch (e: any) {
      toast.error("Failed to add task: " + e.message);
    }
  };

  const resetForm = () => {
    setIsAddDialogOpen(false);
    setTitle("");
    setType("");
    setCustomType("");
    setDuration("60");
    setDate(selectedDate ? format(selectedDate, "yyyy-MM-dd") : "");
    setTime("");
    setReminderMinutes("0");
    setEnergyImpact(-1);
    setDescription("");
    setAiResponse("");
    setPendingTask(null);
  };

  const toggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    try {
      await updateTaskStatus(task.id!, newStatus);
    } catch (e: any) {
      toast.error("Failed to change status: " + e.message);
    }
  };

  const handleBreakDownTask = async (task: Task) => {
    if (!task.id) return;
    setIsBreakingDown(true);
    const toastId = toast.loading(
      `SusunAi is breaking down "${task.title}"...`,
    );

    try {
      const subTasks = await breakDownTask(task.title, task.duration);
      if (subTasks && subTasks.length > 0) {
        // Delete original
        await deleteTask(task.id);

        // Add new sub-tasks
        const originalDate = new Date(task.date);
        let currentOffset = 0;

        for (const st of subTasks) {
          const subTaskDate = new Date(
            originalDate.getTime() + currentOffset * 60000,
          );
          await addTask({
            title: st.title,
            type: task.type,
            duration: st.duration,
            date: subTaskDate.toISOString(),
            status: "pending",
            energyImpact: Math.floor(
              (task.energyImpact || -8) / subTasks.length,
            ),
            description: `Sub-task for: ${task.title}`,
          });
          currentOffset += st.duration + 5; // 5 min gap between subtasks
        }

        toast.success(
          `"${task.title}" has been broken down into ${subTasks.length} sub-tasks!`,
          { id: toastId },
        );
        setSelectedTaskDetails(null);
      } else {
        toast.error("SusunAi couldn't break down this task. Try again later.", {
          id: toastId,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to break down task.", { id: toastId });
    } finally {
      setIsBreakingDown(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      toast.success("Task removed");
    } catch (e: any) {
      toast.error("Failed to delete task: " + e.message);
    }
  };

  const handleAutoReschedule = async () => {
    switchTab("ai");
    setRescheduleResponse(null);
    setIsAiLoading(true);
    try {
      const resp = await autoRescheduleSusun(userProfile, tasks);
      try {
        setRescheduleResponse(JSON.parse(resp));
      } catch {
        setRescheduleResponse({
          summary: "Failed to parse AI output.",
          score: 0,
          actionable_insights: [],
        });
      }
    } catch (e: any) {
      toast.error("Failed AI: " + e.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleInlineAudit = async () => {
    setInlineAiLoading(true);
    try {
      const resp = await autoRescheduleSusun(userProfile, tasks);
      try {
        const parsed = JSON.parse(resp);
        setRescheduleResponse(parsed);
        toast.success("AI Diagnostics run successfully!");
      } catch {
        const fallback = {
          summary: "AI diagnostics run completed. Check insights below.",
          score: 75,
          actionable_insights: [],
        };
        setRescheduleResponse(fallback);
        toast.info("Completed AI Diagnostics analysis.");
      }
    } catch (e: any) {
      toast.error("Audit error: " + e.message);
    } finally {
      setInlineAiLoading(false);
    }
  };

  const handlePurgeWeek = async () => {
    console.log("Purge Week triggered. Offset:", weekOffset);
    const now = new Date();
    const weekStartCurrent = startOfWeek(addWeeks(now, weekOffset), {
      weekStartsOn: 1,
    });
    const weekEndCurrent = endOfWeek(weekStartCurrent, { weekStartsOn: 1 });

    console.log("Purge range:", weekStartCurrent.toISOString(), "to", weekEndCurrent.toISOString());
    console.log("Total tasks available:", tasks.length);

    const filtered = tasks.filter((t) => {
      try {
        const d = parseISO(t.date);
        return d >= weekStartCurrent && d <= weekEndCurrent;
      } catch (e) {
        return false;
      }
    });

    console.log("Tasks found in range:", filtered.length);

    if (filtered.length === 0) {
      toast.error(`No tasks found for ${weekOffset === 0 ? "this week" : "the selected week"} to purge.`);
      return;
    }

    const ids = filtered.map(t => t.id).filter((id): id is string => !!id);
    setTasksToPurgeIds(ids);
    setIsPurgeDialogOpen(true);
  };

  const confirmPurgeWeek = async () => {
    setIsPurgeDialogOpen(false);
    
    if (tasksToPurgeIds.length === 0) return;

    try {
      setIsAiLoading(true);
      await deleteTasks(tasksToPurgeIds);
      toast.success(`Successfully purged ${tasksToPurgeIds.length} items from this week.`);
      setTasksToPurgeIds([]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to purge week. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleBehavioralDiagnostics = async () => {
    if (!userProfile) {
      toast.error("Profile not loaded");
      return;
    }
    setIsBehavioralLoading(true);
    try {
      const response = await solveBehavioralCI(userProfile, tasks);
      setBehavioralResponse(response);
      toast.success("Behavioral CI Analysis Complete");
    } catch (err: any) {
      toast.error("Failed behavioral analysis: " + err.message);
    } finally {
      setIsBehavioralLoading(false);
    }
  };

  const handleBreakdown = async (task: Task) => {
    setIsBreakingDown(true);
    try {
      const subTasks = await breakDownTask(task.title, task.duration);
      if (subTasks && subTasks.length > 0) {
        // Delete original task
        await deleteTask(task.id!);

        let currentDateStr = task.date;
        for (let st of subTasks) {
          await addTask({
            title: st.title,
            type: task.type,
            duration: st.duration,
            date: currentDateStr,
            status: "pending",
            energyImpact: Math.floor(
              (task.energyImpact || -8) / subTasks.length,
            ),
            description: `Part of: ${task.title}`,
          });
        }
        toast.success(
          `Broke down "${task.title}" into ${subTasks.length} sub-tasks!`,
        );
      } else {
        toast.error("Could not break down task.");
      }
    } catch (e: any) {
      toast.error("Failed to break down: " + e.message);
    } finally {
      setIsBreakingDown(false);
    }
  };

  const handleSolveProblem = async () => {
    if (!problemInput.trim()) return;
    const task = tasks.find((t) => t.id === selectedTaskIdForProblem);
    setIsProblemLoading(true);
    setProblemResponse("");
    try {
      const resp = await solveTaskProblem(
        task || { title: "General Request" },
        problemInput,
      );
      setProblemResponse(resp);
    } catch (e: any) {
      toast.error("AI Error: " + e.message);
    } finally {
      setIsProblemLoading(false);
    }
  };

  const handleImportTimetable = async () => {
    if (!timetableInput.trim() && !timetableFile) {
      return toast.error("Please enter timetable text or upload a PDF");
    }
    setIsTimetableLoading(true);
    try {
      let pdfData = undefined;
      if (timetableFile) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve((reader.result as string).split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(timetableFile);
        });
        pdfData = { data: base64, mimeType: timetableFile.type };
      }

      const parsed = await parseTimetable(timetableInput, pdfData);
      if (parsed && Array.isArray(parsed) && parsed.length > 0) {
        const weeksCount = parseInt(repeatWeeks.toString()) || 1;
        const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
        const allTasks: any[] = [];

        for (let i = 0; i < weeksCount; i++) {
          const baseDate = addWeeks(startDate, i);
          for (let item of parsed) {
            const dayMap: any = {
              monday: 0, mon: 0,
              tuesday: 1, tue: 1,
              wednesday: 2, wed: 2,
              thursday: 3, thu: 3,
              friday: 4, fri: 4,
              saturday: 5, sat: 5,
              sunday: 6, sun: 6
            };
            const dayKey = (item.day || item.Day || "").toLowerCase();
            const dayOffset = dayMap[dayKey] ?? 0;
            const itemDate = addDays(baseDate, dayOffset);
            
            const timeStr = (item.time || item.startTime || "09:00").replace(".", ":");
            const timeParts = timeStr.split(":");
            const hVal = parseInt(timeParts[0]);
            const mVal = parseInt(timeParts[1]);
            const hours = isNaN(hVal) ? 9 : hVal;
            const minutes = isNaN(mVal) ? 0 : mVal;
            
            itemDate.setHours(hours, minutes, 0, 0);

            allTasks.push({
              title: item.title || item.course_name || "New Class",
              type: "class",
              duration: parseInt(item.duration) || 60,
              date: itemDate.toISOString(),
              status: "pending",
              energyImpact: -1, // Only 1 energy for each task from import table
              description: item.description || item.venue || "",
            });
          }
        }
        
        // Execute batch update
        await addTasks(allTasks);
        
        toast.success(`Imported ${allTasks.length} sessions for ${weeksCount} weeks!`);
        setTimetableInput("");
        setTimetableFile(null);
      } else {
        toast.error("Failed to parse timetable. Try simpler text.");
      }
    } catch (e: any) {
      toast.error("AI Import Error: " + e.message);
    } finally {
      setIsTimetableLoading(false);
    }
  };

  const handleExtractEventAI = async () => {
    if (!announcementInput.trim()) return;
    setIsEventLoading(true);
    try {
      const parsed = await extractEvent(announcementInput);
      if (parsed && parsed.title) {
        setExtractedEventData(parsed);
      } else {
        toast.error(
          "Could not find event details. Try providing more context.",
        );
      }
    } catch (e: any) {
      toast.error("AI Extraction Error: " + e.message);
    } finally {
      setIsEventLoading(false);
    }
  };

  const confirmExtractedEvent = async () => {
    if (!extractedEventData) return;
    try {
      let baseDate: Date;
      if (extractedEventData.date && extractedEventData.date.includes("-")) {
        const [y, m, d] = extractedEventData.date.split("-").map((x: string) => parseInt(x));
        baseDate = new Date(y, m - 1, d);
      } else {
        baseDate = new Date();
      }

      const timeStr = (extractedEventData.time || "09:00").replace(".", ":");
      const tParts = timeStr.split(":");
      const hVal = parseInt(tParts[0]);
      const mVal = parseInt(tParts[1]);
      baseDate.setHours(isNaN(hVal) ? 9 : hVal, isNaN(mVal) ? 0 : mVal, 0, 0);

      const repeatCount = parseInt(repeatWeeksEvent) || 1;
      const eventTasks: any[] = [];

      for (let i = 0; i < repeatCount; i++) {
        const targetDate = addWeeks(baseDate, i);
        eventTasks.push({
          title: extractedEventData.title,
          type: "personal",
          duration: parseInt(extractedEventData.duration) || 60,
          date: targetDate.toISOString(),
          status: "pending",
          energyImpact: -1,
          description: extractedEventData.description || "",
        });
      }

      await addTasks(eventTasks);

      toast.success(repeatCount > 1 ? `Event added for ${repeatCount} weeks!` : "Event added to calendar!");
      setExtractedEventData(null);
      setAnnouncementInput("");
      setRepeatWeeksEvent("1");
    } catch (e: any) {
      toast.error("Failed to add event: " + e.message);
    }
  };

  const switchTab = (tab: Tab) => {
    const tabs = ["dashboard", "calendar", "ai", "profile", "admin", "ecosystem"];
    const currentIdx = tabs.indexOf(activeTab);
    const newIdx = tabs.indexOf(tab);
    setSlideDirection(newIdx > currentIdx ? 1 : -1);
    setActiveTab(tab);
  };

  const slideVariants = {
    initial: (direction: number) => ({
      x: direction > 0 ? 16 : -16,
      scale: 0.985,
      opacity: 0,
      filter: "blur(4px)",
    }),
    animate: {
      x: 0,
      scale: 1,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        x: { type: "spring", stiffness: 350, damping: 35, mass: 0.8 },
        scale: { type: "spring", stiffness: 280, damping: 30, mass: 0.8 },
        opacity: { duration: 0.22, ease: "easeOut" },
        filter: { duration: 0.25, ease: "easeOut" },
      },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -16 : 16,
      scale: 0.985,
      opacity: 0,
      filter: "blur(4px)",
      transition: {
        x: { type: "spring", stiffness: 350, damping: 35 },
        scale: { type: "spring", stiffness: 280, damping: 30 },
        opacity: { duration: 0.18, ease: "easeIn" },
        filter: { duration: 0.18, ease: "easeIn" },
      },
    }),
  };

  const filteredTasks = tasks.filter((task) => {
    if (!selectedDate) return true;
    return isSameDay(parseISO(task.date), selectedDate);
  });

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-zinc-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl border-2 border-zinc-800 border-t-purple-500 animate-spin" />
          <span className="text-xs font-medium tracking-widest text-zinc-500 uppercase animate-pulse">Running profile check...</span>
        </div>
      </div>
    );
  }

  if (onboardingCompleted === false) {
    return (
      <div className="min-h-screen bg-[#09090b] font-sans text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-500/15 via-fuchsia-500/10 to-indigo-505/5 blur-[100px] rounded-full -mr-48 -mt-48 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/10 via-cyan-500/5 to-purple-500/5 blur-[100px] rounded-full -ml-48 -mb-48 pointer-events-none" />

        <Card className="w-full max-w-xl bg-[#0e0d12]/90 backdrop-blur-xl border border-zinc-800/80 shadow-2xl rounded-3xl overflow-hidden relative z-10 p-2 shadow-purple-500/5">
          <div className="absolute top-0 left-0 w-full h-1 bg-zinc-950">
            <div
              className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 transition-all duration-300 shadow-[0_0_8px_theme(colors.purple.500)]"
              style={{ width: `${(onboardingStep / 4) * 100}%` }}
            />
          </div>

          <CardHeader className="text-center pt-8 pb-4">
            <div className="relative mx-auto w-14 h-14 group/logo mb-4">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 rounded-2xl blur-md opacity-60 pointer-events-none animate-pulse" style={{ animationDuration: "5s" }} />
              <div className="relative w-14 h-14 bg-zinc-950 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">
                  S
                </span>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none rounded-2xl" />
              </div>
            </div>
            <CardTitle className="text-2xl font-black tracking-tight text-white mb-1">
              Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-fuchsia-250">Susun</span><span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 font-extrabold animate-pulse">Ai</span>
            </CardTitle>
            <CardDescription className="text-zinc-500 text-sm uppercase font-bold tracking-wider">
              Let's personalize your scheduling engine.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <AnimatePresence mode="wait">
              {onboardingStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white">
                      1. Daily Routine
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-300">Sleep Time</Label>
                        <Input
                          type="time"
                          value={newPrefs.sleepTime}
                          onChange={(e) =>
                            setNewPrefs({
                              ...newPrefs,
                              sleepTime: e.target.value,
                            })
                          }
                          className="bg-black/20 border-white/10 text-white focus-visible:ring-indigo-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">Wake Time</Label>
                        <Input
                          type="time"
                          value={newPrefs.wakeTime}
                          onChange={(e) =>
                            setNewPrefs({
                              ...newPrefs,
                              wakeTime: e.target.value,
                            })
                          }
                          className="bg-black/20 border-white/10 text-white focus-visible:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-300">Meals per day</Label>
                        <Input
                          type="number"
                          min="1"
                          max="6"
                          value={newPrefs.meals}
                          onChange={(e) =>
                            setNewPrefs({ ...newPrefs, meals: e.target.value })
                          }
                          className="bg-black/20 border-white/10 text-white focus-visible:ring-indigo-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">
                          Daily Sport (hours)
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          max="6"
                          step="0.5"
                          value={newPrefs.sport}
                          onChange={(e) =>
                            setNewPrefs({ ...newPrefs, sport: e.target.value })
                          }
                          className="bg-black/20 border-white/10 text-white focus-visible:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => setOnboardingStep(2)}
                    className="w-full h-12 bg-purple-500 hover:bg-purple-600 text-white font-black rounded-xl text-lg shadow-lg shadow-purple-500/10 mt-4 cursor-pointer"
                  >
                    Continue
                  </Button>
                </motion.div>
              )}

              {onboardingStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white">
                      2. Your Energy Profile
                    </h3>
                    <p className="text-sm text-slate-400">
                      When do you feel most productive and focused for class or
                      programs?
                    </p>
                    <div className="grid gap-3">
                      {[
                        {
                          id: "Morning Bird",
                          title: "🌅 Morning Bird",
                          desc: "Peak focus from 6 AM to 12 PM",
                        },
                        {
                          id: "Balanced",
                          title: "⚖️ Balanced",
                          desc: "Steady energy, standard 9 to 5",
                        },
                        {
                          id: "Night Owl",
                          title: "🦉 Night Owl",
                          desc: "Deep work happens after sunset",
                        },
                      ].map((p) => (
                        <div
                          key={p.id}
                          onClick={() => setEnergyType(p.id)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${energyType === p.id ? "bg-purple-500/20 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]" : "bg-black/20 border-white/10 text-slate-300 hover:bg-white/5"}`}
                        >
                          <div className="font-bold text-lg">{p.title}</div>
                          <div className="text-sm text-slate-400 mt-1">
                            {p.desc}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setOnboardingStep(1)}
                      className="flex-1 h-12 bg-transparent border-white/20 text-white hover:bg-white/10"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setOnboardingStep(3)}
                      className="flex-[2] h-12 bg-purple-500 hover:bg-purple-600 text-white font-black rounded-xl text-lg shadow-lg shadow-purple-500/10"
                    >
                      Continue
                    </Button>
                  </div>
                </motion.div>
              )}

              {onboardingStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 flex flex-col items-center py-6 text-center"
                >
                  <div className="w-full text-left space-y-4">
                    <h3 className="text-xl font-bold text-white">
                      3. Role & Load
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-300">Role</Label>
                        <Select
                          value={newPrefs.role}
                          onValueChange={(val) =>
                            setNewPrefs({ ...newPrefs, role: val })
                          }
                        >
                          <SelectTrigger className="bg-black/20 border-white/10 text-white">
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#16213e] border border-white/10 text-white">
                            <SelectItem value="Student">Student</SelectItem>
                            <SelectItem value="Professional">
                              Professional
                            </SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">
                          Credit Hours / Load
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          value={newPrefs.credit_hours}
                          onChange={(e) =>
                            setNewPrefs({
                              ...newPrefs,
                              credit_hours: Number(e.target.value),
                            })
                          }
                          className="bg-black/20 border-white/10 text-white focus-visible:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-300">
                          Semester End / Deadline
                        </Label>
                        <Input
                          type="date"
                          value={newPrefs.semester_end_date}
                          onChange={(e) =>
                            setNewPrefs({
                              ...newPrefs,
                              semester_end_date: e.target.value,
                            })
                          }
                          className="bg-black/20 border-white/10 text-white focus-visible:ring-indigo-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">
                          Health Condition
                        </Label>
                        <Select
                          value={newPrefs.health_condition}
                          onValueChange={(val) =>
                            setNewPrefs({ ...newPrefs, health_condition: val })
                          }
                        >
                          <SelectTrigger className="bg-black/20 border-white/10 text-white">
                            <SelectValue placeholder="Health" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#16213e] border border-white/10 text-white">
                            <SelectItem value="Excellent">Excellent</SelectItem>
                            <SelectItem value="Average">Average</SelectItem>
                            <SelectItem value="Fatigued">
                              Fatigued / Burnout Risk
                            </SelectItem>
                            <SelectItem value="Injured">
                              Injured / Recovering
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-300">
                          Daily Commute Time
                        </Label>
                        <Input
                          type="text"
                          placeholder="e.g. 1 hour, 30 mins"
                          value={newPrefs.commute_time}
                          onChange={(e) =>
                            setNewPrefs({
                              ...newPrefs,
                              commute_time: e.target.value,
                            })
                          }
                          className="bg-black/20 border-white/10 text-white focus-visible:ring-indigo-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-slate-300">
                            Social Battery
                          </Label>
                          <button
                            type="button"
                            className="text-[10px] text-purple-400 font-bold uppercase hover:underline"
                            onClick={() =>
                              setSocialBatteryType((prev) =>
                                prev === "options" ? "custom" : "options",
                              )
                            }
                          >
                            {socialBatteryType === "options"
                              ? "Use %"
                              : "Use Options"}
                          </button>
                        </div>
                        {socialBatteryType === "options" ? (
                          <Select
                            value={newPrefs.social_battery}
                            onValueChange={(val) =>
                              setNewPrefs({ ...newPrefs, social_battery: val })
                            }
                          >
                            <SelectTrigger className="bg-black/20 border-white/10 text-white">
                              <SelectValue placeholder="Capacity" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 border border-zinc-900 text-white">
                              <SelectItem value="Low">
                                Low (Introvert)
                              </SelectItem>
                              <SelectItem value="Medium">
                                Medium (Ambivert)
                              </SelectItem>
                              <SelectItem value="High">
                                High (Extrovert)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="%"
                              value={
                                parseInt(newPrefs.social_battery) ||
                                socialBatteryCustom
                              }
                              onChange={(e) => {
                                setSocialBatteryCustom(e.target.value);
                                setNewPrefs({
                                  ...newPrefs,
                                  social_battery: e.target.value + "%",
                                });
                              }}
                              className="bg-black/20 border-white/10 text-white focus-visible:ring-purple-500 w-24"
                            />
                            <span className="text-slate-500 flex items-center text-xs">
                              Custom logic threshold
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">
                        Preferred Study/Work Environment
                      </Label>
                      <Select
                        value={newPrefs.study_environment}
                        onValueChange={(val) =>
                          setNewPrefs({ ...newPrefs, study_environment: val })
                        }
                      >
                        <SelectTrigger className="bg-black/20 border-white/10 text-white">
                          <SelectValue placeholder="Environment" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border border-zinc-900 text-white">
                          <SelectItem value="Personal">
                            Personal Room / Home
                          </SelectItem>
                          <SelectItem value="Indoor">
                            Indoor (Library, Cafe)
                          </SelectItem>
                          <SelectItem value="Outdoor">
                            Outdoor / Nature
                          </SelectItem>
                          <SelectItem value="Else">Else (Anywhere)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">
                        Preferred Free Time / Unavailable Times
                      </Label>
                      <Input
                        type="text"
                        placeholder="e.g. Fridays after 6 PM, Sunday mornings"
                        value={newPrefs.preferred_free_time}
                        onChange={(e) =>
                          setNewPrefs({
                            ...newPrefs,
                            preferred_free_time: e.target.value,
                          })
                        }
                        className="bg-black/20 border-white/10 text-white focus-visible:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="w-full flex gap-3 pt-6">
                    <Button
                      variant="outline"
                      onClick={() => setOnboardingStep(2)}
                      className="flex-1 h-14 bg-transparent border-white/20 text-white hover:bg-white/10 rounded-xl"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setOnboardingStep(4)}
                      className="flex-[2] h-14 bg-purple-500 hover:bg-purple-600 text-white font-black rounded-xl text-lg shadow-xl shadow-purple-500/10"
                    >
                      Continue
                    </Button>
                  </div>
                </motion.div>
              )}

              {onboardingStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 flex flex-col items-center py-6 text-center"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-400 via-fuchsia-300 to-indigo-500 rounded-full flex items-center justify-center mb-4 shadow-xl shadow-purple-500/20 animate-pulse">
                    <Sparkles className="w-12 h-12 text-zinc-950" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    You're all set!
                  </h3>
                  <p className="text-slate-400 max-w-sm">
                    We've personalized SusunAi for your lifestyle. Now, start
                    adding your tasks, studying, programs, and classes – let the
                    engine organize it for you.
                  </p>

                  <div className="w-full flex gap-3 pt-6">
                    <Button
                      variant="outline"
                      onClick={() => setOnboardingStep(3)}
                      className="flex-1 h-14 bg-transparent border-white/20 text-white hover:bg-white/10 rounded-xl"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={finishOnboarding}
                      className="flex-[2] h-14 bg-purple-500 text-white hover:bg-purple-600 font-extrabold rounded-xl text-lg shadow-xl shadow-purple-500/10"
                    >
                      Get Started
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    );
  }

  const weekStart = startOfWeek(addWeeks(new Date(), weekOffset), {
    weekStartsOn: 1,
  }); // Monday base
  const weekDays = Array.from({ length: 7 }).map((_, i) =>
    addDays(weekStart, i),
  );

  // Dynamic CSS injector for the themes has been moved to lib/themeHelper.ts


  const targetThemeClass = currentTheme === "smart" 
    ? (metrics.energy === "Peak" ? "theme-teal-smart" : metrics.energy === "Moderate" ? "theme-purple-smart" : "theme-rose-smart") 
    : `theme-${currentTheme}`;

  return (
    <div className={`min-h-screen font-sans flex flex-col overflow-x-hidden pb-36 sm:pb-36 lg:pb-44 relative transition-all duration-300 ${targetThemeClass}`}>
      <style>{injectThemeCss}</style>
      {/* Premium ambient light accents */}
      <div className="absolute top-0 right-1/10 w-[600px] h-[600px] bg-purple-600/[0.08] blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 left-1/10 w-[550px] h-[550px] bg-fuchsia-500/[0.06] blur-[145px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-cyan-500/[0.05] blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/8 left-1/3 w-[650px] h-[650px] bg-indigo-600/[0.07] blur-[155px] rounded-full pointer-events-none" />

      <header className="bg-[#09090b]/85 backdrop-blur-md border-b border-white/[0.06] sticky top-0 z-20 shrink-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-4 h-[76px] sm:h-16 flex items-center justify-between w-full gap-2 sm:gap-3">
          <button
            onClick={() => {
              setIsMobileDashboardOpen(prev => !prev);
            }}
            className="flex items-center gap-2 sm:gap-3 outline-none focus:ring-0 active:scale-[0.98] transition-transform text-left group/brand cursor-pointer shrink-0"
            aria-label="Toggle navigation directory"
          >
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 rounded-xl blur-sm opacity-55 group-hover/brand:opacity-100 transition duration-550" />
              <div className="relative w-11 h-11 sm:w-10 sm:h-10 bg-zinc-950 border border-white/10 rounded-xl flex items-center justify-center shadow-2xl">
                <span className="text-lg sm:text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">
                  S
                </span>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none rounded-xl" />
                {/* Visual interactive pulse on tablet and mobile portrait */}
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-2.5 sm:h-2.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full border border-black animate-pulse shadow-[0_0_8px_rgba(236,72,153,0.7)]" />
              </div>
            </div>
            <h1 className="text-sm sm:text-lg font-black tracking-tight text-white flex items-center gap-0.5">
              <span>Susun</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 font-extrabold relative" style={{ animationDuration: "5s" }}>
                Ai
                <span className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-full blur-[0.5px]" />
              </span>
              <span className="w-1.5 h-1.5 sm:w-1.5 sm:h-1.5 rounded-full bg-cyan-400 animate-pulse ml-0.5 shadow-[0_0_8px_theme(colors.cyan.400)]" />
            </h1>
          </button>

          {/* Ecosystem Hub Button - beside the brand logo */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => {
                if (activeTab === "ecosystem") {
                  switchTab("dashboard");
                } else {
                  switchTab("ecosystem");
                }
              }}
              className={`relative group overflow-hidden rounded-xl p-0.5 border ${activeTab === "ecosystem" ? "border-pink-500/35" : "border-purple-500/10"} active:scale-95 transition-all duration-300 shadow-[0_0_12px_rgba(168,85,247,0.06)] cursor-pointer`}
            >
              <span className={`absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 rounded-xl blur-sm transition duration-300 ${activeTab === "ecosystem" ? "opacity-100" : "opacity-45 group-hover:opacity-100"}`} />
              <div className="relative px-1.5 sm:px-3 py-1 sm:py-1.5 bg-[#09090b] rounded-xl flex items-center gap-1 sm:gap-1.5 text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-purple-300 group-hover:text-white transition-colors duration-200">
                <Sparkles className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 text-purple-400 animate-pulse" />
                <span>{activeTab === "ecosystem" ? "Workspace" : "Susun AI Hub"}</span>
                <span className={`w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full ${activeTab === "ecosystem" ? "bg-cyan-400 animate-pulse" : "bg-emerald-400 animate-pulse"}`} />
              </div>
            </button>
          </div>

          <nav className="hidden sm:flex items-center bg-zinc-950/80 rounded-xl p-1 border border-zinc-900/80 mx-1 flex-1 sm:flex-initial max-w-full justify-end sm:justify-start overflow-x-auto gap-1 md:gap-1.5 lg:p-1.5 lg:rounded-2xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] select-none scroll-smooth">
            <button
              onClick={() => {
                switchTab("dashboard");
              }}
              className={`px-2 py-1.5 md:px-2.5 md:py-1.5 lg:px-3 lg:py-2 rounded-lg lg:rounded-xl text-[9px] md:text-[9.5px] lg:text-[10px] xl:text-[11px] font-black uppercase tracking-wider transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${activeTab === "dashboard" ? "bg-zinc-900 text-white border border-zinc-800/50 shadow-md shadow-black/20" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              <span className="flex items-center gap-1 sm:gap-1.5 lg:gap-2">
                <LayoutList size={14} className="shrink-0" />
                <span>Home</span>
              </span>
            </button>
            <button
              onClick={() => {
                switchTab("calendar");
              }}
              className={`px-2 py-1.5 md:px-2.5 md:py-1.5 lg:px-3 lg:py-2 rounded-lg lg:rounded-xl text-[9px] md:text-[9.5px] lg:text-[10px] xl:text-[11px] font-black uppercase tracking-wider transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${activeTab === "calendar" ? "bg-zinc-900 text-white border border-zinc-800/50 shadow-md shadow-black/20" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              <span className="flex items-center gap-1 sm:gap-1.5 lg:gap-2">
                <CalendarIcon size={14} className="shrink-0" />
                <span>Calendar</span>
              </span>
            </button>
            <button
              onClick={() => {
                switchTab("ai");
              }}
              className={`px-2 py-1.5 md:px-2.5 md:py-1.5 lg:px-3 lg:py-2 rounded-lg lg:rounded-xl text-[9px] md:text-[9.5px] lg:text-[10px] xl:text-[11px] font-black uppercase tracking-wider transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${activeTab === "ai" ? "bg-zinc-900 text-white border border-zinc-800/50 shadow-md shadow-black/20" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              <span className="flex items-center gap-1 sm:gap-1.5 lg:gap-2">
                <BrainCircuit size={14} className="shrink-0" />
                <span>AI Core</span>
              </span>
            </button>
            <button
              onClick={() => {
                switchTab("profile");
              }}
              className={`px-2 py-1.5 md:px-2.5 md:py-1.5 lg:px-3 lg:py-2 rounded-lg lg:rounded-xl text-[9px] md:text-[9.5px] lg:text-[10px] xl:text-[11px] font-black uppercase tracking-wider transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${activeTab === "profile" ? "bg-zinc-900 text-white border border-zinc-800/50 shadow-md shadow-black/20" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              <span className="flex items-center gap-1 sm:gap-1.5 lg:gap-2">
                <User size={14} className="shrink-0" />
                <span>Profile</span>
              </span>
            </button>
            {isUserAdmin && (
              <button
                onClick={() => {
                  switchTab("admin");
                }}
                className={`px-2 py-1.5 md:px-2.5 md:py-1.5 lg:px-3 lg:py-2 rounded-lg lg:rounded-xl text-[9px] md:text-[9.5px] lg:text-[10px] xl:text-[11px] font-black uppercase tracking-wider transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${activeTab === "admin" ? "bg-purple-950/50 text-purple-300 border border-purple-800/30 shadow-md shadow-black/20" : "text-purple-400/80 hover:text-purple-300"}`}
              >
                <span className="flex items-center gap-1 sm:gap-1.5 lg:gap-2">
                  <ShieldCheck size={14} className="shrink-0" />
                  <span className="hidden lg:inline">Admin</span>
                </span>
              </button>
            )}
           </nav>

          {/* Right most helper element to balance flex */}
          <div className="w-1 h-1 shrink-0 hidden sm:block" />
        </div>
      </header>

      {/* Advanced Navigation Control Center (All Devices) */}
      <AnimatePresence>
        {isMobileDashboardOpen && (
          <>
            {/* Backdrop with elegant blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDashboardOpen(false)}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-lg"
            />

            {/* Premium Control Center Drawer / Modal */}
            <motion.div
              initial={isLargeScreen ? { scale: 0.95, opacity: 0 } : { y: "100%", opacity: 0.5 }}
              animate={isLargeScreen ? { scale: 1, opacity: 1 } : { y: 0, opacity: 1 }}
              exit={isLargeScreen ? { scale: 0.95, opacity: 0 } : { y: "100%", opacity: 0.5 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className={`fixed z-[101] bg-[#0d0d12]/95 border border-zinc-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl overflow-hidden flex flex-col ${
                isLargeScreen 
                  ? "inset-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl rounded-[2rem] max-h-[90vh] pb-6" 
                  : "inset-x-0 bottom-0 rounded-t-[2.5rem] max-h-[85vh] pb-8"
              }`}
            >
              {/* Outer Decorative Glow Accent */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent blur-[1px]" />
              
              {/* Drawer Pull Handle Indicator */}
              {!isLargeScreen ? (
                <div className="w-12 h-1 bg-zinc-800/80 rounded-full mx-auto mt-4 mb-5" />
              ) : (
                <div className="mt-8" />
              )}

              {/* Scrollable content container */}
              <div className="flex-1 overflow-y-auto px-6 space-y-6 scrollbar-hide">
                
                {/* Header Info */}
                <div className="space-y-1 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-wider animate-pulse">
                    <Sparkles size={10} /> Active Hub Control
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                    <span>Choose</span>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">SusunAi</span>
                    <span>Space</span>
                  </h3>
                  <p className="text-xs text-zinc-400">Tap below to switch views with dynamic transitions</p>
                </div>

                {/* Grid of Pages / Navigation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                  
                  {/* CARD 1: DASHBOARD */}
                  <button
                    onClick={() => {
                      switchTab("dashboard");
                      setIsMobileDashboardOpen(false);
                    }}
                    className={`group relative text-left p-4 rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer ${
                      activeTab === "dashboard"
                        ? "bg-[#18181b]/90 border-purple-500/40 shadow-lg shadow-purple-500/5 hover:border-purple-500/50"
                        : "bg-zinc-900/50 border-white/[0.04] hover:bg-zinc-900 hover:border-zinc-800"
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/[0.02] blur-xl rounded-full" />
                    {activeTab === "dashboard" && (
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 to-purple-500" />
                    )}
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl border transition-all duration-300 ${
                        activeTab === "dashboard"
                          ? "bg-purple-500/20 border-purple-500/30 text-purple-400"
                          : "bg-zinc-950 border-white/5 text-zinc-400 group-hover:text-zinc-200"
                      }`}>
                        <LayoutList size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white uppercase tracking-wider">Home Dashboard</span>
                          {activeTab === "dashboard" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-1">Aura Bio-Diagnostics & Schedule Hub</p>
                      </div>
                    </div>
                  </button>

                  {/* CARD 2: CALENDAR */}
                  <button
                    onClick={() => {
                      switchTab("calendar");
                      setIsMobileDashboardOpen(false);
                    }}
                    className={`group relative text-left p-4 rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer ${
                      activeTab === "calendar"
                        ? "bg-[#18181b]/90 border-purple-500/40 shadow-lg shadow-purple-500/5 hover:border-purple-500/50"
                        : "bg-zinc-900/50 border-white/[0.04] hover:bg-zinc-900 hover:border-zinc-800"
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.02] blur-xl rounded-full" />
                    {activeTab === "calendar" && (
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 to-purple-500" />
                    )}
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl border transition-all duration-300 ${
                        activeTab === "calendar"
                          ? "bg-purple-500/20 border-purple-500/30 text-purple-400"
                          : "bg-zinc-950 border-white/5 text-zinc-400 group-hover:text-zinc-200"
                      }`}>
                        <CalendarIcon size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white uppercase tracking-wider">Calendar Core</span>
                          {activeTab === "calendar" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-1 font-sans">Interactive Planner & Timeline Grid</p>
                      </div>
                    </div>
                  </button>

                  {/* CARD 3: AI CORE */}
                  <button
                    onClick={() => {
                      switchTab("ai");
                      setIsMobileDashboardOpen(false);
                    }}
                    className={`group relative text-left p-4 rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer ${
                      activeTab === "ai"
                        ? "bg-[#18181b]/90 border-purple-500/40 shadow-lg shadow-purple-500/5 hover:border-purple-500/50"
                        : "bg-zinc-900/50 border-white/[0.04] hover:bg-zinc-900 hover:border-zinc-800"
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/[0.02] blur-xl rounded-full" />
                    {activeTab === "ai" && (
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 to-purple-500" />
                    )}
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl border transition-all duration-300 ${
                        activeTab === "ai"
                          ? "bg-purple-500/20 border-purple-500/30 text-purple-400"
                          : "bg-zinc-950 border-white/5 text-zinc-400 group-hover:text-zinc-200"
                      }`}>
                        <BrainCircuit size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white uppercase tracking-wider">AI Smart Core</span>
                          {activeTab === "ai" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-1">AI Assistant Rescheduler & Brain Audit</p>
                      </div>
                    </div>
                  </button>

                  {/* CARD 4: PROFILE */}
                  <button
                    onClick={() => {
                      switchTab("profile");
                      setIsMobileDashboardOpen(false);
                    }}
                    className={`group relative text-left p-4 rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer ${
                      activeTab === "profile"
                        ? "bg-[#18181b]/90 border-purple-500/40 shadow-lg shadow-purple-500/5 hover:border-purple-500/50"
                        : "bg-zinc-900/50 border-white/[0.04] hover:bg-zinc-900 hover:border-zinc-800"
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/[0.02] blur-xl rounded-full" />
                    {activeTab === "profile" && (
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 to-purple-500" />
                    )}
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl border transition-all duration-300 ${
                        activeTab === "profile"
                          ? "bg-purple-500/20 border-purple-500/30 text-purple-400"
                          : "bg-zinc-950 border-white/5 text-zinc-400 group-hover:text-zinc-200"
                      }`}>
                        <User size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white uppercase tracking-wider">Profile Space</span>
                          {activeTab === "profile" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-1 font-sans">MBTI Persona, Theme Choice & Preferences</p>
                      </div>
                    </div>
                  </button>

                  {/* CARD 5: SUSUN AI HUB */}
                  <button
                    onClick={() => {
                      switchTab("ecosystem");
                      setIsMobileDashboardOpen(false);
                    }}
                    className={`group relative text-left p-4 rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer ${
                      activeTab === "ecosystem"
                        ? "bg-[#18181b]/90 border-purple-500/40 shadow-lg shadow-purple-500/5 hover:border-purple-500/50"
                        : "bg-zinc-900/50 border-white/[0.04] hover:bg-zinc-900 hover:border-zinc-800"
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.02] blur-xl rounded-full" />
                    {activeTab === "ecosystem" && (
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 to-purple-500" />
                    )}
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl border transition-all duration-300 ${
                        activeTab === "ecosystem"
                          ? "bg-purple-500/20 border-purple-500/30 text-emerald-450"
                          : "bg-zinc-950 border-white/5 text-zinc-400 group-hover:text-zinc-200"
                      }`}>
                        <Sparkles size={22} className="text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white uppercase tracking-wider">Susun AI Hub</span>
                          {activeTab === "ecosystem" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-1 font-sans">Ecosystem Hub & Task Collaboration</p>
                      </div>
                    </div>
                  </button>

                  {isUserAdmin && (
                    <button
                      onClick={() => {
                        switchTab("admin");
                        setIsMobileDashboardOpen(false);
                      }}
                      className={`group relative text-left p-4 rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer ${
                        activeTab === "admin"
                          ? "bg-purple-950/60 border-purple-500/40 shadow-lg shadow-purple-500/5 hover:border-purple-500/50"
                          : "bg-[#1f192b]/30 border-purple-900/10 hover:bg-[#1a1426]/50 hover:border-purple-900/30"
                      }`}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/[0.04] blur-xl rounded-full" />
                      {activeTab === "admin" && (
                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-indigo-500" />
                      )}
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl border transition-all duration-300 ${
                          activeTab === "admin"
                            ? "bg-purple-500/20 border-purple-500/30 text-purple-400"
                            : "bg-zinc-950 border-white/5 text-purple-400/80 group-hover:text-purple-300"
                        }`}>
                          <ShieldCheck size={22} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white uppercase tracking-wider">Admin Space</span>
                            {activeTab === "admin" && (
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 mt-1 line-clamp-1 font-sans">Track Students, Manage Roles & Schedule Audits</p>
                        </div>
                      </div>
                    </button>
                  )}

                </div>

                {/* Core Live Stats Widget inside Selector */}
                <div className="bg-zinc-950/70 border border-white/[0.05] rounded-3xl p-4 space-y-3 relative overflow-hidden text-slate-100">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/[0.01] blur-lg rounded-full pointer-events-none" />
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    <span>Performance telemetry</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Connected
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-zinc-500 text-[9px] uppercase tracking-wider font-bold">Planned Tasks</span>
                      <div className="text-lg font-black text-white font-sans">
                        {tasks.length} <span className="text-xs text-zinc-500 font-normal">total</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-zinc-500 text-[9px] uppercase tracking-wider font-bold">Today's Focus</span>
                      <div className="text-lg font-black text-indigo-400 font-sans">
                        {tasks.filter((t: any) => t.status === "completed").length} <span className="text-zinc-500 text-xs font-normal font-sans">/ {tasks.length} Done</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Big Futuristic and Elegant Glassmorphic Close Button */}
                <button
                  onClick={() => setIsMobileDashboardOpen(false)}
                  className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-extrabold uppercase tracking-widest text-[10px] rounded-2xl border border-zinc-800 transition-all duration-200 mt-2 active:scale-98 cursor-pointer"
                >
                  Close Controller
                </button>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 pt-4 pb-40 lg:py-8 relative animate-none">
        {/* Active Tab Info Panel - Floating and Minimalist */}
        <div className="mb-6 flex justify-between items-center bg-zinc-900/40 p-2.5 rounded-xl border border-zinc-850/40 font-sans">
          <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> Active Space ({
              activeTab === "ecosystem" ? "Ecosystem Hub" :
              activeTab === "ai" ? "AI Smart Core" :
              activeTab === "profile" ? "Profile Space" :
              activeTab === "admin" ? "Admin Control Hub" :
              activeTab === "calendar" ? "Calendar Planner" :
              activeTab === "dashboard" ? "Home Dashboard" :
              activeTab.toUpperCase()
            })
          </span>
          <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider hidden xs:inline">
            Status: Synchronized Bio-Model
          </span>
        </div>

        <AnimatePresence mode="wait" custom={slideDirection}>
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              custom={slideDirection}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex justify-center"
            >
              <div className="w-full">
                {/* Personal Insights Carousel at the Top */}
                <div className="mb-8 overflow-hidden relative group">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                      <Sparkles size={16} /> Personal Insights
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-white bg-white/5"
                        onClick={() => {
                          const container =
                            document.getElementById("metrics-carousel");
                          if (container)
                            container.scrollBy({
                              left: -300,
                              behavior: "smooth",
                            });
                        }}
                      >
                        <ChevronLeft size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-white bg-white/5"
                        onClick={() => {
                          const container =
                            document.getElementById("metrics-carousel");
                          if (container)
                            container.scrollBy({
                              left: 300,
                              behavior: "smooth",
                            });
                        }}
                      >
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="mb-10 bg-[#0e0d12]/60 border border-zinc-850 backdrop-blur-xl rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row items-stretch justify-between gap-8 shadow-xl relative overflow-hidden group">
                    {/* Glowing background effects */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-purple-500/10 via-fuchsia-500/5 to-transparent blur-[80px] rounded-full pointer-events-none transition-all duration-300 group-hover:scale-110" />
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/[0.04] blur-[80px] rounded-full pointer-events-none" />

                    {/* Left: Dynamic Quick Insight & Health Diagnostics */}
                    <div className="flex-1 flex flex-col sm:flex-row gap-6 items-start relative z-10">
                      <div className="w-12 h-12 bg-zinc-950 border border-white/10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl">
                        <Sparkles className="text-purple-400 w-6 h-6 animate-pulse" />
                      </div>
                      <div className="flex-1 w-full space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                            <h4 className="text-[10px] font-black text-purple-300 uppercase tracking-[0.2em]">
                              Intelligence Core
                            </h4>
                          </div>
                          
                          {rescheduleResponse ? (
                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border transition-all duration-300 ${
                              rescheduleResponse.score > 80 
                                ? "text-emerald-400 bg-emerald-500/5 border-emerald-500/10" 
                                : rescheduleResponse.score > 50 
                                ? "text-amber-400 bg-amber-500/5 border-amber-500/10" 
                                : "text-rose-400 bg-rose-500/5 border-rose-500/10"
                            }`}>
                              Schedule Health: {rescheduleResponse.score}%
                            </span>
                          ) : (
                            <span className="text-[9px] font-black text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-2.5 py-1 rounded-lg uppercase tracking-wider backdrop-blur-sm">
                              Real-Time Watchdog
                            </span>
                          )}
                        </div>

                        <div className="space-y-2">
                          <p className="text-zinc-100 text-sm sm:text-base font-semibold leading-relaxed">
                            {rescheduleResponse ? rescheduleResponse.summary : metrics.quickInsight}
                          </p>
                          {rescheduleResponse && rescheduleResponse.actionable_insights?.length > 0 && (
                            <p className="text-zinc-400 text-xs font-medium">
                              💡 Suggested next: <span className="text-purple-300 font-bold">{rescheduleResponse.actionable_insights[0].title}</span>. {rescheduleResponse.actionable_insights[0].description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Divider for larger screens */}
                    <div className="hidden lg:block w-[1px] bg-gradient-to-b from-transparent via-zinc-805 to-transparent self-stretch" />

                    {/* Right: Interactive Diagnostics Control Panel & Function Explainer */}
                    <div className="lg:w-80 shrink-0 flex flex-col justify-between gap-4 bg-zinc-950/40 border border-white/[0.02] p-4 rounded-2xl relative z-10 backdrop-blur-md">
                      <div>
                        <h5 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1 flex items-center gap-1">
                          <BrainCircuit size={10} className="text-purple-400" /> Bio-Rhythm Audit
                        </h5>
                        <p className="text-[11px] text-zinc-405 leading-normal">
                          Cross-references your active tasks against your profile to detect workload conflicts, score calendar alignment, and suggest health adjustments.
                        </p>
                      </div>

                      <Button
                        onClick={handleInlineAudit}
                        disabled={inlineAiLoading}
                        className={`w-full group/btn relative overflow-hidden font-black rounded-xl h-10 px-5 transition-all uppercase text-[9px] tracking-widest cursor-pointer shadow-md ${
                          inlineAiLoading
                            ? "bg-purple-500/10 text-purple-300 border border-purple-500/20"
                            : "bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 text-white hover:opacity-90 shadow-purple-500/10 active:scale-95"
                        }`}
                      >
                        {inlineAiLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin text-purple-400" />
                            <span>Auditing Schedule...</span>
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-1.5">
                            <Sparkles className="h-3 w-3 group-hover/btn:rotate-12 transition-transform" />
                            <span>Audit with Gemini AI</span>
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div
                    id="metrics-carousel"
                    className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
                  >
                    {/* Stress Analysis Card */}
                    <div className="min-w-[280px] sm:min-w-[320px] snap-center">
                      <Card className="bg-[#0e0d12]/50 border border-zinc-850 backdrop-blur-md p-5 h-full relative overflow-hidden rounded-3xl shadow-xl group hover:border-purple-500/30 hover:shadow-[0_0_25px_rgba(168,85,247,0.12)] transition-all duration-300">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/[0.08] blur-[40px] rounded-full transition-all duration-300 group-hover:scale-110 pointer-events-none" />
                        <div className="relative z-10 flex flex-col h-full justify-between">
                          <div className="flex items-center justify-between mb-4">
                             <div className="p-2 bg-indigo-500/10 rounded-lg animate-pulse">
                               <Zap size={16} className="text-indigo-400" />
                             </div>
                             <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-950 px-2.5 py-1 rounded-md border border-zinc-900">
                               Stress Score: {Math.round(metrics.stressScore)}
                             </span>
                          </div>
                          
                          <div>
                            <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.15em] mb-1">
                              System State
                            </h4>
                            <div className={`text-3xl font-black mb-3 tracking-tight ${metrics.stressColor}`}>
                              {metrics.stress}
                            </div>
                          </div>

                          <div className="mt-4">
                            <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-900 shadow-inner">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ${
                                  metrics.stressScore > 80 ? "bg-rose-500" : metrics.stressScore > 50 ? "bg-purple-500" : "bg-emerald-500"
                                }`}
                                style={{ width: `${Math.min(100, Math.max(5, metrics.stressScore))}%` }}
                              />
                            </div>
                            <p className="text-[8px] text-zinc-500 mt-2 font-bold uppercase tracking-wider">
                              Schedule Alignment Analysis
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Energy Budget Card */}
                    <div className="min-w-[280px] sm:min-w-[320px] snap-center">
                      <Card className="bg-[#0e0d12]/50 border border-zinc-850 backdrop-blur-md p-5 h-full relative overflow-hidden rounded-3xl shadow-xl group hover:border-emerald-500/30 hover:shadow-[0_0_25px_rgba(16,185,129,0.12)] transition-all duration-300">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/[0.08] blur-[40px] rounded-full transition-all duration-300 group-hover:scale-110 pointer-events-none" />
                        <div className="relative z-10 flex flex-col justify-between h-full">
                          <div>
                            <div className="flex items-center justify-between mb-4">
                               <div className="p-2 bg-emerald-500/10 rounded-lg">
                                 <Activity size={16} className="text-emerald-400" />
                               </div>
                               <span className="text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-black uppercase tracking-wider">
                                 {weekOffset === 0 ? "THIS WEEK" : weekOffset === -1 ? "LAST WEEK" : weekOffset === 1 ? "NEXT WEEK" : `OFFSET: ${weekOffset}`}
                               </span>
                            </div>

                            <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.15em] mb-1">
                              Energy Reserve
                            </h4>
                            <div className="flex items-end gap-1 mb-2">
                              <div className="text-3xl font-black text-white leading-none tracking-tight">
                                {metrics.weeklyEnergyLeft}
                                <span className="text-lg text-zinc-500 ml-1">%</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4">
                            <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-900 shadow-inner">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ${
                                  metrics.weeklyEnergyLeft > 60
                                    ? "bg-emerald-500 animate-pulse"
                                    : metrics.weeklyEnergyLeft > 30
                                      ? "bg-purple-500"
                                      : "bg-rose-500"
                                }`}
                                style={{
                                  width: `${Math.max(5, metrics.weeklyEnergyLeft)}%`,
                                }}
                              />
                            </div>
                            <p className="text-[8px] text-zinc-500 mt-2 font-bold uppercase tracking-wider">
                              Capacity for additional tasks
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Contextual Efficiency Card */}
                    <div className="min-w-[280px] sm:min-w-[320px] snap-center">
                      <Card className="bg-[#0e0d12]/50 border border-zinc-850 backdrop-blur-md p-5 h-full relative overflow-hidden rounded-3xl shadow-xl group hover:border-purple-500/30 hover:shadow-[0_0_25px_rgba(168,85,247,0.12)] transition-all duration-300">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-fuchsia-500/[0.08] blur-[40px] rounded-full transition-all duration-300 group-hover:scale-110 pointer-events-none" />
                        <div className="relative z-10 flex flex-col justify-between h-full">
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Settings2 size={16} className="text-purple-400" />
                              </div>
                              <span className="text-[9px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md font-black uppercase tracking-wider">
                                Optimization
                              </span>
                            </div>
                            <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.14em] mb-3">
                              Contextual efficiency
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                                  Social battery
                                </span>
                                <span className="text-zinc-100 text-xs font-black">
                                  {userProfile?.social_battery || "Medium"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                                  Focus Env
                                </span>
                                <span className="text-zinc-100 text-xs font-black">
                                  {userProfile?.study_environment || "Personal"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                                  Daily Commute
                                </span>
                                <span className="text-zinc-100 text-xs font-black">
                                  {userProfile?.commute_time || "None"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                                  Active Role
                                </span>
                                <span className="text-zinc-100 text-xs font-black">
                                  {userProfile?.role || "Student"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Task Completion Card */}
                    <div className="min-w-[280px] sm:min-w-[320px] snap-center">
                      <Card className="bg-[#0e0d12]/50 border border-zinc-850 backdrop-blur-md p-5 rounded-3xl h-full relative overflow-hidden shadow-xl group hover:border-purple-500/30 hover:shadow-[0_0_25px_rgba(168,85,247,0.12)] transition-all duration-300">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/[0.09] blur-[40px] rounded-full transition-all duration-300 group-hover:scale-110 pointer-events-none mr-2 mt-2" />
                        <div className="relative z-10 flex flex-col justify-between h-full">
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Target size={16} className="text-purple-400" />
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTaskCountMode((prev) =>
                                    prev === "week" ? "total" : "week",
                                  );
                                }}
                                className="text-[9px] font-black bg-zinc-950 hover:bg-purple-500 hover:text-zinc-950 text-purple-400 px-2 py-0.5 rounded border border-zinc-800 transition-all uppercase cursor-pointer"
                              >
                                {taskCountMode === "week" ? "Total" : "Week"}
                              </button>
                            </div>
                            <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.14em] mb-1">
                              Efficiency goal
                            </h4>
                            <div className="text-3xl font-black text-white mb-3 tracking-tight">
                              {taskCountMode === "week"
                                ? metrics.weeklyTasks
                                : metrics.totalTasks}{" "}
                              <span className="text-base font-semibold text-zinc-500 ml-1">
                                Tasks
                              </span>
                            </div>
                          </div>
                          <div className="flex items-end gap-1 h-6">
                            {(() => {
                              const now = new Date();
                              const weekStartForGraph = startOfWeek(
                                addWeeks(now, weekOffset),
                                { weekStartsOn: 1 },
                              );
                              const dailyCounts = Array.from({ length: 7 }).map(
                                (_, i) => {
                                  const day = addDays(weekStartForGraph, i);
                                  return tasks.filter((t) =>
                                    isSameDay(parseISO(t.date), day),
                                  ).length;
                                },
                              );
                              const max = Math.max(...dailyCounts, 1);

                              return dailyCounts.map((count, i) => {
                                const heightPercent =
                                  max === 0
                                    ? 10
                                    : Math.min(100, (count / max) * 100);
                                return (
                                  <div
                                    key={i}
                                    className="flex-1 bg-zinc-950 rounded-t-sm relative group/bar h-full"
                                  >
                                    <div
                                      className="absolute bottom-0 w-full bg-purple-500 rounded-t-sm transition-all duration-1000"
                                      style={{
                                        height: `${Math.max(10, heightPercent)}%`,
                                      }}
                                    />
                                    <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-800 text-[8px] text-zinc-305 px-1 py-0.5 rounded transition-all pointer-events-none whitespace-nowrap z-20">
                                      {count} tasks
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Energy Level Card */}
                    <div className="min-w-[280px] sm:min-w-[320px] snap-center">
                      <Card className="bg-[#0e0d12]/50 border border-zinc-850 backdrop-blur-md p-5 h-full relative overflow-hidden rounded-3xl shadow-xl group hover:border-emerald-500/30 hover:shadow-[0_0_25px_rgba(16,185,129,0.12)] transition-all duration-300">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/[0.08] blur-[40px] rounded-full transition-all duration-300 group-hover:scale-110 pointer-events-none" />
                        <div className="relative z-10 flex flex-col justify-between h-full">
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <Battery size={16} className="text-emerald-400" />
                              </div>
                              <span className="text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-md font-black uppercase tracking-wider">
                                Current Status
                              </span>
                            </div>
                            <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.14em] mb-1">
                              Current Energy
                            </h4>
                            <div className="text-3xl font-black text-white mb-3 tracking-tight">
                              {metrics.energy}
                            </div>
                          </div>
                          <div>
                            <div className="flex gap-1 mb-2">
                              {[1, 2, 3, 4, 5].map((cell) => {
                                let isActive = false;
                                if (
                                  metrics.energy === "Infinite" ||
                                  metrics.energy === "High" ||
                                  metrics.energy === "Peak"
                                )
                                  isActive = cell <= 5;
                                else if (
                                  metrics.energy === "Good" ||
                                  metrics.energy === "Moderate"
                                )
                                  isActive = cell <= 3;
                                else if (metrics.energy === "Low")
                                  isActive = cell <= 1;
                                return (
                                  <div
                                    key={cell}
                                    className={`h-1 flex-1 rounded-sm ${isActive ? "bg-emerald-400" : "bg-zinc-800"}`}
                                  />
                                );
                              })}
                            </div>
                            <div className="space-y-2">
                              <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">
                                Optimal for: {metrics.energy === "Peak" ? "Deep Focus Work & Action" : metrics.energy === "Moderate" ? "General Work & Admin" : "Light Review & Decompress"}
                              </p>
                              
                              <button
                                onClick={() => setShowEnergyExplainer(!showEnergyExplainer)}
                                className="w-full text-left px-2.5 py-1 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 text-[9px] text-emerald-400 font-black tracking-wider uppercase flex items-center justify-between rounded-lg transition-colors cursor-pointer"
                              >
                                <span>⚡ View Bio-Energy Guide</span>
                                <Sparkles size={10} className="animate-pulse" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>

                {/* Dynamic Bio-Energy Explainer Collapse Block */}
                <AnimatePresence>
                  {showEnergyExplainer && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, scale: 0.95 }}
                      animate={{ opacity: 1, height: "auto", scale: 1 }}
                      exit={{ opacity: 0, height: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="w-full mb-10 overflow-hidden"
                    >
                      <Card className="bg-[#0e0d12]/85 border-2 border-emerald-500/20 rounded-3xl p-6 sm:p-8 relative shadow-2xl backdrop-blur-xl">
                        {/* Explainer Background Glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.04] blur-[60px] rounded-full pointer-events-none" />
                        
                        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                          <div className="flex items-center gap-3">
                            <span className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                              <BrainCircuit size={20} />
                            </span>
                            <div>
                              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                                Bio-Rhythm Energy Engine Guide
                              </h3>
                              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">
                                How your instant energy affects scheduling & UI
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowEnergyExplainer(false)}
                            className="text-zinc-400 hover:text-white text-xs font-black uppercase tracking-wider px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg cursor-pointer"
                          >
                            Close
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                                🧠 What does it mean?
                              </h4>
                              <p className="text-zinc-300 text-xs leading-relaxed mt-1">
                                Your current energy represents physical and cognitive capacity at this exact hour. It is calculated dynamically based on your profile's <span className="text-emerald-300 font-extrabold">Primary Energy Type</span> (Morning Bird, Night Owl, or Balanced), modified by your actual sleep routines, wake-up logs, meals consumed, daily sports activity, health condition, and academic loads.
                              </p>
                            </div>

                            <div className="bg-zinc-950/50 border border-zinc-850 p-4 rounded-xl space-y-3">
                              <div className="flex items-start gap-2">
                                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-black">PEAK</span>
                                <div className="text-[11px] text-zinc-300 leading-normal">
                                  <strong>Optimal focus window.</strong> Your cognitive processing speed is maximized. Best for tackling complex exams, logic assignments, study breakdowns, or challenging deep coding.
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="text-xs px-2 py-0.5 rounded bg-slate-500/15 text-slate-300 font-black">MODERATE</span>
                                <div className="text-[11px] text-zinc-300 leading-normal">
                                  <strong>General productivity mode.</strong> Appropriate for structural actions, writing reports, attending lectures, organizing planners, replying to emails, or casual administrative study.
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="text-xs px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-black">LOW</span>
                                <div className="text-[11px] text-zinc-300 leading-normal">
                                  <strong>Recharge & recover period.</strong> Your body requires biological rest to prevent cognitive fatigue. Best for physical sports, offline restoration meals, or sleeping. Incompatible with high-stakes items.
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h4 className="text-xs font-black text-fuchsia-400 uppercase tracking-widest flex items-center gap-1.5">
                                ⚡ What changes? (System Effects)
                              </h4>
                              <p className="text-zinc-300 text-xs leading-relaxed mt-1">
                                Your energy states actively govern several features inside the SusunAi system to automate healthier daily habits:
                              </p>
                            </div>

                            <ul className="text-xs text-zinc-400 space-y-2.5 list-disc pl-4 leading-relaxed">
                              <li>
                                <strong className="text-white">Smart Watchdog Alerts:</strong> Incompatible tasks scheduled outside of your natural peak hours trigger instant visual yellow diagnostics, reminding you to shift them.
                              </li>
                              <li>
                                <strong className="text-white">Gemini Calendar Audits:</strong> AI-powered diagnostics cross-reference energy status against your profiles to evaluate daily wellness and score your timetable alignment health.
                              </li>
                              <li>
                                <strong className="text-white">AI Real-Time Rescheduling:</strong> Clicking the "Audit with Gemini AI" or "Susun AI" buttons triggers an optimization pass that moves intensive workloads into Peak blocks.
                              </li>
                              <li>
                                <strong className="text-white">Dynamic Smart Theme Shifts:</strong> If you select the <strong className="text-purple-400 font-black">Smart Living</strong> interface theme, the full application stylesheet shifts colors dynamically (Concentration Teal for Peak, Balanced Violet for Moderate, and Restorative Rose for Low)!
                              </li>
                            </ul>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col items-center justify-center text-center gap-6 mb-12 bg-[#0e0d12]/60 border border-zinc-850 p-6 sm:p-8 rounded-3xl shadow-xl backdrop-blur-md w-full">
                  <div className="text-center flex flex-col items-center justify-center">
                    <div className="flex items-center gap-2 mb-2 justify-center">
                      <div className="w-1.5 h-4 bg-purple-500 rounded-full animate-pulse" />
                      <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">
                        Scheduler Studio
                      </h2>
                    </div>
                    <h3 className="text-3xl font-black text-white tracking-tight">
                      Weekly <span className="text-purple-400 font-medium">Planner</span>
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                    <Button
                      onClick={handleAutoReschedule}
                      disabled={isAiLoading}
                      className="shadow-md bg-purple-500 hover:bg-purple-600 text-white font-black rounded-xl h-11 px-5 transition-all uppercase text-[10px] tracking-widest cursor-pointer shadow-purple-500/10"
                    >
                      {isAiLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}{" "}
                      Susun AI
                    </Button>

                    <Button
                      className="shadow-md bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-black rounded-xl h-11 px-5 transition-all uppercase text-[10px] tracking-widest cursor-pointer"
                      onClick={() => setIsAddDialogOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Task
                    </Button>

                    <Button
                      onClick={handlePurgeWeek}
                      variant="ghost"
                      className="bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 border border-rose-500/25 hover:border-rose-500/40 text-rose-400 rounded-xl h-11 px-4 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-rose-950/20 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>( purge week)</span>
                    </Button>
                  </div>
                </div>

                <Dialog
                  open={!!selectedTaskDetails}
                  onOpenChange={(open) => {
                    if (!open) {
                      setSelectedTaskDetails(null);
                      setActiveBiometricTab(null);
                    }
                  }}
                >
                  <DialogContent className="sm:max-w-[450px] bg-zinc-950/95 border border-zinc-900 text-white backdrop-blur-2xl rounded-2xl">
                    {selectedTaskDetails && (
                      <div>
                        <DialogHeader>
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${selectedTaskDetails.status === "completed" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-purple-500/20 text-purple-400 border border-purple-500/30"}`}
                            >
                              {selectedTaskDetails.type}
                            </div>
                            {selectedTaskDetails.status === "completed" && (
                              <div className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                COMPLETED
                              </div>
                            )}
                          </div>
                          <DialogTitle className="text-2xl font-bold tracking-tight">
                            {selectedTaskDetails.title}
                          </DialogTitle>
                          <DialogDescription className="flex gap-4 text-slate-300 mt-3 font-medium">
                            <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg">
                              <CalendarIcon
                                size={14}
                                className="text-indigo-400"
                              />{" "}
                              {format(
                                new Date(selectedTaskDetails.date),
                                "MMM d, yyyy",
                              )}
                            </span>
                            <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg">
                              <Clock size={14} className="text-indigo-400" />{" "}
                              {format(
                                new Date(selectedTaskDetails.date),
                                "h:mm a",
                              )}
                            </span>
                            <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />{" "}
                              {selectedTaskDetails.duration}m
                            </span>
                          </DialogDescription>
                        </DialogHeader>

                        {/* Interactive Biometric Impact Analyzer */}
                        {(() => {
                          const biometrics = getTaskBiometrics(
                            selectedTaskDetails.type,
                            selectedTaskDetails.energyImpact,
                            selectedTaskDetails.duration
                          );

                          return (
                            <div className="mt-6 bg-[#000000]/30 p-4 rounded-xl border border-white/[0.06] space-y-4">
                              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                                  <Activity size={14} className="text-purple-400 animate-pulse" /> Biometric Impact Indices
                                </h4>
                                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
                                  Tap gauge for report
                                </span>
                              </div>

                              {/* Interactive Grid Gauges */}
                              <div className="grid grid-cols-3 gap-2">
                                {/* Cognitive Load Gauge */}
                                <button
                                  type="button"
                                  onClick={() => setActiveBiometricTab(activeBiometricTab === "cognitive" ? null : "cognitive")}
                                  className={`p-3 rounded-2xl border transition-all duration-200 text-left cursor-pointer select-none outline-none ${
                                    activeBiometricTab === "cognitive"
                                      ? "bg-blue-500/10 border-blue-400/50 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                                      : "bg-black/40 border-white/5 hover:bg-black/60 hover:border-white/10"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <Brain size={14} className="text-blue-400" />
                                    <span className="text-[11px] font-black text-white font-mono">{biometrics.cognitive}%</span>
                                  </div>
                                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mt-2.5 leading-none">
                                    Cognitive
                                  </span>
                                </button>

                                {/* Physical Vitality Gauge */}
                                <button
                                  type="button"
                                  onClick={() => setActiveBiometricTab(activeBiometricTab === "physical" ? null : "physical")}
                                  className={`p-3 rounded-2xl border transition-all duration-200 text-left cursor-pointer select-none outline-none ${
                                    activeBiometricTab === "physical"
                                      ? "bg-amber-500/10 border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                                      : "bg-black/40 border-white/5 hover:bg-black/60 hover:border-white/10"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <Zap size={14} className="text-amber-400" />
                                    <span className="text-[11px] font-black text-white font-mono">{biometrics.physical}%</span>
                                  </div>
                                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mt-2.5 leading-none">
                                    Physical
                                  </span>
                                </button>

                                {/* Recovery Gauge */}
                                <button
                                  type="button"
                                  onClick={() => setActiveBiometricTab(activeBiometricTab === "recovery" ? null : "recovery")}
                                  className={`p-3 rounded-2xl border transition-all duration-200 text-left cursor-pointer select-none outline-none ${
                                    activeBiometricTab === "recovery"
                                      ? "bg-emerald-500/10 border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                                      : "bg-black/40 border-white/5 hover:bg-black/60 hover:border-white/10"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <Moon size={14} className="text-emerald-400" />
                                    <span className="text-[11px] font-black text-white font-mono">{biometrics.recovery}%</span>
                                  </div>
                                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mt-2.5 leading-none">
                                    Recovery
                                  </span>
                                </button>
                              </div>

                              {/* Clicked Gauge Expanded Report */}
                              <AnimatePresence mode="wait">
                                {activeBiometricTab && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0, y: -4 }}
                                    animate={{ opacity: 1, height: "auto", y: 0 }}
                                    exit={{ opacity: 0, height: 0, y: -4 }}
                                    className="overflow-hidden bg-black/50 rounded-2xl p-3.5 border border-white/[0.06] text-xs"
                                  >
                                    {activeBiometricTab === "cognitive" && (
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-1.5">
                                          <Brain size={14} className="text-blue-400 animate-pulse" />
                                          <span className="text-[9px] font-black uppercase tracking-wider text-blue-300">
                                            Neurological Focus Index
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-zinc-300 leading-relaxed font-sans font-medium">
                                          {biometrics.cognitiveDesc}
                                        </p>
                                      </div>
                                    )}

                                    {activeBiometricTab === "physical" && (
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-1.5">
                                          <Zap size={14} className="text-amber-400 animate-pulse" />
                                          <span className="text-[9px] font-black uppercase tracking-wider text-amber-300">
                                            Stamina & Energy Activation
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-zinc-300 leading-relaxed font-sans font-medium">
                                          {biometrics.physicalDesc}
                                        </p>
                                      </div>
                                    )}

                                    {activeBiometricTab === "recovery" && (
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-1.5">
                                          <Moon size={14} className="text-emerald-400 animate-pulse" />
                                          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-300">
                                            Circadian Restoration Index
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-zinc-300 leading-relaxed font-sans font-medium">
                                          {biometrics.recoveryDesc}
                                        </p>
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })()}

                        {selectedTaskDetails.description && (
                          <div className="mt-6 bg-black/30 rounded-xl p-4 border border-white/10">
                            <h4 className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                              <Info size={14} /> Details & Explanation
                            </h4>
                            <div className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed max-h-[180px] overflow-y-auto pr-2 scrollbar-hide">
                              {selectedTaskDetails.description}
                            </div>
                          </div>
                        )}
                        <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3 pt-6 border-t border-white/5">
                          <div className="flex gap-3 flex-1">
                            {!selectedTaskDetails.status ||
                            selectedTaskDetails.status !== "completed" ? (
                              <Button
                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-11 px-4 shadow-[0_4px_12px_rgba(16,185,129,0.3)] rounded-xl"
                                onClick={() => {
                                  toggleTaskStatus(selectedTaskDetails);
                                  setSelectedTaskDetails(null);
                                }}
                              >
                                <CheckCircle2 size={18} className="mr-2" /> Mark Complete
                              </Button>
                            ) : (
                              <Button
                                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold h-11 px-4 rounded-xl"
                                onClick={() => {
                                  toggleTaskStatus(selectedTaskDetails);
                                  setSelectedTaskDetails(null);
                                }}
                              >
                                Mark Pending
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold h-11 px-4 border border-rose-500/20 rounded-xl"
                              onClick={async () => {
                                try {
                                  await deleteTask(selectedTaskDetails.id!);
                                  setSelectedTaskDetails(null);
                                  toast.success("Task deleted");
                                } catch (err) {
                                  toast.error("Failed to delete task");
                                }
                              }}
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>

                          <div className="flex gap-2 items-center">
                            {selectedTaskDetails.duration >= 30 &&
                              selectedTaskDetails.status !== "completed" && (
                                <Button
                                  variant="outline"
                                  className="bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 font-bold border-dashed h-11 px-4 rounded-xl"
                                  onClick={() =>
                                    handleBreakDownTask(selectedTaskDetails)
                                  }
                                  disabled={isBreakingDown}
                                >
                                  {isBreakingDown ? (
                                    <Loader2 size={16} className="animate-spin" />
                                  ) : (
                                    <SplitSquareHorizontal size={16} />
                                  )}
                                </Button>
                              )}
                            
                            <Button
                              variant="ghost"
                              className="text-slate-400 hover:text-white hover:bg-white/5 font-bold h-11 px-4 rounded-xl"
                              onClick={() => setSelectedTaskDetails(null)}
                            >
                              Close
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                <div className="flex flex-col gap-12">
                  {/* Top side: Tasks & Weekly View */}
                  <div className="flex-1 flex flex-col space-y-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex relative bg-black/20 rounded-xl p-1 border border-white/10 w-full sm:w-[320px]">
                        <div
                          className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-indigo-500 rounded-lg shadow-lg pointer-events-none transition-transform duration-300 ease-out"
                          style={{
                            transform:
                              viewMode === "weekly"
                                ? "translateX(0)"
                                : "translateX(calc(100% + 4px))",
                          }}
                        />
                        <button
                          onClick={() => setViewMode("weekly")}
                          className={`relative flex-1 py-2 text-sm font-bold rounded-lg transition-colors z-10 ${viewMode === "weekly" ? "text-white" : "text-slate-400 hover:text-slate-200"}`}
                        >
                          Weekly
                        </button>
                        <button
                          onClick={() => setViewMode("list")}
                          className={`relative flex-1 py-2 text-sm font-bold rounded-lg transition-colors z-10 ${viewMode === "list" ? "text-white" : "text-slate-400 hover:text-slate-200"}`}
                        >
                          Day List
                        </button>
                      </div>

                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          onClick={handleShowAllTasks}
                          className={`flex-1 sm:flex-none rounded-xl bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10 text-xs h-10 sm:h-9 px-4 font-bold ${!selectedDate ? "opacity-50" : ""}`}
                        >
                          Show All
                        </Button>
                        <Button
                          variant="outline"
                          onClick={toggleTasksVisibility}
                          className="flex-1 sm:flex-none rounded-xl bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10 text-xs h-10 sm:h-9 px-4 font-bold"
                        >
                          {tasksHidden ? "Show" : "Hide"}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      {viewMode === "weekly" ? (
                        <div className="flex items-center gap-1 bg-zinc-950 rounded-xl p-1 border border-zinc-800/80 w-full sm:w-auto justify-between sm:justify-start">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 sm:h-8 sm:w-8 text-zinc-400 hover:text-white"
                            onClick={() => setWeekOffset((prev) => prev - 1)}
                          >
                            <ChevronLeft size={16} />
                          </Button>
                          <span className="text-sm font-bold text-zinc-300 min-w-[100px] text-center">
                            {weekOffset === 0
                              ? "This Week"
                              : weekOffset === 1
                                ? "Next Week"
                                : weekOffset === -1
                                  ? "Last Week"
                                  : `Week ${weekOffset > 0 ? "+" : ""}${weekOffset}`}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 sm:h-8 sm:w-8 text-zinc-400 hover:text-white"
                            onClick={() => setWeekOffset((prev) => prev + 1)}
                          >
                            <ChevronRight size={16} />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-indigo-400 uppercase tracking-widest">
                            {selectedDate
                              ? format(selectedDate, "EEEE, d MMM")
                              : "All Upcoming Tasks"}
                          </h4>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 w-full min-h-[400px] sm:min-h-[500px]">
                      {viewMode === "weekly" ? (
                        <div className="flex flex-col w-full">
                          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl">
                            <div className="overflow-x-auto">
                              <div className="min-w-[700px] sm:min-w-full">
                                {/* Header Row */}
                                <div className="grid grid-cols-[50px_repeat(7,1fr)] border-b border-zinc-800 bg-zinc-950/60">
                                  <div className="p-2 border-r border-zinc-800 flex items-center justify-center">
                                    <Clock className="w-4 h-4 text-indigo-400 opacity-50" />
                                  </div>
                                  {weekDays.map((day, idx) => {
                                    const isToday = isSameDay(day, new Date());
                                    const isSelected =
                                      selectedDate &&
                                      isSameDay(day, selectedDate);
                                    return (
                                      <div
                                        key={idx}
                                        className={`p-2 text-center border-r border-zinc-800 last:border-r-0 ${isToday ? "bg-indigo-505/10 bg-indigo-500/5" : ""} ${isSelected ? "bg-indigo-500/20" : ""}`}
                                      >
                                        <div
                                          className={`text-[9px] font-black uppercase tracking-widest ${isToday ? "text-indigo-400" : isSelected ? "text-indigo-300" : "text-zinc-500"}`}
                                        >
                                          {format(day, "EEE")}
                                        </div>
                                        <div className="text-sm font-bold text-white">
                                          {format(day, "d")}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Time Grid Rows */}
                                <div className="relative">
                                  {(() => {
                                    const startH =
                                      userProfile?.dayStartHour ?? 7;
                                    const endH = userProfile?.dayEndHour ?? 22;
                                    const hoursArr = Array.from(
                                      { length: endH - startH + 1 },
                                      (_, i) => startH + i,
                                    );

                                    return (
                                      <div className="flex">
                                        {/* Hours Col */}
                                        <div className="w-[50px] shrink-0 border-r border-zinc-800 bg-zinc-950/60">
                                          {hoursArr.map((hour) => (
                                            <div
                                              key={hour}
                                              className="h-[50px] border-b border-zinc-800 last:border-b-0 flex items-start justify-center p-1 text-[9px] font-black text-zinc-500 tabular-nums"
                                            >
                                              {hour}:00
                                            </div>
                                          ))}
                                        </div>

                                        {/* Days Cols */}
                                        {weekDays.map((day, dIdx) => {
                                          const dayTasks = tasks
                                            .filter((t) => {
                                              const td = parseISO(t.date);
                                              const h = td.getHours();
                                              return (
                                                isSameDay(td, day) &&
                                                h >= startH &&
                                                h <= endH
                                              );
                                            })
                                            .sort(
                                              (a, b) =>
                                                parseISO(a.date).getTime() -
                                                parseISO(b.date).getTime(),
                                            );

                                          // Column logic for overlaps
                                          const taskColumns: Task[][] = [];
                                          dayTasks.forEach((task) => {
                                            let placed = false;
                                            const taskStart = parseISO(
                                              task.date,
                                            ).getTime();
                                            for (let col of taskColumns) {
                                              const lastTaskInRange =
                                                col[col.length - 1];
                                              const lastTaskEnd =
                                                parseISO(
                                                  lastTaskInRange.date,
                                                ).getTime() +
                                                lastTaskInRange.duration *
                                                  60000;
                                              if (taskStart >= lastTaskEnd) {
                                                col.push(task);
                                                placed = true;
                                                break;
                                              }
                                            }
                                            if (!placed)
                                              taskColumns.push([task]);
                                          });

                                          return (
                                            <div
                                              key={dIdx}
                                              className="flex-1 relative border-r border-white/5 last:border-r-0 group hover:bg-white/[0.02] transition-colors"
                                              onClick={() =>
                                                handleDateSelect(day)
                                              }
                                            >
                                              {/* Background Grid Lines / Clickable Slots */}
                                              {hoursArr.map((hour) => (
                                                <div
                                                  key={hour}
                                                  onDoubleClick={(e) => {
                                                    e.stopPropagation();
                                                    // Also run handleDateSelect logic
                                                    handleDateSelect(day);
                                                    // Set time and open dialog
                                                    setTime(
                                                      `${hour.toString().padStart(2, "0")}:00`,
                                                    );
                                                    setIsAddDialogOpen(true);
                                                  }}
                                                  className="h-[50px] border-b border-white/5 last:border-b-0 w-full cursor-pointer hover:bg-indigo-500/20 transition-colors"
                                                />
                                              ))}

                                              {/* Render Tasks */}
                                              {taskColumns.map(
                                                (col, colIdx) => {
                                                  return col.map((task) => {
                                                    const typeColors: any = {
                                                      study:
                                                        "bg-blue-500/40 border-blue-500/60 text-blue-100",
                                                      program:
                                                        "bg-fuchsia-500/40 border-fuchsia-500/60 text-fuchsia-100",
                                                      class:
                                                        "bg-emerald-500/40 border-emerald-500/60 text-emerald-100",
                                                      personal:
                                                        "bg-purple-500/40 border-purple-500/60 text-purple-100",
                                                      sport:
                                                        "bg-rose-500/40 border-rose-500/60 text-rose-100",
                                                      me_time:
                                                        "bg-indigo-500/40 border-indigo-500/60 text-indigo-100",
                                                      default:
                                                        "bg-white/20 border-white/40 text-white",
                                                    };
                                                    const colors =
                                                      typeColors[task.type] ||
                                                      typeColors.default;
                                                    const td = parseISO(
                                                      task.date,
                                                    );

                                                    const startMins =
                                                      (td.getHours() - startH) *
                                                        60 +
                                                      td.getMinutes();
                                                    const topOffset =
                                                      (startMins / 60) * 50;
                                                    const height =
                                                      (task.duration / 60) * 50;

                                                    const width =
                                                      94 / taskColumns.length;
                                                    const left =
                                                      3 + colIdx * width;

                                                    return (
                                                      <div
                                                        key={task.id}
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setSelectedTaskDetails(
                                                            task,
                                                          );
                                                        }}
                                                        className={`absolute rounded-lg border p-1.5 z-10 cursor-pointer overflow-hidden backdrop-blur-md transition-all hover:scale-[1.05] hover:z-30 shadow-2xl ${colors} ${task.status === "completed" ? "opacity-30 grayscale line-through" : ""}`}
                                                        style={{
                                                          top: `${topOffset}px`,
                                                          height: `${Math.max(height, 24)}px`,
                                                          left: `${left}%`,
                                                          width: `${width - 1}%`,
                                                        }}
                                                      >
                                                        <div className="text-[7px] font-black opacity-80 mb-0.5 leading-none flex items-center gap-1">
                                                          {format(td, "HH:mm")}
                                                        </div>
                                                        <div className="text-[9px] font-black leading-tight line-clamp-2">
                                                          {task.title}
                                                        </div>
                                                      </div>
                                                    );
                                                  });
                                                },
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {!tasksHidden && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                          className={`grid md:grid-cols-2 xl:grid-cols-3 gap-6 ${viewMode === "weekly" ? "mt-8" : ""}`}
                        >
                          {filteredTasks.length === 0 ? (
                            <div className="md:col-span-2 xl:col-span-3 flex flex-col items-center justify-center py-24 text-center bg-white/5 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-lg">
                              <Sparkles className="h-12 w-12 text-slate-500 mb-6 opacity-30 animate-pulse" />
                              <h3 className="text-2xl font-black text-white mb-2">
                                {selectedDate
                                  ? "No task today"
                                  : "No tasks found"}
                              </h3>
                              <p className="text-slate-400 text-lg max-w-xs">
                                {selectedDate
                                  ? `You're completely free on ${format(selectedDate, "EEEE")}. Enjoy your break!`
                                  : "Your schedule is currently empty."}
                              </p>
                            </div>
                          ) : (
                            filteredTasks
                              .sort(
                                (a, b) =>
                                  new Date(a.date).getTime() -
                                  new Date(b.date).getTime(),
                              )
                              .map((task) => {
                                const isCompleted = task.status === "completed";

                                let ringColor = "ring-white/10";
                                let bgColor = "bg-white/5";
                                let bgGlow = "";
                                let iconColor = "text-white";

                                if (task.type === "study") {
                                  ringColor = "ring-blue-500/30";
                                  bgColor = "bg-blue-500/10";
                                  bgGlow =
                                    "group-hover:shadow-[0_0_20px_theme(colors.blue.500/20)]";
                                  iconColor = "text-blue-400";
                                } else if (task.type === "program") {
                                  ringColor = "ring-fuchsia-500/30";
                                  bgColor = "bg-fuchsia-500/10";
                                  bgGlow =
                                    "group-hover:shadow-[0_0_20px_theme(colors.fuchsia.500/20)]";
                                  iconColor = "text-fuchsia-400";
                                } else if (task.type === "class") {
                                  ringColor = "ring-emerald-500/30";
                                  bgColor = "bg-emerald-500/10";
                                  bgGlow =
                                    "group-hover:shadow-[0_0_20px_theme(colors.emerald.500/20)]";
                                  iconColor = "text-emerald-400";
                                } else if (task.type === "personal") {
                                  ringColor = "ring-purple-500/30";
                                  bgColor = "bg-purple-500/10";
                                  bgGlow =
                                    "group-hover:shadow-[0_0_20px_theme(colors.purple.500/20)]";
                                  iconColor = "text-purple-400";
                                } else if (task.type === "sport") {
                                  ringColor = "ring-rose-500/30";
                                  bgColor = "bg-rose-500/10";
                                  bgGlow =
                                    "group-hover:shadow-[0_0_20px_theme(colors.rose.500/20)]";
                                  iconColor = "text-rose-400";
                                } else if (task.type === "me_time") {
                                  ringColor = "ring-indigo-500/30";
                                  bgColor = "bg-indigo-500/10";
                                  bgGlow =
                                    "group-hover:shadow-[0_0_20px_theme(colors.indigo.500/20)]";
                                  iconColor = "text-indigo-400";
                                }

                                return (
                                  <Card
                                    key={task.id}
                                    className={`group cursor-pointer transform transition-all duration-300 hover:scale-[1.02] active:scale-95 border-0 rounded-3xl overflow-hidden ring-1 ${ringColor} ${bgColor} backdrop-blur-xl ${bgGlow} ${isCompleted ? "opacity-50 grayscale" : ""}`}
                                    onClick={() => setSelectedTaskDetails(task)}
                                  >
                                    <div className="absolute top-0 right-0 p-4 z-10 flex gap-2">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-400 hover:text-white"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleTaskStatus(task);
                                        }}
                                      >
                                        {isCompleted ? (
                                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                        ) : (
                                          <div className="h-4 w-4 rounded-full border-2 border-slate-400" />
                                        )}
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-400 hover:text-red-400"
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          try {
                                            await deleteTask(task.id!);
                                            toast.success("Task deleted");
                                          } catch (err) {
                                            toast.error("Failed to delete task");
                                          }
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>

                                    <CardContent className="p-6 relative">
                                      <div className="flex items-center gap-2 mb-4">
                                        <div
                                          className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-md bg-black/20 ${iconColor}`}
                                        >
                                          {task.type}
                                        </div>
                                        {task.duration >= 60 && (
                                          <div className="text-[10px] uppercase font-bold px-2 py-1 rounded-md bg-white/10 text-slate-300">
                                            Long Task
                                          </div>
                                        )}
                                      </div>

                                      <h3
                                        className={`text-xl font-bold mb-4 tracking-tight ${isCompleted ? "line-through text-slate-400" : "text-white"}`}
                                      >
                                        {task.title}
                                      </h3>

                                      <div className="flex flex-col gap-2 mt-auto">
                                        <div className="flex items-center text-sm font-medium text-slate-300 bg-black/20 w-fit px-3 py-1.5 rounded-lg border border-white/5">
                                          <Clock
                                            className={`w-4 h-4 mr-2 ${iconColor}`}
                                          />{" "}
                                          {format(
                                            new Date(task.date),
                                            "h:mm a",
                                          )}{" "}
                                          <span className="opacity-50 mx-2">
                                            •
                                          </span>{" "}
                                          {task.duration} min
                                        </div>
                                      </div>

                                      {/* Biometrics Micro-Indices */}
                                      {(() => {
                                        const bioVal = getTaskBiometrics(task.type, task.energyImpact, task.duration);
                                        return (
                                          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/[0.04] text-[10px] font-bold text-zinc-400 font-mono select-none">
                                            <div className="flex items-center gap-1 bg-blue-500/5 px-2 py-1 rounded-lg border border-blue-500/10" title="Cognitive Demand">
                                              <Brain className="w-3.5 h-3.5 text-blue-400" />
                                              <span>C:{bioVal.cognitive}%</span>
                                            </div>
                                            <div className="flex items-center gap-1 bg-amber-500/5 px-2 py-1 rounded-lg border border-amber-500/10" title="Physical Vitality">
                                              <Zap className="w-3.5 h-3.5 text-amber-500" />
                                              <span>P:{bioVal.physical}%</span>
                                            </div>
                                            <div className="flex items-center gap-1 bg-emerald-500/5 px-2 py-1 rounded-lg border border-emerald-500/10" title="Restorative Recovery">
                                              <Moon className="w-3.5 h-3.5 text-emerald-400" />
                                              <span>R:{bioVal.recovery}%</span>
                                            </div>
                                          </div>
                                        );
                                      })()}
                                    </CardContent>
                                  </Card>
                                );
                              })
                          )}
                        </motion.div>
                      )}
                    </div>

                    {/* Calendar & Metrics removed from bottom */}
                  </div>
                </div>
                {/* Scroll Spacer to escape mobile bottom nav overlay */}
                <div className="h-44 sm:hidden block w-full shrink-0 pointer-events-none" />
              </div>
            </motion.div>
          )}

          {activeTab === "calendar" && (
            <motion.div
              key="calendar"
              custom={slideDirection}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <div className="w-full">
                <div className="flex flex-col items-center justify-center text-center gap-6 mb-12 bg-[#0e0d12]/60 border border-zinc-850 p-6 sm:p-8 rounded-3xl shadow-xl backdrop-blur-md w-full">
                  <div className="text-center flex flex-col items-center justify-center">
                    <div className="flex items-center gap-2 mb-2 justify-center">
                      <div className="w-1.5 h-4 bg-purple-500 rounded-full animate-pulse" />
                      <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">
                        Scheduler Studio
                      </h2>
                    </div>
                    <h3 className="text-3xl font-black text-white tracking-tight">
                      Calendar <span className="text-purple-400 font-medium">Core</span>
                    </h3>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-4 w-full">
                    <div className="flex bg-zinc-950 rounded-xl p-1 border border-zinc-850 shadow-inner w-full sm:w-auto max-w-xs justify-center mx-auto">
                      {(['year', 'month', 'day'] as const).map((view) => (
                        <button
                          key={view}
                          onClick={() => setCalendarView(view)}
                          className={`flex-1 sm:px-6 py-2 text-[10px] font-black uppercase tracking-[0.1em] rounded-lg transition-all duration-300 cursor-pointer ${calendarView === view ? "bg-purple-500 text-white shadow-md shadow-purple-500/10" : "text-zinc-500 hover:text-zinc-300"}`}
                        >
                          {view}
                        </button>
                      ))}
                    </div>
                    {/* Integrated Calendar Search Bar */}
                    <div className="relative w-full max-w-md mx-auto">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 flex items-center">
                        <Search size={14} className="text-purple-400 animate-pulse" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search tasks by title, category, description..."
                        value={calendarSearchQuery}
                        onChange={(e) => setCalendarSearchQuery(e.target.value)}
                        className="w-full h-10 pl-10 pr-10 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 backdrop-blur-md transition-all font-sans font-medium text-center"
                      />
                      {calendarSearchQuery && (
                        <button
                          onClick={() => setCalendarSearchQuery("")}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-[10px] font-black p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                      <Button
                        onClick={handleAutoReschedule}
                        disabled={isAiLoading}
                        className="shadow-md bg-purple-500 hover:bg-purple-600 text-white font-black rounded-xl h-11 px-5 transition-all uppercase text-[10px] tracking-widest cursor-pointer shadow-purple-500/10"
                      >
                        {isAiLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        Susun AI
                      </Button>

                      <Button
                        onClick={() => {
                          if (!selectedDate) handleDateSelect(new Date());
                          setIsAddDialogOpen(true);
                        }}
                        className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold rounded-xl h-11 px-5 transition-all uppercase text-[10px] tracking-widest shadow-md cursor-pointer"
                      >
                        <Plus size={16} className="mr-2" /> Task
                      </Button>

                      <Button
                        onClick={handlePurgeWeek}
                        variant="ghost"
                        className="bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 border border-rose-500/25 hover:border-rose-500/40 text-rose-400 rounded-xl h-11 px-4 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-rose-950/20 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>( purge week)</span>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  <div className="lg:col-span-3">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-6">
                      {calendarView === "month" && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div className="flex items-center justify-between mb-6 px-2">
                            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-3">
                              <CalendarIcon className="text-indigo-400" />
                              {format(currentMonth, "MMMM yyyy")}
                            </h3>
                          </div>

                          <div className="bg-white/10 rounded-2xl overflow-hidden border border-white/10">
                            <div className="grid grid-cols-7 gap-px">
                              {["S", "M", "T", "W", "T", "F", "S"].map(
                                (day, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-black/40 p-2 sm:p-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5"
                                  >
                                    {day}
                                  </div>
                                ),
                              )}
                            </div>

                            <div className="grid grid-cols-7 gap-px">
                              {(() => {
                                const start = startOfMonth(currentMonth);
                                const end = endOfMonth(currentMonth);
                                const startD = startOfWeek(start);
                                const endD = endOfWeek(end);
                                const days = eachDayOfInterval({
                                  start: startD,
                                  end: endD,
                                });

                                return days.map((d, i) => {
                                  const isCurrentMonth = isSameMonth(
                                    d,
                                    currentMonth,
                                  );
                                  const isToday = isSameDay(d, new Date());
                                  const isSelected =
                                    selectedDate && isSameDay(d, selectedDate);
                                  const dayTasks = tasks.filter((t) =>
                                    isSameDay(parseISO(t.date), d),
                                  );
                                  const hasSearchMatch = !!(calendarSearchQuery && dayTasks.some((t) =>
                                    t.title.toLowerCase().includes(calendarSearchQuery.toLowerCase()) ||
                                    t.type.toLowerCase().includes(calendarSearchQuery.toLowerCase()) ||
                                    (t.description && t.description.toLowerCase().includes(calendarSearchQuery.toLowerCase()))
                                  ));

                                  return (
                                    <div
                                      key={i}
                                      onClick={() => handleDateSelect(d)}
                                      onDoubleClick={() => {
                                        handleDateSelect(d);
                                        if (dayTasks.length > 0) {
                                          setCalendarView("day");
                                        } else {
                                          handleDateSelect(d);
                                          setIsAddDialogOpen(true);
                                        }
                                      }}
                                      className={`min-h-[80px] sm:min-h-[110px] p-1 sm:p-2 transition-all cursor-pointer relative border-r border-b border-white/5 group ${
                                        !isCurrentMonth
                                          ? "bg-black/60 opacity-30"
                                          : hasSearchMatch
                                            ? "bg-amber-500/[0.04] hover:bg-amber-500/[0.08]"
                                            : "bg-black/20 hover:bg-white/[0.03]"
                                      } ${isSelected ? "ring-2 ring-inset ring-purple-500 z-10 bg-purple-500/5" : ""} ${hasSearchMatch && !isSelected ? "ring-1 ring-inset ring-amber-500/45 shadow-[0_0_10px_rgba(245,158,11,0.08)]" : ""}`}
                                    >
                                      <div
                                        className={`text-[10px] sm:text-xs font-black mb-1 sm:mb-2 flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg transition-colors ${isToday ? "bg-purple-500 text-white shadow-lg font-black" : hasSearchMatch ? "bg-amber-500 text-black font-black shadow-md shadow-amber-500/10" : "text-slate-400 group-hover:text-slate-200"}`}
                                      >
                                        {format(d, "d")}
                                      </div>

                                      <div className="flex flex-wrap gap-0.5 justify-center sm:justify-start">
                                        {dayTasks.slice(0, 3).map((t) => {
                                          const isPillMatch = calendarSearchQuery && (
                                            t.title.toLowerCase().includes(calendarSearchQuery.toLowerCase()) ||
                                            t.type.toLowerCase().includes(calendarSearchQuery.toLowerCase()) ||
                                            (t.description && t.description.toLowerCase().includes(calendarSearchQuery.toLowerCase()))
                                          );
                                          return (
                                            <div
                                              key={t.id}
                                              className={`w-1.5 h-1.5 sm:w-auto sm:h-auto sm:text-[8px] sm:font-black sm:px-1.5 sm:py-0.5 rounded-full sm:rounded truncate border uppercase tracking-tighter transition-all ${
                                                isPillMatch
                                                  ? "bg-amber-400 text-black border-amber-300 font-extrabold shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                                                  : "border-white/5 bg-purple-500 sm:bg-white/5 text-transparent sm:text-slate-300"
                                              }`}
                                              title={`${t.title} (${t.type})`}
                                            >
                                              {t.title}
                                            </div>
                                          );
                                        })}
                                        {dayTasks.length > 3 && (
                                          <div className="text-[6px] sm:text-[7px] font-black text-purple-400">
                                            +
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          </div>
                        </div>
                      )}

                      {calendarView === "year" && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div className="flex items-center justify-between mb-8 px-2">
                            <h3 className="text-xl font-black text-white flex items-center gap-3">
                              <span className="text-indigo-400">📅</span>
                              {format(currentMonth, "yyyy")}
                            </h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {eachMonthOfInterval({
                              start: startOfYear(currentMonth),
                              end: endOfYear(currentMonth),
                            }).map((month, mIdx) => (
                              <div
                                key={mIdx}
                                className="bg-black/40 rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-colors cursor-pointer"
                                onClick={() => {
                                  setCurrentMonth(month);
                                  setCalendarView("month");
                                }}
                              >
                                <h4 className="text-sm font-black text-white mb-3 px-1">
                                  {format(month, "MMMM")}
                                </h4>
                                <div className="grid grid-cols-7 gap-1">
                                  {["S", "M", "T", "W", "T", "F", "S"].map(
                                    (d, dIdx) => (
                                      <div
                                        key={dIdx}
                                        className="text-[7px] font-bold text-slate-600 text-center"
                                      >
                                        {d}
                                      </div>
                                    ),
                                  )}
                                  {eachDayOfInterval({
                                    start: startOfWeek(startOfMonth(month)),
                                    end: endOfWeek(endOfMonth(month)),
                                  }).map((d, dIdx) => (
                                    <div
                                      key={dIdx}
                                      className={`h-4 flex items-center justify-center text-[8px] font-bold rounded-sm ${
                                        !isSameMonth(d, month)
                                          ? "opacity-0"
                                          : isSameDay(d, new Date())
                                            ? "bg-indigo-500 text-white"
                                            : (() => {
                                                const dayTasks = tasks.filter((t) => isSameDay(parseISO(t.date), d));
                                                if (dayTasks.length === 0) return "text-slate-550";
                                                const isYearMatch = !!(calendarSearchQuery && dayTasks.some((t) =>
                                                  t.title.toLowerCase().includes(calendarSearchQuery.toLowerCase()) ||
                                                  t.type.toLowerCase().includes(calendarSearchQuery.toLowerCase()) ||
                                                  (t.description && t.description.toLowerCase().includes(calendarSearchQuery.toLowerCase()))
                                                ));
                                                return isYearMatch
                                                  ? "text-amber-400 font-extrabold scale-110 bg-amber-400/20 px-1 rounded-sm animate-pulse"
                                                  : "text-indigo-400";
                                              })()
                                      }`}
                                    >
                                      {format(d, "d")}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {calendarView === "day" && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div className="flex items-center justify-between mb-8 px-2">
                            <h3 className="text-xl font-black text-white flex items-center gap-3">
                              <Clock className="text-indigo-400" />
                              {format(
                                selectedDate || new Date(),
                                "EEEE, d MMMM yyyy",
                              )}
                            </h3>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-white bg-white/5"
                                onClick={() =>
                                  handleDateSelect(
                                    addDays(selectedDate || new Date(), -1),
                                  )
                                }
                              >
                                <ChevronLeft size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-white bg-white/5"
                                onClick={() =>
                                  handleDateSelect(
                                    addDays(selectedDate || new Date(), 1),
                                  )
                                }
                              >
                                <ChevronRight size={16} />
                              </Button>
                            </div>
                          </div>

                          <div className="bg-black/40 rounded-2xl border border-white/5 overflow-hidden">
                            <div className="grid grid-cols-1 divide-y divide-white/5 max-h-[600px] overflow-y-auto scrollbar-hide">
                              {Array.from({ length: 24 }).map((_, hour) => {
                                const hourTasks = tasks.filter((t) => {
                                  const td = parseISO(t.date);
                                  return (
                                    isSameDay(td, selectedDate || new Date()) &&
                                    td.getHours() === hour
                                  );
                                });

                                return (
                                  <div
                                    key={hour}
                                    className="flex min-h-[80px] group transition-colors hover:bg-white/[0.02]"
                                  >
                                    <div className="w-20 shrink-0 p-4 text-[10px] font-black text-slate-500 border-r border-white/5 bg-black/20 flex items-start justify-center">
                                      {format(
                                        parse(hour.toString(), "H", new Date()),
                                        "h:mm a",
                                      )}
                                    </div>
                                    <div className="flex-1 p-3 flex flex-col gap-2">
                                      {hourTasks.map((t) => {
                                        const isDayTaskMatch = !!(calendarSearchQuery && (
                                          t.title.toLowerCase().includes(calendarSearchQuery.toLowerCase()) ||
                                          t.type.toLowerCase().includes(calendarSearchQuery.toLowerCase()) ||
                                          (t.description && t.description.toLowerCase().includes(calendarSearchQuery.toLowerCase()))
                                        ));
                                        return (
                                          <div
                                            key={t.id}
                                            onClick={() => setSelectedTaskDetails(t)}
                                            className={`border rounded-xl p-3 flex items-center justify-between group/task transition-all cursor-pointer ${
                                              isDayTaskMatch 
                                                ? "bg-amber-500/10 border-amber-500/40 hover:bg-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                                                : "bg-indigo-500/20 border-indigo-500/30 hover:bg-indigo-500/30"
                                            }`}
                                          >
                                            <div className="flex items-center gap-3">
                                              <div className={`w-1 h-8 rounded-full ${isDayTaskMatch ? "bg-amber-400 animate-pulse animate-duration-1000" : "bg-indigo-500"}`} />
                                              <div>
                                                <div className="text-xs font-black text-white">
                                                  {t.title}
                                                </div>
                                                <div className="text-[10px] text-slate-400">
                                                  {t.duration} min • {t.type}
                                                </div>
                                              </div>
                                            </div>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-8 w-8 text-slate-500 hover:text-rose-400 opacity-0 group-hover/task:opacity-100 transition-opacity z-10"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                deleteTask(t.id);
                                              }}
                                            >
                                              <Trash2 size={14} />
                                            </Button>
                                          </div>
                                        );
                                      })}
                                      {hourTasks.length === 0 && (
                                        <div className="h-full flex items-center text-[10px] font-bold text-slate-600 tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                                          No events scheduled
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-1">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 h-full flex flex-col shadow-2xl">
                      {calendarSearchQuery ? (
                        <>
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <h3 className="text-xl font-black text-white flex items-center gap-2">
                                <Search size={18} className="text-amber-400 animate-pulse" />
                                Search Results
                              </h3>
                              <p className="text-[10px] font-bold text-amber-400/80 uppercase tracking-widest mt-1">
                                {(() => {
                                  const matches = tasks.filter((t) =>
                                    t.title.toLowerCase().includes(calendarSearchQuery.toLowerCase()) ||
                                    t.type.toLowerCase().includes(calendarSearchQuery.toLowerCase()) ||
                                    (t.description && t.description.toLowerCase().includes(calendarSearchQuery.toLowerCase()))
                                  );
                                  return `${matches.length} matches found`;
                                })()}
                              </p>
                            </div>
                          </div>

                          <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-hide py-2">
                            {(() => {
                              const matches = tasks.filter((t) =>
                                t.title.toLowerCase().includes(calendarSearchQuery.toLowerCase()) ||
                                t.type.toLowerCase().includes(calendarSearchQuery.toLowerCase()) ||
                                (t.description && t.description.toLowerCase().includes(calendarSearchQuery.toLowerCase()))
                              ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                              if (matches.length === 0) {
                                return (
                                  <div className="h-40 flex flex-col items-center justify-center text-center">
                                    <AlertTriangle className="text-zinc-650 mb-3 animate-bounce" size={24} />
                                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                      No Tasks Match
                                    </p>
                                    <p className="text-[9px] text-zinc-600 font-sans mt-1">
                                      Try adjusting search terms
                                    </p>
                                  </div>
                                );
                              }

                              return matches.map((task) => {
                                const tDate = parseISO(task.date);
                                return (
                                  <Card
                                    key={task.id}
                                    className="bg-zinc-950/40 border-amber-400/20 hover:border-amber-400/40 hover:bg-amber-400/[0.02] cursor-pointer transition-all group p-4 rounded-2xl relative border overflow-hidden active:scale-95 flex flex-col"
                                    onClick={() => {
                                      setSelectedDate(tDate);
                                      setCurrentMonth(tDate);
                                      setSelectedTaskDetails(task);
                                    }}
                                  >
                                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-500/70 animate-pulse" />
                                    <div className="flex justify-between items-start mb-2">
                                      <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 px-1.5 py-0.5 rounded">
                                        {format(tDate, "MMM d, yyyy")}
                                      </span>
                                      <span className="text-[9px] font-black text-zinc-500 font-mono">
                                        {format(tDate, "h:mm a")}
                                      </span>
                                    </div>
                                    <h4 className="text-xs font-black text-white mb-2 line-clamp-1 group-hover:text-amber-300 transition-colors">
                                      {task.title}
                                    </h4>
                                    <div className="flex items-center gap-2 text-[9px] font-black text-zinc-550 uppercase tracking-tighter">
                                      {task.duration} MIN • <span className="text-amber-400/80 font-bold">{task.type}</span>
                                    </div>
                                    {/* Sidebar micro-biometrics row */}
                                    {(() => {
                                      const bio = getTaskBiometrics(task.type, task.energyImpact, task.duration);
                                      return (
                                        <div className="flex items-center gap-2 pt-2 mt-3 border-t border-white/[0.03] text-[9.5px] font-semibold text-zinc-550 font-mono select-none">
                                          <div className="flex items-center gap-0.5" title="Cognitive">
                                            <Brain className="w-3 h-3 text-blue-400/80" />
                                            <span>{bio.cognitive}%</span>
                                          </div>
                                          <div className="flex items-center gap-0.5" title="Physical">
                                            <Zap className="w-3 h-3 text-amber-500/80" />
                                            <span>{bio.physical}%</span>
                                          </div>
                                          <div className="flex items-center gap-0.5" title="Recovery">
                                            <Moon className="w-3 h-3 text-emerald-400/80" />
                                            <span>{bio.recovery}%</span>
                                          </div>
                                        </div>
                                      );
                                    })()}
                                  </Card>
                                );
                              });
                            })()}
                          </div>
                          
                          <Button
                            onClick={() => setCalendarSearchQuery("")}
                            variant="ghost"
                            className="w-full mt-4 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 h-10 rounded-xl"
                          >
                            Clear Search Filter
                          </Button>
                        </>
                      ) : selectedDate ? (
                        <>
                          <div className="flex items-center justify-between mb-8">
                            <div>
                              <h3 className="text-xl font-black text-white">
                                Daily Focus
                              </h3>
                              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">
                                {format(selectedDate, "MMMM d")}
                              </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                              <LayoutList
                                size={18}
                                className="text-indigo-400"
                              />
                            </div>
                          </div>
                          <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-hide py-2">
                            {tasks.filter((t) =>
                              isSameDay(parseISO(t.date), selectedDate),
                            ).length === 0 ? (
                              <div className="h-40 flex flex-col items-center justify-center text-center">
                                <Sparkles
                                  size={24}
                                  className="text-slate-600 mb-3 opacity-30"
                                />
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest italic">
                                  Open Schedule
                                </p>
                              </div>
                            ) : (
                              tasks
                                .filter((t) =>
                                  isSameDay(parseISO(t.date), selectedDate),
                                )
                                .map((task) => (
                                  <Card
                                    key={task.id}
                                    className="bg-black/40 border-white/5 hover:bg-white/[0.04] cursor-pointer transition-all group p-4 rounded-2xl relative border overflow-hidden active:scale-95"
                                    onClick={() => setSelectedTaskDetails(task)}
                                  >
                                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-indigo-500/50" />
                                    <div className="flex justify-between items-start mb-2">
                                      <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                                        {format(new Date(task.date), "h:mm a")}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all z-10"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteTask(task.id!);
                                        }}
                                      >
                                        <Trash2 size={12} />
                                      </Button>
                                    </div>
                                    <h4 className="text-sm font-bold text-white mb-2 line-clamp-1">
                                      {task.title}
                                    </h4>
                                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-tighter mb-3">
                                      {task.duration} MIN • {task.type}
                                    </div>
                                    {/* Sidebar micro-biometrics row */}
                                    {(() => {
                                      const bio = getTaskBiometrics(task.type, task.energyImpact, task.duration);
                                      return (
                                        <div className="flex items-center gap-2.5 pt-2 border-t border-white/[0.03] text-[9.5px] font-bold text-zinc-500 font-mono select-none">
                                          <div className="flex items-center gap-0.5" title="Cognitive">
                                            <Brain className="w-3 h-3 text-blue-400" />
                                            <span>{bio.cognitive}%</span>
                                          </div>
                                          <div className="flex items-center gap-0.5" title="Physical">
                                            <Zap className="w-3 h-3 text-amber-500" />
                                            <span>{bio.physical}%</span>
                                          </div>
                                          <div className="flex items-center gap-0.5" title="Recovery">
                                            <Moon className="w-3 h-3 text-emerald-400" />
                                            <span>{bio.recovery}%</span>
                                          </div>
                                        </div>
                                      );
                                    })()}
                                  </Card>
                                ))
                            )}
                          </div>
                          <Button
                            onClick={() => setIsAddDialogOpen(true)}
                            variant="outline"
                            className="w-full mt-6 border-white/10 bg-transparent text-slate-300 font-black uppercase text-[10px] tracking-widest hover:text-white hover:bg-white/5 rounded-xl h-12"
                          >
                            New Activity
                          </Button>
                        </>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center py-12">
                          <div className="w-16 h-16 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center mb-6">
                            <CalendarIcon
                              size={32}
                              className="text-indigo-400/20"
                            />
                          </div>
                          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest max-w-[140px] leading-relaxed">
                            Select a date to unlock schedule focus
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Scroll Spacer to escape mobile bottom nav overlay */}
                <div className="h-44 sm:hidden block w-full shrink-0 pointer-events-none" />
              </div>
            </motion.div>
          )}

          {activeTab === "ai" && (
            <motion.div
              key="ai"
              custom={slideDirection}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex justify-center"
            >
              <div className="w-full max-w-3xl">
                <div className="mb-8">
                  <h2 className="text-sm font-black uppercase tracking-widest text-purple-400 flex items-center gap-3">
                    <Sparkles className="text-purple-400 w-5 h-5" /> SusunAi
                    Intelligence
                  </h2>
                  <p className="text-slate-500 text-[10px] mt-2 uppercase font-bold tracking-tight">
                    Your automated schedule optimizer and academic assistant.
                  </p>
                </div>

                <Card className="bg-[#0e0d12]/60 border border-zinc-850 backdrop-blur-md shadow-[0_0_30px_rgba(168,85,247,0.05)] rounded-3xl overflow-hidden mb-8 relative">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/[0.04] blur-[50px] rounded-full pointer-events-none" />
                  <div className="bg-zinc-950 p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between border-b border-zinc-800">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Schedule Triage
                      </h3>
                      <p className="text-zinc-400 text-sm max-w-md">
                        Our AI system can analyze your current tasks, find
                        missed items, and suggest optimal times to re-schedule
                        them based on your ({energyType}) energy profile.
                      </p>
                    </div>
                    <Button
                      onClick={handleAutoReschedule}
                      disabled={isAiLoading}
                      className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 shadow-md rounded-xl font-bold px-6 py-5 h-auto md:w-auto w-full group transition-all"
                    >
                      {isAiLoading ? (
                        <Loader2 className="animate-spin mr-2" size={18} />
                      ) : (
                        <BrainCircuit
                          className="mr-2 group-hover:scale-110 transition-transform"
                          size={18}
                        />
                      )}
                      {isAiLoading ? "Analyzing..." : "Run Diagnostics"}
                    </Button>
                  </div>
                  <CardContent className="p-0">
                    <div className="bg-zinc-950/40 p-6 min-h-[100px]">
                      {isAiLoading ? (
                        <div className="flex flex-col items-center justify-center h-[100px] gap-4">
                          <Loader2 className="animate-spin text-purple-400 w-8 h-8" />
                          <p className="text-slate-400 font-medium animate-pulse">
                            Running advanced permutations...
                          </p>
                        </div>
                      ) : rescheduleResponse ? (
                        <div className="flex flex-col gap-6">
                          <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                            <div
                              className={`text-4xl font-black ${rescheduleResponse.score > 80 ? "text-emerald-400" : rescheduleResponse.score > 50 ? "text-amber-400" : "text-rose-400"}`}
                            >
                              {rescheduleResponse.score}
                            </div>
                            <div>
                              <h4 className="text-white font-bold tracking-wider uppercase text-sm">
                                Schedule Health Score
                              </h4>
                              <p className="text-slate-400 text-xs mt-1">
                                {rescheduleResponse.summary}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {rescheduleResponse.actionable_insights?.map(
                              (insight: any, i: number) => (
                                <div
                                  key={i}
                                  className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col justify-between hover:bg-white/10 transition-colors"
                                >
                                  <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      {insight.iconType === "rest" ? (
                                        <Coffee
                                          className="text-emerald-400"
                                          size={16}
                                        />
                                      ) : insight.iconType === "focus" ? (
                                        <Target
                                          className="text-rose-400"
                                          size={16}
                                        />
                                      ) : (
                                        <Target
                                          className="text-indigo-400"
                                          size={16}
                                        />
                                      )}
                                      <h5 className="font-bold text-slate-200 text-sm">
                                        {insight.title}
                                      </h5>
                                    </div>
                                    <p className="text-slate-400 text-xs">
                                      {insight.description}
                                    </p>
                                  </div>
                                  <Button
                                    variant="secondary"
                                    className="w-full text-xs font-bold h-8"
                                    onClick={() => setIsAddDialogOpen(true)}
                                  >
                                    {insight.actionText}
                                  </Button>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-slate-500 text-center text-sm">
                          No recent diagnostics run.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#0e0d12]/60 border border-zinc-850 backdrop-blur-md shadow-[0_0_30px_rgba(168,85,247,0.05)] rounded-3xl overflow-hidden mb-8 relative">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-fuchsia-500/[0.04] blur-[50px] rounded-full pointer-events-none" />
                  <div className="bg-zinc-950 p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between border-b border-zinc-800">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Behavioral CI Engine
                      </h3>
                      <p className="text-zinc-400 text-sm max-w-md">
                        Synthesizes your MBTI, habits, and schedule using Neural
                        Networks and Particle Swarm Optimization to generate a
                        hyper-personalized routine.
                      </p>
                    </div>
                    <Button
                      onClick={handleBehavioralDiagnostics}
                      disabled={isBehavioralLoading}
                      className="bg-purple-500 hover:bg-purple-600 text-white font-black shadow-md shadow-purple-500/10 rounded-xl px-6 py-5 h-auto md:w-auto w-full group transition-all cursor-pointer"
                    >
                      {isBehavioralLoading ? (
                        <Loader2 className="animate-spin mr-2" size={18} />
                      ) : (
                        <Zap
                          className="mr-2 group-hover:scale-110 transition-transform"
                          size={18}
                        />
                      )}
                      {isBehavioralLoading
                        ? "Simulating..."
                        : "Run Deep Profile"}
                    </Button>
                  </div>
                  <CardContent className="p-0">
                    <div className="bg-zinc-950/40 p-6 min-h-[100px]">
                      {isBehavioralLoading ? (
                        <div className="flex flex-col items-center justify-center h-[200px] gap-4">
                          <div className="relative w-16 h-16">
                            <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
                          </div>
                          <div className="text-center">
                            <p className="text-white font-bold animate-pulse">
                              Running Neural Optimization...
                            </p>
                            <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-2">
                              Mapping MBTI to Time Constants
                            </p>
                          </div>
                        </div>
                      ) : behavioralResponse ? (
                        <div className="space-y-8">
                          <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2 italic">
                              <Brain className="w-3 h-3" /> Personal Insight
                              Pattern
                            </h4>
                            <p className="text-slate-200 text-sm italic leading-relaxed">
                              "{behavioralResponse.personal_insight}"
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2">
                                <Activity className="w-3 h-3" /> Predicted
                                Energy Map
                              </h4>
                              <div className="space-y-3">
                                {Object.entries(
                                  (Array.isArray(behavioralResponse.energy_map) 
                                    ? (behavioralResponse.energy_map[0] || {}) 
                                    : (behavioralResponse.energy_map || {}))
                                ).filter(([key]) => key !== 'day').map(([time, level]: [string, any]) => {
                                  // Ensure level is a number
                                  const levelNum = typeof level === 'number' ? level : 
                                                 (typeof level === 'string' && !isNaN(parseInt(level))) ? parseInt(level) : 50;
                                  
                                  return (
                                    <div
                                      key={time}
                                      className="flex items-center gap-3"
                                    >
                                      <span className="text-[10px] font-bold text-slate-500 w-16 uppercase">
                                        {time}
                                      </span>
                                      <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full bg-gradient-to-r ${levelNum > 80 ? "from-emerald-400 to-emerald-600" : levelNum > 50 ? "from-purple-400 to-purple-600" : "from-indigo-500 to-indigo-700"}`}
                                          style={{ width: `${levelNum}%` }}
                                        />
                                      </div>
                                      <span className="text-[10px] font-bold text-white w-8">
                                        {levelNum}%
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2">
                                <Zap className="w-3 h-3" /> Risk Identification
                                (Burnout)
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {behavioralResponse.risk_zones?.map(
                                  (risk: string, i: number) => (
                                    <div
                                      key={i}
                                      className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-bold rounded-lg uppercase tracking-tight"
                                    >
                                      {risk}
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="pt-6 border-t border-white/10">
                            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <CalendarClock className="w-3 h-3" />{" "}
                              PSO-Optimized Action Plan
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              {behavioralResponse.action_plan?.map(
                                (step: any, i: number) => (
                                  <div
                                    key={i}
                                    className="bg-black/40 p-4 rounded-xl border border-white/5 group hover:border-emerald-500/30 transition-all"
                                  >
                                    <div className="text-[10px] font-bold text-slate-500 mb-2">
                                      {step.time || `Phase ${i + 1}`}
                                    </div>
                                    <div className="text-white font-bold text-xs mb-1 group-hover:text-emerald-400 transition-colors">
                                      {step.task}
                                    </div>
                                    <p className="text-[10px] text-slate-500 leading-tight">
                                      {step.focus_type}
                                    </p>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-8 text-center bg-black/10 rounded-xl border border-dashed border-white/10">
                          <UserCheck className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                          <h5 className="text-slate-400 font-bold text-sm">
                            Deep Profile Analysis Pending
                          </h5>
                          <p className="text-slate-600 text-[11px] mt-1">
                            Fill your Profile traits then run CI simulation.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <Card className="lg:col-span-1 bg-[#0e0d12]/50 border border-zinc-850 backdrop-blur-md shadow-xl rounded-3xl p-6 flex flex-col group hover:border-purple-500/30 hover:shadow-[0_0_25px_rgba(168,85,247,0.12)] transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/[0.04] blur-[40px] rounded-full pointer-events-none transition-all duration-300 group-hover:scale-110" />
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                        <Sparkles className="text-purple-400 w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        AI Task Solver
                      </h3>
                    </div>
                    <p className="text-zinc-400 text-sm mb-4">
                      Struggling with a specific task? Ask SusunAi for strategic
                      help, tips, or solutions.
                    </p>

                    <div className="space-y-4 flex-1 flex flex-col">
                      <div className="space-y-2">
                        <Label className="text-xs text-zinc-400">
                          Select Task (Optional)
                        </Label>
                        <Select
                          value={selectedTaskIdForProblem}
                          onValueChange={setSelectedTaskIdForProblem}
                        >
                          <SelectTrigger className="bg-zinc-950 border border-zinc-900 text-white h-10 rounded-xl">
                            <SelectValue placeholder="General Inquiry" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-950 border border-zinc-800 text-white max-h-[200px]">
                            <SelectItem value="none">
                              General Inquiry
                            </SelectItem>
                            {tasks
                              .filter((t) => t.status !== "completed")
                              .slice(0, 15)
                              .map((t) => (
                                <SelectItem key={t.id} value={t.id!}>
                                  {t.title}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Textarea
                        value={problemInput}
                        onChange={(e) => setProblemInput(e.target.value)}
                        placeholder="I'm stuck on this project because... / How do I study for this?"
                        className="w-full flex-1 min-h-[120px] bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all text-sm mb-4"
                      />

                      <Button
                        onClick={handleSolveProblem}
                        disabled={isProblemLoading || !problemInput.trim()}
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white font-black h-12 rounded-xl shrink-0 cursor-pointer shadow-lg shadow-purple-500/10"
                      >
                        {isProblemLoading ? (
                          <Loader2 className="animate-spin mr-2" />
                        ) : (
                          <BrainCircuit className="mr-2 h-4 w-4" />
                        )}
                        Ask SusunAi
                      </Button>
                    </div>

                    <AnimatePresence>
                      {problemResponse && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-6 pt-6 border-t border-white/10 overflow-hidden"
                        >
                          <div className="bg-black/40 rounded-xl p-4 border border-white/5 max-h-[300px] overflow-y-auto">
                            <div className="text-xs font-bold text-purple-400 uppercase mb-2">
                              Solution Recommendation
                            </div>
                            <div className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
                              {problemResponse}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>

                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="bg-[#0e0d12]/50 border border-zinc-850 backdrop-blur-md shadow-xl rounded-3xl p-6 group hover:border-emerald-500/30 hover:shadow-[0_0_25px_rgba(16,185,129,0.12)] transition-all duration-300 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.04] blur-[40px] rounded-full pointer-events-none transition-all duration-300 group-hover:scale-110" />
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                          <CalendarClock className="text-emerald-400 w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-white">
                          Import Timetable
                        </h3>
                      </div>
                      <p className="text-zinc-400 text-sm mb-4">
                        Paste your weekly schedule or upload a PDF timetable to
                        generate your semester calendar instantly.
                      </p>

                      <div className="space-y-4">
                        <textarea
                          value={timetableInput}
                          onChange={(e) => setTimetableInput(e.target.value)}
                          placeholder="e.g. Monday 10am-12pm Calculus, Tuesday 2pm-4pm Physics..."
                          className="w-full h-32 bg-zinc-950 border border-zinc-900 rounded-xl p-4 text-white placeholder:text-zinc-650 focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all font-mono text-xs"
                        />

                        <div className="relative group">
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setTimetableFile(file);
                            }}
                            className="hidden"
                            id="timetable-pdf"
                          />
                          <Label
                            htmlFor="timetable-pdf"
                            className={`flex items-center justify-center gap-3 w-full p-4 border rounded-xl cursor-pointer transition-all ${timetableFile ? "border-emerald-550 bg-emerald-500/10 text-emerald-400" : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-300 hover:border-zinc-700"}`}
                          >
                            {timetableFile ? (
                              <>
                                <CheckCircle2 className="w-5 h-5" />{" "}
                                {timetableFile.name}
                              </>
                            ) : (
                              <>
                                <FileUp className="w-5 h-5" /> Upload PDF
                                Timetable
                              </>
                            )}
                          </Label>
                        </div>
                        <div className="space-y-3 pt-1">
                          <div className="w-full">
                            <Label className="text-xs text-zinc-400 mb-1.5 block">
                              Repeat for (Weeks)
                            </Label>
                            <Input
                              type="number"
                              value={repeatWeeks}
                              onChange={(e) => setRepeatWeeks(e.target.value)}
                              className="bg-zinc-950 border-zinc-900 text-white h-10 rounded-xl focus:ring-1 focus:ring-emerald-500/30 w-full"
                            />
                          </div>
                          <Button
                            onClick={handleImportTimetable}
                            disabled={
                              isTimetableLoading ||
                              (!timetableInput.trim() && !timetableFile)
                            }
                            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none text-white font-bold h-10 rounded-xl cursor-pointer shadow-md shadow-emerald-500/10 transition-all duration-200"
                          >
                            {isTimetableLoading ? (
                              <Loader2 className="animate-spin mr-2 h-4 w-4" />
                            ) : (
                              <Sparkles className="mr-2 h-4 w-4" />
                            )}
                            Auto-Generate
                          </Button>
                        </div>
                      </div>
                    </Card>

                    <Card className="bg-[#0e0d12]/50 border border-zinc-850 backdrop-blur-md shadow-xl rounded-3xl p-6 group hover:border-purple-500/30 hover:shadow-[0_0_25px_rgba(168,85,247,0.12)] transition-all duration-300 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/[0.04] blur-[40px] rounded-full pointer-events-none transition-all duration-300 group-hover:scale-110" />
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                          <MessageSquarePlus className="text-purple-400 w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-white">
                          Event Extractor
                        </h3>
                      </div>
                      <p className="text-zinc-400 text-sm mb-4">
                        Paste an event announcement or reminder text to quickly
                        add it to your schedule.
                      </p>

                      <div className="space-y-4">
                        <textarea
                          value={announcementInput}
                          onChange={(e) => setAnnouncementInput(e.target.value)}
                          placeholder="Paste email, WhatsApp message, or notice here..."
                          className="w-full h-32 bg-zinc-950 border border-zinc-900 rounded-xl p-4 text-white placeholder:text-zinc-650 focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all text-sm"
                        />

                        {extractedEventData ? (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl"
                          >
                            <div className="text-xs font-bold text-purple-400 uppercase mb-1">
                              Found Event
                            </div>
                            <div className="text-white font-bold">
                              {extractedEventData.title}
                            </div>
                            <div className="text-zinc-400 text-xs mt-1">
                              {extractedEventData.date} @{" "}
                              {extractedEventData.time} (
                              {extractedEventData.duration} min)
                            </div>

                            <div className="mt-3 space-y-1">
                              <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">
                                Repeat Weekly
                              </label>
                              <Select
                                value={repeatWeeksEvent}
                                onValueChange={setRepeatWeeksEvent}
                              >
                                <SelectTrigger className="bg-zinc-950 border-zinc-900 text-white h-9 rounded-xl text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-950 border-zinc-805 text-white">
                                  {[1, 2, 4, 8, 12, 15].map((w) => (
                                    <SelectItem key={w} value={w.toString()}>
                                      {w} {w === 1 ? "Week" : "Weeks"}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex gap-2 mt-4">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 bg-transparent border-zinc-850 text-zinc-400 hover:text-white"
                                onClick={() => setExtractedEventData(null)}
                              >
                                Discard
                              </Button>
                              <Button
                                size="sm"
                                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-black h-9 rounded-xl cursor-pointer shadow-lg shadow-purple-500/10"
                                onClick={confirmExtractedEvent}
                              >
                                Add to Calendar
                              </Button>
                            </div>
                          </motion.div>
                        ) : (
                          <Button
                            onClick={handleExtractEventAI}
                            disabled={isEventLoading || !announcementInput}
                            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-black h-10 rounded-xl cursor-pointer shadow-lg shadow-purple-500/10"
                          >
                            {isEventLoading ? (
                              <Loader2 className="animate-spin mr-2" />
                            ) : (
                              <BrainCircuit className="mr-2 h-4 w-4" />
                            )}
                            Analyze Text
                          </Button>
                        )}
                      </div>
                    </Card>
                  </div>
                </div>
                {/* Scroll Spacer to escape mobile bottom nav overlay */}
                <div className="h-44 sm:hidden block w-full shrink-0 pointer-events-none" />
              </div>
            </motion.div>
          )}

          {activeTab === "profile" && (
            <motion.div
              key="profile"
              custom={slideDirection}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex justify-center"
            >
              <div className="w-full max-w-2xl">
                <div className="mb-8">
                  <h2 className="text-sm font-black uppercase tracking-widest text-purple-400 flex items-center gap-3">
                    <User className="text-purple-400 w-5 h-5" /> Your Profile
                  </h2>
                  <p className="text-slate-500 text-[10px] mt-2 uppercase font-bold tracking-tight">
                    Manage your personalization and energy settings.
                  </p>
                </div>

                <div className="flex flex-col gap-6">
                  <Card className="bg-white/5 border-white/10 backdrop-blur-md shadow-xl rounded-2xl p-6">
                    <div className="flex items-center gap-4 border-b border-white/10 pb-6 mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-400 to-fuchsia-600 flex items-center justify-center text-xl font-black text-white shadow-lg overflow-hidden">
                        {auth.currentUser?.photoURL ? (
                          <img
                            src={auth.currentUser.photoURL}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          auth.currentUser?.email?.charAt(0).toUpperCase() ||
                          "U"
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {auth.currentUser?.displayName || "Student User"}
                        </h3>
                        <p className="text-slate-400 text-sm">
                          {auth.currentUser?.email}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-3 tracking-wide uppercase">
                          Profile Optimization
                        </h4>
                        <p className="text-slate-400 text-sm mb-4">
                          Set your environment and social capacity for SusunAi
                          algorithms.
                        </p>
                        <div className="bg-black/20 border border-white/10 rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-6">
                          <div className="space-y-2">
                            <Label className="text-slate-300">
                              Daily Commute Time
                            </Label>
                            <Input
                              type="text"
                              value={userProfile?.commute_time || ""}
                              onChange={(e) => {
                                const up = {
                                  ...userProfile,
                                  commute_time: e.target.value,
                                };
                                setUserProfile(up);
                                updateUserProfile({
                                  commute_time: e.target.value,
                                });
                              }}
                              placeholder="e.g. 45 mins"
                              className="bg-white/5 border-white/10 text-white focus-visible:ring-purple-500 h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center mb-1">
                              <Label className="text-slate-300">
                                Social Battery
                              </Label>
                              <button
                                type="button"
                                className="text-[10px] text-purple-400 font-bold uppercase hover:underline"
                                onClick={() =>
                                  setSocialBatteryType((prev) =>
                                    prev === "options" ? "custom" : "options",
                                  )
                                }
                              >
                                {socialBatteryType === "options"
                                  ? "Use %"
                                  : "Use Options"}
                              </button>
                            </div>
                            {socialBatteryType === "options" ? (
                              <Select
                                value={userProfile?.social_battery || "Medium"}
                                onValueChange={(val) => {
                                  const up = {
                                    ...userProfile,
                                    social_battery: val,
                                  };
                                  setUserProfile(up);
                                  updateUserProfile({ social_battery: val });
                                }}
                              >
                                <SelectTrigger className="bg-white/5 border-white/10 text-white h-11">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-950 border-zinc-900 text-white">
                                  <SelectItem value="Low">
                                    Low (Introvert)
                                  </SelectItem>
                                  <SelectItem value="Medium">
                                    Medium (Ambivert)
                                  </SelectItem>
                                  <SelectItem value="High">
                                    High (Extrovert)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="flex gap-2">
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={parseInt(
                                    userProfile?.social_battery || "50",
                                  )}
                                  onChange={(e) => {
                                    const val = e.target.value + "%";
                                    const up = {
                                      ...userProfile,
                                      social_battery: val,
                                    };
                                    setUserProfile(up);
                                    updateUserProfile({ social_battery: val });
                                  }}
                                  className="bg-white/5 border-white/10 text-white h-11 w-24"
                                />
                                <span className="text-slate-500 flex items-center text-xs">
                                  Custom threshold
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label className="text-slate-300 mb-2 block">
                              Preferred Study/Work Environment
                            </Label>
                            <Select
                              value={
                                userProfile?.study_environment || "Personal"
                              }
                              onValueChange={(val) => {
                                const up = {
                                  ...userProfile,
                                  study_environment: val,
                                };
                                setUserProfile(up);
                                updateUserProfile({ study_environment: val });
                              }}
                            >
                              <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 w-full max-w-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-950 border-zinc-900 text-white">
                                <SelectItem value="Personal">
                                  Personal Room / Home
                                </SelectItem>
                                <SelectItem value="Indoor">
                                  Indoor (Library, Cafe)
                                </SelectItem>
                                <SelectItem value="Outdoor">
                                  Outdoor / Nature
                                </SelectItem>
                                <SelectItem value="Else">
                                  Else (Anywhere)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <h4 className="text-sm font-semibold text-white mb-3 tracking-wide uppercase">
                          Energy Productivity Profile
                        </h4>
                        <p className="text-slate-400 text-sm mb-4">
                          This helps SusunAi figure out the best times for your
                          deep work vs casual work.
                        </p>

                        <div className="bg-black/20 border border-white/10 rounded-xl p-6">
                          <Label className="text-slate-300 mb-3 block">
                            Primary Energy Type
                          </Label>
                          <Select
                            value={energyType}
                            onValueChange={handleEnergyChange}
                          >
                            <SelectTrigger className="bg-white/5 border-white/10 focus:ring-purple-500 text-white w-full max-w-xs h-12">
                              <SelectValue placeholder="Energy Type" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 border border-zinc-900 text-white">
                              <SelectItem
                                value="Morning Bird"
                                className="focus:bg-white/10 focus:text-white py-3"
                              >
                                🌅 Morning Bird (Focus better AM)
                              </SelectItem>
                              <SelectItem
                                value="Night Owl"
                                className="focus:bg-white/10 focus:text-white py-3"
                              >
                                🦉 Night Owl (Focus better PM)
                              </SelectItem>
                              <SelectItem
                                value="Balanced"
                                className="focus:bg-white/10 focus:text-white py-3"
                              >
                                ⚖️ Balanced (Standard 9-5 peak)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Theme Personalization Section */}
                      <div className="bg-black/20 border border-white/10 rounded-xl p-6">
                        <h4 className="text-sm font-semibold text-white mb-2 tracking-wide uppercase flex items-center gap-2">
                          <Sparkles size={16} className="text-purple-400" /> Interface Style Theme
                        </h4>
                        <p className="text-slate-400 text-xs mb-4">
                          Choose from more than 5 themes to customize your workspace. "Smart Living" theme shifts colors dynamically to match your natural biological cycles.
                        </p>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                          {[
                            { id: "dark", label: "Midnight Dark", emoji: "🌌", gradient: "from-zinc-900 to-zinc-950 border-zinc-800" },
                            { id: "light", label: "Prism Light", emoji: "☀️", gradient: "from-slate-100 to-white border-slate-300 text-slate-900" },
                            { id: "orange", label: "Amber Sunrise", emoji: "🍊", gradient: "from-amber-950/40 to-orange-900/10 border-amber-900/30" },
                            { id: "purple", label: "Nebula Purple", emoji: "🔮", gradient: "from-purple-950/40 to-violet-900/10 border-purple-900/30" },
                            { id: "smart", label: "Smart Living", emoji: "🧠", gradient: "from-indigo-950/40 via-purple-950/40 to-[#0e0d12]/60 border-indigo-500/20" },
                            { id: "cyberpunk", label: "Cyber Punk", emoji: "⚡", gradient: "from-black/90 to-zinc-950 border-fuchsia-500/30" },
                            { id: "emerald", label: "Zen Forest", emoji: "🌿", gradient: "from-emerald-950/40 to-teal-950/20 border-emerald-500/10" },
                            { id: "quantum", label: "Quantum Fusion", emoji: "🧬", gradient: "from-slate-950 to-blue-950/50 border-cyan-500/30" }
                          ].map((t) => {
                            const isSelected = currentTheme === t.id;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={async () => {
                                  setCurrentTheme(t.id);
                                  const up = { ...userProfile, theme: t.id };
                                  setUserProfile(up);
                                  await updateUserProfile({ theme: t.id });
                                  toast.success(`Theme updated to ${t.label}!`);
                                }}
                                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all relative overflow-hidden h-24 justify-between cursor-pointer group ${t.gradient} ${
                                  isSelected 
                                    ? "ring-2 ring-purple-500 border-transparent shadow-[0_0_15px_rgba(168,85,247,0.3)]" 
                                    : "hover:border-white/20 hover:shadow-md"
                                }`}
                              >
                                <div className="flex justify-between w-full items-center">
                                  <span className="text-xl">{t.emoji}</span>
                                  {isSelected && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                                  )}
                                </div>
                                <div>
                                  <div className={`text-[10px] font-black uppercase tracking-wider ${t.id === 'light' ? 'text-slate-900' : 'text-white'}`}>
                                    {t.label}
                                  </div>
                                  <div className={`text-[8px] font-medium leading-none mt-1 ${t.id === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                                    {t.id === "smart" ? `Adapts to ${metrics.energy}` : t.id === "orange" ? "Amber focus" : t.id === "emerald" ? "Calming study" : "Calm color"}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Bio-Rhythm Energy Explainer Section (Profile) */}
                      <div className="bg-black/20 border border-white/10 rounded-xl p-6">
                        <h4 className="text-sm font-semibold text-white mb-2 tracking-wide uppercase flex items-center gap-2">
                          <BrainCircuit size={16} className="text-emerald-400" /> Bio-Rhythm Peak Energy Explainer
                        </h4>
                        <p className="text-slate-400 text-xs mb-3">
                          What is current energy, how does it affect scheduling and what does it change?
                        </p>
                        
                        <div className="space-y-3.5 text-xs text-slate-300">
                          <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/80 space-y-1">
                            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400">🧠 What Current Energy is:</span>
                            <p className="leading-relaxed text-[11px]">
                              Determined by your biological sleep times, sports routines, health context, active hour of the day, and academic load. It calculates if your head is in peak focus mode or requires biological rest.
                            </p>
                          </div>

                          <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/80 space-y-2">
                            <span className="text-[10px] uppercase font-black tracking-widest text-fuchsia-400">⚡ What does it change? (System Effects):</span>
                            <ul className="list-disc pl-4 space-y-1.5 leading-relaxed text-[11px] text-zinc-400">
                              <li><strong className="text-zinc-200">Alert Flags:</strong> Non-essential or demanding tasks scheduled inside mismatched times trigger visual alert markers warning you of immediate brain strain.</li>
                              <li><strong className="text-zinc-200">AI Scheduling Algorithms:</strong> Directs AI optimization core to reshuffle high-stakes tasks into Peak blocks automatically.</li>
                              <li><strong className="text-zinc-200">Smart UI Ambient:</strong> Under the <span className="text-purple-400 font-extrabold">Smart Living theme</span>, the entire system's background glow dynamically transforms into specialized hues (Analytical Teal for Peak hours, Creative Violet for Moderate times, and Restful Rose/Amber for Low/restorative periods).</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-white mb-3 tracking-wide uppercase">
                          Daily Routine
                        </h4>
                        <p className="text-slate-400 text-sm mb-4">
                          Your daily metrics which help optimize your timeline.
                        </p>
                        <div className="bg-black/20 border border-white/10 rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-slate-300">Sleep Time</Label>
                            <Input
                              type="time"
                              value={preferences.sleepTime || "23:00"}
                              onChange={(e) => {
                                const p = {
                                  ...preferences,
                                  sleepTime: e.target.value,
                                };
                                setPreferences(p);
                                updateUserProfile({
                                  preferences: JSON.stringify(p),
                                });
                                toast.success("Routine updated");
                              }}
                              className="bg-white/5 border-white/10 text-white focus-visible:ring-purple-500 h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-300">Wake Time</Label>
                            <Input
                              type="time"
                              value={preferences.wakeTime || "07:00"}
                              onChange={(e) => {
                                const p = {
                                  ...preferences,
                                  wakeTime: e.target.value,
                                };
                                setPreferences(p);
                                updateUserProfile({
                                  preferences: JSON.stringify(p),
                                });
                                toast.success("Routine updated");
                              }}
                              className="bg-white/5 border-white/10 text-white focus-visible:ring-purple-500 h-11"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-white mb-3 tracking-wide uppercase">
                          Weekly Timetable Display
                        </h4>
                        <p className="text-slate-400 text-sm mb-4">
                          Set the hour range for your weekly timetable view.
                        </p>
                        <div className="bg-black/20 border border-white/10 rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-slate-300">
                              Day Start (Hour)
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              max="12"
                              value={userProfile?.dayStartHour ?? 7}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setUserProfile({
                                  ...userProfile,
                                  dayStartHour: val,
                                });
                                updateUserProfile({ dayStartHour: val });
                              }}
                              className="bg-white/5 border-white/10 text-white h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-300">
                              Day End (Hour)
                            </Label>
                            <Input
                              type="number"
                              min="13"
                              max="23"
                              value={userProfile?.dayEndHour ?? 22}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setUserProfile({
                                  ...userProfile,
                                  dayEndHour: val,
                                });
                                updateUserProfile({ dayEndHour: val });
                              }}
                              className="bg-white/5 border-white/10 text-white h-11"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-white mb-3 tracking-wide uppercase">
                          Academic & Health context
                        </h4>
                        <p className="text-slate-400 text-sm mb-4">
                          Refine your status for better AI scheduling.
                        </p>
                        <div className="bg-black/20 border border-white/10 rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                          <div className="space-y-2">
                            <Label className="text-slate-300">
                              Academic Role
                            </Label>
                            <Select
                              value={userProfile?.role || "Student"}
                              onValueChange={(val) => {
                                const up = { ...userProfile, role: val };
                                setUserProfile(up);
                                updateUserProfile({ role: val });
                              }}
                            >
                              <SelectTrigger className="bg-white/5 border-white/10 text-white h-11">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-950 border border-zinc-900 text-white">
                                <SelectItem value="Student">
                                  Undergraduate
                                </SelectItem>
                                <SelectItem value="Postgrad">
                                  Postgraduate
                                </SelectItem>
                                <SelectItem value="Researcher">
                                  Researcher
                                </SelectItem>
                                <SelectItem value="Educator">
                                  Educator / Faculty
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-300">
                              Bio Condition
                            </Label>
                            <Select
                              value={userProfile?.health_condition || "Normal"}
                              onValueChange={(val) => {
                                const up = {
                                  ...userProfile,
                                  health_condition: val,
                                };
                                setUserProfile(up);
                                updateUserProfile({ health_condition: val });
                              }}
                            >
                              <SelectTrigger className="bg-white/5 border-white/10 text-white h-11">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-950 border border-zinc-900 text-white">
                                <SelectItem value="Normal">
                                  Healthy / Normal
                                </SelectItem>
                                <SelectItem value="Low Energy">
                                  Chronic Low Energy
                                </SelectItem>
                                <SelectItem value="ADHD">
                                  ADHD / Focus Sensitive
                                </SelectItem>
                                <SelectItem value="Recovery">
                                  Recovering / Stress
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-300">
                              Credit Hours
                            </Label>
                            <Input
                              type="number"
                              value={userProfile?.credit_hours || 0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setUserProfile({
                                  ...userProfile,
                                  credit_hours: val,
                                });
                                updateUserProfile({ credit_hours: val });
                              }}
                              className="bg-white/5 border-white/10 text-white h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-300">
                              Semester End
                            </Label>
                            <Input
                              type="date"
                              value={userProfile?.semester_end_date || ""}
                              onChange={(e) => {
                                setUserProfile({
                                  ...userProfile,
                                  semester_end_date: e.target.value,
                                });
                                updateUserProfile({
                                  semester_end_date: e.target.value,
                                });
                              }}
                              className="bg-white/5 border-white/10 text-white h-11"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-white mb-3 tracking-wide uppercase">
                          Behavioral Personalization
                        </h4>
                        <p className="text-slate-400 text-sm mb-4">
                          Input your traits for the CI Behavioral & Analytical
                          Engine.
                        </p>
                        <div className="bg-black/20 border border-white/10 rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                          <div className="space-y-2">
                            <Label className="text-slate-300">
                              Major/Field of Study
                            </Label>
                            <Input
                              value={userProfile?.major || ""}
                              onChange={(e) => {
                                setUserProfile({
                                  ...userProfile,
                                  major: e.target.value,
                                });
                                updateUserProfile({ major: e.target.value });
                              }}
                              placeholder="e.g. Computer Science"
                              className="bg-white/5 border-white/10 text-white h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-300">MBTI Type</Label>
                            <Select
                              value={userProfile?.mbti || ""}
                              onValueChange={(val) => {
                                setUserProfile({
                                  ...userProfile,
                                  mbti: val,
                                });
                                updateUserProfile({ mbti: val });
                              }}
                            >
                              <SelectTrigger className="bg-white/5 border-white/10 text-white h-11">
                                <SelectValue placeholder="Select your MBTI" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-900 border-white/10 text-white max-h-[300px] w-[320px]">
                                {MBTI_TYPES.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    <div className="flex flex-col py-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-black text-blue-400">
                                          {type.name}
                                        </span>
                                        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                          Profile
                                        </span>
                                      </div>
                                      <span className="text-xs text-slate-400 leading-relaxed mt-1 whitespace-normal break-words">
                                        {type.desc}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-300">
                              Assignment Habits
                            </Label>
                            <Select
                              value={
                                userProfile?.assignment_habits ||
                                "Before deadline"
                              }
                              onValueChange={(val) => {
                                setUserProfile({
                                  ...userProfile,
                                  assignment_habits: val,
                                });
                                updateUserProfile({ assignment_habits: val });
                              }}
                            >
                              <SelectTrigger className="bg-white/5 border-white/10 text-white h-11">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-950 border border-zinc-900 text-white">
                                <SelectItem value="Right away">
                                  Right Away (Proactive)
                                </SelectItem>
                                <SelectItem value="Before deadline">
                                  Before Deadline (Planned)
                                </SelectItem>
                                <SelectItem value="Last minute">
                                  Last Minute (Urgent)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-300">
                              Fixed Focus Session (Min)
                            </Label>
                            <Select
                              value={(userProfile?.focus_duration || 25).toString()}
                              onValueChange={(val) => {
                                setUserProfile({
                                  ...userProfile,
                                  focus_duration: parseInt(val),
                                });
                                updateUserProfile({ focus_duration: parseInt(val) });
                              }}
                            >
                              <SelectTrigger className="bg-white/5 border-white/10 text-white h-11">
                                <SelectValue placeholder="Select session length" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-900 border-white/10 text-white w-[300px]">
                                {FOCUS_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value.toString()}>
                                    <div className="flex flex-col py-1">
                                      <span className={`font-bold ${opt.color}`}>{opt.label}</span>
                                      <span className="text-[10px] text-slate-400 leading-tight mt-1 whitespace-normal">
                                        {opt.risk}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 space-y-3">
                        <Dialog
                          open={isResetDialogOpen}
                          onOpenChange={setIsResetDialogOpen}
                        >
                          <DialogTrigger
                            render={
                              <Button
                                variant="ghost"
                                className="w-full border border-rose-500/10 text-rose-400/60 hover:bg-rose-500/10 hover:text-rose-400 transition-all rounded-xl h-12 flex items-center justify-center gap-2 text-xs"
                              />
                            }
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Trash2 size={14} /> Reset All Profile & Tasks
                            </div>
                          </DialogTrigger>
                          <DialogContent className="bg-zinc-950 border border-zinc-900 text-white rounded-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-xl flex items-center gap-2 text-rose-400">
                                <Trash2 size={20} /> Danger Zone
                              </DialogTitle>
                              <DialogDescription className="text-slate-400 pt-2 text-base">
                                This will permanently delete all your tasks and
                                reset your profile settings to default. This
                                action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
                              <Button
                                variant="ghost"
                                className="flex-1 border-white/10 text-slate-300 hover:bg-white/5"
                                onClick={() => setIsResetDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold"
                                onClick={async () => {
                                  try {
                                    const newProfile = await resetUserData();
                                    if (newProfile) {
                                      setUserProfile(newProfile);
                                      setOnboardingCompleted(false);
                                      toast.success(
                                        "Everything has been reset",
                                      );
                                      setIsResetDialogOpen(false);
                                    }
                                  } catch (e) {
                                    toast.error("Failed to reset data");
                                  }
                                }}
                              >
                                Yes, Reset Everything
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="outline"
                          className="w-full border-white/10 text-slate-300 hover:bg-white/5 hover:text-white transition-all rounded-xl h-12 flex items-center justify-center gap-2"
                          onClick={() => auth.signOut()}
                        >
                          <LogOut size={18} /> Log Out
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
                {/* Scroll Spacer to escape mobile bottom nav overlay */}
                <div className="h-44 sm:hidden block w-full shrink-0 pointer-events-none" />
              </div>
            </motion.div>
          )}

          {activeTab === "ecosystem" && (
            <motion.div
              key="ecosystem"
              custom={slideDirection}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex justify-center"
            >
              <div className="w-full max-w-6xl">
                <EcosystemPage tasks={tasks} userProfile={userProfile} />
              </div>
            </motion.div>
          )}

          {activeTab === "admin" && isUserAdmin && (
            <motion.div
              key="admin"
              custom={slideDirection}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex justify-center"
            >
              <div className="w-full max-w-5xl px-4">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-widest text-purple-400 flex items-center gap-3">
                      <ShieldCheck className="text-purple-400 w-6 h-6" /> Admin Control Hub
                    </h2>
                    <p className="text-slate-400 text-xs mt-2 uppercase font-bold tracking-wider">
                      Authorized Space: Track student behaviors, schedules, and active schedules.
                    </p>
                  </div>
                  <Button
                    onClick={loadAdminUsers}
                    disabled={adminUsersLoading}
                    variant="outline"
                    className="border-purple-900/30 text-purple-300 hover:bg-purple-900/10 h-10 rounded-xl"
                  >
                    {adminUsersLoading ? (
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Synchronize Directory
                  </Button>
                </div>

                {/* Dashboard Metrics Cards */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
                  <Card className="bg-zinc-950/40 border border-zinc-900 shadow-md shadow-black/40 overflow-hidden relative p-2.5 xs:p-3 sm:p-4 flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/[0.01] blur-lg rounded-full" />
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[8px] xs:text-[9px] sm:text-xs font-black uppercase tracking-widest text-slate-400 truncate">Enrolled</span>
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400 shrink-0 select-none" />
                    </div>
                    <div className="mt-2">
                      <div className="text-base xs:text-lg sm:text-2xl font-black text-white tracking-tight leading-none">{adminUsers.length}</div>
                      <p className="text-[7px] xs:text-[8px] sm:text-[10px] text-zinc-500 font-extrabold uppercase mt-1 truncate">Profiles</p>
                    </div>
                  </Card>

                  <Card className="bg-zinc-950/40 border border-zinc-900 shadow-md shadow-black/40 overflow-hidden relative p-2.5 xs:p-3 sm:p-4 flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/[0.01] blur-lg rounded-full" />
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[8px] xs:text-[9px] sm:text-xs font-black uppercase tracking-widest text-slate-400 truncate">Staff</span>
                      <ShieldCheck className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400 shrink-0 select-none" />
                    </div>
                    <div className="mt-2">
                      <div className="text-base xs:text-lg sm:text-2xl font-black text-white tracking-tight leading-none">
                        {adminUsers.filter(u => u.role === "Admin").length || 1}
                      </div>
                      <p className="text-[7px] xs:text-[8px] sm:text-[10px] text-zinc-500 font-extrabold uppercase mt-1 truncate">System Admins</p>
                    </div>
                  </Card>

                  <Card className="bg-zinc-950/40 border border-zinc-900 shadow-md shadow-black/40 overflow-hidden relative p-2.5 xs:p-3 sm:p-4 flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/[0.01] blur-lg rounded-full" />
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[8px] xs:text-[9px] sm:text-xs font-black uppercase tracking-widest text-slate-400 truncate">DB status</span>
                      <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-400 shrink-0 select-none animate-pulse" />
                    </div>
                    <div className="mt-2">
                      <div className="text-base xs:text-lg sm:text-2xl font-black text-emerald-400 tracking-tight leading-none flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2 shrink-0 select-none">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>Online</span>
                      </div>
                      <p className="text-[7px] xs:text-[8px] sm:text-[10px] text-zinc-500 font-extrabold uppercase tracking-tight mt-1 truncate">Connected</p>
                    </div>
                  </Card>
                </div>

                {/* Class Cohort Dashboard & Real-Time Bio-Analytics */}
                <Card className="bg-zinc-950/45 border border-zinc-900 shadow-xl p-5 mb-8 overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500" />
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-4 h-4 text-purple-400" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-200">
                      Classroom Cohort Dashboard & Real-Time Bio-Analytics
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
                    {/* Bio-Energy Types */}
                    <div className="bg-zinc-950/20 border border-white/[0.02] p-3 sm:p-4 rounded-2xl space-y-3">
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#a1a1aa] block">
                        🔋 Bio-Energy
                      </span>
                      <div className="space-y-2">
                        {["Night Owl", "Morning Bird", "Balanced", "Exhausted"].map((type) => {
                          const count = aggregateStats.energy[type] || 0;
                          const pct = adminUsers.length ? Math.round((count / adminUsers.length) * 100) : 0;
                          return (
                            <div key={type} className="space-y-1">
                              <div className="flex justify-between items-center text-[8.5px] sm:text-[9.5px] font-extrabold text-zinc-400">
                                <span className="uppercase truncate max-w-[55px] xs:max-w-none">{type}</span>
                                <span className="shrink-0">{count} ({pct}%)</span>
                              </div>
                              <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                                <div
                                  style={{ width: `${pct}%` }}
                                  className="h-full bg-purple-500 rounded-full transition-all duration-550"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Personality Filters MBTI */}
                    <div className="bg-zinc-950/20 border border-white/[0.02] p-3 sm:p-4 rounded-2xl space-y-3">
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#a1a1aa] block">
                        🧠 MBTI Profile
                      </span>
                      <div className="space-y-2">
                        {["INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP"].map((type) => {
                          const count = aggregateStats.mbti[type] || 0;
                          const pct = adminUsers.length ? Math.round((count / adminUsers.length) * 100) : 0;
                          return (
                            <div key={type} className="space-y-1">
                              <div className="flex justify-between items-center text-[8.5px] sm:text-[9.5px] font-extrabold text-zinc-400">
                                <span className="uppercase">{type}</span>
                                <span className="shrink-0">{count} ({pct}%)</span>
                              </div>
                              <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                                <div
                                  style={{ width: `${pct}%` }}
                                  className="h-full bg-blue-500 rounded-full transition-all duration-550"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Academic Study Habits */}
                    <div className="bg-zinc-950/20 border border-white/[0.02] p-3 sm:p-4 rounded-2xl space-y-3">
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#a1a1aa] block">
                        ✏️ Study Habits
                      </span>
                      <div className="space-y-2">
                        {["Crammer", "Planner", "Consistent", "Flexible"].map((habit) => {
                          const count = aggregateStats.study[habit] || 0;
                          const pct = adminUsers.length ? Math.round((count / adminUsers.length) * 100) : 0;
                          return (
                            <div key={habit} className="space-y-1">
                              <div className="flex justify-between items-center text-[8.5px] sm:text-[9.5px] font-extrabold text-zinc-400">
                                <span className="uppercase truncate max-w-[55px] xs:max-w-none">{habit}</span>
                                <span className="shrink-0">{count} ({pct}%)</span>
                              </div>
                              <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                                <div
                                  style={{ width: `${pct}%` }}
                                  className="h-full bg-emerald-500 rounded-full transition-all duration-550"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Enrolled Academic Majors */}
                    <div className="bg-zinc-950/20 border border-white/[0.02] p-3 sm:p-4 rounded-2xl space-y-3">
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#a1a1aa] block">
                        🎓 Enrolled Majors
                      </span>
                      <div className="space-y-2">
                        {Object.entries(aggregateStats.majors).slice(0, 4).map(([major, count]) => {
                          const val = count as number;
                          const pct = adminUsers.length ? Math.round((val / adminUsers.length) * 100) : 0;
                          return (
                            <div key={major} className="space-y-1">
                              <div className="flex justify-between items-center text-[8.5px] sm:text-[9.5px] font-extrabold text-zinc-400 font-mono">
                                <span className="uppercase truncate max-w-[50px] xs:max-w-[70px]">{major}</span>
                                <span className="shrink-0">{val} ({pct}%)</span>
                              </div>
                              <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                                <div
                                  style={{ width: `${pct}%` }}
                                  className="h-full bg-pink-500 rounded-full transition-all duration-550"
                                />
                              </div>
                            </div>
                          );
                        })}
                        {Object.keys(aggregateStats.majors).length === 0 && (
                          <div className="text-[9px] sm:text-[10px] font-bold text-zinc-650 uppercase py-2">
                            No student data
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Directory & Profile Explorer Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Student Directory List (width: 7/12) */}
                  <div className="lg:col-span-7 space-y-4">
                    <Card className="bg-zinc-950/40 border border-zinc-900 shadow-xl shadow-black/40 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 mb-4 border-b border-zinc-900 pb-3">
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#e4e4e7] flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-400" /> Students Pool
                        </h3>
                        
                        {/* Search & Filter */}
                        <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
                          <div className="relative flex-1 sm:flex-initial sm:w-48">
                            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                            <Input
                              type="text"
                              placeholder="Search directory..."
                              value={adminSearchQuery}
                              onChange={(e) => setAdminSearchQuery(e.target.value)}
                              className="pl-8 bg-black/40 border-zinc-900 w-full text-xs text-white placeholder:text-zinc-500 h-9 rounded-xl focus:ring-1 focus:ring-purple-500"
                            />
                          </div>
                          
                          <select
                            value={adminFilterRole}
                            onChange={(e) => setAdminFilterRole(e.target.value)}
                            className="bg-black/40 border border-zinc-900 text-xs text-zinc-400 rounded-xl h-9 px-2.5 outline-none cursor-pointer hover:border-zinc-800 transition-all text-center"
                          >
                            <option value="all">Roles (All)</option>
                            <option value="Admin">Admins</option>
                            <option value="Student">Students</option>
                          </select>
                        </div>
                      </div>

                      <ScrollArea className="h-[500px] pr-2">
                        {adminUsersLoading ? (
                          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
                            <Loader2 className="animate-spin h-6 w-6 text-purple-400" />
                            <span className="text-xs font-bold uppercase tracking-wider">Syncing secure user records...</span>
                          </div>
                        ) : (
                          (() => {
                            const filtered = adminUsers.filter(u => {
                              const matchesSearch = 
                                u.major?.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
                                u.id?.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
                                (u.role || "Student").toLowerCase().includes(adminSearchQuery.toLowerCase());
                              
                              const matchesRole = adminFilterRole === "all" || (u.role || "Student") === adminFilterRole;
                              return matchesSearch && matchesRole;
                            });

                            if (filtered.length === 0) {
                              return (
                                <div className="text-center py-16 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
                                  No student profiles match your filters
                                </div>
                              );
                            }

                            return (
                              <div className="space-y-2.5">
                                {filtered.map((user) => (
                                  <button
                                    key={user.id}
                                    onClick={() => setAdminSelectedUser(user)}
                                    className={`w-full text-left p-3 sm:p-3.5 rounded-xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:scale-[1.01] ${
                                      adminSelectedUser?.id === user.id
                                        ? "bg-purple-950/20 border-purple-500/30 shadow-md shadow-purple-500/5"
                                        : "bg-zinc-950 border-white/[0.02] hover:bg-zinc-900 hover:border-zinc-800"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                                      <div className={`w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center shrink-0 rounded-lg text-white font-extrabold text-[11px] sm:text-xs tracking-tight ${
                                        user.role === "Admin" ? "bg-purple-600/20 text-purple-400 border border-purple-500/30" : "bg-blue-600/10 text-blue-400 border border-blue-500/15"
                                      }`}>
                                        {user.major ? user.major.slice(0, 3).toUpperCase() : "STU"}
                                      </div>
                                      <div className="min-w-0 flex-1 sm:flex-initial">
                                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                          <span className="text-xs font-black text-white uppercase tracking-wide truncate max-w-[130px] sm:max-w-none">
                                            {user.id.slice(0, 10)}... (Profile)
                                          </span>
                                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                                            user.role === "Admin" ? "bg-purple-500/20 text-purple-400" : "bg-zinc-800 text-zinc-400"
                                          }`}>
                                            {user.role || "Student"}
                                          </span>
                                        </div>
                                        <div className="text-[10px] text-zinc-400 mt-0.5 truncate max-w-[200px] sm:max-w-[300px]">
                                          Major: {user.major || "Undecided"} • MBTI: {user.mbti || "None"}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t border-white/[0.03] sm:border-t-0 pt-2 sm:pt-0 gap-1.5 sm:gap-0.5 pl-14 sm:pl-0 w-full sm:w-auto">
                                      <span className="text-[9px] text-zinc-500 font-mono flex items-center gap-1">
                                        <span className="sm:hidden text-[7.5px] text-zinc-650 font-sans uppercase font-black tracking-widest">End Date:</span>
                                        {user.semester_end_date || "N/A"}
                                      </span>
                                      <span className="text-[9px] font-bold sm:font-black tracking-tight uppercase px-2 py-0.5 sm:p-0 rounded-full sm:rounded-none bg-purple-500/10 sm:bg-transparent text-purple-400 flex items-center gap-1">
                                        <span className="sm:hidden text-[7.5px] text-purple-550/70 font-sans uppercase font-black tracking-widest mr-0.5">Type:</span>
                                        {user.energy_type || "Standard"}
                                      </span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            );
                          })()
                        )}
                      </ScrollArea>
                    </Card>
                  </div>

                  {/* Right Column: Deep Tracking Details & User Schedule (width: 5/12) */}
                  <div className="lg:col-span-5 space-y-4">
                    {adminSelectedUser ? (
                      <Card className="bg-zinc-950/40 border border-zinc-900 shadow-2xl p-5 relative overflow-hidden flex flex-col gap-4">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/[0.02] blur-2xl rounded-full" />
                        
                        {/* Profile Header Block */}
                        <div className="border-b border-zinc-900 pb-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[9px] uppercase font-black tracking-widest text-purple-400">Student Profile Detail</span>
                              <h4 className="text-sm font-black text-white uppercase mt-1 tracking-wide truncate max-w-[180px]">
                                User: {adminSelectedUser.id.slice(0, 12)}...
                              </h4>
                            </div>
                            
                            {/* Role Modifier Widget */}
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-[8px] uppercase font-black text-zinc-500">Alter Role</span>
                              <select
                                value={adminSelectedUser.role || "Student"}
                                onChange={(e) => handleUpdateUserRole(adminSelectedUser.id, e.target.value)}
                                className="bg-black border border-purple-900/30 text-[9px] font-black uppercase text-purple-300 rounded px-2 py-1 outline-none cursor-pointer"
                              >
                                <option value="Student">Student (Default)</option>
                                <option value="Admin">Administrator</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Behavior Telemetry Grid */}
                        <div className="bg-zinc-950 border border-white/[0.02] rounded-2xl p-3.5 space-y-3">
                          <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block mb-1">
                            Behavior Telemetry
                          </span>
                          
                          <div className="grid grid-cols-2 gap-3.5">
                            <div className="bg-zinc-900/30 p-2.5 rounded-xl">
                              <span className="text-[8px] uppercase font-black text-zinc-500">Energy Bio-Type</span>
                              <div className="text-xs font-extrabold text-white mt-1 uppercase flex items-center gap-1.5">
                                <Zap className="text-amber-400 w-3 h-3" />
                                {adminSelectedUser.energy_type || "N/A"}
                              </div>
                            </div>
                            <div className="bg-zinc-900/30 p-2.5 rounded-xl">
                              <span className="text-[8px] uppercase font-black text-zinc-500">Major Study</span>
                              <div className="text-xs font-extrabold text-purple-400 mt-1 uppercase truncate max-w-[120px]">
                                {adminSelectedUser.major || "Undecided"}
                              </div>
                            </div>
                            <div className="bg-zinc-900/30 p-2.5 rounded-xl">
                              <span className="text-[8px] uppercase font-black text-zinc-500">Credit Hours Load</span>
                              <div className="text-xs font-extrabold text-white mt-1">
                                {adminSelectedUser.credit_hours || 0} Hours
                              </div>
                            </div>
                            <div className="bg-zinc-900/30 p-2.5 rounded-xl">
                              <span className="text-[8px] uppercase font-black text-zinc-500">Study Env</span>
                              <div className="text-xs font-extrabold text-emerald-400 mt-1 uppercase">
                                {adminSelectedUser.study_environment || "Quiet"}
                              </div>
                            </div>
                          </div>
                          
                          <div className="pt-2 border-t border-zinc-900/60 grid grid-cols-2 gap-3 text-[10px]">
                            <div>
                              <span className="text-zinc-500 uppercase font-bold tracking-tight block">Social Battery:</span>
                              <span className="text-slate-300 font-semibold">{adminSelectedUser.social_battery || "Stable"}</span>
                            </div>
                            <div>
                              <span className="text-zinc-500 uppercase font-bold tracking-tight block">Work Habits:</span>
                              <span className="text-slate-300 font-semibold">{adminSelectedUser.assignment_habits || "Standard"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Schedule Audit & Strain Analysis Indicator */}
                        {(() => {
                          const examCramming = adminSelectedUserTasks.some(t => t.title?.toLowerCase().includes("cram") || t.description?.toLowerCase().includes("cram"));
                          const superLate = adminSelectedUserTasks.some(t => {
                            if (!t.time) return false;
                            const hr = parseInt(t.time.split(":")[0]);
                            return hr >= 23 || hr <= 4;
                          });
                          const excessiveHours = adminSelectedUserTasks.reduce((acc, t) => acc + (t.duration || 0), 0) > 300; // 5 hours a day is high

                          let strainLevel = "HEALTHY";
                          let strainColor = "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
                          let strainWarning = "Student workload is balanced with their bioschedule preferences. Active focus cycles are stable and fit energy thresholds.";

                          if (examCramming || superLate || excessiveHours) {
                            strainLevel = "HIGH STRESS RISK";
                            strainColor = "text-rose-400 border-rose-500/20 bg-rose-500/5";
                            if (superLate) {
                              strainWarning = "ALERT: Active study blocks detected after midnight. Disrupts sleep structure rules and exhausts daily energy reservoir.";
                            } else if (excessiveHours) {
                              strainWarning = "WARNING: Heavy cognitive loads (5+ hours) scheduled. Suggest mini-breaks to maintain high study retention.";
                            } else {
                              strainWarning = "CRITICAL: Cramming blocks registered in timetable. High brain drain risk estimated.";
                            }
                          }

                          return (
                            <div className="p-3.5 bg-zinc-950 border border-zinc-900 rounded-xl space-y-2 mt-2">
                              <div className="flex justify-between items-center text-[9px] uppercase font-black">
                                <span className="text-zinc-500 block">Auto AI Schedule Auditor</span>
                                <span className={`px-2 py-0.5 rounded border ${strainColor}`}>
                                  {strainLevel}
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold">
                                {strainWarning}
                              </p>
                            </div>
                          );
                        })()}

                        {/* Active Schedule & Activity Feed */}
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-purple-400" /> Active Schedule ({adminSelectedUserTasks.length})
                            </span>
                          </div>

                          <ScrollArea className="h-[180px] rounded-xl border border-zinc-900 bg-zinc-950 p-2.5">
                            {adminSelectedUserTasksLoading ? (
                              <div className="flex justify-center items-center py-12">
                                <Loader2 className="animate-spin h-5 w-5 text-purple-400" />
                              </div>
                            ) : adminSelectedUserTasks.length === 0 ? (
                              <div className="text-center py-12 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                                No events/tasks tracked
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {adminSelectedUserTasks.map((t) => (
                                  <div
                                    key={t.id}
                                    className="p-2 rounded-lg bg-zinc-900/40 border border-white/[0.01] flex items-center justify-between text-xs hover:bg-zinc-900/85 transition-all"
                                  >
                                    <div className="max-w-[150px]">
                                      <span className="font-extrabold text-slate-100 block truncate uppercase tracking-tight">
                                        {t.title}
                                      </span>
                                      <span className="text-[10px] text-zinc-500 block">
                                        Duration: {t.duration} min • {t.type}
                                      </span>
                                      {t.description && (
                                        <span className="text-[9px] text-zinc-400 leading-tight italic block mt-0.5 truncate">
                                          {t.description}
                                        </span>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                      <div className="text-right">
                                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded block ${
                                          t.status === "completed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                                        }`}>
                                          {t.status}
                                        </span>
                                        <span className="text-[8.5px] text-zinc-500 block mt-1 font-mono">
                                          {t.date}
                                        </span>
                                      </div>

                                      {/* Administrator Overrides Toolbar */}
                                      <div className="flex flex-col items-center gap-1 border-l border-zinc-900 pl-2">
                                        <button
                                          onClick={() => handleAdminUpdateTaskStatus(adminSelectedUser.id, t.id, t.status)}
                                          className="p-1 rounded hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-emerald-400"
                                          title="Override task status toggle"
                                        >
                                          <CheckCircle2 className={`w-3.5 h-3.5 ${t.status === "completed" ? "text-emerald-400" : ""}`} />
                                        </button>
                                        
                                        <button
                                          onClick={() => handleAdminDeleteTask(adminSelectedUser.id, t.id)}
                                          className="p-1 rounded hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-rose-500"
                                          title="Force audit delete block"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </ScrollArea>
                        </div>

                        {/* Real-time Student Activity Feed Audit Logs */}
                        <div className="space-y-3 pt-3 border-t border-zinc-900/60">
                          <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-1.5">
                            <Terminal className="w-3.5 h-3.5 text-purple-400" /> Administrative User Audit Logs & Activity Feed
                          </span>
                          
                          <ScrollArea className="h-[180px] rounded-xl border border-zinc-900 bg-zinc-950 p-2.5">
                            {adminSelectedUserActivitiesLoading ? (
                              <div className="flex justify-center items-center py-8">
                                <Loader2 className="animate-spin h-5 w-5 text-purple-400" />
                              </div>
                            ) : adminSelectedUserActivities.length === 0 ? (
                              <div className="text-center py-10 text-[9px] uppercase font-bold tracking-wider text-zinc-500">
                                No client activities recorded yet
                              </div>
                            ) : (
                              <div className="space-y-2 font-mono text-[10px]">
                                {adminSelectedUserActivities.map((act) => (
                                  <div
                                    key={act.id}
                                    className="p-2 rounded bg-zinc-900/40 border border-zinc-900 space-y-1"
                                  >
                                    <div className="flex justify-between items-center text-[8.5px]">
                                      <span className="font-extrabold text-purple-400 uppercase tracking-tight bg-purple-950/20 border border-purple-900/30 px-1.5 py-0.5 rounded">
                                        {act.action}
                                      </span>
                                      <span className="text-zinc-600">
                                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                    <p className="text-zinc-300 text-[9.5px] leading-relaxed">
                                      {act.details}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </ScrollArea>
                        </div>
                      </Card>
                    ) : (
                      <div className="h-[450px] rounded-3xl border border-zinc-900 border-dashed bg-zinc-950/25 flex flex-col justify-center items-center p-8 text-center text-slate-500 gap-3">
                        <Users className="w-8 h-8 text-purple-500/40" />
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Deep Profile Tracker</h4>
                          <p className="text-[10px] text-zinc-500 mt-2 max-w-[240px] uppercase font-bold tracking-tight">
                            Select a student from the pool directory to track their live bio-telemetry and active schedule.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Scroll Spacer to escape mobile bottom nav overlay */}
                <div className="h-44 sm:hidden block w-full shrink-0 pointer-events-none" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Dialog
          open={isPurgeDialogOpen}
          onOpenChange={setIsPurgeDialogOpen}
        >
          <DialogContent className="bg-slate-900 border-white/10 text-white rounded-2xl sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2 text-rose-500">
                <Trash2 className="h-5 w-5" /> Confirm Purge
              </DialogTitle>
              <DialogDescription className="text-slate-400 pt-2 text-base">
                You are about to remove <span className="font-bold text-white">{tasksToPurgeIds.length}</span> items from your schedule for the current week. 
                <br /><br />
                <span className="text-rose-400 font-semibold italic">Warning: This action is permanent and cannot be reversed.</span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
              <Button
                variant="ghost"
                className="text-slate-300 hover:text-white hover:bg-white/5 order-2 sm:order-1"
                onClick={() => setIsPurgeDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl px-8 order-1 sm:order-2"
                onClick={confirmPurgeWeek}
              >
                Purge Now
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogContent className="sm:max-w-[340px] bg-[#16213e]/95 backdrop-blur-xl border-white/10 text-slate-100 rounded-2xl p-3 overflow-hidden">
            <DialogHeader className="mb-0">
              <DialogTitle className="text-white text-sm font-black uppercase tracking-widest">
                Add to Schedule
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-1.5 py-0">
              <div className="grid gap-1">
                <Label
                  htmlFor="title-global"
                  className="text-slate-300 text-[10px] font-semibold"
                >
                  Title
                </Label>
                <Input
                  id="title-global"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task"
                  className="h-7 bg-black/20 border-white/10 focus-visible:ring-indigo-500 text-white placeholder:text-slate-500 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-1">
                  <Label className="text-slate-300 text-[10px] font-semibold">
                    Type
                  </Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="h-7 bg-black/20 border-white/10 focus:ring-indigo-500 text-white data-[placeholder]:text-slate-500 text-xs">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#16213e] border border-white/10 text-white">
                      <SelectItem
                        value="study"
                        className="focus:bg-white/10 focus:text-white"
                      >
                        📚 Study
                      </SelectItem>
                      <SelectItem
                        value="program"
                        className="focus:bg-white/10 focus:text-white"
                      >
                        💻 Program
                      </SelectItem>
                      <SelectItem
                        value="class"
                        className="focus:bg-white/10 focus:text-white"
                      >
                        🏫 Class
                      </SelectItem>
                      <SelectItem
                        value="personal"
                        className="focus:bg-white/10 focus:text-white"
                      >
                        🗣️ Personal
                      </SelectItem>
                      <SelectItem
                        value="sport"
                        className="focus:bg-white/10 focus:text-white"
                      >
                        🚴 Sports
                      </SelectItem>
                      <SelectItem
                        value="me_time"
                        className="focus:bg-white/10 focus:text-white"
                      >
                        🧘 Me Time
                      </SelectItem>
                      <SelectItem
                        value="custom"
                        className="focus:bg-white/10 focus:text-white"
                      >
                        ✨ Custom
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1">
                  <Label
                    htmlFor="duration-global"
                    className="text-slate-300 text-[10px] font-semibold"
                  >
                    Dur (min)
                  </Label>
                  <Input
                    id="duration-global"
                    type="number"
                    min="15"
                    step="15"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="h-7 bg-black/20 border-white/10 focus-visible:ring-indigo-500 text-white text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="grid gap-1">
                  <Label
                    htmlFor="date-global"
                    className="text-slate-300 text-[10px] font-semibold"
                  >
                    Date
                  </Label>
                  <Input
                    id="date-global"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-7 w-full min-w-0 bg-black/20 border-white/10 focus-visible:ring-indigo-500 text-white text-xs"
                  />
                </div>
                <div className="grid gap-1">
                  <Label
                    htmlFor="time-global"
                    className="text-slate-300 text-[10px] font-semibold"
                  >
                    Time
                  </Label>
                  <Input
                    id="time-global"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-7 w-full min-w-0 bg-black/20 border-white/10 focus-visible:ring-indigo-500 text-white text-xs"
                  />
                </div>
              </div>
              <div className="grid gap-1">
                <Label
                  htmlFor="description-global"
                  className="text-slate-300 text-[10px] font-semibold"
                >
                  Description
                </Label>
                <Textarea
                  id="description-global"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details..."
                  className="bg-black/20 border-white/10 focus-visible:ring-indigo-500 text-white placeholder:text-slate-500 min-h-[36px] text-xs py-1"
                />
              </div>
              <div className="grid gap-1 mt-0.5">
                <div className="flex justify-between items-center">
                  <Label className="text-slate-300 text-[10px] font-semibold flex items-center gap-1.5">
                    <Zap
                      size={11}
                      className={
                        energyImpact < 0 ? "text-rose-400" : "text-emerald-400"
                      }
                    />
                    Energy Impact
                  </Label>
                  <span
                    className={`text-[9px] font-black ${energyImpact < 0 ? "text-rose-400" : "text-emerald-400"}`}
                  >
                    {energyImpact < 0 ? "-" : "+"} {Math.abs(energyImpact)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  value={energyImpact}
                  onChange={(e) => setEnergyImpact(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 h-1 mt-0.5"
                />
              </div>

              <div className="mt-1.5 bg-white/5 border border-white/10 rounded-xl p-2 flex flex-col gap-1">
                <div className="text-[8px] uppercase font-black tracking-widest text-emerald-400">
                  Relax & Recover
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      setType("me_time");
                      setTitle("Me Time");
                      setEnergyImpact(5);
                    }}
                    className="flex-1 flex flex-col items-center justify-center p-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-300 transition-colors"
                  >
                    <Coffee size={12} className="mb-0.5" />
                    <span className="text-[7px] font-bold">Me Time</span>
                  </button>
                  <button
                    onClick={() => {
                      setType("me_time");
                      setTitle("Sleep More");
                      setEnergyImpact(10);
                    }}
                    className="flex-1 flex flex-col items-center justify-center p-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 transition-colors"
                  >
                    <Moon size={12} className="mb-0.5" />
                    <span className="text-[7px] font-bold">Sleep</span>
                  </button>
                  <button
                    onClick={() => {
                      setType("me_time");
                      setTitle("Rest Phone");
                      setEnergyImpact(3);
                    }}
                    className="flex-1 flex flex-col items-center justify-center p-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-300 transition-colors"
                  >
                    <Smartphone size={12} className="mb-0.5" />
                    <span className="text-[7px] font-bold">Offline</span>
                  </button>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-2">
              <Button
                type="button"
                onClick={confirmAddTask}
                className="w-full h-8 bg-purple-500 hover:bg-purple-600 text-white font-black uppercase tracking-widest text-[9px] rounded-xl shadow-lg shadow-purple-500/10 cursor-pointer animate-none"
              >
                <Plus className="mr-1.5 h-3 w-3" /> Add Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
