// Utility functions for profile completion calculation

export interface ProfileCompletionResult {
  percentage: number;
  points: number;
  completedFields: number;
  totalFields: number;
  missingFields: string[];
  hasResume: boolean;
  canApply: boolean;
}


export function calculateProfileCompletion(profile: any): ProfileCompletionResult {
  // If profile already has completion percentage calculated, use it
  if (profile?.profileCompleted) {
    const percentage = parseInt(profile.profileCompleted);
    
    // Comprehensive resume detection - check ALL possible locations
    const resumeDocument = profile?.resumeDocument;
    const resumeUrl = profile?.resumeUrl;
    const resume = profile?.resume; // Alternative field
    const resumeAndDocs = profile?.jobPreferences?.resumeAndDocs;
    const documents = profile?.documents; // Check if resume is in documents array
    
    // Debug resume detection with ALL possible fields
    console.log('🔍 COMPREHENSIVE RESUME DEBUG:', {
      profileKeys: Object.keys(profile || {}),
      resumeDocument: resumeDocument,
      resumeDocumentExists: !!(resumeDocument && resumeDocument.trim() !== ''),
      resumeUrl: resumeUrl,
      resumeUrlExists: !!(resumeUrl && resumeUrl.trim() !== ''),
      resume: resume,
      resumeExists: !!(resume && (typeof resume === 'string' ? resume.trim() !== '' : resume)),
      resumeAndDocs: resumeAndDocs,
      resumeAndDocsLength: resumeAndDocs?.length || 0,
      documents: documents,
      documentsLength: documents?.length || 0,
      jobPreferences: profile?.jobPreferences ? Object.keys(profile.jobPreferences) : 'No jobPreferences'
    });
    
    // Check multiple resume locations
    const hasResume = !!(resumeDocument && resumeDocument.trim() !== '') ||
                     !!(resumeUrl && resumeUrl.trim() !== '') ||
                     !!(resume && (typeof resume === 'string' ? resume.trim() !== '' : resume)) ||
                     !!(resumeAndDocs && resumeAndDocs.length > 0) ||
                     !!(documents && documents.length > 0 && documents.some((doc: any) => 
                       doc.type === 'resume' || doc.name?.toLowerCase().includes('resume') || doc.name?.toLowerCase().includes('cv')
                     ));
                     
    console.log('✅ FINAL RESUME STATUS:', hasResume);
    
    
    // Create missing fields list based on actual checks
    const missingFields: string[] = [];
    if (!hasResume) {
      missingFields.push("Resume (Required for job applications)");
    }
    
    // Add other missing fields only if profile is less than 80%
    if (percentage < 80) {
      const result = calculateFieldsCompletion(profile);
      // Add non-resume missing fields
      result.missingFields.forEach(field => {
        if (!field.includes('Resume')) {
          missingFields.push(field);
        }
      });
    }
    
    
    const calculatedPoints = 50 + percentage * 2; // Base 50 + 2 points per percentage (100% = 250 points)
    const applicationPoints = profile?.rewards?.applyForJobs || 0; // Points from job applications
    const rmServicePoints = profile?.rewards?.rmService || 0; // Points from RM service purchase
    const deductedPoints = profile?.deductedPoints || 0;
    const totalPoints = calculatedPoints + applicationPoints + rmServicePoints;
    const availablePoints = Math.max(0, totalPoints - deductedPoints);
    
    return {
      percentage,
      points: availablePoints,
      completedFields: Math.round(percentage * 24 / 100),
      totalFields: 24,
      missingFields,
      hasResume,
      canApply: percentage >= 80 && hasResume
    };
  }

  // Fallback to manual calculation if profileCompleted is not available
  return calculateFieldsCompletion(profile);
}

function calculateFieldsCompletion(profile: any): ProfileCompletionResult {
  let completed = 0;
  const totalFields = 24; // employmentVisa removed
  const missingFields: string[] = [];

  // Personal Info (9 fields - employmentVisa removed)
  if (profile?.fullName || profile?.name) completed++; else missingFields.push("Full Name");
  if (profile?.email) completed++; else missingFields.push("Email");
  if (profile?.phoneNumber) completed++; else missingFields.push("Phone Number");
  if (profile?.location) completed++; else missingFields.push("Location");
  if (profile?.dateOfBirth) completed++; else missingFields.push("Date of Birth");
  if (profile?.nationality) completed++; else missingFields.push("Nationality");
  if (profile?.professionalSummary) completed++; else missingFields.push("Professional Summary");
  if (profile?.emirateId) completed++; else missingFields.push("Emirates ID");
  if (profile?.passportNumber) completed++; else missingFields.push("Passport Number");

  // Experience (4 fields)
  const exp = profile?.professionalExperience?.[0];
  if (exp?.currentRole) completed++; else missingFields.push("Current Role");
  if (exp?.company) completed++; else missingFields.push("Company");
  if (exp?.yearsOfExperience) completed++; else missingFields.push("Years of Experience");
  if (exp?.industry) completed++; else missingFields.push("Industry");

  // Education (4 fields)
  const edu = profile?.education?.[0];
  if (edu?.highestDegree || edu?.degree) completed++; else missingFields.push("Highest Degree");
  if (edu?.institution) completed++; else missingFields.push("Institution");
  if (edu?.yearOfGraduation || edu?.year) completed++; else missingFields.push("Year of Graduation");
  if (edu?.gradeCgpa || edu?.grade) completed++; else missingFields.push("Grade/CGPA");

  // Skills, Preferences, Certifications (3 fields)
  if (profile?.skills && profile.skills.length > 0) completed++; else missingFields.push("Skills");
  if (profile?.jobPreferences?.preferredJobType && profile.jobPreferences.preferredJobType.length > 0) completed++; else missingFields.push("Job Preferences");
  if (profile?.certifications && profile.certifications.length > 0) completed++; else missingFields.push("Certifications");

  // Resume (1 field) - Comprehensive check
  const hasResume = !!(profile?.resumeDocument && profile.resumeDocument.trim() !== '') ||
                   !!(profile?.resumeUrl && profile.resumeUrl.trim() !== '') ||
                   !!(profile?.resume && (typeof profile.resume === 'string' ? profile.resume.trim() !== '' : profile.resume)) ||
                   !!(profile?.jobPreferences?.resumeAndDocs && profile.jobPreferences.resumeAndDocs.length > 0) ||
                   !!(profile?.documents && profile.documents.length > 0 && profile.documents.some((doc: any) => 
                     doc.type === 'resume' || doc.name?.toLowerCase().includes('resume') || doc.name?.toLowerCase().includes('cv')
                   ));
  
  if (hasResume) completed++; else missingFields.push("Resume (Required for job applications)");

  // Social Links (3 fields)
  if (profile?.socialLinks?.linkedIn || profile?.socialLinks?.linkedin) completed++; else missingFields.push("LinkedIn");
  if (profile?.socialLinks?.instagram) completed++; else missingFields.push("Instagram");
  if (profile?.socialLinks?.twitterX || profile?.socialLinks?.twitter) completed++; else missingFields.push("Twitter/X");

  const percentage = Math.round((completed / totalFields) * 100);
  const canApply = percentage >= 80 && hasResume;

    const calculatedPoints = 50 + percentage * 2; // Base 50 + 2 points per percentage (100% = 250 points)
    const applicationPoints = profile?.rewards?.applyForJobs || 0; // Points from job applications
    const rmServicePoints = profile?.rewards?.rmService || 0; // Points from RM service purchase
    const deductedPoints = profile?.deductedPoints || 0;
    const totalPoints = calculatedPoints + applicationPoints + rmServicePoints;
    const availablePoints = Math.max(0, totalPoints - deductedPoints);
  
  return {
    percentage,
    points: availablePoints,
    completedFields: completed,
    totalFields,
    missingFields,
    hasResume,
    canApply
  };
}

export function isEligibleToApply(profileCompletionResult: ProfileCompletionResult): boolean {
  return profileCompletionResult.canApply;
}

// Legacy function for backward compatibility
export function isEligibleToApplyByPercentage(profileCompletionPercentage: number): boolean {
  return profileCompletionPercentage >= 80;
}

export function getCompletionTier(percentage: number): string {
  if (percentage >= 90) return "Platinum";
  if (percentage >= 80) return "Gold";
  if (percentage >= 60) return "Silver";
  return "Bronze";
}

export function hasValidResume(profile: any): boolean {
  // Comprehensive resume check - all possible locations
  return !!(profile?.resumeDocument && profile.resumeDocument.trim() !== '') ||
         !!(profile?.resumeUrl && profile.resumeUrl.trim() !== '') ||
         !!(profile?.resume && (typeof profile.resume === 'string' ? profile.resume.trim() !== '' : profile.resume)) ||
         !!(profile?.jobPreferences?.resumeAndDocs && profile.jobPreferences.resumeAndDocs.length > 0) ||
         !!(profile?.documents && profile.documents.length > 0 && profile.documents.some((doc: any) => 
           doc.type === 'resume' || doc.name?.toLowerCase().includes('resume') || doc.name?.toLowerCase().includes('cv')
         ));
}

export function getResumeValidationMessage(profile: any): string {
  if (hasValidResume(profile)) {
    return "✅ Resume uploaded successfully";
  } else {
    return "❌ Resume is required - please upload your resume document";
  }
}

export function getCompletionMessage(completionResult: ProfileCompletionResult): string {
  const { percentage, hasResume, canApply } = completionResult;
  
  if (canApply) {
    return "Great! Your profile is complete and you have uploaded your resume. You can apply for jobs.";
  } else if (!hasResume && percentage >= 80) {
    return "Your profile is 80%+ complete, but you need to upload your resume to apply for jobs.";
  } else if (hasResume && percentage < 80) {
    return `You have uploaded your resume, but need ${80 - percentage}% more profile completion to apply for jobs.`;
  } else if (!hasResume && percentage < 80) {
    return `You need ${80 - percentage}% more profile completion AND must upload your resume to apply for jobs.`;
  } else {
    return `Complete ${80 - percentage}% more of your profile and upload your resume to apply for jobs.`;
  }
}
