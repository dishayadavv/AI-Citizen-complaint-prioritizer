// =========================================
// CITYFIX AI COMPLAINT PRIORITY ENGINE
// Explainable rule-based NLP analysis
// =========================================

function analyzeComplaint(
  title,
  description,
  category = "",
  severity = 1,
  location = "",
  hasPhoto = false,
  similarComplaints = 0
) {

  // =========================================
  // BASIC NORMALIZATION
  // =========================================

  const safeTitle =
    String(title || "")
      .toLowerCase()
      .trim();

  const safeDescription =
    String(description || "")
      .toLowerCase()
      .trim();

  const safeCategory =
    String(category || "")
      .toLowerCase()
      .trim();

  const safeLocation =
    String(location || "")
      .toLowerCase()
      .trim();

  const text =
    `${safeTitle} ${safeDescription}`.trim();


  // =========================================
  // SCORE VARIABLES
  // =========================================

  let score = 0;

  const aiReasons = [];

  const detectedFactors = [];


  // =========================================
  // HELPER FUNCTIONS
  // =========================================

  function addScore(
    points,
    reason,
    factor
  ) {

    score += points;

    if (reason) {
      aiReasons.push(reason);
    }

    if (factor) {
      detectedFactors.push(factor);
    }
  }


  function containsAny(words) {

    return words.some(
      word => text.includes(word)
    );

  }


  function countMatches(words) {

    return words.filter(
      word => text.includes(word)
    ).length;

  }


  // =========================================
  // 1. SAFETY RISK ANALYSIS
  // =========================================

  const extremeSafetyTerms = [

    "risk to life",
    "life at risk",
    "danger to life",
    "life threatening",
    "life-threatening",
    "electrocution",
    "electric shock",
    "exposed live wire",
    "live wire",
    "gas leak",
    "gas leakage",
    "fire hazard",
    "building collapse",
    "building may collapse",
    "people injured",
    "person injured",
    "someone injured",
    "death",
    "dead"
  ];

  if (
    containsAny(extremeSafetyTerms)
  ) {

    addScore(
      32,
      "Potential immediate threat to human safety detected.",
      "Safety Risk"
    );

  }
  else {

    const safetyTerms = [

      "dangerous",
      "unsafe",
      "hazard",
      "accident",
      "injury",
      "injured",
      "risk",
      "broken wire",
      "fallen pole",
      "open manhole",
      "open drain",
      "deep pothole"
    ];

    const safetyMatches =
      countMatches(safetyTerms);

    if (safetyMatches > 0) {

      addScore(
        Math.min(
          24,
          10 + safetyMatches * 4
        ),
        "Potential public safety risk detected.",
        "Safety Risk"
      );

    }

  }


  // =========================================
  // 2. EMERGENCY ANALYSIS
  // =========================================

  const emergencyTerms = [

    "emergency",
    "urgent",
    "urgently",
    "immediately",
    "immediate",
    "right now",
    "as soon as possible",
    "critical",
    "severe emergency"
  ];

  const emergencyMatches =
    countMatches(emergencyTerms);

  if (emergencyMatches > 0) {

    addScore(
      Math.min(
        18,
        8 + emergencyMatches * 3
      ),
      "Urgent language indicates that the issue may require rapid response.",
      "Urgency"
    );

  }


  // =========================================
  // 3. ESSENTIAL SERVICE ANALYSIS
  // =========================================

  const essentialServiceTerms = [

    "no water",
    "no water supply",
    "water supply stopped",
    "water unavailable",
    "no electricity",
    "no power",
    "power outage",
    "electricity outage",
    "electricity not available",
    "water outage",
    "sewage overflow",
    "sewage leaking",
    "major flooding",
    "flooding"
  ];

  const essentialMatches =
    countMatches(
      essentialServiceTerms
    );

  if (essentialMatches > 0) {

    addScore(
      Math.min(
        22,
        10 + essentialMatches * 4
      ),
      "Essential public service disruption detected.",
      "Essential Service"
    );

  }


  // =========================================
  // 4. INFRASTRUCTURE IMPACT
  // =========================================

  const infrastructureTerms = [

    "main road",
    "highway",
    "bridge",
    "road blocked",
    "road completely blocked",
    "major road",
    "traffic",
    "water pipeline",
    "main water line",
    "electric pole",
    "transformer",
    "drainage system",
    "sewer line"
  ];

  const infrastructureMatches =
    countMatches(
      infrastructureTerms
    );

  if (infrastructureMatches > 0) {

    addScore(
      Math.min(
        18,
        7 + infrastructureMatches * 3
      ),
      "Important public infrastructure appears to be affected.",
      "Infrastructure Impact"
    );

  }


  // =========================================
  // 5. PUBLIC IMPACT
  // =========================================

  const publicImpactTerms = [

    "many people",
    "many residents",
    "residents affected",
    "entire area",
    "whole area",
    "everyone",
    "public",
    "community",
    "neighborhood",
    "school",
    "hospital",
    "station",
    "market",
    "crowded",
    "heavy traffic",
    "children",
    "elderly"
  ];

  const publicMatches =
    countMatches(
      publicImpactTerms
    );

  if (publicMatches > 0) {

    addScore(
      Math.min(
        16,
        6 + publicMatches * 3
      ),
      "The description indicates potential impact on multiple people or a sensitive public area.",
      "Public Impact"
    );

  }


  // =========================================
  // 6. DURATION ANALYSIS
  // =========================================

  const extendedDurationTerms = [

    "for days",
    "for weeks",
    "for months",
    "several days",
    "several weeks",
    "many days",
    "many weeks",
    "since yesterday",
    "since last week",
    "since last month",
    "not fixed for days",
    "not fixed for weeks",
    "has been happening for"
  ];

  if (
    containsAny(
      extendedDurationTerms
    )
  ) {

    addScore(
      12,
      "The issue appears to have remained unresolved for an extended period.",
      "Duration"
    );

  }


  // =========================================
  // 7. SEVERITY CONTEXT
  // =========================================

  const severityNumber =
    Number(severity) || 1;

  if (severityNumber >= 5) {

    addScore(
      12,
      "Citizen-reported severity is extremely high.",
      "Reported Severity"
    );

  }
  else if (severityNumber >= 4) {

    addScore(
      9,
      "Citizen-reported severity indicates a serious issue.",
      "Reported Severity"
    );

  }
  else if (severityNumber >= 3) {

    addScore(
      5,
      "Citizen-reported severity indicates a moderate issue.",
      "Reported Severity"
    );

  }


  // =========================================
  // 8. CATEGORY INTELLIGENCE
  // =========================================

  const categoryWeights = {

    electricity: 10,

    water: 9,

    drainage: 8,

    road: 7,

    garbage: 4,

    streetlight: 4,

    other: 2

  };

  const categoryScore =
    categoryWeights[
      safeCategory
    ] || 0;

  if (categoryScore > 0) {

    addScore(
      categoryScore,
      `${category} infrastructure has been identified as the affected service.`,
      "Category"
    );

  }


  // =========================================
  // 9. LOCATION IMPORTANCE
  // =========================================

  const importantLocationTerms = [

    "school",
    "college",
    "hospital",
    "clinic",
    "railway station",
    "station",
    "bus stop",
    "market",
    "main road",
    "highway",
    "public place"
  ];

  if (
    importantLocationTerms.some(
      term =>
        safeLocation.includes(term) ||
        text.includes(term)
    )
  ) {

    addScore(
      10,
      "The reported location may have high public importance.",
      "Location Impact"
    );

  }


  // =========================================
  // 10. REPEATED COMPLAINT ANALYSIS
  // =========================================

  const similarCount =
    Number(similarComplaints) || 0;

  if (similarCount >= 10) {

    addScore(
      18,
      `${similarCount} similar complaints indicate a widespread recurring issue.`,
      "Complaint Frequency"
    );

  }
  else if (similarCount >= 5) {

    addScore(
      13,
      `${similarCount} similar complaints indicate a recurring public issue.`,
      "Complaint Frequency"
    );

  }
  else if (similarCount >= 3) {

    addScore(
      9,
      `${similarCount} similar complaints indicate that the issue is recurring.`,
      "Complaint Frequency"
    );

  }
  else if (similarCount >= 1) {

    addScore(
      5,
      "Similar complaints have previously been reported at this location.",
      "Complaint Frequency"
    );

  }


  // =========================================
  // 11. PHOTO EVIDENCE
  // =========================================

  if (hasPhoto) {

    addScore(
      3,
      "Photo evidence was submitted with the complaint.",
      "Evidence"
    );

  }


  // =========================================
  // 12. SPECIFICITY / DESCRIPTION QUALITY
  // =========================================

  const wordCount =
    safeDescription
      .split(/\s+/)
      .filter(Boolean)
      .length;

  if (wordCount >= 30) {

    addScore(
      3,
      "The complaint contains detailed descriptive information.",
      "Description Detail"
    );

  }


  // =========================================
  // 13. CATEGORY-SPECIFIC INTELLIGENCE
  // =========================================

  if (
    safeCategory === "road"
  ) {

    if (
      containsAny([
        "accident",
        "blocked",
        "deep pothole",
        "large pothole",
        "traffic",
        "dangerous"
      ])
    ) {

      addScore(
        10,
        "Road-related safety or accessibility problem detected.",
        "Road Risk"
      );

    }

  }


  if (
    safeCategory === "electricity"
  ) {

    if (
      containsAny([
        "wire",
        "shock",
        "spark",
        "fire",
        "transformer",
        "pole"
      ])
    ) {

      addScore(
        15,
        "Potential electrical infrastructure hazard detected.",
        "Electrical Risk"
      );

    }

  }


  if (
    safeCategory === "water"
  ) {

    if (
      containsAny([
        "drinking water",
        "contaminated",
        "dirty water",
        "no water",
        "water supply stopped"
      ])
    ) {

      addScore(
        10,
        "Potential impact on essential water access detected.",
        "Water Risk"
      );

    }

  }


  if (
    safeCategory === "drainage"
  ) {

    if (
      containsAny([
        "sewage",
        "overflow",
        "flood",
        "open drain",
        "blocked drain"
      ])
    ) {

      addScore(
        10,
        "Potential sanitation or flooding risk detected.",
        "Drainage Risk"
      );

    }

  }


  // =========================================
  // 14. LIMIT SCORE
  // =========================================

  if (score > 100) {

    score = 100;

  }

  score =
    Math.round(score);


  // =========================================
  // 15. DETERMINE AI LEVEL
  // =========================================

  let detectedLevel =
    "Low";

  if (score >= 80) {

    detectedLevel =
      "Critical";

  }
  else if (score >= 60) {

    detectedLevel =
      "High";

  }
  else if (score >= 40) {

    detectedLevel =
      "Medium";

  }


  // =========================================
  // 16. LOW PRIORITY REASON
  // =========================================

  if (
    aiReasons.length === 0
  ) {

    aiReasons.push(
      "No strong urgency, safety, or public-impact indicators were detected."
    );

  }


  // =========================================
  // 17. REMOVE DUPLICATE REASONS
  // =========================================

  const uniqueReasons =
    [
      ...new Set(aiReasons)
    ];


  // =========================================
  // 18. RECOMMENDED ACTION
  // =========================================

  let recommendedAction =
    "Review and schedule the complaint according to normal service priority.";

  if (
    detectedLevel === "Critical"
  ) {

    recommendedAction =
      "Immediate inspection and rapid response are recommended.";

  }
  else if (
    detectedLevel === "High"
  ) {

    recommendedAction =
      "Prioritize inspection and initiate corrective action soon.";

  }
  else if (
    detectedLevel === "Medium"
  ) {

    recommendedAction =
      "Schedule inspection and corrective action within the normal service window.";

  }


  // =========================================
  // 19. PREDICTED RESPONSE TIME
  // =========================================

  let predictedResolutionTime =
    7;

  if (
    detectedLevel === "Critical"
  ) {

    predictedResolutionTime =
      1;

  }
  else if (
    detectedLevel === "High"
  ) {

    predictedResolutionTime =
      2;

  }
  else if (
    detectedLevel === "Medium"
  ) {

    predictedResolutionTime =
      4;

  }


  // =========================================
  // 20. FINAL AI RESULT
  // =========================================

  return {

    aiScore: score,

    detectedLevel:

      detectedLevel,

    aiReasons:

      uniqueReasons,

    detectedFactors:

      [
        ...new Set(
          detectedFactors
        )
      ],

    recommendedAction:

      recommendedAction,

    predictedResolutionTime:

      predictedResolutionTime

  };

}


// =========================================
// EXPORT
// =========================================

module.exports = {

  analyzeComplaint

};