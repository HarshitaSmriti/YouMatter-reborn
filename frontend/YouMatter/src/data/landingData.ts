import {
  Activity,
  BookOpen,
  Brain,
  Heart,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Wind,
} from "lucide-react";

const landingData = {
  navbar: {
    logo: "YouMatter",

    buttonText: "About Us ",
    links: [
      { name: "Home", path: "#home" },
      { name: "Features", path: "#features" },
      { name: "How It Works", path: "#how-it-works" },
      { name: "About Us", path: "#about" },
      { name: "Contact", path: "#contact" },
    ],
  },

  hero: {
    badge: "AI-Powered Mental Wellness Companion",

    titleLine1: "You matter.",

    titleLine2: "We're here for",

    highlight: "you.",

    description:
      "YouMatter is an AI companion that listens, supports, and helps you build a healthier, happier mind when sadness feels heavy.",

    trustText:
      "Trusted by 10,000+ users for a better everyday",

    quickBenefits: [
      "AI Chat Support",
      "Mood Tracking",
      "Journaling",
      "Breathing Exercises",
    ],

    previewMessages: [
      {
        type: "bot",
        text: "Hey there! How are you feeling today?",
        time: "10:30 AM",
      },

      {
        type: "user",
        text: "A bit overwhelmed, but I'm doing my best.",
        time: "10:31 AM",
      },

      {
        type: "bot",
        text: "I hear you. Let's take it one step at a time. Would you like to try a breathing exercise together?",
        time: "10:32 AM",
      },
    ],
  },

  features: [
    {
      title: "AI Chat Support",

      description:
        "Talk to our AI companion anytime, anywhere. We're here to listen and help.",

      icon: MessageCircle,

      tone: "purple",
    },

    {
      title: "Mood Tracking",

      description:
        "Track your mood daily and gain insights to understand your emotions better.",

      icon: Heart,

      tone: "pink",
    },

    {
      title: "Journaling",

      description:
        "Write your thoughts, reflect on your day, and release what's on your mind.",

      icon: BookOpen,

      tone: "green",
    },

    {
      title: "Breathing Exercises",

      description:
        "Reduce stress and anxiety with guided breathing and relaxation exercises.",

      icon: Wind,

      tone: "blue",
    },

    {
      title: "Daily Motivation",

      description:
        "Get daily encouraging quotes and reminders that you matter.",

      icon: Star,

      tone: "amber",
    },
  ],

  steps: [
    {
      title: "Share how you feel",

      description:
        "Start with a simple check-in and say what's been sitting with you.",

      icon: Brain,
    },

    {
      title: "Get gentle support",

      description:
        "Receive calm, practical prompts for reflection, grounding, or rest.",

      icon: Sparkles,
    },

    {
      title: "Build healthier rhythms",

      description:
        "Use mood notes, journaling, and breathing tools to notice progress.",

      icon: Activity,
    },
  ],

  safeguards: [
    "Private journaling space",
    "Crisis support reminders",
    "Compassionate, non-judgmental tone",
  ],

  contact: {
    title: "Need a little support today?",

    description:
      "Start a conversation with YouMatter and take the next gentle step toward feeling understood.",

    icon: ShieldCheck,
  },
};

export default landingData;