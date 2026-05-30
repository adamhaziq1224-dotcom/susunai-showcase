import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs, onSnapshot, query, orderBy } from 'firebase/firestore';

export interface UserProfile {
  role?: string;
  credit_hours?: number;
  semester_end_date?: string;
  health_condition?: string;
  unavailable_times?: string;
  preferred_free_time?: string;
  energy_type: string;
  onboardingCompleted: boolean;
  preferences: string;
  dayStartHour?: number;
  dayEndHour?: number;
  commute_time?: string; // e.g. "30 mins", "1 hour"
  social_battery?: string; // "Low", "Medium", "High"
  study_environment?: string; // "Quiet", "Background Noise", "Group"
  
  // New personalization fields
  age?: number;
  major?: string;
  mbti?: string;
  assignment_habits?: string; // "Right away" | "Before deadline" | "Last minute"
  focus_duration?: number; // minutes
  theme?: string;
  
  createdAt: number;
  updatedAt: number;
}

export interface Task {
  id?: string;
  title: string;
  type: string;
  duration: number; // in minutes
  date: string; // ISO date
  status: string; // "pending" | "completed"
  description?: string; // Venue, links, or important notes
  reminderMinutes?: number; // Minutes before task to notify
  energyImpact?: number; // -1 to -10 for consumption, +1 to +10 for recovery
  createdAt: number; // Keep this explicitly here since it's required during create
  updatedAt: number;
}

export async function getUserProfile() {
  const user = auth.currentUser;
  if (!user) return null;
  const path = `users/${user.uid}`;
  let docSnap;
  try {
    docSnap = await getDoc(doc(db, path));
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  // Create default profile
  const profile: UserProfile = {
    role: 'Student',
    credit_hours: 0,
    semester_end_date: '',
    health_condition: 'Excellent',
    unavailable_times: '',
    preferred_free_time: '',
    energy_type: 'Balanced',
    onboardingCompleted: false,
    dayStartHour: 7,
    dayEndHour: 22,
    preferences: JSON.stringify({
      sleepTime: '23:00',
      wakeTime: '07:00',
      meals: '3',
      sport: '1',
      focusWork: '25',
      focusBreak: '5',
      focusSound: 'success'
    }),
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  try {
    await setDoc(doc(db, path), profile);
    return profile;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
    return null;
  }
}

export async function updateUserProfile(updates: Partial<UserProfile>) {
  const user = auth.currentUser;
  if (!user) return;
  const path = `users/${user.uid}`;
  try {
    const docSnap = await getDoc(doc(db, path));
    const now = Date.now();
    if (!docSnap.exists()) {
      const profile: UserProfile = {
        energy_type: 'Balanced',
        onboardingCompleted: false,
        preferences: '{}',
        ...updates,
        createdAt: now,
        updatedAt: now
      };
      await setDoc(doc(db, path), profile);
    } else {
      await updateDoc(doc(db, path), {
        ...updates,
        updatedAt: now
      });
    }

    const keys = Object.keys(updates);
    if (updates.onboardingCompleted === true) {
      await logUserActivity("Onboarding Complete", `Synchronized student bio-energy baseline: ${updates.energy_type || "Balanced"}`);
    } else if (keys.length > 0) {
      const fieldList = keys.join(", ");
      await logUserActivity("Profile Updated", `Updated student preferences: ${fieldList}`);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    const user = auth.currentUser;
    if (!user) throw new Error("Not signed in");
    
    const taskId = crypto.randomUUID();
    const path = `users/${user.uid}/tasks/${taskId}`;
    const now = Date.now();
    try {
      await setDoc(doc(db, path), {
        ...task,
        createdAt: now,
        updatedAt: now,
      });
      await logUserActivity("Task Created", `Created active task block: "${task.title}" (${task.duration} mins) slated under type ${task.type}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
}

export async function addTasks(tasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[]) {
    const user = auth.currentUser;
    if (!user) throw new Error("Not signed in");
    
    const { writeBatch } = await import('firebase/firestore');
    const now = Date.now();
    const CHUNK_SIZE = 450; // Firestore limit is 500, using slightly less for safety
    
    for (let i = 0; i < tasks.length; i += CHUNK_SIZE) {
        const chunk = tasks.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        
        chunk.forEach(task => {
            const taskId = crypto.randomUUID();
            const docRef = doc(db, `users/${user.uid}/tasks/${taskId}`);
            batch.set(docRef, {
                ...task,
                createdAt: now,
                updatedAt: now,
            });
        });
        
        try {
            await batch.commit();
        } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/tasks (batch ${i/CHUNK_SIZE})`);
            throw err;
        }
    }
    await logUserActivity("Bulk Tasks Generated", `SLATE GENERATOR: Plotted ${tasks.length} synchronized schedule blocks`);
}

export async function deleteTasks(taskIds: string[]) {
    const user = auth.currentUser;
    if (!user) throw new Error("Not signed in");
    
    const { writeBatch } = await import('firebase/firestore');
    const CHUNK_SIZE = 450;
    
    for (let i = 0; i < taskIds.length; i += CHUNK_SIZE) {
        const chunk = taskIds.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        
        chunk.forEach(taskId => {
            const docRef = doc(db, `users/${user.uid}/tasks/${taskId}`);
            batch.delete(docRef);
        });
        
        try {
            await batch.commit();
        } catch (err) {
            handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/tasks (batch delete ${i/CHUNK_SIZE})`);
            throw err;
        }
    }
}

export async function updateTaskStatus(taskId: string, status: string) {
    const user = auth.currentUser;
    if (!user) throw new Error("Not signed in");
    
    const path = `users/${user.uid}/tasks/${taskId}`;
    const now = Date.now();
    try {
      const docSnap = await getDoc(doc(db, path));
      const title = docSnap.exists() ? docSnap.data().title : "Activity block";
      await updateDoc(doc(db, path), {
        status,
        updatedAt: now,
      });
      await logUserActivity("Task Audited", `Completed schedule block: marked "${title}" as ${status}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
}

export async function deleteTask(taskId: string) {
    const user = auth.currentUser;
    if (!user) throw new Error("Not signed in");
    
    const path = `users/${user.uid}/tasks/${taskId}`;
    try {
      const docSnap = await getDoc(doc(db, path));
      const title = docSnap.exists() ? docSnap.data().title : "Activity block";
      await deleteDoc(doc(db, path));
      await logUserActivity("Task Purged", `Removed event schedule: "${title}"`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
}

export async function subscribeToTasks(callback: (tasks: Task[]) => void) {
    const user = auth.currentUser;
    if (!user) return () => {};
    
    const path = `users/${user.uid}/tasks`;
    const q = query(collection(db, path), orderBy('date', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
        const tasks: Task[] = [];
        snapshot.forEach((doc) => {
            tasks.push({ id: doc.id, ...doc.data() } as Task);
        });
        callback(tasks);
    }, (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
    });
}

export async function resetUserData() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");
  
  const profilePath = `users/${user.uid}`;
  const tasksPath = `users/${user.uid}/tasks`;
  const now = Date.now();
  
  try {
    // 1. Reset Profile
    const defaultProfile: UserProfile = {
      role: 'Student',
      credit_hours: 0,
      semester_end_date: '',
      health_condition: 'Excellent',
      unavailable_times: '',
      preferred_free_time: '',
      energy_type: 'Balanced',
      onboardingCompleted: false,
      dayStartHour: 7,
      dayEndHour: 22,
      preferences: JSON.stringify({
        sleepTime: '23:00',
        wakeTime: '07:00',
        meals: '3',
        sport: '1',
        focusWork: '25',
        focusBreak: '5',
        focusSound: 'success'
      }),
      createdAt: now,
      updatedAt: now
    };
    await setDoc(doc(db, profilePath), defaultProfile);
    
    // 2. Delete all tasks
    const querySnapshot = await getDocs(collection(db, tasksPath));
    const deletePromises = querySnapshot.docs.map(taskDoc => deleteDoc(taskDoc.ref));
    await Promise.all(deletePromises);
    
    await logUserActivity("Account Reset", "Executed system-wide dataset purge & reset energy schedule models");
    return defaultProfile;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, profilePath);
  }
}

export async function getAllUsers() {
  const path = 'users';
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const users: (UserProfile & { id: string })[] = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() } as UserProfile & { id: string });
    });
    return users;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export async function getUserTasks(userId: string) {
  const path = `users/${userId}/tasks`;
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const tasks: Task[] = [];
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() } as Task);
    });
    return tasks;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export async function adminUpdateUser(userId: string, updates: Partial<UserProfile>) {
  const path = `users/${userId}`;
  try {
    const now = Date.now();
    await updateDoc(doc(db, path), {
      ...updates,
      updatedAt: now
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export interface UserActivity {
  id?: string;
  action: string;
  details: string;
  timestamp: number;
}

export async function logUserActivity(action: string, details: string) {
  const user = auth.currentUser;
  if (!user) return;
  const activityId = crypto.randomUUID();
  const path = `users/${user.uid}/activities/${activityId}`;
  try {
    await setDoc(doc(db, path), {
      action,
      details,
      timestamp: Date.now()
    });
  } catch (err) {
    console.warn("Unable to log activity: ", err);
  }
}

export async function getUserActivities(userId: string) {
  const path = `users/${userId}/activities`;
  try {
    const querySnapshot = await getDocs(query(collection(db, path), orderBy('timestamp', 'desc')));
    const activities: UserActivity[] = [];
    querySnapshot.forEach((doc) => {
      activities.push({ id: doc.id, ...doc.data() } as UserActivity);
    });
    return activities;
  } catch (err) {
    console.warn("Failed to list activities: ", err);
    return [];
  }
}

export async function adminUpdateStudentTask(userId: string, taskId: string, updates: Partial<Task>) {
  const path = `users/${userId}/tasks/${taskId}`;
  try {
    const now = Date.now();
    await updateDoc(doc(db, path), {
      ...updates,
      updatedAt: now
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function adminDeleteStudentTask(userId: string, taskId: string) {
  const path = `users/${userId}/tasks/${taskId}`;
  try {
    await deleteDoc(doc(db, path));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

