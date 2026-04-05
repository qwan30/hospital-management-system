package com.hospital.shared.publicsite;

import java.util.List;

public record HomePageContentResponse(
    String hospitalName,
    String hospitalAddress,
    String hospitalPhone,
    String mapsEmbedUrl,
    String privacyPolicyUrl,
    String facebookUrl,
    String youtubeUrl,
    List<HospitalContentSectionResponse> sections
) {}
