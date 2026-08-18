package com.hospital.core.content;

import com.hospital.core.shared.HospitalProfileProperties;
import com.hospital.shared.publicsite.HomePageContentResponse;
import com.hospital.shared.publicsite.HospitalContentSectionResponse;
import com.hospital.shared.publicsite.NewsArticleResponse;
import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PublicContentService {
  private final HospitalContentSectionRepository hospitalContentSectionRepository;
  private final NewsArticleRepository newsArticleRepository;
  private final HospitalProfileProperties hospitalProfileProperties;

  public PublicContentService(
      HospitalContentSectionRepository hospitalContentSectionRepository,
      NewsArticleRepository newsArticleRepository,
      HospitalProfileProperties hospitalProfileProperties) {
    this.hospitalContentSectionRepository = hospitalContentSectionRepository;
    this.newsArticleRepository = newsArticleRepository;
    this.hospitalProfileProperties = hospitalProfileProperties;
  }

  @Transactional(readOnly = true)
  public HomePageContentResponse getHomePageContent() {
    var sections = hospitalContentSectionRepository.findByActiveTrueOrderBySortOrderAscTitleAsc().stream()
        .map(this::toSectionResponse)
        .toList();
    return new HomePageContentResponse(
        fallback(hospitalProfileProperties.name(), "Hospital Management System"),
        fallback(hospitalProfileProperties.address(), "123 ABC Street, District 1, Ho Chi Minh City"),
        fallback(hospitalProfileProperties.phone(), "028 1234 5678"),
        fallback(hospitalProfileProperties.mapsEmbedUrl(), "https://www.google.com/maps?q=10.7769,106.7009&z=15&output=embed"),
        fallback(hospitalProfileProperties.privacyPolicyUrl(), "/privacy"),
        fallback(hospitalProfileProperties.facebookUrl(), "https://facebook.com"),
        fallback(hospitalProfileProperties.youtubeUrl(), "https://youtube.com"),
        sections.isEmpty() ? defaultSections() : sections);
  }

  @Transactional(readOnly = true)
  public List<NewsArticleResponse> listNewsArticles() {
    var articles = newsArticleRepository.findByActiveTrueOrderByPublishedAtDesc().stream()
        .map(this::toNewsResponse)
        .toList();
    return articles.isEmpty() ? defaultNewsArticles() : articles;
  }

  @Transactional(readOnly = true)
  public NewsArticleResponse getNewsArticleBySlug(String slug) {
    if (slug == null || slug.isBlank()) {
      return null;
    }
    var dbArticle = newsArticleRepository.findBySlugIgnoreCase(slug.trim())
        .filter(NewsArticleEntity::isActive)
        .map(this::toNewsResponse)
        .orElse(null);
    if (dbArticle != null) {
      return dbArticle;
    }
    return defaultNewsArticles().stream()
        .filter(article -> article.slug().equalsIgnoreCase(slug.trim()))
        .findFirst()
        .orElse(null);
  }

  @Transactional(readOnly = true)
  public Page<NewsArticleResponse> getArchivedNews(int page, int size) {
    int safeSize = Math.max(size, 1);
    Pageable pageable = PageRequest.of(Math.max(page, 0), safeSize);
    var paged = newsArticleRepository.findByActiveTrueOrderByPublishedAtDesc(pageable);
    if (paged.hasContent() || paged.getTotalElements() > 0) {
      return paged.map(this::toNewsResponse);
    }
    var defaults = defaultNewsArticles();
    int start = Math.min(page * safeSize, defaults.size());
    int end = Math.min(start + safeSize, defaults.size());
    var sublist = defaults.subList(start, end);
    return new org.springframework.data.domain.PageImpl<>(sublist, pageable, defaults.size());
  }

  HospitalContentSectionResponse toSectionResponse(HospitalContentSectionEntity entity) {
    return new HospitalContentSectionResponse(
        entity.getId(),
        entity.getSlug(),
        entity.getTitle(),
        entity.getBody(),
        entity.getImageUrl(),
        entity.getCtaLabel(),
        entity.getCtaHref(),
        entity.getSortOrder());
  }

  NewsArticleResponse toNewsResponse(NewsArticleEntity entity) {
    return new NewsArticleResponse(
        entity.getId(),
        entity.getSlug(),
        entity.getTitle(),
        entity.getSummary(),
        entity.getContent(),
        entity.getImageUrl(),
        entity.getPublishedAt());
  }

  private List<HospitalContentSectionResponse> defaultSections() {
    return List.of(
        new HospitalContentSectionResponse(null, "mission", "Trusted care for every visit",
            "Modern booking, coordinated clinical workflows, and clear follow-up communication.",
            null, "Book an appointment", "/booking", 1),
        new HospitalContentSectionResponse(null, "services", "Specialties and patient services",
            "Explore departments, doctors, preventive screening, and post-visit follow-up support.",
            null, "Explore departments", "/departments", 2));
  }

  private List<NewsArticleResponse> defaultNewsArticles() {
    return List.of(
        new NewsArticleResponse(
            null,
            "evening-clinic",
            "Expanded Evening Clinic Hours Across Outpatient Departments",
            "Selected departments including Internal Medicine, Pediatrics, and Cardiology now support evening consultation appointments for working families.",
            "Hospital Core has expanded its operational outpatient hours to better serve working families and community members who require after-hours medical consultations.\n\nStarting this month, board-certified clinicians across Internal Medicine, Pediatrics, and Cardiology will provide scheduled consultations from 17:30 to 20:30 on weekdays. All laboratory screening, emergency triage, and digital follow-up systems will remain fully coordinated during these evening clinic shifts.\n\nPatients can book evening consultations directly through the online appointment booking portal or by contacting the outpatient reception desk.",
            "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
            Instant.parse("2026-08-14T08:00:00Z")),
        new NewsArticleResponse(
            null,
            "digital-follow-up",
            "Digital Follow-Up Platform Expands Across All Specialties",
            "Patients now receive automated follow-up check-ins and symptom monitoring reminders directly through the integrated patient portal.",
            "Following a successful pilot phase in Cardiology and Internal Medicine, Hospital Core has completed the hospital-wide rollout of its digital follow-up platform.\n\nThe system delivers secure care-team reminders, post-procedure guidance, and medication compliance check-ins straight to patient accounts. Clinicians can review patient-reported symptoms and vital signs in real time, triggering early clinical interventions when necessary.\n\nPatients with completed consultations can log in to the Patient Portal to view care plans, download digital invoices, and message their primary care teams.",
            "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80",
            Instant.parse("2026-08-08T08:00:00Z")),
        new NewsArticleResponse(
            null,
            "robotic-surgery-wing",
            "Expansion of the Advanced Robotic Surgery Suite",
            "Integrating next-generation precision surgical units to accelerate recovery times and surgical precision in minimally invasive cardiac procedures.",
            "Hospital Core has commissioned two new robotic-assisted surgical units in the North Surgical Wing, marking a major milestone in minimally invasive surgical capabilities.\n\nThe high-definition 3D stereoscopic visualization and articulated micro-instruments enable surgical teams to perform complex cardiothoracic and orthopedic procedures with sub-millimeter precision. Clinical trial data indicates a 40% reduction in post-operative recovery duration and reduced post-surgical analgesic requirements.\n\nOur surgical faculty has completed comprehensive robotic simulation training and is now accepting referrals for robotic-assisted cardiac and orthopedic surgeries.",
            "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80",
            Instant.parse("2026-07-27T08:00:00Z")),
        new NewsArticleResponse(
            null,
            "preventive-cardiology-protocol",
            "Comprehensive Preventive Cardiology Protocol Introduced",
            "New multi-tier cardiovascular risk assessment protocol helps early detection of ischemic heart disease and vascular conditions.",
            "Cardiovascular diseases remain the leading cause of adult morbidity. In response, Hospital Core's cardiology department has introduced an evidence-based preventive screening protocol.\n\nThe screening program integrates automated risk stratification, advanced lipid biomarker panels, 2D echocardiography, and personalized nutritional guidance. Patients identified with intermediate or high risk receive tailored monitoring regimens and direct lifestyle intervention support from clinical cardiologists.\n\nRegistration for the preventive cardiology screening package is open to all registered patients through our online booking system.",
            "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80",
            Instant.parse("2026-07-14T08:00:00Z")),
        new NewsArticleResponse(
            null,
            "neural-reconstruction-systems",
            "Breakthrough in Peripheral Nerve Reconstruction Research",
            "Hospital Core research division announces successful clinical trial for bio-compatible neural scaffolds in motor function recovery.",
            "Our neurosurgery and orthopedic trauma research units have published findings from a 12-month clinical study on bio-compatible synthetic neural scaffolding.\n\nThe advanced scaffolds provide structured micro-channels that guide regenerating axonal growth following traumatic peripheral nerve injuries. Participating patients demonstrated significant improvements in motor function recovery scores and tactile sensory restoration compared to traditional graft techniques.\n\nFurther multicenter studies are planned to expand application to spinal trauma and reconstructive plastic surgery.",
            "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1200&q=80",
            Instant.parse("2026-06-29T08:00:00Z")),
        new NewsArticleResponse(
            null,
            "pediatric-wellness-initiative",
            "Hospital Core Launches Community Pediatric Wellness Initiative",
            "Providing free developmental screenings, immunization reviews, and nutrition counseling for pediatric patients throughout the province.",
            "Supporting the health and well-being of the next generation, Hospital Core's Department of Pediatrics has launched the 2026 Community Pediatric Wellness Initiative.\n\nThe program includes comprehensive developmental milestone assessments, vision and hearing screenings, immunization catch-up schedules, and nutritional counseling for infants and young children. Consultations are delivered by specialized pediatric clinicians in our family-friendly outpatient clinic wing.\n\nParents can schedule child wellness checkups online or during standard morning clinic sessions.",
            "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80",
            Instant.parse("2026-06-09T08:00:00Z")));
  }

  private String fallback(String value, String fallbackValue) {
    return value == null || value.isBlank() ? fallbackValue : value;
  }
}
