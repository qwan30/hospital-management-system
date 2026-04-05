import type { PublicHomePageContent } from "./public-home.types";

export const defaultPublicHomePageContent: PublicHomePageContent = {
  brandName: "Clinical Atelier",
  skipLinkLabel: "Skip to main content",
  navLinks: [
    { label: "Home", href: "#home" },
    { label: "Departments", href: "#departments" },
    { label: "Doctors", href: "#doctors" },
    { label: "Services", href: "#services" }
  ],
  searchPlaceholder: "Search doctors or conditions...",
  emergencyLabel: "Emergency",
  hero: {
    eyebrow: "Established 1924 • Center of Excellence",
    title: "A Sanctuary of\nClinical Precision",
    description:
      "Where advanced medical science meets a restorative human experience. We provide surgical precision wrapped in the comfort of world-class hospitality.",
    primaryCta: {
      label: "Book Appointment",
      href: "/booking"
    },
    secondaryCta: {
      label: "Search Doctors",
      href: "#doctors"
    },
    imageSrc: "/images/clinical-atelier/hero-interior.jpg",
    imageAlt: "Clinical Atelier care interior"
  },
  quickLinks: [
    {
      title: "Emergency",
      description: "24/7 Trauma Response Team. Call now for immediate assistance.",
      href: "tel:+15559112835",
      actionLabel: "+1 (555) 911-ATELIER",
      icon: "emergency",
      variant: "critical"
    },
    {
      title: "Find a Clinic",
      description: "Locate the nearest Clinical Atelier facility in your area.",
      href: "#footer",
      actionLabel: "View Map",
      icon: "map",
      variant: "surface"
    },
    {
      title: "Our Departments",
      description: "Explore our specialized centers of medical excellence.",
      href: "#departments",
      actionLabel: "Explore Specialized Care",
      icon: "spark",
      variant: "inverse"
    }
  ],
  departments: {
    eyebrow: "Clinical Specializations",
    title: "Centers of Excellence",
    cta: {
      label: "All Departments",
      href: "#departments"
    },
    cards: [
      {
        title: "Cardiology",
        description:
          "Precision diagnostics and minimally invasive cardiac interventions.",
        tone: "slate",
        overlayTone: "light",
        imageSrc: "/images/clinical-atelier/department-cardiology.jpg",
        imageAlt: "Cardiology team and care environment"
      },
      {
        title: "Pediatrics",
        description:
          "A sanctuary for our youngest patients, blending care with cutting-edge science.",
        tone: "pale",
        overlayTone: "dark",
        imageSrc: "/images/clinical-atelier/department-pediatrics.jpg",
        imageAlt: "Pediatrics waiting area"
      },
      {
        title: "Neurology",
        description: "Advanced neurological mapping and neuro-surgical precision.",
        tone: "navy",
        overlayTone: "light",
        imageSrc: "/images/clinical-atelier/department-neurology.jpg",
        imageAlt: "Neurology treatment setting"
      },
      {
        title: "Orthopedics",
        description:
          "Restoring mobility through innovative joint replacement and sports medicine.",
        tone: "ash",
        overlayTone: "light",
        imageSrc: "/images/clinical-atelier/department-orthopedics.jpg",
        imageAlt: "Orthopedics recovery and mobility"
      }
    ]
  },
  trust: {
    title: "Globally Recognized, Locally Trusted",
    description:
      "We are committed to the highest standards of medical care and clinical safety. Our institution is accredited by leading international health organizations.",
    metrics: [
      {
        value: "98%",
        label: "Patient Satisfaction"
      },
      {
        value: "JCI",
        label: "Accredited since 1998"
      }
    ],
    testimonial: {
      quote:
        "\"The level of precision in my treatment was matched only by the genuine warmth of the staff. Clinical Atelier isn't just a hospital; it's a sanctuary for healing.\"",
      name: "Elizabeth J. Thompson",
      role: "Cardiac Recovery Patient",
      imageSrc: "/images/clinical-atelier/testimonial-elizabeth.jpg",
      imageAlt: "Elizabeth J. Thompson"
    }
  },
  doctors: {
    eyebrow: "World-Class Expertise",
    title: "Our Leading Practitioners",
    cards: [
      {
        badge: "Chief Surgeon",
        name: "Dr. Sarah Chen",
        specialty: "Cardiovascular Specialist",
        description:
          "Pioneer in robotic cardiac surgery with over 15 years of precise clinical outcomes.",
        href: "/doctors/sarah-chen",
        imageSrc: "/images/clinical-atelier/doctor-sarah-chen.jpg",
        imageAlt: "Dr. Sarah Chen"
      },
      {
        badge: "Director",
        name: "Dr. Julian Vane",
        specialty: "Neuroscience Lead",
        description:
          "Specializing in cognitive restoration and advanced micro-neurosurgery.",
        href: "/doctors/julian-vane",
        imageSrc: "/images/clinical-atelier/doctor-julian-vane.jpg",
        imageAlt: "Dr. Julian Vane"
      },
      {
        badge: "Department Head",
        name: "Dr. Elena Rossi",
        specialty: "Pediatric Oncology",
        description:
          "Dedicated to gentle, effective therapies for our most precious patients.",
        href: "/doctors/elena-rossi",
        imageSrc: "/images/clinical-atelier/doctor-elena-rossi.jpg",
        imageAlt: "Dr. Elena Rossi"
      }
    ]
  },
  news: {
    eyebrow: "Medical Insights",
    title: "Latest from the Atelier\nJournal",
    description:
      "Stay informed about our latest clinical breakthroughs, health tips, and hospital announcements.",
    cta: {
      label: "Subscribe to Journal",
      href: "/journal"
    },
    articles: [
      {
        category: "Medical Breakthrough",
        title: "New non-invasive techniques in\ncardiac repair.",
        summary:
          "Our team successfully implements a new laser-based protocol for valvular repair...",
        href: "/journal/non-invasive-cardiac-repair",
        imageSrc: "/images/clinical-atelier/journal-cardiac-repair.jpg",
        imageAlt: "Clinical article about cardiac repair"
      },
      {
        category: "Hospital Update",
        title: "Unveiling our new wellness pavilion.",
        summary:
          "Designed by world-class architects to prioritize patient recovery and mental tranquility...",
        href: "/journal/wellness-pavilion",
        imageSrc: "/images/clinical-atelier/journal-wellness-pavilion.jpg",
        imageAlt: "New wellness pavilion"
      }
    ]
  },
  footer: {
    copyright: "© 2024 Precise Sanctuary Public Hospital. All Rights Reserved.",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Contact Us", href: "/contact" },
      { label: "Accessibility", href: "/accessibility" }
    ]
  }
};
