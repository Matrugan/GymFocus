import { useEffect, useMemo, useState } from "react";

import {
  Plus,
  Trash2,
  CheckCircle,
  Circle,
  Loader2,
  Save,
  Trophy,
  Pencil,
  X,
  Settings2,
  CalendarDays,
  Archive,
} from "lucide-react";

import toast from "react-hot-toast";

import { motion } from "framer-motion";

import { updateProfileStats } from "../services/profileService";
import {
  archiveWorkoutPlanRecord,
  createCompletedWorkoutLogWithDuration,
  createWorkoutExercise,
  createWorkoutExercises,
  createWorkoutLog,
  createWorkoutPlanRecord,
  createWorkoutProgress,
  createWorkoutSetLogs,
  deleteWorkoutExercise,
  deleteWorkoutSetLogsForExerciseDate,
  fetchActiveWorkoutPlans,
  fetchDailyWorkoutProgress,
  fetchWorkoutExercises,
  fetchWorkoutLogs,
  fetchWorkoutSetLogs,
  findCompletedWorkoutLog,
  findWorkoutLogByDay,
  updateWorkoutExercise,
  updateWorkoutPlanRecord,
  updateWorkoutProgress,
} from "../services/workoutService";
import { unlockAchievement } from "../utils/achievementSystem";
import { logXP } from "../utils/xpSystem";
import CurrentWorkoutCard from "./components/CurrentWorkoutCard";
import CreateWorkoutPlanForm from "./components/CreateWorkoutPlanForm";
import WorkoutHeader from "./components/WorkoutHeader";
import WorkoutQuickTools from "./components/WorkoutQuickTools";
import WorkoutTemplatesPanel from "./components/WorkoutTemplatesPanel";
import { reportError } from "../utils/errorHandler";
import {
  getCurrentWorkoutDay,
  getNextWorkoutDayAfter,
  sortWorkoutLogs,
  getWorkoutDateKey,
} from "./components/workoutLogic";

const workoutTemplates = [
  {
    title: "AB Iniciante",
    description: "Treino AB simples para quem está começando.",
    focuses: {
      "Treino A": "Superiores",
      "Treino B": "Inferiores e Abdômen",
    },
    exercises: [
      {
        workout_day: "Treino A",
        name: "Supino máquina",
        sets: "3",
        reps: "10-12",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Puxada alta",
        sets: "3",
        reps: "10-12",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Desenvolvimento de ombros",
        sets: "3",
        reps: "10-12",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Rosca direta",
        sets: "2",
        reps: "12",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Tríceps pulley",
        sets: "2",
        reps: "12",
        load: "",
      },

      {
        workout_day: "Treino B",
        name: "Agachamento livre ou guiado",
        sets: "3",
        reps: "10-12",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Leg press",
        sets: "3",
        reps: "10-12",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Cadeira extensora",
        sets: "3",
        reps: "12",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Mesa flexora",
        sets: "3",
        reps: "12",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Prancha abdominal",
        sets: "3",
        reps: "30s",
        load: "",
      },
    ],
  },
  {
    title: "ABC Iniciante",
    description: "Treino ABC com volume moderado para iniciantes.",
    focuses: {
      "Treino A": "Peito, Ombros e Tríceps",
      "Treino B": "Costas e Bíceps",
      "Treino C": "Pernas e Abdômen",
    },
    exercises: [
      {
        workout_day: "Treino A",
        name: "Supino máquina",
        sets: "3",
        reps: "10-12",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Supino inclinado com halteres",
        sets: "3",
        reps: "10",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Desenvolvimento de ombros",
        sets: "3",
        reps: "10-12",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Tríceps pulley",
        sets: "3",
        reps: "12",
        load: "",
      },

      {
        workout_day: "Treino B",
        name: "Puxada alta",
        sets: "3",
        reps: "10-12",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Remada baixa",
        sets: "3",
        reps: "10-12",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Pulldown",
        sets: "3",
        reps: "12",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Rosca direta",
        sets: "3",
        reps: "12",
        load: "",
      },

      {
        workout_day: "Treino C",
        name: "Agachamento guiado",
        sets: "3",
        reps: "10-12",
        load: "",
      },
      {
        workout_day: "Treino C",
        name: "Leg press",
        sets: "3",
        reps: "10-12",
        load: "",
      },
      {
        workout_day: "Treino C",
        name: "Cadeira extensora",
        sets: "3",
        reps: "12",
        load: "",
      },
      {
        workout_day: "Treino C",
        name: "Mesa flexora",
        sets: "3",
        reps: "12",
        load: "",
      },
      {
        workout_day: "Treino C",
        name: "Abdominal máquina",
        sets: "3",
        reps: "15",
        load: "",
      },
    ],
  },
  {
    title: "ABC Hipertrofia",
    description: "Treino ABC focado em hipertrofia muscular.",
    focuses: {
      "Treino A": "Peito e Tríceps",
      "Treino B": "Costas e Bíceps",
      "Treino C": "Pernas e Abdômen",
    },
    exercises: [
      {
        workout_day: "Treino A",
        name: "Supino reto",
        sets: "4",
        reps: "8-10",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Supino inclinado",
        sets: "3",
        reps: "10-12",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Crucifixo",
        sets: "3",
        reps: "12",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Tríceps corda",
        sets: "3",
        reps: "10-12",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Tríceps testa",
        sets: "3",
        reps: "10-12",
        load: "",
      },

      {
        workout_day: "Treino B",
        name: "Puxada alta",
        sets: "4",
        reps: "8-10",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Remada baixa",
        sets: "3",
        reps: "10-12",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Remada unilateral",
        sets: "3",
        reps: "10",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Rosca direta",
        sets: "3",
        reps: "10-12",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Rosca martelo",
        sets: "3",
        reps: "10-12",
        load: "",
      },

      {
        workout_day: "Treino C",
        name: "Agachamento livre",
        sets: "4",
        reps: "8-10",
        load: "",
      },
      {
        workout_day: "Treino C",
        name: "Leg press",
        sets: "4",
        reps: "10-12",
        load: "",
      },
      {
        workout_day: "Treino C",
        name: "Cadeira extensora",
        sets: "3",
        reps: "12",
        load: "",
      },
      {
        workout_day: "Treino C",
        name: "Mesa flexora",
        sets: "3",
        reps: "12",
        load: "",
      },
      {
        workout_day: "Treino C",
        name: "Abdominal prancha",
        sets: "3",
        reps: "30-45s",
        load: "",
      },
    ],
  },
  {
    title: "ABC Avançado",
    description: "Treino ABC com maior intensidade e volume.",
    focuses: {
      "Treino A": "Peito, Ombros e Tríceps",
      "Treino B": "Costas, Trapézio e Bíceps",
      "Treino C": "Pernas completas",
    },
    exercises: [
      {
        workout_day: "Treino A",
        name: "Supino reto",
        sets: "4",
        reps: "6-8",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Supino inclinado com halteres",
        sets: "4",
        reps: "8-10",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Crossover",
        sets: "3",
        reps: "12-15",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Desenvolvimento militar",
        sets: "4",
        reps: "8-10",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Elevação lateral",
        sets: "4",
        reps: "12",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Tríceps francês",
        sets: "3",
        reps: "10-12",
        load: "",
      },

      {
        workout_day: "Treino B",
        name: "Barra fixa ou puxada alta",
        sets: "4",
        reps: "6-10",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Remada curvada",
        sets: "4",
        reps: "8-10",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Remada cavalinho",
        sets: "3",
        reps: "10",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Encolhimento",
        sets: "4",
        reps: "12",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Rosca direta barra",
        sets: "3",
        reps: "8-10",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Rosca alternada",
        sets: "3",
        reps: "10-12",
        load: "",
      },

      {
        workout_day: "Treino C",
        name: "Agachamento livre",
        sets: "5",
        reps: "6-8",
        load: "",
      },
      {
        workout_day: "Treino C",
        name: "Leg press",
        sets: "4",
        reps: "10",
        load: "",
      },
      {
        workout_day: "Treino C",
        name: "Stiff",
        sets: "4",
        reps: "8-10",
        load: "",
      },
      {
        workout_day: "Treino C",
        name: "Cadeira extensora",
        sets: "3",
        reps: "12-15",
        load: "",
      },
      {
        workout_day: "Treino C",
        name: "Mesa flexora",
        sets: "3",
        reps: "12",
        load: "",
      },
      {
        workout_day: "Treino C",
        name: "Panturrilha em pé",
        sets: "5",
        reps: "12-15",
        load: "",
      },
    ],
  },
  {
    title: "ABCD Normal",
    description: "Divisão ABCD equilibrada para evolução muscular.",
    focuses: {
      "Treino A": "Peito e Tríceps",
      "Treino B": "Costas e Bíceps",
      "Treino C": "Pernas",
      "Treino D": "Ombros e Abdômen",
    },
    exercises: [
      {
        workout_day: "Treino A",
        name: "Supino reto",
        sets: "4",
        reps: "8-10",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Supino inclinado",
        sets: "3",
        reps: "10",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Crucifixo",
        sets: "3",
        reps: "12",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Tríceps pulley",
        sets: "3",
        reps: "10-12",
        load: "",
      },

      {
        workout_day: "Treino B",
        name: "Puxada alta",
        sets: "4",
        reps: "8-10",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Remada baixa",
        sets: "3",
        reps: "10-12",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Pulldown",
        sets: "3",
        reps: "12",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Rosca direta",
        sets: "3",
        reps: "10-12",
        load: "",
      },

      {
        workout_day: "Treino C",
        name: "Agachamento",
        sets: "4",
        reps: "8-10",
        load: "",
      },
      {
        workout_day: "Treino C",
        name: "Leg press",
        sets: "4",
        reps: "10-12",
        load: "",
      },
      {
        workout_day: "Treino C",
        name: "Stiff",
        sets: "3",
        reps: "10",
        load: "",
      },
      {
        workout_day: "Treino C",
        name: "Panturrilha sentado",
        sets: "4",
        reps: "12-15",
        load: "",
      },

      {
        workout_day: "Treino D",
        name: "Desenvolvimento com halteres",
        sets: "4",
        reps: "8-10",
        load: "",
      },
      {
        workout_day: "Treino D",
        name: "Elevação lateral",
        sets: "3",
        reps: "12",
        load: "",
      },
      {
        workout_day: "Treino D",
        name: "Face pull",
        sets: "3",
        reps: "12-15",
        load: "",
      },
      {
        workout_day: "Treino D",
        name: "Abdominal infra",
        sets: "3",
        reps: "15",
        load: "",
      },
    ],
  },
  {
    title: "ABCD Avançado",
    description: "Divisão ABCD com maior volume e intensidade.",
    focuses: {
      "Treino A": "Peito",
      "Treino B": "Costas",
      "Treino C": "Pernas",
      "Treino D": "Ombros e Braços",
    },
    exercises: [
      {
        workout_day: "Treino A",
        name: "Supino reto",
        sets: "4",
        reps: "6-8",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Supino inclinado com halteres",
        sets: "4",
        reps: "8-10",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Paralelas",
        sets: "3",
        reps: "8-12",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Crossover",
        sets: "3",
        reps: "12-15",
        load: "",
      },

      {
        workout_day: "Treino B",
        name: "Barra fixa ou puxada alta",
        sets: "4",
        reps: "6-10",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Remada curvada",
        sets: "4",
        reps: "8",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Remada unilateral",
        sets: "3",
        reps: "10",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Pulldown",
        sets: "3",
        reps: "12",
        load: "",
      },

      {
        workout_day: "Treino C",
        name: "Agachamento livre",
        sets: "5",
        reps: "6-8",
        load: "",
      },
      {
        workout_day: "Treino C",
        name: "Leg press",
        sets: "4",
        reps: "10",
        load: "",
      },
      {
        workout_day: "Treino C",
        name: "Stiff",
        sets: "4",
        reps: "8-10",
        load: "",
      },
      {
        workout_day: "Treino C",
        name: "Mesa flexora",
        sets: "3",
        reps: "12",
        load: "",
      },

      {
        workout_day: "Treino D",
        name: "Desenvolvimento militar",
        sets: "4",
        reps: "6-8",
        load: "",
      },
      {
        workout_day: "Treino D",
        name: "Elevação lateral",
        sets: "4",
        reps: "12",
        load: "",
      },
      {
        workout_day: "Treino D",
        name: "Rosca direta",
        sets: "3",
        reps: "8-10",
        load: "",
      },
      {
        workout_day: "Treino D",
        name: "Rosca martelo",
        sets: "3",
        reps: "10-12",
        load: "",
      },
      {
        workout_day: "Treino D",
        name: "Tríceps testa",
        sets: "3",
        reps: "8-10",
        load: "",
      },
      {
        workout_day: "Treino D",
        name: "Tríceps corda",
        sets: "3",
        reps: "12",
        load: "",
      },
    ],
  },
  {
    title: "ABCDE Avançado",
    description: "Treino ABCDE com foco específico por grupo muscular.",
    focuses: {
      "Treino A": "Peito",
      "Treino B": "Costas",
      "Treino C": "Pernas",
      "Treino D": "Ombros",
      "Treino E": "Braços e Abdômen",
    },
    exercises: [
      {
        workout_day: "Treino A",
        name: "Supino reto",
        sets: "4",
        reps: "6-8",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Supino inclinado",
        sets: "4",
        reps: "8-10",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Crossover",
        sets: "4",
        reps: "12",
        load: "",
      },

      {
        workout_day: "Treino B",
        name: "Puxada alta",
        sets: "4",
        reps: "8-10",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Remada curvada",
        sets: "4",
        reps: "8",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Remada baixa",
        sets: "4",
        reps: "10-12",
        load: "",
      },

      {
        workout_day: "Treino C",
        name: "Agachamento livre",
        sets: "5",
        reps: "6-8",
        load: "",
      },
      {
        workout_day: "Treino C",
        name: "Leg press",
        sets: "4",
        reps: "10",
        load: "",
      },
      {
        workout_day: "Treino C",
        name: "Stiff",
        sets: "4",
        reps: "8-10",
        load: "",
      },
      {
        workout_day: "Treino C",
        name: "Panturrilha em pé",
        sets: "5",
        reps: "12-15",
        load: "",
      },

      {
        workout_day: "Treino D",
        name: "Desenvolvimento militar",
        sets: "4",
        reps: "6-8",
        load: "",
      },
      {
        workout_day: "Treino D",
        name: "Elevação lateral",
        sets: "4",
        reps: "12",
        load: "",
      },
      {
        workout_day: "Treino D",
        name: "Face pull",
        sets: "4",
        reps: "12-15",
        load: "",
      },

      {
        workout_day: "Treino E",
        name: "Rosca direta",
        sets: "4",
        reps: "8-10",
        load: "",
      },
      {
        workout_day: "Treino E",
        name: "Rosca martelo",
        sets: "3",
        reps: "10-12",
        load: "",
      },
      {
        workout_day: "Treino E",
        name: "Tríceps testa",
        sets: "4",
        reps: "8-10",
        load: "",
      },
      {
        workout_day: "Treino E",
        name: "Abdominal prancha",
        sets: "4",
        reps: "40-60s",
        load: "",
      },
    ],
  },
  {
    title: "Full Body Iniciante",
    description: "Treino de corpo inteiro ideal para iniciantes.",
    focuses: {
      "Full Body": "Corpo inteiro",
    },
    exercises: [
      {
        workout_day: "Full Body",
        name: "Agachamento livre ou guiado",
        sets: "3",
        reps: "10-12",
        load: "",
      },
      {
        workout_day: "Full Body",
        name: "Supino máquina",
        sets: "3",
        reps: "10-12",
        load: "",
      },
      {
        workout_day: "Full Body",
        name: "Puxada alta",
        sets: "3",
        reps: "10-12",
        load: "",
      },
      {
        workout_day: "Full Body",
        name: "Desenvolvimento de ombros",
        sets: "3",
        reps: "10-12",
        load: "",
      },
      {
        workout_day: "Full Body",
        name: "Leg press",
        sets: "3",
        reps: "10-12",
        load: "",
      },
      {
        workout_day: "Full Body",
        name: "Prancha abdominal",
        sets: "3",
        reps: "30s",
        load: "",
      },
    ],
  },
  {
    title: "Full Body Intermediário",
    description: "Treino de corpo inteiro com volume moderado.",
    focuses: {
      "Full Body": "Corpo inteiro e condicionamento",
    },
    exercises: [
      {
        workout_day: "Full Body",
        name: "Agachamento livre",
        sets: "4",
        reps: "8-10",
        load: "",
      },
      {
        workout_day: "Full Body",
        name: "Supino reto",
        sets: "4",
        reps: "8-10",
        load: "",
      },
      {
        workout_day: "Full Body",
        name: "Remada baixa",
        sets: "4",
        reps: "10",
        load: "",
      },
      {
        workout_day: "Full Body",
        name: "Desenvolvimento militar",
        sets: "3",
        reps: "10",
        load: "",
      },
      {
        workout_day: "Full Body",
        name: "Stiff",
        sets: "3",
        reps: "10",
        load: "",
      },
      {
        workout_day: "Full Body",
        name: "Rosca direta",
        sets: "3",
        reps: "12",
        load: "",
      },
      {
        workout_day: "Full Body",
        name: "Tríceps pulley",
        sets: "3",
        reps: "12",
        load: "",
      },
      {
        workout_day: "Full Body",
        name: "Prancha abdominal",
        sets: "3",
        reps: "45s",
        load: "",
      },
    ],
  },
  {
    title: "PPL - Push Pull Legs",
    description: "Divisão Push, Pull e Legs.",
    focuses: {
      "Treino A": "Push - Peito, Ombros e Tríceps",
      "Treino B": "Pull - Costas e Bíceps",
      "Treino C": "Legs - Pernas",
    },
    exercises: [
      {
        workout_day: "Treino A",
        name: "Supino reto",
        sets: "4",
        reps: "8-10",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Desenvolvimento militar",
        sets: "3",
        reps: "8-10",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Elevação lateral",
        sets: "3",
        reps: "12",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Tríceps corda",
        sets: "3",
        reps: "10-12",
        load: "",
      },

      {
        workout_day: "Treino B",
        name: "Puxada alta",
        sets: "4",
        reps: "8-10",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Remada baixa",
        sets: "3",
        reps: "10-12",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Face pull",
        sets: "3",
        reps: "12",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Rosca direta",
        sets: "3",
        reps: "10-12",
        load: "",
      },

      {
        workout_day: "Treino C",
        name: "Agachamento",
        sets: "4",
        reps: "8-10",
        load: "",
      },
      {
        workout_day: "Treino C",
        name: "Leg press",
        sets: "4",
        reps: "10-12",
        load: "",
      },
      {
        workout_day: "Treino C",
        name: "Stiff",
        sets: "3",
        reps: "10-12",
        load: "",
      },
      {
        workout_day: "Treino C",
        name: "Panturrilha em pé",
        sets: "4",
        reps: "12-15",
        load: "",
      },
    ],
  },
  {
    title: "PPL Avançado",
    description: "Push Pull Legs com maior volume para praticantes avançados.",
    focuses: {
      "Treino A": "Push pesado",
      "Treino B": "Pull pesado",
      "Treino C": "Legs pesado",
    },
    exercises: [
      {
        workout_day: "Treino A",
        name: "Supino reto",
        sets: "5",
        reps: "5-8",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Supino inclinado com halteres",
        sets: "4",
        reps: "8-10",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Desenvolvimento militar",
        sets: "4",
        reps: "6-8",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Elevação lateral",
        sets: "4",
        reps: "12-15",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Tríceps testa",
        sets: "4",
        reps: "8-10",
        load: "",
      },

      {
        workout_day: "Treino B",
        name: "Barra fixa",
        sets: "5",
        reps: "6-10",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Remada curvada",
        sets: "4",
        reps: "6-8",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Remada baixa",
        sets: "4",
        reps: "10",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Face pull",
        sets: "4",
        reps: "12-15",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Rosca direta",
        sets: "4",
        reps: "8-10",
        load: "",
      },

      {
        workout_day: "Treino C",
        name: "Agachamento livre",
        sets: "5",
        reps: "5-8",
        load: "",
      },
      {
        workout_day: "Treino C",
        name: "Leg press",
        sets: "4",
        reps: "10",
        load: "",
      },
      {
        workout_day: "Treino C",
        name: "Stiff",
        sets: "4",
        reps: "8-10",
        load: "",
      },
      {
        workout_day: "Treino C",
        name: "Afundo com halteres",
        sets: "3",
        reps: "10 cada perna",
        load: "",
      },
      {
        workout_day: "Treino C",
        name: "Panturrilha em pé",
        sets: "5",
        reps: "12-15",
        load: "",
      },
    ],
  },
  {
    title: "Emagrecimento e Condicionamento",
    description: "Treino com musculação e exercícios metabólicos.",
    focuses: {
      "Treino A": "Força geral",
      "Treino B": "Condicionamento",
      "Treino C": "Pernas e Core",
    },
    exercises: [
      {
        workout_day: "Treino A",
        name: "Agachamento goblet",
        sets: "3",
        reps: "12",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Supino máquina",
        sets: "3",
        reps: "12",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Puxada alta",
        sets: "3",
        reps: "12",
        load: "",
      },
      {
        workout_day: "Treino A",
        name: "Prancha abdominal",
        sets: "3",
        reps: "30-45s",
        load: "",
      },

      {
        workout_day: "Treino B",
        name: "Esteira ou bike",
        sets: "1",
        reps: "15-20min",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Burpee adaptado",
        sets: "3",
        reps: "10",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Kettlebell swing ou remada alta",
        sets: "3",
        reps: "12",
        load: "",
      },
      {
        workout_day: "Treino B",
        name: "Abdominal bicicleta",
        sets: "3",
        reps: "20",
        load: "",
      },

      {
        workout_day: "Treino C",
        name: "Leg press",
        sets: "4",
        reps: "12",
        load: "",
      },
      {
        workout_day: "Treino C",
        name: "Cadeira extensora",
        sets: "3",
        reps: "15",
        load: "",
      },
      {
        workout_day: "Treino C",
        name: "Mesa flexora",
        sets: "3",
        reps: "15",
        load: "",
      },
      {
        workout_day: "Treino C",
        name: "Abdominal infra",
        sets: "3",
        reps: "15",
        load: "",
      },
    ],
  },
];

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function WorkoutManager({ user, profile, onProfileUpdated }) {
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [progress, setProgress] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [setLogs, setSetLogs] = useState([]);
  const [expandedSetLoggerId, setExpandedSetLoggerId] = useState(null);
  const [setLogForms, setSetLogForms] = useState({});
  const [savingSetLogs, setSavingSetLogs] = useState(false);
  const [workoutStartedAt, setWorkoutStartedAt] = useState(null);
  const [elapsedWorkoutSeconds, setElapsedWorkoutSeconds] = useState(0);

  const [loading, setLoading] = useState(true);
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [addingExercise, setAddingExercise] = useState(false);
  const [finishingWorkout, setFinishingWorkout] = useState(false);
  const [updatingPlan, setUpdatingPlan] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState(false);
  const [updatingExercise, setUpdatingExercise] = useState(false);
  const [updatingFocuses, setUpdatingFocuses] = useState(false);

  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showPlanTools, setShowPlanTools] = useState(false);
  const [showFocusEditor, setShowFocusEditor] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);

  const [selectedWorkoutDay, setSelectedWorkoutDay] = useState("Todos");

  const [newPlan, setNewPlan] = useState({
    title: "",
    description: "",
  });

  const [editingPlan, setEditingPlan] = useState(null);

  const [editPlanData, setEditPlanData] = useState({
    title: "",
    description: "",
  });

  const [dayFocuses, setDayFocuses] = useState({});

  const [newExercise, setNewExercise] = useState({
    workout_day: "Treino A",
    name: "",
    sets: "",
    reps: "",
    load: "",
  });

  const [editingExercise, setEditingExercise] = useState(null);

  const [editExerciseData, setEditExerciseData] = useState({
    workout_day: "Treino A",
    name: "",
    sets: "",
    reps: "",
    load: "",
  });

  const today = getLocalDateString();

  const workoutDayOptions = [
    "Treino A",
    "Treino B",
    "Treino C",
    "Treino D",
    "Treino E",
    "Full Body",
  ];

  const workoutFilterOptions = ["Todos", ...workoutDayOptions];

  useEffect(() => {
    if (user?.id) {
      getWorkoutData();
    }
  }, [user?.id]);

  function getPlanFocuses(plan) {
    return plan?.day_focuses || {};
  }

  function getDayFocus(day) {
    return dayFocuses?.[day] || "";
  }

  function getDayLabel(day) {
    const focus = getDayFocus(day);

    if (!focus.trim()) {
      return day;
    }

    return `${day} - ${focus}`;
  }

  function formatWorkoutDate(dateString) {
    if (!dateString) {
      return "";
    }

    const [year, month, day] = dateString.split("-");

    return `${day}/${month}/${year}`;
  }

  function formatWorkoutDuration(totalSeconds) {
    const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${String(minutes).padStart(2, "0")}m`;
    }

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0",
    )}`;
  }

  function getTodayCompletedLog(logs) {
  return (
    sortWorkoutLogs(logs).find((log) => {
      const logStatus = log.status || "completed";

      return (
        getWorkoutDateKey(log.workout_date) === today &&
        logStatus === "completed"
      );
    }) || null
  );
}

  async function getWorkoutData() {
    setLoading(true);

    const { data: plansData, error: plansError } =
      await fetchActiveWorkoutPlans(user.id);

    if (plansError) {
      reportError(plansError, "Error loading workout plans.");
      setLoading(false);
      return;
    }

    setPlans(plansData || []);

    const selectedPlan = plansData?.[0] || null;

    setExpandedSetLoggerId(null);
    setSetLogForms({});
    setActivePlan(selectedPlan);
    setDayFocuses(getPlanFocuses(selectedPlan));

    if (!selectedPlan) {
      setExercises([]);
      setProgress([]);
      setWorkoutLogs([]);
      setSetLogs([]);
      setShowCreatePlan(true);
      setLoading(false);
      return;
    }

    await loadPlanDetails(selectedPlan.id);

    setLoading(false);
  }

  async function loadPlanDetails(planId) {
    const { data: exercisesData, error: exercisesError } =
      await fetchWorkoutExercises(user.id, planId);

    if (exercisesError) {
      reportError(exercisesError, "Error loading exercises.");
      return;
    }

    const loadedExercises = exercisesData || [];

    setExercises(loadedExercises);

    const { data: logsData, error: logsError } = await fetchWorkoutLogs(
      user.id,
      planId,
    );

    if (logsError) {
      reportError(logsError, "Error loading workout history.");
      return;
    }

    const loadedLogs = logsData || [];

    setWorkoutLogs(loadedLogs);

    const currentDay = getCurrentWorkoutDay(loadedExercises, loadedLogs);
    const loadedTodayCompletedLog = getTodayCompletedLog(loadedLogs);

    setSelectedWorkoutDay(loadedTodayCompletedLog?.workout_day || currentDay);

    const { data: progressData, error: progressError } =
      await fetchDailyWorkoutProgress(user.id, planId, today);

    if (progressError) {
      reportError(progressError, "Error loading workout progress.");
      return;
    }
    const { data: setLogsData, error: setLogsError } =
      await fetchWorkoutSetLogs(user.id, planId);

    if (setLogsError) {
      reportError(setLogsError, "Error loading set logs.");
      return;
    }

    setSetLogs(setLogsData || []);

    setProgress(progressData || []);
  }

  async function createWorkoutFromTemplate(template) {
    if (!user?.id) return;

    const confirmCreate = confirm(
      `Create "${template.title}" with ${template.exercises.length} exercises?`,
    );

    if (!confirmCreate) return;

    setCreatingTemplate(true);

    const { data: planData, error: planError } =
      await createWorkoutPlanRecord({
        user_id: user.id,
        title: template.title,
        description: template.description,
        is_active: true,
        day_focuses: template.focuses,
      });

    if (planError) {
      reportError(planError, "Error creating workout template.");
      setCreatingTemplate(false);
      return;
    }

    const exercisesToInsert = template.exercises.map((exercise, index) => ({
      workout_plan_id: planData.id,
      user_id: user.id,
      workout_day: exercise.workout_day,
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      load: exercise.load,
      sort_order: index + 1,
    }));

    const { data: exercisesData, error: exercisesError } =
      await createWorkoutExercises(exercisesToInsert);

    if (exercisesError) {
      reportError(exercisesError, "Workout created, but exercises could not be added.");
      setCreatingTemplate(false);
      return;
    }

    const createdExercises = exercisesData || [];

    setPlans((prev) => [planData, ...prev]);
    setActivePlan(planData);
    setDayFocuses(template.focuses);
    setExercises(createdExercises);
    setProgress([]);
    setWorkoutLogs([]);
    setSetLogs([]);
    setExpandedSetLoggerId(null);
    setSetLogForms({});
    setSelectedWorkoutDay(getCurrentWorkoutDay(createdExercises, []));

    setShowTemplates(false);
    setShowCreatePlan(false);
    setShowPlanTools(false);
    setShowFocusEditor(false);
    setShowAddExercise(false);

    toast.success(`${template.title} created!`);

    setCreatingTemplate(false);
  }

  async function createWorkoutPlan() {
    if (!newPlan.title.trim()) {
      toast.error("Enter a workout name.");
      return;
    }

    setCreatingPlan(true);

    const { data, error } = await createWorkoutPlanRecord({
      user_id: user.id,
      title: newPlan.title.trim(),
      description: newPlan.description.trim(),
      is_active: true,
      day_focuses: {},
    });

    if (error) {
      reportError(error, "Error creating workout.");
      setCreatingPlan(false);
      return;
    }

    setNewPlan({
      title: "",
      description: "",
    });

    setPlans((prev) => [data, ...prev]);
    setActivePlan(data);
    setDayFocuses({});
    setExercises([]);
    setProgress([]);
    setWorkoutLogs([]);
    setSetLogs([]);
    setExpandedSetLoggerId(null);
    setSetLogForms({});
    setSelectedWorkoutDay("Treino A");
    setShowCreatePlan(false);
    setShowPlanTools(true);

    toast.success("Workout created!");

    setCreatingPlan(false);
  }

  async function selectPlan(plan) {
    setActivePlan(plan);
    setDayFocuses(getPlanFocuses(plan));
    setEditingPlan(null);
    setEditingExercise(null);
    setExpandedSetLoggerId(null);
    setSetLogForms({});
    setShowCreatePlan(false);

    await loadPlanDetails(plan.id);
  }

  function startEditPlan(plan) {
    setEditingPlan(plan);
    setShowPlanTools(true);

    setEditPlanData({
      title: plan.title || "",
      description: plan.description || "",
    });
  }

  function cancelEditPlan() {
    setEditingPlan(null);

    setEditPlanData({
      title: "",
      description: "",
    });
  }

  async function updateWorkoutPlan() {
    if (!editingPlan) return;

    if (!editPlanData.title.trim()) {
      toast.error("Enter a workout name.");
      return;
    }

    setUpdatingPlan(true);

    const { data, error } = await updateWorkoutPlanRecord(
      editingPlan.id,
      user.id,
      {
        title: editPlanData.title.trim(),
        description: editPlanData.description.trim(),
      },
    );

    if (error) {
      reportError(error, "Error updating workout plan.");
      setUpdatingPlan(false);
      return;
    }

    setPlans((prev) =>
      prev.map((plan) => (plan.id === editingPlan.id ? data : plan)),
    );

    if (activePlan?.id === editingPlan.id) {
      setActivePlan(data);
      setDayFocuses(getPlanFocuses(data));
    }

    cancelEditPlan();

    toast.success("Workout plan updated!");

    setUpdatingPlan(false);
  }

  async function updateDayFocuses() {
    if (!activePlan) return;

    setUpdatingFocuses(true);

    const cleanedFocuses = Object.fromEntries(
      Object.entries(dayFocuses).map(([day, focus]) => [day, focus.trim()]),
    );

    const { data, error } = await updateWorkoutPlanRecord(
      activePlan.id,
      user.id,
      {
        day_focuses: cleanedFocuses,
      },
    );

    if (error) {
      reportError(error, "Error saving workout focuses.");
      setUpdatingFocuses(false);
      return;
    }

    setActivePlan(data);
    setDayFocuses(getPlanFocuses(data));

    setPlans((prev) => prev.map((plan) => (plan.id === data.id ? data : plan)));

    toast.success("Workout focuses saved!");

    setUpdatingFocuses(false);
  }

  async function archiveWorkoutPlan(planId) {
    const confirmArchive = confirm(
      "Archive this workout plan? It will leave your active plans, but your workout history and records will stay saved.",
    );

    if (!confirmArchive) return;

    setDeletingPlan(true);

    const { error } = await archiveWorkoutPlanRecord(planId, user.id);

    if (error) {
      reportError(error, "Error archiving workout plan.");
      setDeletingPlan(false);
      return;
    }

    const updatedPlans = plans.filter((plan) => plan.id !== planId);

    setPlans(updatedPlans);

    if (editingPlan?.id === planId) {
      cancelEditPlan();
    }

    if (activePlan?.id === planId) {
      const nextPlan = updatedPlans[0] || null;

      setActivePlan(nextPlan);
      setDayFocuses(getPlanFocuses(nextPlan));

      if (nextPlan) {
        await loadPlanDetails(nextPlan.id);
      } else {
        setExercises([]);
        setProgress([]);
        setWorkoutLogs([]);
        setSetLogs([]);
        setExpandedSetLoggerId(null);
        setSetLogForms({});
        setShowCreatePlan(true);
      }
    }

    setSelectedWorkoutDay("Treino A");

    toast.success("Workout plan archived.");

    setDeletingPlan(false);
  }

  async function addExercise() {
    if (!activePlan) {
      toast.error("Create or select a workout first.");
      return;
    }

    if (!newExercise.name.trim()) {
      toast.error("Enter an exercise name.");
      return;
    }

    setAddingExercise(true);

    const { data, error } = await createWorkoutExercise({
      workout_plan_id: activePlan.id,
      user_id: user.id,
      workout_day: newExercise.workout_day,
      name: newExercise.name.trim(),
      sets: newExercise.sets.trim(),
      reps: newExercise.reps.trim(),
      load: newExercise.load.trim(),
      sort_order: exercises.length + 1,
    });

    if (error) {
      reportError(error, "Error adding exercise.");
      setAddingExercise(false);
      return;
    }

    const updatedExercises = [...exercises, data];

    setExercises(updatedExercises);

    setNewExercise({
      workout_day: newExercise.workout_day,
      name: "",
      sets: "",
      reps: "",
      load: "",
    });

    const currentDay = getCurrentWorkoutDay(updatedExercises, workoutLogs);
    setSelectedWorkoutDay(currentDay);

    toast.success("Exercise added!");

    setAddingExercise(false);
  }

  function startEditExercise(exercise) {
    setEditingExercise(exercise);
    setShowPlanTools(true);

    setEditExerciseData({
      workout_day: exercise.workout_day || "Treino A",
      name: exercise.name || "",
      sets: exercise.sets || "",
      reps: exercise.reps || "",
      load: exercise.load || "",
    });
  }

  function cancelEditExercise() {
    setEditingExercise(null);

    setEditExerciseData({
      workout_day: "Treino A",
      name: "",
      sets: "",
      reps: "",
      load: "",
    });
  }

  async function updateExercise() {
    if (!editingExercise) return;

    if (!editExerciseData.name.trim()) {
      toast.error("Enter an exercise name.");
      return;
    }

    setUpdatingExercise(true);

    const { data, error } = await updateWorkoutExercise(
      editingExercise.id,
      user.id,
      {
        workout_day: editExerciseData.workout_day,
        name: editExerciseData.name.trim(),
        sets: editExerciseData.sets.trim(),
        reps: editExerciseData.reps.trim(),
        load: editExerciseData.load.trim(),
      },
    );

    if (error) {
      reportError(error, "Error updating exercise.");
      setUpdatingExercise(false);
      return;
    }

    const updatedExercises = exercises.map((exercise) =>
      exercise.id === editingExercise.id ? data : exercise,
    );

    setExercises(updatedExercises);

    const currentDay = getCurrentWorkoutDay(updatedExercises, workoutLogs);
    setSelectedWorkoutDay(currentDay);

    cancelEditExercise();

    toast.success("Exercise updated!");

    setUpdatingExercise(false);
  }

  async function deleteExercise(exerciseId) {
    const confirmDelete = confirm("Delete this exercise?");

    if (!confirmDelete) return;

    const { error } = await deleteWorkoutExercise(exerciseId, user.id);

    if (error) {
      reportError(error, "Error deleting exercise.");
      return;
    }

    const updatedExercises = exercises.filter((item) => item.id !== exerciseId);

    setExercises(updatedExercises);
    setProgress((prev) =>
      prev.filter((item) => item.exercise_id !== exerciseId),
    );
    setSetLogs((prev) => prev.filter((item) => item.exercise_id !== exerciseId));
    setSetLogForms((prev) => {
      const nextForms = { ...prev };
      delete nextForms[exerciseId];
      return nextForms;
    });

    if (expandedSetLoggerId === exerciseId) {
      setExpandedSetLoggerId(null);
    }

    if (editingExercise?.id === exerciseId) {
      cancelEditExercise();
    }

    const currentDay = getCurrentWorkoutDay(updatedExercises, workoutLogs);
    setSelectedWorkoutDay(currentDay);

    toast.success("Exercise deleted.");
  }

  function isExerciseCompleted(exerciseId) {
    return progress.some(
      (item) => item.exercise_id === exerciseId && item.completed,
    );
  }

  const todayCompletedLog = useMemo(() => {
    return getTodayCompletedLog(workoutLogs);
  }, [workoutLogs]);

  const workoutAlreadyCompletedToday = Boolean(todayCompletedLog);

  const currentWorkoutDay = useMemo(() => {
    return getCurrentWorkoutDay(exercises, workoutLogs);
  }, [exercises, workoutLogs]);

  const completedWorkoutDayToday = todayCompletedLog?.workout_day || null;

  const displayWorkoutDay =
    workoutAlreadyCompletedToday && completedWorkoutDayToday
      ? completedWorkoutDayToday
      : currentWorkoutDay;

  useEffect(() => {
    if (completedWorkoutDayToday) {
      setSelectedWorkoutDay(completedWorkoutDayToday);
    }
  }, [todayCompletedLog?.id, completedWorkoutDayToday]);

  const nextWorkoutDay = useMemo(() => {
  return getNextWorkoutDayAfter(currentWorkoutDay, exercises);
}, [currentWorkoutDay, exercises]);

const recentWorkoutLogs = useMemo(() => {
  return workoutLogs.slice(0, 7);
}, [workoutLogs]);

const lastCompletedWorkoutLog = useMemo(() => {
  return (
    workoutLogs.find((log) => {
      const logStatus = log.status || "completed";

      return log.workout_date !== today && logStatus === "completed";
    }) || null
  );
}, [workoutLogs, today]);

const lastCompletedWorkoutDay = lastCompletedWorkoutLog?.workout_day || null;

const displayNextWorkoutDay = useMemo(() => {
  return getNextWorkoutDayAfter(currentWorkoutDay, exercises);
}, [currentWorkoutDay, exercises]);

const workoutTimerStorageKey = useMemo(() => {
  if (!user?.id || !activePlan?.id || !currentWorkoutDay) {
    return "";
  }

  return `gymfocus-workout-timer:${user.id}:${activePlan.id}:${today}:${currentWorkoutDay}`;
}, [user?.id, activePlan?.id, today, currentWorkoutDay]);

  const workoutTimerRunning =
    Boolean(workoutStartedAt) && !workoutAlreadyCompletedToday;

  useEffect(() => {
    if (!workoutTimerStorageKey || workoutAlreadyCompletedToday) {
      setWorkoutStartedAt(null);
      setElapsedWorkoutSeconds(0);

      if (workoutTimerStorageKey) {
        localStorage.removeItem(workoutTimerStorageKey);
      }

      return;
    }

    const storedStartedAt = Number(localStorage.getItem(workoutTimerStorageKey));

    if (Number.isFinite(storedStartedAt) && storedStartedAt > 0) {
      setWorkoutStartedAt(storedStartedAt);
      setElapsedWorkoutSeconds(
        Math.max(0, Math.floor((Date.now() - storedStartedAt) / 1000)),
      );
      return;
    }

    setWorkoutStartedAt(null);
    setElapsedWorkoutSeconds(0);
  }, [workoutTimerStorageKey, workoutAlreadyCompletedToday]);

  useEffect(() => {
    if (!workoutTimerRunning) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setElapsedWorkoutSeconds(
        Math.max(0, Math.floor((Date.now() - workoutStartedAt) / 1000)),
      );
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [workoutTimerRunning, workoutStartedAt]);

  function startWorkoutTimer() {
    if (!workoutTimerStorageKey || workoutAlreadyCompletedToday) {
      return;
    }

    if (workoutStartedAt) {
      return;
    }

    const startedAt = Date.now();

    localStorage.setItem(workoutTimerStorageKey, String(startedAt));
    setWorkoutStartedAt(startedAt);
    setElapsedWorkoutSeconds(0);
  }

  function clearWorkoutTimer() {
    if (workoutTimerStorageKey) {
      localStorage.removeItem(workoutTimerStorageKey);
    }

    setWorkoutStartedAt(null);
    setElapsedWorkoutSeconds(0);
  }

  async function toggleExercise(exercise) {
    if (!activePlan) return;

    if (workoutAlreadyCompletedToday) {
      toast.error("Today's workout is already completed.");
      return;
    }

    const exerciseDay = exercise.workout_day || "Treino A";

    if (exerciseDay !== currentWorkoutDay) {
      toast.error(`Hoje é dia de ${getDayLabel(currentWorkoutDay)}.`);
      return;
    }

    startWorkoutTimer();

    const existingProgress = progress.find(
      (item) => item.exercise_id === exercise.id,
    );

    if (existingProgress) {
      const newCompletedStatus = !existingProgress.completed;

      const { data, error } = await updateWorkoutProgress(
        existingProgress.id,
        {
          completed: newCompletedStatus,
          completed_at: newCompletedStatus ? new Date().toISOString() : null,
        },
      );

      if (error) {
        reportError(error, "Error updating progress.");
        return;
      }

      setProgress((prev) =>
        prev.map((item) => (item.id === existingProgress.id ? data : item)),
      );

      return;
    }

    const { data, error } = await createWorkoutProgress({
      user_id: user.id,
      workout_plan_id: activePlan.id,
      exercise_id: exercise.id,
      workout_date: today,
      completed: true,
      completed_at: new Date().toISOString(),
    });

    if (error) {
      reportError(error, "Error marking exercise.");
      return;
    }

    setProgress((prev) => [...prev, data]);
  }

  const currentWorkoutExercises = useMemo(() => {
    return exercises.filter(
      (exercise) => (exercise.workout_day || "Treino A") === currentWorkoutDay,
    );
  }, [exercises, currentWorkoutDay]);

  const displayWorkoutExercises = useMemo(() => {
    return exercises.filter(
      (exercise) => (exercise.workout_day || "Treino A") === displayWorkoutDay,
    );
  }, [exercises, displayWorkoutDay]);

  const filteredExercises = useMemo(() => {
    if (selectedWorkoutDay === "Todos") {
      return exercises;
    }

    return exercises.filter(
      (exercise) => (exercise.workout_day || "Treino A") === selectedWorkoutDay,
    );
  }, [exercises, selectedWorkoutDay]);

  const groupedExercises = useMemo(() => {
    return filteredExercises.reduce((groups, exercise) => {
      const day = exercise.workout_day || "Treino A";

      if (!groups[day]) {
        groups[day] = [];
      }

      groups[day].push(exercise);

      return groups;
    }, {});
  }, [filteredExercises]);

  const availableWorkoutDays = useMemo(() => {
    const daysFromExercises = exercises.map(
      (exercise) => exercise.workout_day || "Treino A",
    );

    return workoutFilterOptions.filter((day) => {
      if (day === "Todos") return true;

      return daysFromExercises.includes(day);
    });
  }, [exercises]);

  const visibleCompletedCount = useMemo(() => {
    return filteredExercises.filter((exercise) =>
      isExerciseCompleted(exercise.id),
    ).length;
  }, [filteredExercises, progress]);

  const todayCompletedCount = useMemo(() => {
    return currentWorkoutExercises.filter((exercise) =>
      isExerciseCompleted(exercise.id),
    ).length;
  }, [currentWorkoutExercises, progress]);

  const displayWorkoutCompletedCount = useMemo(() => {
    return displayWorkoutExercises.filter((exercise) =>
      isExerciseCompleted(exercise.id),
    ).length;
  }, [displayWorkoutExercises, progress]);

  const visibleTotalExercises = filteredExercises.length;
  const todayTotalExercises = currentWorkoutExercises.length;
  const displayWorkoutTotalExercises = displayWorkoutExercises.length;

  const todayWorkoutCompleted =
    todayTotalExercises > 0 && todayCompletedCount === todayTotalExercises;

  const visibleProgressPercent =
    visibleTotalExercises > 0
      ? Math.round((visibleCompletedCount / visibleTotalExercises) * 100)
      : 0;

  const displayWorkoutProgressPercent =
    displayWorkoutTotalExercises > 0
      ? Math.round(
          (displayWorkoutCompletedCount / displayWorkoutTotalExercises) * 100,
        )
      : 0;

  async function finishWorkout() {
    if (!activePlan) return;

    if (workoutAlreadyCompletedToday) {
      toast.error("Today's workout is already completed.");
      return;
    }

    if (todayTotalExercises === 0) {
      toast.error(`No exercises found for ${getDayLabel(currentWorkoutDay)}.`);
      return;
    }

    if (!todayWorkoutCompleted) {
      toast.error(
        `Complete all exercises from ${getDayLabel(currentWorkoutDay)} first.`,
      );
      return;
    }

    setFinishingWorkout(true);

    const { data: existingWorkout } = await findCompletedWorkoutLog(
      user.id,
      activePlan.id,
      today,
    );

    if (existingWorkout) {
      toast.error("Today's workout is already completed.");
      setFinishingWorkout(false);
      return;
    }

    const finishedAt = new Date();
    const startedAtDate = workoutStartedAt
      ? new Date(workoutStartedAt)
      : finishedAt;
    const durationSeconds = workoutStartedAt
      ? Math.max(1, Math.floor((finishedAt.getTime() - workoutStartedAt) / 1000))
      : elapsedWorkoutSeconds;
    const workoutLogPayload = {
      user_id: user.id,
      workout_plan_id: activePlan.id,
      workout_day: currentWorkoutDay,
      workout_date: today,
      status: "completed",
      started_at: startedAtDate.toISOString(),
      completed_at: finishedAt.toISOString(),
      duration_seconds: durationSeconds,
    };

    const { data: insertedLog, error: workoutError } =
      await createCompletedWorkoutLogWithDuration(workoutLogPayload);

    if (workoutError) {
      reportError(workoutError, "Error completing workout.");
      setFinishingWorkout(false);
      return;
    }

    setSelectedWorkoutDay(currentWorkoutDay);
    setWorkoutLogs((prev) => [insertedLog, ...prev]);

    const newXP = (profile?.xp || 0) + 100;
    const newStreak = (profile?.streak || 0) + 1;

    const { error: profileError } = await updateProfileStats(user.id, {
      xp: newXP,
      streak: newStreak,
    });

    if (profileError) {
      reportError(profileError, "Error updating profile.");
      setFinishingWorkout(false);
      return;
    }

    await logXP(user.id, 100, "workout");

    await unlockAchievement(user.id, "💪 First Workout");

    if (newStreak >= 7) {
      await unlockAchievement(user.id, "🔥 7 Day Streak");
    }

    if (newXP >= 1000) {
      await unlockAchievement(user.id, "🏆 1000 XP");
    }

    if (newXP >= 10000) {
      await unlockAchievement(user.id, "👑 10K XP");
    }

    onProfileUpdated?.({
      ...profile,
      xp: newXP,
      streak: newStreak,
    });

    toast.success(`${getDayLabel(currentWorkoutDay)} completed! +100 XP`);

    clearWorkoutTimer();
    setFinishingWorkout(false);
  }

  async function skipWorkout() {
    if (!activePlan) return;

    if (workoutAlreadyCompletedToday) {
      toast.error("Today's workout already has a record.");
      return;
    }

    const confirmSkip = confirm(
      `Skip ${getDayLabel(currentWorkoutDay)}? This will move your sequence to the next workout.`,
    );

    if (!confirmSkip) return;

    setFinishingWorkout(true);

    const { data: existingWorkout } = await findWorkoutLogByDay(
      user.id,
      activePlan.id,
      today,
      currentWorkoutDay,
    );

    if (existingWorkout) {
      toast.error("Today's workout already has a record.");
      setFinishingWorkout(false);
      return;
    }

    const { data: insertedLog, error } = await createWorkoutLog({
      user_id: user.id,
      workout_plan_id: activePlan.id,
      workout_day: currentWorkoutDay,
      workout_date: today,
      status: "skipped",
    });

    if (error) {
      reportError(error, "Error skipping workout.");
      setFinishingWorkout(false);
      return;
    }

    const nextDayAfterSkip = getNextWorkoutDayAfter(
      currentWorkoutDay,
      exercises,
    );

    setWorkoutLogs((prev) => [insertedLog, ...prev]);
    setSelectedWorkoutDay(nextDayAfterSkip);

    toast.success(
      `${getDayLabel(currentWorkoutDay)} skipped. Next: ${getDayLabel(
        nextDayAfterSkip,
      )}.`,
    );

    clearWorkoutTimer();
    setFinishingWorkout(false);
  }

  function getExerciseSetLogs(exerciseId) {
    return setLogs
      .filter((log) => log.exercise_id === exerciseId)
      .sort((a, b) => {
        const dateComparison = getWorkoutDateKey(b.workout_date).localeCompare(
          getWorkoutDateKey(a.workout_date),
        );

        if (dateComparison !== 0) {
          return dateComparison;
        }

        return a.set_number - b.set_number;
      });
  }

  function getTodayExerciseSetLogs(exerciseId) {
    return getExerciseSetLogs(exerciseId).filter(
      (log) => getWorkoutDateKey(log.workout_date) === today,
    );
  }

  function getPlannedSetsCount(exercise) {
    const parsedSets = Number.parseInt(exercise.sets, 10);

    if (Number.isNaN(parsedSets) || parsedSets <= 0) {
      return 3;
    }

    return parsedSets;
  }

  function createInitialSetRows(exercise) {
    const existingLogs = getTodayExerciseSetLogs(exercise.id);

    if (existingLogs.length > 0) {
      return existingLogs.map((log) => ({
        set_number: log.set_number,
        load: log.load ?? "",
        reps: log.reps ?? "",
      }));
    }

    const setsCount = getPlannedSetsCount(exercise);

    return Array.from({ length: setsCount }, (_, index) => ({
      set_number: index + 1,
      load: "",
      reps: "",
    }));
  }

  function openSetLogger(exercise) {
    setExpandedSetLoggerId((currentId) =>
      currentId === exercise.id ? null : exercise.id,
    );

    setSetLogForms((prev) => {
      if (prev[exercise.id]) {
        return prev;
      }

      return {
        ...prev,
        [exercise.id]: {
          difficulty: "moderate",
          notes: "",
          sets: createInitialSetRows(exercise),
        },
      };
    });
  }

  function updateSetRow(exerciseId, index, field, value) {
    setSetLogForms((prev) => {
      const currentForm = prev[exerciseId];

      if (!currentForm) {
        return prev;
      }

      const updatedSets = currentForm.sets.map((setRow, rowIndex) => {
        if (rowIndex !== index) {
          return setRow;
        }

        return {
          ...setRow,
          [field]: value,
        };
      });

      return {
        ...prev,
        [exerciseId]: {
          ...currentForm,
          sets: updatedSets,
        },
      };
    });
  }

  function updateSetFormField(exerciseId, field, value) {
    setSetLogForms((prev) => {
      const currentForm = prev[exerciseId];

      if (!currentForm) {
        return prev;
      }

      return {
        ...prev,
        [exerciseId]: {
          ...currentForm,
          [field]: value,
        },
      };
    });
  }

  function addSetRow(exerciseId) {
    setSetLogForms((prev) => {
      const currentForm = prev[exerciseId];

      if (!currentForm) {
        return prev;
      }

      const nextSetNumber = currentForm.sets.length + 1;

      return {
        ...prev,
        [exerciseId]: {
          ...currentForm,
          sets: [
            ...currentForm.sets,
            {
              set_number: nextSetNumber,
              load: "",
              reps: "",
            },
          ],
        },
      };
    });
  }

  function removeSetRow(exerciseId, index) {
    setSetLogForms((prev) => {
      const currentForm = prev[exerciseId];

      if (!currentForm || currentForm.sets.length <= 1) {
        return prev;
      }

      const updatedSets = currentForm.sets
        .filter((_, rowIndex) => rowIndex !== index)
        .map((setRow, rowIndex) => ({
          ...setRow,
          set_number: rowIndex + 1,
        }));

      return {
        ...prev,
        [exerciseId]: {
          ...currentForm,
          sets: updatedSets,
        },
      };
    });
  }

  async function markExerciseCompletedAfterSetLog(exercise) {
    const existingProgress = progress.find(
      (item) => item.exercise_id === exercise.id,
    );

    if (existingProgress) {
      if (existingProgress.completed) {
        return;
      }

      const { data, error } = await updateWorkoutProgress(
        existingProgress.id,
        {
          completed: true,
          completed_at: new Date().toISOString(),
        },
      );

      if (error) {
        reportError(error);
        return;
      }

      setProgress((prev) =>
        prev.map((item) => (item.id === existingProgress.id ? data : item)),
      );

      return;
    }

    const { data, error } = await createWorkoutProgress({
      user_id: user.id,
      workout_plan_id: activePlan.id,
      exercise_id: exercise.id,
      workout_date: today,
      completed: true,
      completed_at: new Date().toISOString(),
    });

    if (error) {
      reportError(error);
      return;
    }

    setProgress((prev) => [...prev, data]);
  }

  async function saveExerciseSetLogs(exercise) {
    if (!activePlan) return;

    if (workoutAlreadyCompletedToday) {
      toast.error("Today's workout is already completed.");
      return;
    }

    const exerciseDay = exercise.workout_day || "Treino A";

    if (exerciseDay !== currentWorkoutDay) {
      toast.error(`Hoje é dia de ${getDayLabel(currentWorkoutDay)}.`);
      return;
    }

    startWorkoutTimer();

    const form = setLogForms[exercise.id];

    if (!form) {
      toast.error("Open the set logger first.");
      return;
    }

    const validSets = form.sets
      .map((setRow, index) => ({
        user_id: user.id,
        workout_plan_id: activePlan.id,
        exercise_id: exercise.id,
        workout_date: today,
        set_number: index + 1,
        reps: setRow.reps === "" ? null : Number(setRow.reps),
        load: setRow.load === "" ? null : Number(setRow.load),
        difficulty: form.difficulty,
        notes: form.notes?.trim() || null,
      }))
      .filter((setRow) => setRow.reps !== null || setRow.load !== null);

    if (validSets.length === 0) {
      toast.error("Enter at least one load or reps value.");
      return;
    }

    const hasInvalidNumbers = validSets.some((setRow) => {
      const hasInvalidReps =
        setRow.reps !== null &&
        (!Number.isFinite(setRow.reps) || setRow.reps < 0);
      const hasInvalidLoad =
        setRow.load !== null &&
        (!Number.isFinite(setRow.load) || setRow.load < 0);

      return hasInvalidReps || hasInvalidLoad;
    });

    if (hasInvalidNumbers) {
      toast.error("Use valid positive numbers for load and reps.");
      return;
    }

    setSavingSetLogs(true);

    const { error: deleteError } = await deleteWorkoutSetLogsForExerciseDate({
      exerciseId: exercise.id,
      userId: user.id,
      workoutDate: today,
      workoutPlanId: activePlan.id,
    });

    if (deleteError) {
      reportError(deleteError, "Error updating set logs.");
      setSavingSetLogs(false);
      return;
    }

    const { data, error } = await createWorkoutSetLogs(validSets);

    if (error) {
      reportError(error, "Error saving set logs.");
      setSavingSetLogs(false);
      return;
    }

    const savedLogs = (data || []).sort(
      (a, b) => a.set_number - b.set_number,
    );

    setSetLogs((prev) => {
      const withoutCurrentExercise = prev.filter(
        (log) =>
          !(
            log.exercise_id === exercise.id &&
            log.workout_date === today &&
            log.workout_plan_id === activePlan.id
          ),
      );

      return [...withoutCurrentExercise, ...savedLogs];
    });

    setSetLogForms((prev) => ({
      ...prev,
      [exercise.id]: {
        ...form,
        sets: savedLogs.map((log) => ({
          set_number: log.set_number,
          load: log.load ?? "",
          reps: log.reps ?? "",
        })),
      },
    }));

    await markExerciseCompletedAfterSetLog(exercise);

    toast.success("Exercise performance saved!");

    setSavingSetLogs(false);
  }

  if (loading) {
    return (
      <div
        className="
          bg-white
          border
          border-zinc-200
          rounded-2xl
          sm:rounded-3xl
          p-5
          sm:p-8
          shadow-sm

          dark:bg-white/5
          dark:border-white/10
        "
      >
        <div className="h-8 w-52 bg-zinc-200 dark:bg-white/10 rounded-xl animate-pulse mb-6" />
        <div className="h-48 bg-zinc-100 dark:bg-white/5 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 40,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="
        w-full
        bg-white
        text-zinc-950
        border
        border-zinc-200
        rounded-2xl
        sm:rounded-3xl
        p-4
        sm:p-6
        md:p-8
        shadow-sm
        transition-colors
        min-w-0

        dark:bg-white/5
        dark:text-white
        dark:border-white/10
        dark:backdrop-blur-xl
      "
    >
      <WorkoutHeader
        activePlan={activePlan}
        displayWorkoutDay={displayWorkoutDay}
        getDayLabel={getDayLabel}
        setShowCreatePlan={setShowCreatePlan}
        setShowTemplates={setShowTemplates}
        showCreatePlan={showCreatePlan}
        showTemplates={showTemplates}
        workoutAlreadyCompletedToday={workoutAlreadyCompletedToday}
      />

      {showTemplates && (
        <WorkoutTemplatesPanel
          creatingTemplate={creatingTemplate}
          onCreateTemplate={createWorkoutFromTemplate}
          templates={workoutTemplates}
        />
      )}

      <CreateWorkoutPlanForm
        createWorkoutPlan={createWorkoutPlan}
        creatingPlan={creatingPlan}
        newPlan={newPlan}
        setNewPlan={setNewPlan}
        showCreatePlan={showCreatePlan}
      />
      {/* PLANS */}
      {plans.length > 0 && (
        <div
          className="
            bg-zinc-50
            border
            border-zinc-200
            rounded-2xl
            p-4
            sm:p-5
            mb-6

            dark:bg-black/30
            dark:border-white/10
          "
        >
          <div
            className="
              flex
              flex-col
              sm:flex-row
              sm:items-center
              sm:justify-between
              gap-3
              mb-4
            "
          >
            <div>
              <h3 className="font-black text-lg sm:text-xl">
                Your workout plans
              </h3>

              <p className="text-zinc-500 text-sm mt-1">
                Select the plan you want to follow.
              </p>
            </div>

            <button
              onClick={() => setShowPlanTools((prev) => !prev)}
              className="
                w-full
                sm:w-auto
                px-4
                py-2
                rounded-xl
                bg-white
                border
                border-zinc-200
                text-zinc-700
                font-bold
                flex
                items-center
                justify-center
                gap-2
                hover:border-purple-500
                transition

                dark:bg-black/30
                dark:border-white/10
                dark:text-zinc-300
              "
            >
              <Settings2 size={17} />
              Manage
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`
                  shrink-0
                  flex
                  items-center
                  gap-2
                  rounded-2xl
                  border
                  px-3
                  py-2
                  transition

                  ${
                    activePlan?.id === plan.id
                      ? "bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white border-transparent"
                      : "bg-white border-zinc-200 text-zinc-700 hover:border-purple-500 dark:bg-black/30 dark:border-white/10 dark:text-zinc-300"
                  }
                `}
              >
                <button
                  onClick={() => selectPlan(plan)}
                  className="font-bold text-sm px-2 py-1 max-w-[190px] truncate"
                  title={plan.title}
                >
                  {plan.title}
                </button>

                {showPlanTools && (
                  <>
                    <button
                      onClick={() => startEditPlan(plan)}
                      className="
                        w-8
                        h-8
                        rounded-xl
                        flex
                        items-center
                        justify-center
                        hover:bg-white/20
                        transition
                      "
                      title="Edit workout plan"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => archiveWorkoutPlan(plan.id)}
                      disabled={deletingPlan}
                      className="
                        w-8
                        h-8
                        rounded-xl
                        flex
                        items-center
                        justify-center
                        hover:bg-red-500/20
                        hover:text-red-300
                        transition
                        disabled:opacity-50
                      "
                      title="Archive workout plan"
                    >
                      <Archive size={16} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDIT PLAN */}
      {editingPlan && (
        <div
          className="
            bg-zinc-50
            border
            border-zinc-200
            rounded-2xl
            p-4
            sm:p-5
            mb-6

            dark:bg-black/30
            dark:border-white/10
          "
        >
          <h3 className="font-black text-lg sm:text-xl mb-4">
            Edit workout plan
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-3">
            <input
              type="text"
              placeholder="Workout name"
              value={editPlanData.title}
              onChange={(e) =>
                setEditPlanData((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              className="WorkoutInput"
            />

            <input
              type="text"
              placeholder="Description"
              value={editPlanData.description}
              onChange={(e) =>
                setEditPlanData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="WorkoutInput"
            />

            <button
              onClick={updateWorkoutPlan}
              disabled={updatingPlan}
              className="
                w-full
                md:w-auto
                px-5
                py-3
                rounded-2xl
                bg-green-600
                text-white
                font-bold
                flex
                items-center
                justify-center
                gap-2
                disabled:opacity-50
              "
            >
              {updatingPlan ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Save size={18} />
              )}
              Save
            </button>

            <button
              onClick={cancelEditPlan}
              className="
                w-full
                md:w-auto
                px-5
                py-3
                rounded-2xl
                bg-zinc-200
                text-zinc-700
                font-bold
                flex
                items-center
                justify-center
                gap-2
                hover:bg-zinc-300
                transition

                dark:bg-white/10
                dark:text-white
                dark:hover:bg-white/20
              "
            >
              <X size={18} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {!activePlan && (
        <div
          className="
            bg-zinc-50
            border
            border-zinc-200
            rounded-2xl
            p-8
            text-center
            text-zinc-500

            dark:bg-black/30
            dark:border-white/10
          "
        >
          Nenhum treino criado ainda. Clique em <strong>New workout</strong>{" "}
          para começar ou use um <strong>Template</strong>.
        </div>
      )}

      {activePlan && (
        <>
          <CurrentWorkoutCard
            activePlan={activePlan}
            displayNextWorkoutDay={displayNextWorkoutDay}
            displayWorkoutCompletedCount={displayWorkoutCompletedCount}
            displayWorkoutDay={displayWorkoutDay}
            displayWorkoutProgressPercent={displayWorkoutProgressPercent}
            displayWorkoutTotalExercises={displayWorkoutTotalExercises}
            elapsedWorkoutSeconds={elapsedWorkoutSeconds}
            formatWorkoutDate={formatWorkoutDate}
            formatWorkoutDuration={formatWorkoutDuration}
            getDayLabel={getDayLabel}
            lastCompletedWorkoutDay={lastCompletedWorkoutDay}
            lastCompletedWorkoutLog={lastCompletedWorkoutLog}
            startWorkoutTimer={startWorkoutTimer}
            todayCompletedLog={todayCompletedLog}
            todayTotalExercises={todayTotalExercises}
            workoutAlreadyCompletedToday={workoutAlreadyCompletedToday}
            workoutTimerRunning={workoutTimerRunning}
          />

          <WorkoutQuickTools
            displayWorkoutDay={displayWorkoutDay}
            finishingWorkout={finishingWorkout}
            setSelectedWorkoutDay={setSelectedWorkoutDay}
            setShowAddExercise={setShowAddExercise}
            setShowFocusEditor={setShowFocusEditor}
            showAddExercise={showAddExercise}
            showFocusEditor={showFocusEditor}
            skipWorkout={skipWorkout}
            workoutAlreadyCompletedToday={workoutAlreadyCompletedToday}
          />

          {/* DAY FOCUSES */}
          {showFocusEditor && (
            <div
              className="
                bg-zinc-50
                border
                border-zinc-200
                rounded-2xl
                p-4
                sm:p-5
                mb-6

                dark:bg-black/30
                dark:border-white/10
              "
            >
              <div
                className="
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  gap-4
                  mb-4
                "
              >
                <div>
                  <h3 className="font-black text-lg sm:text-xl">
                    Workout focuses
                  </h3>

                  <p className="text-zinc-500 text-sm mt-1">
                    Define o foco principal de cada treino.
                  </p>
                </div>

                <button
                  onClick={updateDayFocuses}
                  disabled={updatingFocuses}
                  className="
                    w-full
                    sm:w-auto
                    px-5
                    py-3
                    rounded-2xl
                    bg-gradient-to-r
                    from-purple-500
                    to-fuchsia-500
                    text-white
                    font-bold
                    flex
                    items-center
                    justify-center
                    gap-2
                    disabled:opacity-50
                  "
                >
                  {updatingFocuses ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  Save focuses
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {workoutDayOptions.map((day) => (
                  <div key={day}>
                    <label className="block text-sm font-bold text-zinc-600 dark:text-zinc-300 mb-2">
                      {day}
                    </label>

                    <input
                      type="text"
                      placeholder={
                        day === "Treino A"
                          ? "Ex: Peito e Tríceps"
                          : day === "Treino B"
                            ? "Ex: Costas e Bíceps"
                            : day === "Treino C"
                              ? "Ex: Pernas e Abdômen"
                              : "Ex: Ombros, Cardio..."
                      }
                      value={dayFocuses?.[day] || ""}
                      onChange={(e) =>
                        setDayFocuses((prev) => ({
                          ...prev,
                          [day]: e.target.value,
                        }))
                      }
                      className="WorkoutInput"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ADD EXERCISE */}
          {showAddExercise && (
            <div
              className="
                bg-zinc-50
                border
                border-zinc-200
                rounded-2xl
                p-4
                sm:p-5
                mb-6

                dark:bg-black/30
                dark:border-white/10
              "
            >
              <h3 className="font-black text-lg sm:text-xl mb-4">
                Add exercise
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[.9fr_1.4fr_.7fr_.7fr_.7fr_auto] gap-3">
                <select
                  value={newExercise.workout_day}
                  onChange={(e) =>
                    setNewExercise((prev) => ({
                      ...prev,
                      workout_day: e.target.value,
                    }))
                  }
                  className="WorkoutInput"
                >
                  {workoutDayOptions.map((day) => (
                    <option key={day} value={day}>
                      {getDayLabel(day)}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Exercise name"
                  value={newExercise.name}
                  onChange={(e) =>
                    setNewExercise((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="WorkoutInput"
                />

                <input
                  type="text"
                  placeholder="Sets"
                  value={newExercise.sets}
                  onChange={(e) =>
                    setNewExercise((prev) => ({
                      ...prev,
                      sets: e.target.value,
                    }))
                  }
                  className="WorkoutInput"
                />

                <input
                  type="text"
                  placeholder="Reps"
                  value={newExercise.reps}
                  onChange={(e) =>
                    setNewExercise((prev) => ({
                      ...prev,
                      reps: e.target.value,
                    }))
                  }
                  className="WorkoutInput"
                />

                <input
                  type="text"
                  placeholder="Load"
                  value={newExercise.load}
                  onChange={(e) =>
                    setNewExercise((prev) => ({
                      ...prev,
                      load: e.target.value,
                    }))
                  }
                  className="WorkoutInput"
                />

                <button
                  onClick={addExercise}
                  disabled={addingExercise}
                  className="
                    w-full
                    lg:w-auto
                    px-5
                    py-3
                    rounded-2xl
                    bg-zinc-950
                    text-white
                    font-bold
                    flex
                    items-center
                    justify-center
                    gap-2
                    disabled:opacity-50

                    dark:bg-white
                    dark:text-black
                  "
                >
                  {addingExercise ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Plus size={18} />
                  )}
                  Add
                </button>
              </div>
            </div>
          )}

          {/* FILTER */}
          {exercises.length > 0 && (
            <div
              className="
                bg-zinc-50
                border
                border-zinc-200
                rounded-2xl
                p-4
                sm:p-5
                mb-6

                dark:bg-black/30
                dark:border-white/10
              "
            >
              <div
                className="
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  gap-4
                  mb-4
                "
              >
                <div>
                  <h3 className="font-black text-lg sm:text-xl">Checklist</h3>

                  <p className="text-zinc-500 text-sm mt-1">
                    Showing {visibleCompletedCount}/{visibleTotalExercises}{" "}
                    completed
                    {selectedWorkoutDay !== "Todos"
                      ? ` in ${getDayLabel(selectedWorkoutDay)}`
                      : " in all workouts"}
                  </p>
                </div>

                <div
                  className="
                    px-3
                    py-1
                    rounded-full
                    bg-purple-500/10
                    border
                    border-purple-500/20
                    text-purple-500
                    text-xs
                    font-bold
                    w-fit
                  "
                >
                  {visibleProgressPercent}% visible progress
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {availableWorkoutDays.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedWorkoutDay(day)}
                    className={`
                      shrink-0
                      px-4
                      py-2
                      rounded-xl
                      border
                      text-sm
                      font-bold
                      transition

                      ${
                        selectedWorkoutDay === day
                          ? "bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white border-transparent"
                          : "bg-white border-zinc-200 text-zinc-600 hover:border-purple-500 dark:bg-black/30 dark:border-white/10 dark:text-zinc-300"
                      }
                    `}
                  >
                    {day === "Todos" ? "Todos" : getDayLabel(day)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* EDIT EXERCISE */}
          {editingExercise && (
            <div
              className="
                bg-zinc-50
                border
                border-zinc-200
                rounded-2xl
                p-4
                sm:p-5
                mb-6

                dark:bg-black/30
                dark:border-white/10
              "
            >
              <h3 className="font-black text-lg sm:text-xl mb-4">
                Edit exercise
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[.9fr_1.4fr_.7fr_.7fr_.7fr_auto_auto] gap-3">
                <select
                  value={editExerciseData.workout_day}
                  onChange={(e) =>
                    setEditExerciseData((prev) => ({
                      ...prev,
                      workout_day: e.target.value,
                    }))
                  }
                  className="WorkoutInput"
                >
                  {workoutDayOptions.map((day) => (
                    <option key={day} value={day}>
                      {getDayLabel(day)}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Exercise name"
                  value={editExerciseData.name}
                  onChange={(e) =>
                    setEditExerciseData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="WorkoutInput"
                />

                <input
                  type="text"
                  placeholder="Sets"
                  value={editExerciseData.sets}
                  onChange={(e) =>
                    setEditExerciseData((prev) => ({
                      ...prev,
                      sets: e.target.value,
                    }))
                  }
                  className="WorkoutInput"
                />

                <input
                  type="text"
                  placeholder="Reps"
                  value={editExerciseData.reps}
                  onChange={(e) =>
                    setEditExerciseData((prev) => ({
                      ...prev,
                      reps: e.target.value,
                    }))
                  }
                  className="WorkoutInput"
                />

                <input
                  type="text"
                  placeholder="Load"
                  value={editExerciseData.load}
                  onChange={(e) =>
                    setEditExerciseData((prev) => ({
                      ...prev,
                      load: e.target.value,
                    }))
                  }
                  className="WorkoutInput"
                />

                <button
                  onClick={updateExercise}
                  disabled={updatingExercise}
                  className="
                    w-full
                    lg:w-auto
                    px-5
                    py-3
                    rounded-2xl
                    bg-green-600
                    text-white
                    font-bold
                    flex
                    items-center
                    justify-center
                    gap-2
                    disabled:opacity-50
                  "
                >
                  {updatingExercise ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  Save
                </button>

                <button
                  onClick={cancelEditExercise}
                  className="
                    w-full
                    lg:w-auto
                    px-5
                    py-3
                    rounded-2xl
                    bg-zinc-200
                    text-zinc-700
                    font-bold
                    flex
                    items-center
                    justify-center
                    gap-2
                    hover:bg-zinc-300
                    transition

                    dark:bg-white/10
                    dark:text-white
                    dark:hover:bg-white/20
                  "
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* EXERCISES */}
          <div className="space-y-5 sm:space-y-6">
            {exercises.length === 0 && (
              <div
                className="
                  bg-zinc-50
                  border
                  border-zinc-200
                  rounded-2xl
                  p-8
                  text-center
                  text-zinc-500

                  dark:bg-black/30
                  dark:border-white/10
                "
              >
                No exercises yet. Use <strong>Add exercise</strong> to create
                your first checkpoint.
              </div>
            )}

            {exercises.length > 0 && visibleTotalExercises === 0 && (
              <div
                className="
                  bg-zinc-50
                  border
                  border-zinc-200
                  rounded-2xl
                  p-8
                  text-center
                  text-zinc-500

                  dark:bg-black/30
                  dark:border-white/10
                "
              >
                No exercises found for this filter.
              </div>
            )}

            {Object.entries(groupedExercises).map(([day, dayExercises]) => (
              <div
                key={day}
                className={`
                  bg-zinc-50
                  border
                  rounded-2xl
                  p-4
                  sm:p-5

                  ${
                    day === currentWorkoutDay && !workoutAlreadyCompletedToday
                      ? "border-purple-500/40 ring-2 ring-purple-500/20"
                      : "border-zinc-200 dark:border-white/10"
                  }

                  dark:bg-black/20
                `}
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-lg sm:text-xl">
                        {getDayLabel(day)}
                      </h3>

                      {day === currentWorkoutDay &&
                        !workoutAlreadyCompletedToday && (
                          <span
                            className="
                            px-3
                            py-1
                            rounded-full
                            bg-purple-500
                            text-white
                            text-[11px]
                            font-bold
                          "
                          >
                            Current
                          </span>
                        )}

                      {todayCompletedLog?.workout_day === day && (
                        <span
                          className="
                            px-3
                            py-1
                            rounded-full
                            bg-green-500
                            text-white
                            text-[11px]
                            font-bold
                          "
                        >
                          Completed today
                        </span>
                      )}
                    </div>

                    <p className="text-zinc-500 text-sm mt-1">
                      {dayExercises.length} exercise
                      {dayExercises.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <div
                    className="
                      px-3
                      py-1
                      rounded-full
                      bg-purple-500/10
                      border
                      border-purple-500/20
                      text-purple-500
                      text-xs
                      font-bold
                    "
                  >
                    {
                      dayExercises.filter((exercise) =>
                        isExerciseCompleted(exercise.id),
                      ).length
                    }
                    /{dayExercises.length}
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {dayExercises.map((exercise) => {
                    const completed = isExerciseCompleted(exercise.id);
                    const isEditingCurrentExercise =
                      editingExercise?.id === exercise.id;
                    const exerciseWorkoutDay =
                      exercise.workout_day || "Treino A";
                    const isCurrentExercise =
                      exerciseWorkoutDay === currentWorkoutDay;
                    const isDisplayWorkoutExercise =
                      exerciseWorkoutDay === displayWorkoutDay;

                    return (
                      <div key={exercise.id} className="space-y-3">
                        <motion.div
                        initial={{
                          opacity: 0,
                          y: 12,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        className={`
                          flex
                          items-center
                          justify-between
                          gap-4
                          rounded-2xl
                          border
                          p-4
                          sm:p-5
                          transition

                          ${
                            completed
                              ? "bg-green-500/10 border-green-500/30"
                              : "bg-white border-zinc-200 dark:bg-black/30 dark:border-white/10"
                          }

                          ${
                            isEditingCurrentExercise
                              ? "ring-2 ring-purple-500/60"
                              : ""
                          }

                          ${
                            (!isCurrentExercise &&
                              !workoutAlreadyCompletedToday) ||
                            (workoutAlreadyCompletedToday &&
                              !isDisplayWorkoutExercise)
                              ? "opacity-70"
                              : ""
                          }
                        `}
                      >
                        <div
                          className="
    flex
    items-center
    gap-4
    flex-1
    min-w-0
    text-left
  "
                        >
                          <button
                            type="button"
                            onClick={() => toggleExercise(exercise)}
                            className={`
    w-11
    h-11
    rounded-2xl
    flex
    items-center
    justify-center
    shrink-0

                              ${
                                completed
                                  ? "bg-green-500 text-white"
                                  : isCurrentExercise &&
                                      !workoutAlreadyCompletedToday
                                    ? "bg-zinc-200 text-zinc-500 dark:bg-zinc-800"
                                    : "bg-zinc-100 text-zinc-400 dark:bg-white/5"
                              }
                            `}
                          >
                            {completed ? (
                              <CheckCircle size={22} />
                            ) : (
                              <Circle size={22} />
                            )}
                          </button>

                          <div className="min-w-0">
                            <h4
                              className={`
                                font-black
                                text-base
                                sm:text-lg
                                break-words

                                ${completed ? "line-through opacity-70" : ""}
                              `}
                            >
                              {exercise.name}
                            </h4>

                            <p className="text-zinc-500 text-sm mt-1">
                              {exercise.sets || "-"} sets •{" "}
                              {exercise.reps || "-"} reps
                              {exercise.load ? ` • ${exercise.load}` : ""}
                            </p>
                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openSetLogger(exercise);
                                }}
                                disabled={
                                  !isCurrentExercise ||
                                  workoutAlreadyCompletedToday
                                }
                                className="
      px-3
      py-2
      rounded-xl
      bg-purple-500/10
      text-purple-500
      border
      border-purple-500/20
      text-xs
      font-bold
      hover:bg-purple-500/20
      disabled:opacity-40
      disabled:hover:bg-purple-500/10
      transition
    "
                              >
                                {expandedSetLoggerId === exercise.id
                                  ? "Close log"
                                  : "Log sets"}
                              </button>

                              {getTodayExerciseSetLogs(exercise.id).length >
                                0 && (
                                <span className="text-xs text-green-500 font-bold">
                                  {getTodayExerciseSetLogs(exercise.id).length}{" "}
                                  sets logged
                                </span>
                              )}
                            </div>

                            {!isCurrentExercise &&
                              !workoutAlreadyCompletedToday && (
                              <p className="text-xs text-zinc-400 mt-1">
                                Not current in sequence
                              </p>
                            )}

                            {workoutAlreadyCompletedToday &&
                              isDisplayWorkoutExercise && (
                                <p className="text-xs text-green-500 mt-1">
                                  This workout was completed today
                                </p>
                              )}
                          </div>
                        </div>

                        {showPlanTools && (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => startEditExercise(exercise)}
                              className="
                                w-10
                                h-10
                                rounded-xl
                                flex
                                items-center
                                justify-center
                                text-zinc-500
                                hover:text-purple-500
                                hover:bg-purple-500/10
                                transition
                                shrink-0
                              "
                              title="Edit exercise"
                            >
                              <Pencil size={18} />
                            </button>

                            <button
                              onClick={() => deleteExercise(exercise.id)}
                              className="
                                w-10
                                h-10
                                rounded-xl
                                flex
                                items-center
                                justify-center
                                text-zinc-500
                                hover:text-red-500
                                hover:bg-red-500/10
                                transition
                                shrink-0
                              "
                              title="Delete exercise"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}
                        </motion.div>

                        {expandedSetLoggerId === exercise.id && (
                          <div
                            className="
                          mt-3
                          rounded-2xl
                          border
                          border-purple-500/20
                          bg-purple-500/5
                          p-4
                          sm:p-5

                          dark:bg-purple-500/10
                        "
                          >
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        <h4 className="font-black text-base sm:text-lg">
          Log performance
        </h4>

        <p className="text-zinc-500 text-sm mt-1">
          Register load and reps for this exercise today.
        </p>
      </div>

      <button
        type="button"
        onClick={() => addSetRow(exercise.id)}
        className="
          px-3
          py-2
          rounded-xl
          bg-white
          border
          border-zinc-200
          text-zinc-700
          font-bold
          text-xs
          hover:border-purple-500
          transition

          dark:bg-black/30
          dark:border-white/10
          dark:text-white
        "
      >
        + Set
      </button>
    </div>

    <div className="space-y-3">
      {(setLogForms[exercise.id]?.sets || []).map((setRow, index) => (
        <div
          key={`${exercise.id}-set-${index}`}
          className="
            grid
            grid-cols-[auto_1fr_1fr_auto]
            gap-2
            items-center
          "
        >
          <div
            className="
              w-10
              h-10
              rounded-xl
              bg-purple-500
              text-white
              font-black
              flex
              items-center
              justify-center
              text-sm
            "
          >
            {index + 1}
          </div>

          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            placeholder="Load"
            value={setRow.load}
            onChange={(event) =>
              updateSetRow(exercise.id, index, "load", event.target.value)
            }
            className="WorkoutInput"
          />

          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            placeholder="Reps"
            value={setRow.reps}
            onChange={(event) =>
              updateSetRow(exercise.id, index, "reps", event.target.value)
            }
            className="WorkoutInput"
          />

          <button
            type="button"
            onClick={() => removeSetRow(exercise.id, index)}
            className="
              w-10
              h-10
              rounded-xl
              bg-red-500/10
              text-red-500
              flex
              items-center
              justify-center
              hover:bg-red-500/20
              transition
            "
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
      <select
        value={setLogForms[exercise.id]?.difficulty || "moderate"}
        onChange={(event) =>
          updateSetFormField(exercise.id, "difficulty", event.target.value)
        }
        className="WorkoutInput"
      >
        <option value="light">Light</option>
        <option value="moderate">Moderate</option>
        <option value="heavy">Heavy</option>
        <option value="failure">Failure</option>
      </select>

      <input
        type="text"
        placeholder="Notes"
        value={setLogForms[exercise.id]?.notes || ""}
        onChange={(event) =>
          updateSetFormField(exercise.id, "notes", event.target.value)
        }
        className="WorkoutInput"
      />
    </div>

    {getTodayExerciseSetLogs(exercise.id).length > 0 && (
      <div
        className="
          mt-4
          rounded-2xl
          bg-white
          border
          border-zinc-200
          p-4

          dark:bg-black/30
          dark:border-white/10
        "
      >
        <p className="text-xs font-black text-zinc-500 uppercase tracking-wide mb-2">
          Saved today
        </p>

        <div className="flex flex-wrap gap-2">
          {getTodayExerciseSetLogs(exercise.id).map((log) => (
            <span
              key={log.id}
              className="
                px-3
                py-2
                rounded-xl
                bg-green-500/10
                text-green-500
                text-xs
                font-bold
              "
            >
              Set {log.set_number}: {log.load ?? "-"}kg x {log.reps ?? "-"}
            </span>
          ))}
        </div>
      </div>
    )}

    <button
      type="button"
      onClick={() => saveExerciseSetLogs(exercise)}
      disabled={savingSetLogs}
      className="
        w-full
        mt-4
        px-5
        py-3
        rounded-2xl
        bg-gradient-to-r
        from-purple-500
        to-fuchsia-500
        text-white
        font-bold
        flex
        items-center
        justify-center
        gap-2
        disabled:opacity-50
        hover:scale-[1.01]
        transition
      "
    >
      {savingSetLogs ? (
        <Loader2 className="animate-spin" size={18} />
      ) : (
        <Save size={18} />
      )}
      Save performance
    </button>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* RECENT WORKOUT HISTORY */}
          <div
            className="
              mt-6
              bg-zinc-50
              border
              border-zinc-200
              rounded-2xl
              p-4
              sm:p-5

              dark:bg-black/30
              dark:border-white/10
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                gap-4
                mb-4
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    w-11
                    h-11
                    rounded-2xl
                    bg-purple-500/10
                    text-purple-500
                    flex
                    items-center
                    justify-center
                    shrink-0
                  "
                >
                  <CalendarDays size={21} />
                </div>

                <div>
                  <h3 className="font-black text-lg sm:text-xl">
                    Recent workouts
                  </h3>

                  <p className="text-zinc-500 text-sm mt-1">
                    Last logs from this plan.
                  </p>
                </div>
              </div>

              <div
                className="
                  px-3
                  py-1
                  rounded-full
                  bg-purple-500/10
                  border
                  border-purple-500/20
                  text-purple-500
                  text-xs
                  font-bold
                  shrink-0
                "
              >
                {recentWorkoutLogs.length}
              </div>
            </div>

            {recentWorkoutLogs.length === 0 ? (
              <div
                className="
                  rounded-2xl
                  border
                  border-dashed
                  border-zinc-300
                  p-5
                  text-center
                  text-zinc-500
                  text-sm

                  dark:border-white/10
                "
              >
                No workout logs yet. Finish or skip a workout to build history.
              </div>
            ) : (
              <div className="space-y-3">
                {recentWorkoutLogs.map((log, index) => {
                  const logStatus = log.status || "completed";
                  const isSkipped = logStatus === "skipped";

                  return (
                    <div
                      key={
                        log.id ||
                        `${log.workout_date}-${log.workout_day}-${index}`
                      }
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        rounded-2xl
                        bg-white
                        border
                        border-zinc-200
                        p-4

                        dark:bg-black/30
                        dark:border-white/10
                      "
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-black break-words">
                            {getDayLabel(log.workout_day)}
                          </h4>

                          {log.workout_date === today && (
                            <span
                              className={`
                                px-2
                                py-1
                                rounded-full
                                text-white
                                text-[10px]
                                font-bold

                                ${isSkipped ? "bg-orange-500" : "bg-green-500"}
                              `}
                            >
                              Today
                            </span>
                          )}

                          <span
                            className={`
                              px-2
                              py-1
                              rounded-full
                              text-[10px]
                              font-bold

                              ${
                                isSkipped
                                  ? "bg-orange-500/10 text-orange-500"
                                  : "bg-green-500/10 text-green-500"
                              }
                            `}
                          >
                            {isSkipped ? "Skipped" : "Completed"}
                          </span>
                        </div>

                        <p className="text-zinc-500 text-sm mt-1">
                          {isSkipped ? "Skipped on" : "Completed on"}{" "}
                          {formatWorkoutDate(log.workout_date)}
                        </p>

                        {!isSkipped && Number(log.duration_seconds) > 0 && (
                          <p className="text-zinc-500 text-xs mt-1">
                            Duration:{" "}
                            {formatWorkoutDuration(log.duration_seconds)}
                          </p>
                        )}
                      </div>

                      <div
                        className={`
                          w-10
                          h-10
                          rounded-xl
                          flex
                          items-center
                          justify-center
                          shrink-0

                          ${
                            isSkipped
                              ? "bg-orange-500/10 text-orange-500"
                              : "bg-green-500/10 text-green-500"
                          }
                        `}
                      >
                        {isSkipped ? (
                          <X size={20} />
                        ) : (
                          <CheckCircle size={20} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* FINISH BUTTON */}
          <div
            className="
              mt-6
              bg-zinc-50
              border
              border-zinc-200
              rounded-2xl
              p-4
              sm:p-5
              flex
              flex-col
              sm:flex-row
              sm:items-center
              sm:justify-between
              gap-4

              dark:bg-black/30
              dark:border-white/10
            "
          >
            <div>
              <h3 className="font-black text-lg">
                {workoutAlreadyCompletedToday
                  ? "Workout completed today"
                  : `Finish ${getDayLabel(currentWorkoutDay)}`}
              </h3>

              <p className="text-zinc-500 text-sm mt-1">
                {workoutAlreadyCompletedToday
                  ? `Next workout in sequence: ${getDayLabel(nextWorkoutDay)}.`
                  : "Complete today's sequence workout to finish the day."}
              </p>
            </div>

            <button
              onClick={finishWorkout}
              disabled={
                !todayWorkoutCompleted ||
                finishingWorkout ||
                workoutAlreadyCompletedToday
              }
              className="
                w-full
                sm:w-auto
                px-6
                py-4
                rounded-2xl
                bg-gradient-to-r
                from-purple-500
                to-fuchsia-500
                text-white
                font-bold
                flex
                items-center
                justify-center
                gap-3
                disabled:opacity-40
                disabled:hover:scale-100
                hover:scale-105
                transition
              "
            >
              {finishingWorkout ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Trophy size={20} />
              )}
              {workoutAlreadyCompletedToday ? "Done Today" : "Complete Today"}
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}

export default WorkoutManager;
