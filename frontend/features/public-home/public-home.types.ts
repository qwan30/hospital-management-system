export interface SiteLink {
  readonly label: string;
  readonly href: string;
}

export type QuickLinkIcon = "emergency" | "map" | "spark";
export type QuickLinkVariant = "critical" | "surface" | "inverse";
export type PlaceholderTone =
  | "hero"
  | "slate"
  | "pale"
  | "navy"
  | "ash"
  | "portrait"
  | "article"
  | "avatar";
export type OverlayTone = "light" | "dark";

export interface HeroContent {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly primaryCta: SiteLink;
  readonly secondaryCta: SiteLink;
  readonly imageSrc?: string;
  readonly imageAlt?: string;
}

export interface QuickLinkCard {
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly actionLabel: string;
  readonly icon: QuickLinkIcon;
  readonly variant: QuickLinkVariant;
}

export interface DepartmentCard {
  readonly title: string;
  readonly description: string;
  readonly tone: PlaceholderTone;
  readonly overlayTone: OverlayTone;
  readonly imageSrc?: string;
  readonly imageAlt?: string;
}

export interface TrustMetric {
  readonly value: string;
  readonly label: string;
}

export interface Testimonial {
  readonly quote: string;
  readonly name: string;
  readonly role: string;
  readonly imageSrc?: string;
  readonly imageAlt?: string;
}

export interface DoctorCard {
  readonly badge: string;
  readonly name: string;
  readonly specialty: string;
  readonly description: string;
  readonly href: string;
  readonly imageSrc?: string;
  readonly imageAlt?: string;
}

export interface NewsArticle {
  readonly category: string;
  readonly title: string;
  readonly summary: string;
  readonly href: string;
  readonly imageSrc?: string;
  readonly imageAlt?: string;
}

export interface PublicHomePageContent {
  readonly brandName: string;
  readonly skipLinkLabel: string;
  readonly navLinks: readonly SiteLink[];
  readonly searchPlaceholder: string;
  readonly emergencyLabel: string;
  readonly hero: HeroContent;
  readonly quickLinks: readonly QuickLinkCard[];
  readonly departments: {
    readonly eyebrow: string;
    readonly title: string;
    readonly cta: SiteLink;
    readonly cards: readonly DepartmentCard[];
  };
  readonly trust: {
    readonly title: string;
    readonly description: string;
    readonly metrics: readonly TrustMetric[];
    readonly testimonial: Testimonial;
  };
  readonly doctors: {
    readonly eyebrow: string;
    readonly title: string;
    readonly cards: readonly DoctorCard[];
  };
  readonly news: {
    readonly eyebrow: string;
    readonly title: string;
    readonly description: string;
    readonly cta: SiteLink;
    readonly articles: readonly NewsArticle[];
  };
  readonly footer: {
    readonly copyright: string;
    readonly links: readonly SiteLink[];
  };
}
