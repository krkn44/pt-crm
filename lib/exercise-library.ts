// Libreria esercizi predefiniti

export interface ExerciseTemplate {
  nome: string;
  categoria: "petto" | "dorso" | "gambe" | "spalle" | "braccia" | "core" | "cardio";
  serie: number;
  ripetizioni: string;
  peso?: string;
  recupero?: string;
  note?: string;
  videoUrl?: string;
}

export const exerciseLibrary: ExerciseTemplate[] = [
  // PETTO
  {
    nome: "Panca piana con bilanciere",
    categoria: "petto",
    serie: 3,
    ripetizioni: "8-12",
    peso: "60kg",
    recupero: "90s",
    note: "Mantenere i gomiti a 45° rispetto al busto",
  },
  {
    nome: "Panca inclinata con manubri",
    categoria: "petto",
    serie: 3,
    ripetizioni: "10-12",
    peso: "2x20kg",
    recupero: "90s",
  },
  {
    nome: "Croci ai cavi",
    categoria: "petto",
    serie: 3,
    ripetizioni: "12-15",
    peso: "15kg",
    recupero: "60s",
  },
  {
    nome: "Push-up",
    categoria: "petto",
    serie: 3,
    ripetizioni: "10-20",
    peso: "Corpo libero",
    recupero: "60s",
  },

  // DORSO
  {
    nome: "Trazioni alla sbarra",
    categoria: "dorso",
    serie: 3,
    ripetizioni: "6-10",
    peso: "Corpo libero",
    recupero: "120s",
    note: "Presa prona, larghezza spalle",
  },
  {
    nome: "Lat machine",
    categoria: "dorso",
    serie: 3,
    ripetizioni: "10-12",
    peso: "40kg",
    recupero: "90s",
  },
  {
    nome: "Rematore con bilanciere",
    categoria: "dorso",
    serie: 3,
    ripetizioni: "8-10",
    peso: "50kg",
    recupero: "90s",
  },
  {
    nome: "Pulley basso",
    categoria: "dorso",
    serie: 3,
    ripetizioni: "12",
    peso: "35kg",
    recupero: "60s",
  },

  // GAMBE
  {
    nome: "Squat",
    categoria: "gambe",
    serie: 4,
    ripetizioni: "8-12",
    peso: "70kg",
    recupero: "120s",
    note: "Scendere fino a 90° o parallelo",
  },
  {
    nome: "Leg press",
    categoria: "gambe",
    serie: 3,
    ripetizioni: "12-15",
    peso: "100kg",
    recupero: "90s",
  },
  {
    nome: "Affondi",
    categoria: "gambe",
    serie: 3,
    ripetizioni: "10 per gamba",
    peso: "2x15kg",
    recupero: "60s",
  },
  {
    nome: "Leg curl",
    categoria: "gambe",
    serie: 3,
    ripetizioni: "12",
    peso: "30kg",
    recupero: "60s",
  },
  {
    nome: "Leg extension",
    categoria: "gambe",
    serie: 3,
    ripetizioni: "12-15",
    peso: "35kg",
    recupero: "60s",
  },
  {
    nome: "Calf raise",
    categoria: "gambe",
    serie: 3,
    ripetizioni: "15-20",
    peso: "50kg",
    recupero: "45s",
  },

  // SPALLE
  {
    nome: "Military press",
    categoria: "spalle",
    serie: 3,
    ripetizioni: "8-12",
    peso: "40kg",
    recupero: "90s",
  },
  {
    nome: "Alzate laterali",
    categoria: "spalle",
    serie: 3,
    ripetizioni: "12-15",
    peso: "2x10kg",
    recupero: "60s",
  },
  {
    nome: "Alzate frontali",
    categoria: "spalle",
    serie: 3,
    ripetizioni: "12",
    peso: "2x10kg",
    recupero: "60s",
  },
  {
    nome: "Face pull",
    categoria: "spalle",
    serie: 3,
    ripetizioni: "15",
    peso: "20kg",
    recupero: "60s",
    note: "Ottimo per deltoidi posteriori",
  },

  // BRACCIA
  {
    nome: "Curl con bilanciere",
    categoria: "braccia",
    serie: 3,
    ripetizioni: "10-12",
    peso: "25kg",
    recupero: "60s",
  },
  {
    nome: "Curl con manubri alternato",
    categoria: "braccia",
    serie: 3,
    ripetizioni: "12 per braccio",
    peso: "2x12kg",
    recupero: "60s",
  },
  {
    nome: "French press",
    categoria: "braccia",
    serie: 3,
    ripetizioni: "12",
    peso: "15kg",
    recupero: "60s",
  },
  {
    nome: "Dip alle parallele",
    categoria: "braccia",
    serie: 3,
    ripetizioni: "8-12",
    peso: "Corpo libero",
    recupero: "90s",
  },
  {
    nome: "Tricipiti ai cavi",
    categoria: "braccia",
    serie: 3,
    ripetizioni: "12-15",
    peso: "20kg",
    recupero: "45s",
  },

  // CORE
  {
    nome: "Plank",
    categoria: "core",
    serie: 3,
    ripetizioni: "45-60s",
    peso: "Corpo libero",
    recupero: "60s",
  },
  {
    nome: "Crunch",
    categoria: "core",
    serie: 3,
    ripetizioni: "15-20",
    peso: "Corpo libero",
    recupero: "45s",
  },
  {
    nome: "Russian twist",
    categoria: "core",
    serie: 3,
    ripetizioni: "20 totali",
    peso: "Corpo libero o disco",
    recupero: "45s",
  },
  {
    nome: "Mountain climber",
    categoria: "core",
    serie: 3,
    ripetizioni: "20 totali",
    peso: "Corpo libero",
    recupero: "45s",
  },
  {
    nome: "Leg raises",
    categoria: "core",
    serie: 3,
    ripetizioni: "12-15",
    peso: "Corpo libero",
    recupero: "60s",
  },

  // CARDIO
  {
    nome: "Corsa tapis roulant",
    categoria: "cardio",
    serie: 1,
    ripetizioni: "20-30min",
    recupero: "0s",
    note: "Frequenza cardiaca 130-150 bpm",
  },
  {
    nome: "Cyclette",
    categoria: "cardio",
    serie: 1,
    ripetizioni: "20-30min",
    recupero: "0s",
  },
  {
    nome: "Burpees",
    categoria: "cardio",
    serie: 3,
    ripetizioni: "10-15",
    peso: "Corpo libero",
    recupero: "60s",
  },
];

export const exerciseCategories = [
  { value: "petto", label: "Petto" },
  { value: "dorso", label: "Dorso" },
  { value: "gambe", label: "Gambe" },
  { value: "spalle", label: "Spalle" },
  { value: "braccia", label: "Braccia" },
  { value: "core", label: "Core" },
  { value: "cardio", label: "Cardio" },
] as const;
