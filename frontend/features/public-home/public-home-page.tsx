import type {
  DepartmentCard,
  DoctorCard,
  NewsArticle,
  PlaceholderTone,
  PublicHomePageContent,
  QuickLinkCard,
  QuickLinkIcon,
  QuickLinkVariant,
  SiteLink
} from "./public-home.types";
import {
  ArrowRightGlyph,
  DepartmentGlyph,
  EmergencyGlyph,
  MapPinGlyph,
  PublicAction,
  PublicBrand,
  PublicEyebrow,
  PublicSectionHeading,
  PublicStat,
  SearchGlyph
} from "../public-ui/public-ui";
import styles from "./public-home-page.module.css";

type PublicHomePageProps = {
  readonly content: PublicHomePageContent;
};

const placeholderToneClassNames: Record<PlaceholderTone, string> = {
  hero: styles.placeholderHero,
  slate: styles.placeholderSlate,
  pale: styles.placeholderPale,
  navy: styles.placeholderNavy,
  ash: styles.placeholderAsh,
  portrait: styles.placeholderPortrait,
  article: styles.placeholderArticle,
  avatar: styles.placeholderAvatar
};

export function PublicHomePage({ content }: PublicHomePageProps) {
  return (
    <div className={styles.page}>
      <a href="#main-content" className="skip-link">
        {content.skipLinkLabel}
      </a>
      <div className={styles.frame}>
        <SiteHeader
          brandName={content.brandName}
          navLinks={content.navLinks}
          searchPlaceholder={content.searchPlaceholder}
          emergencyLabel={content.emergencyLabel}
        />
        <main id="main-content" className={styles.main}>
          <HeroSection content={content} />
          <QuickLinksSection cards={content.quickLinks} />
          <DepartmentsSection content={content} />
          <TrustSection content={content} />
          <DoctorsSection content={content} />
          <NewsSection content={content} />
        </main>
        <SiteFooter
          brandName={content.brandName}
          copyright={content.footer.copyright}
          links={content.footer.links}
        />
      </div>
    </div>
  );
}

function SiteHeader({
  brandName,
  navLinks,
  searchPlaceholder,
  emergencyLabel
}: {
  readonly brandName: string;
  readonly navLinks: readonly SiteLink[];
  readonly searchPlaceholder: string;
  readonly emergencyLabel: string;
}) {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.headerPrimary}>
          <a href="#home" aria-label={`${brandName} home`} className={styles.brandLink}>
            <PublicBrand
              label="Precise Sanctuary Care"
              mark="CA"
              name={brandName}
            />
          </a>
          <nav className={styles.nav} aria-label="Primary">
            {navLinks.map((link, index) => (
              <a
                key={link.label}
                aria-current={index === 0 ? "page" : undefined}
                className={cx(styles.navLink, index === 0 && styles.navLinkActive)}
                href={link.href}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className={styles.utilityCluster}>
          <form action="/doctors" className={styles.searchShell} role="search">
            <button
              type="submit"
              className={styles.searchButton}
              aria-label="Submit doctor search"
            >
              <SearchGlyph />
            </button>
            <input
              aria-label={searchPlaceholder}
              className={styles.searchInput}
              name="q"
              placeholder={searchPlaceholder}
              type="search"
            />
          </form>

          <PublicAction href="tel:+15559112835" tone="primary">
            {emergencyLabel}
          </PublicAction>
        </div>
      </div>
    </header>
  );
}

function HeroSection({ content }: { readonly content: PublicHomePageContent }) {
  return (
    <section id="home" className={styles.hero}>
      <div className={styles.heroCopy}>
        <PublicEyebrow>{content.hero.eyebrow}</PublicEyebrow>
        <h1 className={styles.heroTitle}>{content.hero.title}</h1>
        <p className={styles.heroDescription}>{content.hero.description}</p>
        <div className={styles.heroActions}>
          <PublicAction href={content.hero.primaryCta.href} tone="primary">
            {content.hero.primaryCta.label}
            <ArrowRightGlyph />
          </PublicAction>
          <PublicAction href={content.hero.secondaryCta.href} tone="secondary">
            {content.hero.secondaryCta.label}
            <SearchGlyph />
          </PublicAction>
        </div>
      </div>

      <div className={styles.heroVisual}>
        <MediaImage
          alt={content.hero.imageAlt ?? "Clinical Atelier hero"}
          className={styles.heroImage}
          src={content.hero.imageSrc}
          tone="hero"
        />
        <div className={styles.heroVisualOverlay} aria-hidden="true" />
        <div className={styles.heroGlassCard}>
          <div className={styles.heroGlassEyebrow}>Clinical arrival</div>
          <div className={styles.heroGlassTitle}>Calm navigation, urgent readiness.</div>
          <div className={styles.heroGlassSummary}>
            Tonal layering, concierge intake, and high-trust wayfinding support every
            first interaction.
          </div>
        </div>
        <div className={styles.heroMetricRail}>
          {content.trust.metrics.map((metric) => (
            <PublicStat
              key={metric.label}
              className={styles.heroMetric}
              label={metric.label}
              value={metric.value}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function QuickLinksSection({
  cards
}: {
  readonly cards: readonly QuickLinkCard[];
}) {
  return (
    <section className={styles.quickLinks} aria-label="Quick links">
      <div className={styles.quickLinksGrid}>
        {cards.map((card) => (
          <a
            key={card.title}
            href={card.href}
            className={cx(styles.quickLinkCard, quickLinkVariantClassName(card.variant))}
          >
            <div className={styles.quickLinkIconWrap}>{renderQuickLinkIcon(card.icon)}</div>
            <h2 className={styles.quickLinkTitle}>{card.title}</h2>
            <p className={styles.quickLinkDescription}>{card.description}</p>
            <span className={styles.quickLinkAction}>
              {card.actionLabel}
              <ArrowRightGlyph />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

function DepartmentsSection({
  content
}: {
  readonly content: PublicHomePageContent;
}) {
  return (
    <section id="departments" className={styles.section}>
      <PublicSectionHeading
        action={
          <PublicAction href={content.departments.cta.href} tone="inline">
            {content.departments.cta.label}
            <ArrowRightGlyph />
          </PublicAction>
        }
        eyebrow={content.departments.eyebrow}
        title={content.departments.title}
      />
      <div className={styles.departmentGrid}>
        {content.departments.cards.map((card) => (
          <DepartmentCardView key={card.title} card={card} />
        ))}
      </div>
    </section>
  );
}

function DepartmentCardView({ card }: { readonly card: DepartmentCard }) {
  return (
    <article className={styles.departmentCard}>
      <div className={styles.departmentMedia}>
        <MediaImage
          alt={card.imageAlt ?? card.title}
          className={styles.departmentImage}
          src={card.imageSrc}
          tone={card.tone}
        />
        <div
          className={cx(
            styles.departmentOverlay,
            card.overlayTone === "light"
              ? styles.departmentOverlayLight
              : styles.departmentOverlayDark
          )}
        >
          <h3 className={styles.departmentName}>{card.title}</h3>
        </div>
      </div>
      <p className={styles.departmentDescription}>{card.description}</p>
    </article>
  );
}

function TrustSection({ content }: { readonly content: PublicHomePageContent }) {
  return (
    <section className={styles.trustBand}>
      <div className={styles.trustGrid}>
        <div className={styles.trustIntro}>
          <h2 className={styles.trustTitle}>{content.trust.title}</h2>
          <p className={styles.trustDescription}>{content.trust.description}</p>
          <div className={styles.trustMetricGrid}>
            {content.trust.metrics.map((metric) => (
              <PublicStat
                key={metric.label}
                className={styles.trustMetric}
                label={metric.label}
                value={metric.value}
              />
            ))}
          </div>
        </div>

        <aside className={styles.testimonialCard}>
          <div className={styles.quoteMark}>“</div>
          <p className={styles.testimonialText}>{content.trust.testimonial.quote}</p>
          <div className={styles.testimonialMeta}>
            <div className={styles.testimonialAvatar}>
              <MediaImage
                alt={content.trust.testimonial.imageAlt ?? content.trust.testimonial.name}
                className={styles.testimonialAvatarImage}
                src={content.trust.testimonial.imageSrc}
                tone="avatar"
              />
            </div>
            <div>
              <div className={styles.testimonialName}>{content.trust.testimonial.name}</div>
              <div className={styles.testimonialRole}>{content.trust.testimonial.role}</div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function DoctorsSection({
  content
}: {
  readonly content: PublicHomePageContent;
}) {
  return (
    <section id="doctors" className={styles.section}>
      <PublicSectionHeading
        align="center"
        eyebrow={content.doctors.eyebrow}
        title={content.doctors.title}
      />
      <div className={styles.doctorGrid}>
        {content.doctors.cards.map((doctor) => (
          <DoctorCardView key={doctor.name} doctor={doctor} />
        ))}
      </div>
    </section>
  );
}

function DoctorCardView({ doctor }: { readonly doctor: DoctorCard }) {
  return (
    <article className={styles.doctorCard}>
      <div className={styles.doctorMedia}>
        <MediaImage
          alt={doctor.imageAlt ?? doctor.name}
          className={styles.doctorImage}
          src={doctor.imageSrc}
          tone="portrait"
        />
        <div className={styles.doctorBadge}>{doctor.badge}</div>
      </div>
      <h3 className={styles.doctorName}>{doctor.name}</h3>
      <div className={styles.doctorSpecialty}>{doctor.specialty}</div>
      <p className={styles.doctorDescription}>{doctor.description}</p>
      <PublicAction href={doctor.href} tone="surface" className={styles.doctorAction}>
        View Profile
      </PublicAction>
    </article>
  );
}

function NewsSection({ content }: { readonly content: PublicHomePageContent }) {
  return (
    <section id="services" className={styles.newsSection}>
      <div className={styles.newsGrid}>
        <div className={styles.newsIntro}>
          <PublicEyebrow>{content.news.eyebrow}</PublicEyebrow>
          <h2 className={styles.newsTitle}>{content.news.title}</h2>
          <p className={styles.newsDescription}>{content.news.description}</p>
          <div className={styles.newsAccent} aria-hidden="true" />
          <PublicAction href={content.news.cta.href} tone="surface">
            {content.news.cta.label}
          </PublicAction>
        </div>
        <div className={styles.newsCards}>
          {content.news.articles.map((article) => (
            <NewsCardView key={article.title} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsCardView({ article }: { readonly article: NewsArticle }) {
  return (
    <article className={styles.newsCard}>
      <a className={styles.newsCardLink} href={article.href}>
        <div className={styles.articleMedia}>
          <MediaImage
            alt={article.imageAlt ?? article.title}
            className={styles.articleImage}
            src={article.imageSrc}
            tone="article"
          />
        </div>
        <div className={styles.articleCategory}>{article.category}</div>
        <h3 className={styles.articleTitle}>{article.title}</h3>
        <p className={styles.articleSummary}>{article.summary}</p>
      </a>
    </article>
  );
}

function SiteFooter({
  brandName,
  copyright,
  links
}: {
  readonly brandName: string;
  readonly copyright: string;
  readonly links: readonly SiteLink[];
}) {
  return (
    <footer id="footer" className={styles.footer}>
      <div className={styles.footerInner}>
        <PublicBrand
          label="Precise Sanctuary Care"
          mark="CA"
          name={brandName}
          tone="inverse"
        />
        <div className={styles.footerLegal}>{copyright}</div>
        <nav className={styles.footerLinks} aria-label="Legal">
          {links.map((link) => (
            <a key={link.label} href={link.href} className={styles.footerLink}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}

function MediaImage({
  src,
  alt,
  className,
  tone
}: {
  readonly src?: string;
  readonly alt: string;
  readonly className?: string;
  readonly tone: PlaceholderTone;
}) {
  if (src) {
    return <img alt={alt} className={cx(styles.mediaImage, className)} src={src} />;
  }

  return (
    <div
      aria-hidden="true"
      className={cx(styles.mediaPlaceholder, placeholderToneClassNames[tone], className)}
    />
  );
}

function quickLinkVariantClassName(variant: QuickLinkVariant) {
  switch (variant) {
    case "critical":
      return styles.quickLinkCritical;
    case "surface":
      return styles.quickLinkSurface;
    case "inverse":
      return styles.quickLinkInverse;
  }
}

function renderQuickLinkIcon(icon: QuickLinkIcon) {
  switch (icon) {
    case "emergency":
      return <EmergencyGlyph />;
    case "map":
      return <MapPinGlyph />;
    case "spark":
      return <DepartmentGlyph />;
  }
}

function cx(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(" ");
}
