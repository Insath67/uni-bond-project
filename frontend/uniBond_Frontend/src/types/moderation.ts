export type ModerationStatus = "allowed" | "review" | "rejected";

export type ConfidenceLevel = "low" | "medium" | "high";

export type AcademicRelevance =
  | "study_related"
  | "possibly_study_related"
  | "not_study_related"
  | "uncertain";

export type ModerationPredictionCandidate = {
  label: string;
  confidence: number;
  confidence_percentage: string;
};

export type TextModerationResult = {
  predicted_label: string;
  confidence: number;
  confidence_percentage: string;
  confidence_level: ConfidenceLevel;
  status: ModerationStatus;
  is_allowed: boolean;
  explanation: string;
};

export type ImageModerationResult = {
  filename: string;
  content_type: string;
  predicted_label: string;
  detected_subject: string;
  confidence: number;
  confidence_percentage: string;
  confidence_level: ConfidenceLevel;
  academic_relevance: AcademicRelevance;
  status: ModerationStatus;
  is_allowed: boolean;
  explanation: string;
  moderation_reason: string;
  upload_guidance: string[];
  top_predictions: ModerationPredictionCandidate[];
};

export type ModerationCheckResponse = {
  has_text: boolean;
  has_image: boolean;
  text_result?: TextModerationResult | null;
  image_result?: ImageModerationResult | null;
  final_status: ModerationStatus;
  is_allowed: boolean;
  reasons: string[];
  explanation: string;
};
