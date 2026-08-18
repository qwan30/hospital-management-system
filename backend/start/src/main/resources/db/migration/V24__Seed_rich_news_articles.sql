-- Flyway Migration V24: Seed rich clinical news articles
INSERT INTO news_articles (id, slug, title, summary, content, image_url, published_at, is_active)
VALUES
  (
    gen_random_uuid(),
    'evening-clinic',
    'Expanded Evening Clinic Hours Across Outpatient Departments',
    'Selected departments including Internal Medicine, Pediatrics, and Cardiology now support evening consultation appointments for working families.',
    'Hospital Core has expanded its operational outpatient hours to better serve working families and community members who require after-hours medical consultations.

Starting this month, board-certified clinicians across Internal Medicine, Pediatrics, and Cardiology will provide scheduled consultations from 17:30 to 20:30 on weekdays. All laboratory screening, emergency triage, and digital follow-up systems will remain fully coordinated during these evening clinic shifts.

Patients can book evening consultations directly through the online appointment booking portal or by contacting the outpatient reception desk.',
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    NOW() - INTERVAL '4 days',
    TRUE
  ),
  (
    gen_random_uuid(),
    'digital-follow-up',
    'Digital Follow-Up Platform Expands Across All Specialties',
    'Patients now receive automated follow-up check-ins and symptom monitoring reminders directly through the integrated patient portal.',
    'Following a successful pilot phase in Cardiology and Internal Medicine, Hospital Core has completed the hospital-wide rollout of its digital follow-up platform.

The system delivers secure care-team reminders, post-procedure guidance, and medication compliance check-ins straight to patient accounts. Clinicians can review patient-reported symptoms and vital signs in real time, triggering early clinical interventions when necessary.

Patients with completed consultations can log in to the Patient Portal to view care plans, download digital invoices, and message their primary care teams.',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
    NOW() - INTERVAL '10 days',
    TRUE
  ),
  (
    gen_random_uuid(),
    'robotic-surgery-wing',
    'Expansion of the Advanced Robotic Surgery Suite',
    'Integrating next-generation precision surgical units to accelerate recovery times and surgical precision in minimally invasive cardiac procedures.',
    'Hospital Core has commissioned two new robotic-assisted surgical units in the North Surgical Wing, marking a major milestone in minimally invasive surgical capabilities.

The high-definition 3D stereoscopic visualization and articulated micro-instruments enable surgical teams to perform complex cardiothoracic and orthopedic procedures with sub-millimeter precision. Clinical trial data indicates a 40% reduction in post-operative recovery duration and reduced post-surgical analgesic requirements.

Our surgical faculty has completed comprehensive robotic simulation training and is now accepting referrals for robotic-assisted cardiac and orthopedic surgeries.',
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
    NOW() - INTERVAL '22 days',
    TRUE
  ),
  (
    gen_random_uuid(),
    'preventive-cardiology-protocol',
    'Comprehensive Preventive Cardiology Protocol Introduced',
    'New multi-tier cardiovascular risk assessment protocol helps early detection of ischemic heart disease and vascular conditions.',
    'Cardiovascular diseases remain the leading cause of adult morbidity. In response, Hospital Core''s cardiology department has introduced an evidence-based preventive screening protocol.

The screening program integrates automated risk stratification, advanced lipid biomarker panels, 2D echocardiography, and personalized nutritional guidance. Patients identified with intermediate or high risk receive tailored monitoring regimens and direct lifestyle intervention support from clinical cardiologists.

Registration for the preventive cardiology screening package is open to all registered patients through our online booking system.',
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80',
    NOW() - INTERVAL '35 days',
    TRUE
  ),
  (
    gen_random_uuid(),
    'neural-reconstruction-systems',
    'Breakthrough in Peripheral Nerve Reconstruction Research',
    'Hospital Core research division announces successful clinical trial for bio-compatible neural scaffolds in motor function recovery.',
    'Our neurosurgery and orthopedic trauma research units have published findings from a 12-month clinical study on bio-compatible synthetic neural scaffolding.

The advanced scaffolds provide structured micro-channels that guide regenerating axonal growth following traumatic peripheral nerve injuries. Participating patients demonstrated significant improvements in motor function recovery scores and tactile sensory restoration compared to traditional graft techniques.

Further multicenter studies are planned to expand application to spinal trauma and reconstructive plastic surgery.',
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1200&q=80',
    NOW() - INTERVAL '50 days',
    TRUE
  ),
  (
    gen_random_uuid(),
    'pediatric-wellness-initiative',
    'Hospital Core Launches Community Pediatric Wellness Initiative',
    'Providing free developmental screenings, immunization reviews, and nutrition counseling for pediatric patients throughout the province.',
    'Supporting the health and well-being of the next generation, Hospital Core''s Department of Pediatrics has launched the 2026 Community Pediatric Wellness Initiative.

The program includes comprehensive developmental milestone assessments, vision and hearing screenings, immunization catch-up schedules, and nutritional counseling for infants and young children. Consultations are delivered by specialized pediatric clinicians in our family-friendly outpatient clinic wing.

Parents can schedule child wellness checkups online or during standard morning clinic sessions.',
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    NOW() - INTERVAL '70 days',
    TRUE
  )
ON CONFLICT (slug) DO UPDATE
SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content = EXCLUDED.content,
  image_url = EXCLUDED.image_url,
  published_at = EXCLUDED.published_at,
  is_active = TRUE;
