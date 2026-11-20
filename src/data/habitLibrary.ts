export interface HabitLibraryItem {
  id: string;
  name: string;
  category: string;
  description: string;
  frequency: "daily" | "weekly";
  icon: string;
  color: string;
}

export const HABIT_LIBRARY_CATEGORIES = [
  "All",
  "Study & Learning",
  "Reading",
  "Health & Wellbeing",
  "Fitness & Movement",
  "Mindfulness & Reflection",
  "Personal Care",
  "Home & Organization",
  "Social & Family",
  "Creativity",
  "Digital Balance",
] as const;

export const STARTER_HABIT_LIBRARY: HabitLibraryItem[] = [
  // Study & Learning
  {
    id: "lib-study-1",
    name: "Review lecture notes",
    category: "Study & Learning",
    description: "Go over key concepts from today's lectures",
    frequency: "daily",
    icon: "GraduationCap",
    color: "#C2410C",
  },
  {
    id: "lib-study-2",
    name: "Study one topic",
    category: "Study & Learning",
    description: "Deep dive into a single academic or professional topic",
    frequency: "daily",
    icon: "GraduationCap",
    color: "#C2410C",
  },
  {
    id: "lib-study-3",
    name: "Solve practice questions",
    category: "Study & Learning",
    description: "Test understanding with practice exercises",
    frequency: "daily",
    icon: "GraduationCap",
    color: "#C2410C",
  },
  {
    id: "lib-study-4",
    name: "Review flashcards",
    category: "Study & Learning",
    description: "Spaced repetition practice for active recall",
    frequency: "daily",
    icon: "GraduationCap",
    color: "#C2410C",
  },
  {
    id: "lib-study-5",
    name: "Practice a programming concept",
    category: "Study & Learning",
    description: "Write code or solve an algorithm challenge",
    frequency: "daily",
    icon: "GraduationCap",
    color: "#C2410C",
  },
  {
    id: "lib-study-6",
    name: "Practice a language",
    category: "Study & Learning",
    description: "Spend 15 minutes speaking, reading, or listening",
    frequency: "daily",
    icon: "GraduationCap",
    color: "#C2410C",
  },

  // Reading
  {
    id: "lib-read-1",
    name: "Read a book",
    category: "Reading",
    description: "Spend 20-30 uninterrupted minutes reading",
    frequency: "daily",
    icon: "BookOpen",
    color: "#9A3412",
  },
  {
    id: "lib-read-2",
    name: "Read a few pages",
    category: "Reading",
    description: "Small bite-sized daily reading habit",
    frequency: "daily",
    icon: "BookOpen",
    color: "#9A3412",
  },
  {
    id: "lib-read-3",
    name: "Read before bed",
    category: "Reading",
    description: "Wind down peacefully away from blue light",
    frequency: "daily",
    icon: "BookOpen",
    color: "#9A3412",
  },
  {
    id: "lib-read-4",
    name: "Write a reading note",
    category: "Reading",
    description: "Summarize a key takeaway or interesting idea",
    frequency: "daily",
    icon: "BookOpen",
    color: "#9A3412",
  },

  // Health & Wellbeing
  {
    id: "lib-health-1",
    name: "Drink water regularly",
    category: "Health & Wellbeing",
    description: "Stay well-hydrated throughout the day",
    frequency: "daily",
    icon: "HeartPulse",
    color: "#16A34A",
  },
  {
    id: "lib-health-2",
    name: "Take a screen break",
    category: "Health & Wellbeing",
    description: "Look at distance and rest your eyes (20-20-20 rule)",
    frequency: "daily",
    icon: "HeartPulse",
    color: "#16A34A",
  },
  {
    id: "lib-health-3",
    name: "Get some fresh air",
    category: "Health & Wellbeing",
    description: "Step outside for natural sunlight and breeze",
    frequency: "daily",
    icon: "HeartPulse",
    color: "#16A34A",
  },
  {
    id: "lib-health-4",
    name: "Consistent sleep routine",
    category: "Health & Wellbeing",
    description: "Go to bed and wake up at consistent hours",
    frequency: "daily",
    icon: "HeartPulse",
    color: "#16A34A",
  },

  // Fitness & Movement
  {
    id: "lib-fit-1",
    name: "Go for a walk",
    category: "Fitness & Movement",
    description: "A refreshing 20-30 minute walk",
    frequency: "daily",
    icon: "Dumbbell",
    color: "#65A30D",
  },
  {
    id: "lib-fit-2",
    name: "Stretch gently",
    category: "Fitness & Movement",
    description: "Relieve tension in neck, shoulders, and lower back",
    frequency: "daily",
    icon: "Dumbbell",
    color: "#65A30D",
  },
  {
    id: "lib-fit-3",
    name: "Personal workout session",
    category: "Fitness & Movement",
    description: "Gym, calisthenics, running, or sport practice",
    frequency: "daily",
    icon: "Dumbbell",
    color: "#65A30D",
  },

  // Mindfulness & Reflection
  {
    id: "lib-mind-1",
    name: "Write a short journal entry",
    category: "Mindfulness & Reflection",
    description: "Jot down reflections on how the day went",
    frequency: "daily",
    icon: "Sparkles",
    color: "#7C3AED",
  },
  {
    id: "lib-mind-2",
    name: "Write down something I appreciate",
    category: "Mindfulness & Reflection",
    description: "Practice gratitude for life's small blessings",
    frequency: "daily",
    icon: "Sparkles",
    color: "#7C3AED",
  },
  {
    id: "lib-mind-3",
    name: "Plan tomorrow",
    category: "Mindfulness & Reflection",
    description: "Review upcoming schedule and top priorities for tomorrow",
    frequency: "daily",
    icon: "Sparkles",
    color: "#7C3AED",
  },

  // Personal Care & Home
  {
    id: "lib-home-1",
    name: "Tidy my desk",
    category: "Home & Organization",
    description: "Clear clutter for a fresh workspace tomorrow",
    frequency: "daily",
    icon: "House",
    color: "#475569",
  },
  {
    id: "lib-home-2",
    name: "Make my bed",
    category: "Home & Organization",
    description: "Start the morning with an easy accomplished task",
    frequency: "daily",
    icon: "House",
    color: "#475569",
  },

  // Social & Family
  {
    id: "lib-soc-1",
    name: "Check in with family",
    category: "Social & Family",
    description: "Call, message, or spend quality time with loved ones",
    frequency: "daily",
    icon: "Users",
    color: "#E11D48",
  },
  {
    id: "lib-soc-2",
    name: "Contact a friend",
    category: "Social & Family",
    description: "Reach out to catch up and stay connected",
    frequency: "weekly",
    icon: "Users",
    color: "#E11D48",
  },

  // Digital Balance
  {
    id: "lib-dig-1",
    name: "Take a break from notifications",
    category: "Digital Balance",
    description: "Mute non-essential alerts for peaceful focus",
    frequency: "daily",
    icon: "Sparkles",
    color: "#0D9488",
  },
  {
    id: "lib-dig-2",
    name: "Organize downloads & desktop",
    category: "Digital Balance",
    description: "File away or delete temporary downloads",
    frequency: "weekly",
    icon: "Folder",
    color: "#0D9488",
  },
];
