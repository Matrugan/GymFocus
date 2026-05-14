import { useEffect, useMemo, useState } from "react";

import { supabase } from "../lib/supabase";

import {
  Dumbbell,
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
  Sparkles,
  ClipboardList,
} from "lucide-react";

import toast from "react-hot-toast";

import { motion } from "framer-motion";

import { unlockAchievement } from "../utils/achievementSystem";
import { logXP } from "../utils/xpSystem";

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

  function getOrderedWorkoutDaysFromExercises(exerciseList) {
    const daysFromExercises = exerciseList.map(
      (exercise) => exercise.workout_day || "Treino A",
    );

    const uniqueDays = [...new Set(daysFromExercises)];

    return workoutDayOptions.filter((day) => uniqueDays.includes(day));
  }

  function getNextWorkoutDayAfter(day, exerciseList) {
    const orderedDays = getOrderedWorkoutDaysFromExercises(exerciseList);

    if (orderedDays.length === 0) {
      return "Treino A";
    }

    const currentIndex = orderedDays.indexOf(day);

    if (currentIndex === -1) {
      return orderedDays[0];
    }

    const nextIndex = (currentIndex + 1) % orderedDays.length;

    return orderedDays[nextIndex];
  }

  function getNextWorkoutDayFromLogs(exerciseList, logs) {
    const orderedDays = getOrderedWorkoutDaysFromExercises(exerciseList);

    if (orderedDays.length === 0) {
      return "Treino A";
    }

    const validLogs = logs.filter((log) => {
      const logStatus = log.status || "completed";

      return (
        orderedDays.includes(log.workout_day) &&
        ["completed", "skipped"].includes(logStatus)
      );
    });

    if (validLogs.length === 0) {
      return orderedDays[0];
    }

    const lastSequenceLog = validLogs[0];
    const lastSequenceDay = lastSequenceLog.workout_day;

    return getNextWorkoutDayAfter(lastSequenceDay, exerciseList);
  }

  function getTodayCompletedLog(logs) {
    return (
      logs.find((log) => {
        const logStatus = log.status || "completed";

        return log.workout_date === today && logStatus === "completed";
      }) || null
    );
  }

  function getCurrentWorkoutDay(exerciseList, logs) {
    const todayCompletedLog = getTodayCompletedLog(logs);

    if (todayCompletedLog?.workout_day) {
      return todayCompletedLog.workout_day;
    }

    return getNextWorkoutDayFromLogs(exerciseList, logs);
  }

  async function getWorkoutData() {
    setLoading(true);

    const { data: plansData, error: plansError } = await supabase
      .from("workout_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (plansError) {
      console.log(plansError);
      toast.error("Error loading workout plans.");
      setLoading(false);
      return;
    }

    setPlans(plansData || []);

    const selectedPlan = plansData?.[0] || null;

    setActivePlan(selectedPlan);
    setDayFocuses(getPlanFocuses(selectedPlan));

    if (!selectedPlan) {
      setExercises([]);
      setProgress([]);
      setWorkoutLogs([]);
      setShowCreatePlan(true);
      setLoading(false);
      return;
    }

    await loadPlanDetails(selectedPlan.id);

    setLoading(false);
  }

  async function loadPlanDetails(planId) {
    const { data: exercisesData, error: exercisesError } = await supabase
      .from("workout_exercises")
      .select("*")
      .eq("user_id", user.id)
      .eq("workout_plan_id", planId)
      .order("workout_day", { ascending: true })
      .order("sort_order", { ascending: true });

    if (exercisesError) {
      console.log(exercisesError);
      toast.error("Error loading exercises.");
      return;
    }

    const loadedExercises = exercisesData || [];

    setExercises(loadedExercises);

    const { data: logsData, error: logsError } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("workout_plan_id", planId)
      .order("workout_date", { ascending: false });

    if (logsError) {
      console.log(logsError);
      toast.error("Error loading workout history.");
      return;
    }

    const loadedLogs = logsData || [];

    setWorkoutLogs(loadedLogs);

    const currentDay = getCurrentWorkoutDay(loadedExercises, loadedLogs);
    setSelectedWorkoutDay(currentDay);

    const { data: progressData, error: progressError } = await supabase
      .from("daily_workout_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("workout_plan_id", planId)
      .eq("workout_date", today);

    if (progressError) {
      console.log(progressError);
      toast.error("Error loading workout progress.");
      return;
    }

    setProgress(progressData || []);
  }

  async function createWorkoutFromTemplate(template) {
    if (!user?.id) return;

    const confirmCreate = confirm(
      `Create "${template.title}" with ${template.exercises.length} exercises?`,
    );

    if (!confirmCreate) return;

    setCreatingTemplate(true);

    const { data: planData, error: planError } = await supabase
      .from("workout_plans")
      .insert([
        {
          user_id: user.id,
          title: template.title,
          description: template.description,
          is_active: true,
          day_focuses: template.focuses,
        },
      ])
      .select()
      .single();

    if (planError) {
      console.log(planError);
      toast.error("Error creating workout template.");
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

    const { data: exercisesData, error: exercisesError } = await supabase
      .from("workout_exercises")
      .insert(exercisesToInsert)
      .select();

    if (exercisesError) {
      console.log(exercisesError);
      toast.error("Workout created, but exercises could not be added.");
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

    const { data, error } = await supabase
      .from("workout_plans")
      .insert([
        {
          user_id: user.id,
          title: newPlan.title.trim(),
          description: newPlan.description.trim(),
          is_active: true,
          day_focuses: {},
        },
      ])
      .select()
      .single();

    if (error) {
      console.log(error);
      toast.error("Error creating workout.");
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

    const { data, error } = await supabase
      .from("workout_plans")
      .update({
        title: editPlanData.title.trim(),
        description: editPlanData.description.trim(),
      })
      .eq("id", editingPlan.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.log(error);
      toast.error("Error updating workout plan.");
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

    const { data, error } = await supabase
      .from("workout_plans")
      .update({
        day_focuses: cleanedFocuses,
      })
      .eq("id", activePlan.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.log(error);
      toast.error("Error saving workout focuses.");
      setUpdatingFocuses(false);
      return;
    }

    setActivePlan(data);
    setDayFocuses(getPlanFocuses(data));

    setPlans((prev) => prev.map((plan) => (plan.id === data.id ? data : plan)));

    toast.success("Workout focuses saved!");

    setUpdatingFocuses(false);
  }

  async function deleteWorkoutPlan(planId) {
    const confirmDelete = confirm(
      "Delete this workout plan? This will also remove it from your active workouts.",
    );

    if (!confirmDelete) return;

    setDeletingPlan(true);

    const { error } = await supabase
      .from("workout_plans")
      .update({
        is_active: false,
      })
      .eq("id", planId)
      .eq("user_id", user.id);

    if (error) {
      console.log(error);
      toast.error("Error deleting workout plan.");
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
        setShowCreatePlan(true);
      }
    }

    setSelectedWorkoutDay("Treino A");

    toast.success("Workout plan deleted.");

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

    const { data, error } = await supabase
      .from("workout_exercises")
      .insert([
        {
          workout_plan_id: activePlan.id,
          user_id: user.id,
          workout_day: newExercise.workout_day,
          name: newExercise.name.trim(),
          sets: newExercise.sets.trim(),
          reps: newExercise.reps.trim(),
          load: newExercise.load.trim(),
          sort_order: exercises.length + 1,
        },
      ])
      .select()
      .single();

    if (error) {
      console.log(error);
      toast.error("Error adding exercise.");
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

    const { data, error } = await supabase
      .from("workout_exercises")
      .update({
        workout_day: editExerciseData.workout_day,
        name: editExerciseData.name.trim(),
        sets: editExerciseData.sets.trim(),
        reps: editExerciseData.reps.trim(),
        load: editExerciseData.load.trim(),
      })
      .eq("id", editingExercise.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.log(error);
      toast.error("Error updating exercise.");
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

    const { error } = await supabase
      .from("workout_exercises")
      .delete()
      .eq("id", exerciseId)
      .eq("user_id", user.id);

    if (error) {
      console.log(error);
      toast.error("Error deleting exercise.");
      return;
    }

    const updatedExercises = exercises.filter((item) => item.id !== exerciseId);

    setExercises(updatedExercises);
    setProgress((prev) =>
      prev.filter((item) => item.exercise_id !== exerciseId),
    );

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

  const nextWorkoutDay = useMemo(() => {
    if (!workoutAlreadyCompletedToday) {
      return currentWorkoutDay;
    }

    return getNextWorkoutDayAfter(currentWorkoutDay, exercises);
  }, [workoutAlreadyCompletedToday, currentWorkoutDay, exercises]);

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
    if (workoutAlreadyCompletedToday) {
      return nextWorkoutDay;
    }

    return getNextWorkoutDayAfter(currentWorkoutDay, exercises);
  }, [
    workoutAlreadyCompletedToday,
    nextWorkoutDay,
    currentWorkoutDay,
    exercises,
  ]);

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

    const existingProgress = progress.find(
      (item) => item.exercise_id === exercise.id,
    );

    if (existingProgress) {
      const newCompletedStatus = !existingProgress.completed;

      const { data, error } = await supabase
        .from("daily_workout_progress")
        .update({
          completed: newCompletedStatus,
          completed_at: newCompletedStatus ? new Date().toISOString() : null,
        })
        .eq("id", existingProgress.id)
        .select()
        .single();

      if (error) {
        console.log(error);
        toast.error("Error updating progress.");
        return;
      }

      setProgress((prev) =>
        prev.map((item) => (item.id === existingProgress.id ? data : item)),
      );

      return;
    }

    const { data, error } = await supabase
      .from("daily_workout_progress")
      .insert([
        {
          user_id: user.id,
          workout_plan_id: activePlan.id,
          exercise_id: exercise.id,
          workout_date: today,
          completed: true,
          completed_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.log(error);
      toast.error("Error marking exercise.");
      return;
    }

    setProgress((prev) => [...prev, data]);
  }

  const currentWorkoutExercises = useMemo(() => {
    return exercises.filter(
      (exercise) => (exercise.workout_day || "Treino A") === currentWorkoutDay,
    );
  }, [exercises, currentWorkoutDay]);

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

  const visibleTotalExercises = filteredExercises.length;
  const todayTotalExercises = currentWorkoutExercises.length;

  const todayWorkoutCompleted =
    todayTotalExercises > 0 && todayCompletedCount === todayTotalExercises;

  const visibleProgressPercent =
    visibleTotalExercises > 0
      ? Math.round((visibleCompletedCount / visibleTotalExercises) * 100)
      : 0;

  const todayProgressPercent =
    todayTotalExercises > 0
      ? Math.round((todayCompletedCount / todayTotalExercises) * 100)
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

    const { data: existingWorkout } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("workout_plan_id", activePlan.id)
      .eq("workout_date", today)
      .eq("status", "completed")
      .maybeSingle();

    if (existingWorkout) {
      toast.error("Today's workout is already completed.");
      setFinishingWorkout(false);
      return;
    }

    const { data: insertedLog, error: workoutError } = await supabase
      .from("workout_logs")
      .insert([
        {
          user_id: user.id,
          workout_plan_id: activePlan.id,
          workout_day: currentWorkoutDay,
          workout_date: today,
          status: "completed",
        },
      ])
      .select()
      .single();

    if (workoutError) {
      console.log(workoutError);
      toast.error("Error completing workout.");
      setFinishingWorkout(false);
      return;
    }

    setWorkoutLogs((prev) => [insertedLog, ...prev]);

    const newXP = (profile?.xp || 0) + 100;
    const newStreak = (profile?.streak || 0) + 1;

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        xp: newXP,
        streak: newStreak,
      })
      .eq("id", user.id);

    if (profileError) {
      console.log(profileError);
      toast.error("Error updating profile.");
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

    const { data: existingWorkout } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("workout_plan_id", activePlan.id)
      .eq("workout_date", today)
      .eq("workout_day", currentWorkoutDay)
      .maybeSingle();

    if (existingWorkout) {
      toast.error("Today's workout already has a record.");
      setFinishingWorkout(false);
      return;
    }

    const { data: insertedLog, error } = await supabase
      .from("workout_logs")
      .insert([
        {
          user_id: user.id,
          workout_plan_id: activePlan.id,
          workout_day: currentWorkoutDay,
          workout_date: today,
          status: "skipped",
        },
      ])
      .select()
      .single();

    if (error) {
      console.log(error);
      toast.error("Error skipping workout.");
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

    setFinishingWorkout(false);
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
      {/* HEADER */}
      <div
        className="
          flex
          items-start
          sm:items-center
          justify-between
          flex-col
          sm:flex-row
          gap-4
          mb-6
        "
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div
            className="
              w-12
              h-12
              sm:w-14
              sm:h-14
              rounded-2xl
              bg-gradient-to-r
              from-purple-500
              to-fuchsia-500
              text-white
              flex
              items-center
              justify-center
              shrink-0
            "
          >
            <Dumbbell size={24} />
          </div>

          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl font-black break-words">
              Workouts
            </h2>

            <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base mt-1">
              {activePlan
                ? workoutAlreadyCompletedToday
                  ? `Done today: ${getDayLabel(currentWorkoutDay)}.`
                  : `Continue with ${getDayLabel(currentWorkoutDay)}.`
                : "Create your first workout plan."}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowTemplates((prev) => !prev)}
            className="
              w-full
              sm:w-auto
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
              hover:scale-[1.02]
              transition

              dark:bg-white
              dark:text-black
            "
          >
            {showTemplates ? <X size={18} /> : <Sparkles size={18} />}
            {showTemplates ? "Close templates" : "Templates"}
          </button>

          <button
            onClick={() => setShowCreatePlan((prev) => !prev)}
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
              hover:scale-[1.02]
              transition
            "
          >
            {showCreatePlan ? <X size={18} /> : <Plus size={18} />}
            {showCreatePlan ? "Close" : "New workout"}
          </button>
        </div>
      </div>

      {/* WORKOUT TEMPLATES */}
      {showTemplates && (
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
          <div className="mb-5">
            <h3 className="font-black text-lg sm:text-xl">Workout templates</h3>

            <p className="text-zinc-500 text-sm mt-1">
              Choose a ready-made plan and customize it later.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {workoutTemplates.map((template) => (
              <div
                key={template.title}
                className="
                  bg-white
                  border
                  border-zinc-200
                  rounded-2xl
                  p-4
                  flex
                  flex-col
                  justify-between
                  gap-4

                  dark:bg-black/30
                  dark:border-white/10
                "
              >
                <div>
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
                      mb-4
                    "
                  >
                    <ClipboardList size={21} />
                  </div>

                  <h4 className="font-black text-lg">{template.title}</h4>

                  <p className="text-zinc-500 text-sm mt-2">
                    {template.description}
                  </p>

                  <div className="mt-4 space-y-2">
                    {Object.entries(template.focuses).map(([day, focus]) => (
                      <div
                        key={day}
                        className="
                          text-xs
                          px-3
                          py-2
                          rounded-xl
                          bg-zinc-100
                          text-zinc-600

                          dark:bg-white/5
                          dark:text-zinc-300
                        "
                      >
                        <strong>{day}</strong> - {focus}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-zinc-500 text-xs mb-3">
                    {template.exercises.length} exercises included
                  </p>

                  <button
                    onClick={() => createWorkoutFromTemplate(template)}
                    disabled={creatingTemplate}
                    className="
                      w-full
                      px-4
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
                      hover:scale-[1.02]
                      transition
                    "
                  >
                    {creatingTemplate ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Plus size={18} />
                    )}
                    Use template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE PLAN */}
      {showCreatePlan && (
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
            Create workout plan
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
            <input
              type="text"
              placeholder="Ex: Treino ABC - Hipertrofia"
              value={newPlan.title}
              onChange={(e) =>
                setNewPlan((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              className="WorkoutInput"
            />

            <input
              type="text"
              placeholder="Descrição opcional"
              value={newPlan.description}
              onChange={(e) =>
                setNewPlan((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="WorkoutInput"
            />

            <button
              onClick={createWorkoutPlan}
              disabled={creatingPlan}
              className="
                w-full
                md:w-auto
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
              {creatingPlan ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Plus size={18} />
              )}
              Create
            </button>
          </div>
        </div>
      )}

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
                      onClick={() => deleteWorkoutPlan(plan.id)}
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
                      title="Delete workout plan"
                    >
                      <Trash2 size={16} />
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
          {/* CURRENT WORKOUT CARD */}
          <div
            className="
              bg-gradient-to-r
              from-purple-600
              to-fuchsia-600
              rounded-2xl
              sm:rounded-3xl
              p-5
              sm:p-6
              text-white
              mb-6
            "
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-white/70 text-sm">
                  {workoutAlreadyCompletedToday
                    ? "Workout completed today"
                    : "Current workout"}
                </p>

                <h3 className="text-2xl sm:text-3xl font-black mt-1 break-words">
                  {getDayLabel(currentWorkoutDay)}
                </h3>

                <p className="text-white/80 mt-2 break-words">
                  {workoutAlreadyCompletedToday
                    ? "You already finished today's workout."
                    : `From plan: ${activePlan.title}`}
                </p>
              </div>

              <div
                className="
                  px-4
                  py-2
                  rounded-full
                  bg-white/15
                  border
                  border-white/20
                  text-white
                  font-bold
                  text-xs
                  sm:text-sm
                  shrink-0
                "
              >
                {workoutAlreadyCompletedToday
                  ? "Done"
                  : `${todayCompletedCount}/${todayTotalExercises}`}
              </div>
            </div>

            <div className="mt-5">
              <div className="flex justify-between text-sm mb-2">
                <span>Today's progress</span>
                <span>{todayProgressPercent}%</span>
              </div>

              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{
                    width: `${todayProgressPercent}%`,
                  }}
                />
              </div>
            </div>

            {/* WORKOUT SEQUENCE */}
            <div
              className="
                mt-5
                grid
                grid-cols-1
                sm:grid-cols-3
                gap-3
              "
            >
              <div
                className="
                  rounded-2xl
                  bg-white/10
                  border
                  border-white/15
                  p-4
                "
              >
                <p className="text-white/60 text-xs font-bold uppercase tracking-wide">
                  Last
                </p>

                <h4 className="font-black mt-2 break-words">
                  {lastCompletedWorkoutDay
                    ? getDayLabel(lastCompletedWorkoutDay)
                    : "No workout yet"}
                </h4>

                <p className="text-white/60 text-xs mt-2">
                  {lastCompletedWorkoutLog
                    ? formatWorkoutDate(lastCompletedWorkoutLog.workout_date)
                    : "Start your sequence"}
                </p>
              </div>

              <div
                className="
                  rounded-2xl
                  bg-white
                  text-purple-700
                  border
                  border-white
                  p-4
                  shadow-lg
                "
              >
                <p className="text-purple-500 text-xs font-black uppercase tracking-wide">
                  Current
                </p>

                <h4 className="font-black mt-2 break-words">
                  {getDayLabel(currentWorkoutDay)}
                </h4>

                <p className="text-purple-500 text-xs mt-2">
                  {workoutAlreadyCompletedToday
                    ? "Completed today"
                    : "Do this workout now"}
                </p>
              </div>

              <div
                className="
                  rounded-2xl
                  bg-white/10
                  border
                  border-white/15
                  p-4
                "
              >
                <p className="text-white/60 text-xs font-bold uppercase tracking-wide">
                  Next
                </p>

                <h4 className="font-black mt-2 break-words">
                  {getDayLabel(displayNextWorkoutDay)}
                </h4>

                <p className="text-white/60 text-xs mt-2">
                  After current workout
                </p>
              </div>
            </div>
          </div>

          {/* QUICK TOOLS */}
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-4
              gap-3
              mb-6
            "
          >
            <button
              onClick={skipWorkout}
              disabled={workoutAlreadyCompletedToday || finishingWorkout}
              className="
                px-4
                py-3
                rounded-2xl
                bg-orange-500/10
                border
                border-orange-500/20
                text-orange-500
                font-bold
                flex
                items-center
                justify-center
                gap-2
                hover:bg-orange-500/20
                disabled:opacity-40
                disabled:hover:bg-orange-500/10
                transition
              "
            >
              <X size={18} />
              Skip workout
            </button>

            <button
              onClick={() => setShowFocusEditor((prev) => !prev)}
              className="
                px-4
                py-3
                rounded-2xl
                bg-zinc-50
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
              {showFocusEditor ? <X size={18} /> : <Pencil size={18} />}
              Workout focuses
            </button>

            <button
              onClick={() => setShowAddExercise((prev) => !prev)}
              className="
                px-4
                py-3
                rounded-2xl
                bg-zinc-50
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
              {showAddExercise ? <X size={18} /> : <Plus size={18} />}
              Add exercise
            </button>

            <button
              onClick={() => setSelectedWorkoutDay(currentWorkoutDay)}
              className="
                px-4
                py-3
                rounded-2xl
                bg-zinc-950
                text-white
                font-bold
                flex
                items-center
                justify-center
                gap-2
                hover:scale-[1.02]
                transition

                dark:bg-white
                dark:text-black
              "
            >
              <Dumbbell size={18} />
              Today's checklist
            </button>
          </div>

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
                    const isCurrentExercise =
                      (exercise.workout_day || "Treino A") ===
                      currentWorkoutDay;

                    return (
                      <motion.div
                        key={exercise.id}
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
                            !isCurrentExercise || workoutAlreadyCompletedToday
                              ? "opacity-70"
                              : ""
                          }
                        `}
                      >
                        <button
                          onClick={() => toggleExercise(exercise)}
                          className="
                            flex
                            items-center
                            gap-4
                            flex-1
                            min-w-0
                            text-left
                          "
                        >
                          <div
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
                          </div>

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

                            {!isCurrentExercise && (
                              <p className="text-xs text-zinc-400 mt-1">
                                Not current in sequence
                              </p>
                            )}

                            {workoutAlreadyCompletedToday &&
                              isCurrentExercise && (
                                <p className="text-xs text-green-500 mt-1">
                                  This workout was completed today
                                </p>
                              )}
                          </div>
                        </button>

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
