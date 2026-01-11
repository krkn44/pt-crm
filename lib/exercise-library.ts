// Predefined exercise library

export interface ExerciseTemplate {
  name: string;
  category: "chest" | "back" | "legs" | "shoulders" | "arms" | "core" | "cardio";
  sets: number;
  reps: string;
  weight?: string;
  rest?: string;
  notes?: string;
  videoUrl?: string;
}

export const exerciseLibrary: ExerciseTemplate[] = [
  // CHEST
  {
    name: "Barbell Bench Press",
    category: "chest",
    sets: 3,
    reps: "8-12",
    weight: "60kg",
    rest: "90s",
    notes: "Keep elbows at 45° from body",
  },
  {
    name: "Incline Dumbbell Press",
    category: "chest",
    sets: 3,
    reps: "10-12",
    weight: "2x20kg",
    rest: "90s",
  },
  {
    name: "Cable Flyes",
    category: "chest",
    sets: 3,
    reps: "12-15",
    weight: "15kg",
    rest: "60s",
  },
  {
    name: "Push-ups",
    category: "chest",
    sets: 3,
    reps: "10-20",
    weight: "Bodyweight",
    rest: "60s",
  },

  // BACK
  {
    name: "Pull-ups",
    category: "back",
    sets: 3,
    reps: "6-10",
    weight: "Bodyweight",
    rest: "120s",
    notes: "Pronated grip, shoulder width",
  },
  {
    name: "Lat Pulldown",
    category: "back",
    sets: 3,
    reps: "10-12",
    weight: "40kg",
    rest: "90s",
  },
  {
    name: "Barbell Row",
    category: "back",
    sets: 3,
    reps: "8-10",
    weight: "50kg",
    rest: "90s",
  },
  {
    name: "Seated Cable Row",
    category: "back",
    sets: 3,
    reps: "12",
    weight: "35kg",
    rest: "60s",
  },

  // LEGS
  {
    name: "Squat",
    category: "legs",
    sets: 4,
    reps: "8-12",
    weight: "70kg",
    rest: "120s",
    notes: "Go down to 90° or parallel",
  },
  {
    name: "Leg Press",
    category: "legs",
    sets: 3,
    reps: "12-15",
    weight: "100kg",
    rest: "90s",
  },
  {
    name: "Lunges",
    category: "legs",
    sets: 3,
    reps: "10 per leg",
    weight: "2x15kg",
    rest: "60s",
  },
  {
    name: "Leg Curl",
    category: "legs",
    sets: 3,
    reps: "12",
    weight: "30kg",
    rest: "60s",
  },
  {
    name: "Leg Extension",
    category: "legs",
    sets: 3,
    reps: "12-15",
    weight: "35kg",
    rest: "60s",
  },
  {
    name: "Calf Raise",
    category: "legs",
    sets: 3,
    reps: "15-20",
    weight: "50kg",
    rest: "45s",
  },

  // SHOULDERS
  {
    name: "Military Press",
    category: "shoulders",
    sets: 3,
    reps: "8-12",
    weight: "40kg",
    rest: "90s",
  },
  {
    name: "Lateral Raises",
    category: "shoulders",
    sets: 3,
    reps: "12-15",
    weight: "2x10kg",
    rest: "60s",
  },
  {
    name: "Front Raises",
    category: "shoulders",
    sets: 3,
    reps: "12",
    weight: "2x10kg",
    rest: "60s",
  },
  {
    name: "Face Pull",
    category: "shoulders",
    sets: 3,
    reps: "15",
    weight: "20kg",
    rest: "60s",
    notes: "Great for rear deltoids",
  },

  // ARMS
  {
    name: "Barbell Curl",
    category: "arms",
    sets: 3,
    reps: "10-12",
    weight: "25kg",
    rest: "60s",
  },
  {
    name: "Alternating Dumbbell Curl",
    category: "arms",
    sets: 3,
    reps: "12 per arm",
    weight: "2x12kg",
    rest: "60s",
  },
  {
    name: "French Press",
    category: "arms",
    sets: 3,
    reps: "12",
    weight: "15kg",
    rest: "60s",
  },
  {
    name: "Parallel Bar Dips",
    category: "arms",
    sets: 3,
    reps: "8-12",
    weight: "Bodyweight",
    rest: "90s",
  },
  {
    name: "Cable Tricep Pushdown",
    category: "arms",
    sets: 3,
    reps: "12-15",
    weight: "20kg",
    rest: "45s",
  },

  // CORE
  {
    name: "Plank",
    category: "core",
    sets: 3,
    reps: "45-60s",
    weight: "Bodyweight",
    rest: "60s",
  },
  {
    name: "Crunch",
    category: "core",
    sets: 3,
    reps: "15-20",
    weight: "Bodyweight",
    rest: "45s",
  },
  {
    name: "Russian Twist",
    category: "core",
    sets: 3,
    reps: "20 total",
    weight: "Bodyweight or plate",
    rest: "45s",
  },
  {
    name: "Mountain Climber",
    category: "core",
    sets: 3,
    reps: "20 total",
    weight: "Bodyweight",
    rest: "45s",
  },
  {
    name: "Leg Raises",
    category: "core",
    sets: 3,
    reps: "12-15",
    weight: "Bodyweight",
    rest: "60s",
  },

  // CARDIO
  {
    name: "Treadmill Running",
    category: "cardio",
    sets: 1,
    reps: "20-30min",
    rest: "0s",
    notes: "Heart rate 130-150 bpm",
  },
  {
    name: "Stationary Bike",
    category: "cardio",
    sets: 1,
    reps: "20-30min",
    rest: "0s",
  },
  {
    name: "Burpees",
    category: "cardio",
    sets: 3,
    reps: "10-15",
    weight: "Bodyweight",
    rest: "60s",
  },
];

export const exerciseCategories = [
  { value: "chest", label: "Chest" },
  { value: "back", label: "Back" },
  { value: "legs", label: "Legs" },
  { value: "shoulders", label: "Shoulders" },
  { value: "arms", label: "Arms" },
  { value: "core", label: "Core" },
  { value: "cardio", label: "Cardio" },
] as const;
