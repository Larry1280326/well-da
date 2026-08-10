// ==========================================
// Shared RFQ Types, Enums & Constants
// ==========================================
// Imported by both client (section components) and server (validation, API route).
// Enum arrays MUST match PostgreSQL ENUM labels exactly.

// ---- PostgreSQL ENUM value arrays ----

export const CONTACT_METHODS = ["Email", "Phone", "Whatsapp"] as const;
export type ContactMethod = (typeof CONTACT_METHODS)[number];

export const PRODUCT_TYPES = [
  "Enclosure",
  "Cabinet",
  "Panel",
  "Bracket",
  "Custom",
] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const DRAWING_AVAIL = [
  "Production drawing available",
  "Concept only",
  "No drawing yet",
] as const;
export type DrawingAvail = (typeof DRAWING_AVAIL)[number];

export const MATERIALS = [
  "Mild Steel",
  "Stainless Steel",
  "Electrogalvanized Steel",
  "Aluminium",
  "Other",
  "Not Sure",
] as const;
export type Material = (typeof MATERIALS)[number];

export const THICKNESS_UNITS = ["mm", "inch"] as const;
export type ThicknessUnit = (typeof THICKNESS_UNITS)[number];

export const ASSEMBLY_REQ = ["Yes", "No", "Not Sure"] as const;
export type AssemblyReq = (typeof ASSEMBLY_REQ)[number];

export const PRINTING_MARKING_OPTIONS = [
  "Silk Screen",
  "Laser Marking",
  "Label",
  "None",
] as const;
export type PrintingMarkingOption =
  (typeof PRINTING_MARKING_OPTIONS)[number];

export const REQUIRED_DATE_TYPES = [
  "Ready for Shipment",
  "Required at Destination",
] as const;
export type RequiredDateType = (typeof REQUIRED_DATE_TYPES)[number];

export const SHIPPING_QUOTE_REQ = ["Yes", "No", "Not Sure"] as const;
export type ShippingQuoteReq = (typeof SHIPPING_QUOTE_REQ)[number];

export const ADDITIONAL_OPTIONS = ["NO_DRAWING", "REQUIRE_NDA"] as const;
export type AdditionalOption = (typeof ADDITIONAL_OPTIONS)[number];

// ---- Dropdown option lists (not ENUMs in DB, but selectable options) ----

export const SURFACE_FINISH_OPTIONS = [
  "Powder Coating",
  "Brushed",
  "Polished",
  "Mirror Finish",
  "Other",
  "Not Sure",
] as const;

export const OPERATING_ENV_OPTIONS = [
  "Indoor",
  "Outdoor",
  "Humid Environment",
  "Coastal / High-salt Environment",
  "High-temperature Environment",
  "Other",
] as const;

export const PROTECTION_REQ_OPTIONS = [
  "Anti-corrosion",
  "Water Resistance",
  "Dust Resistance",
  "Target IP Rating",
  "Not Sure",
] as const;

export const INSPECTION_REQ_OPTIONS = [
  "Standard Factory Inspection",
  "Dimensional Inspection Report",
  "First Article Inspection",
  "Material Certificate",
  "Third-party Testing",
  "Other",
] as const;

export const CERT_REPORT_OPTIONS = [
  "Material Certificate",
  "RoHS",
  "REACH",
  "ISO 9001",
  "Other",
] as const;

// ---- File upload constants ----

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB per file
export const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100 MB total
export const MAX_FILES = 10;

export const ACCEPTED_EXTENSIONS = [
  ".pdf",
  ".dxf",
  ".dwg",
  ".step",
  ".stp",
  ".igs",
  ".iges",
  ".jpg",
  ".jpeg",
  ".png",
  ".xlsx",
  ".zip",
] as const;

export const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "image/vnd.dxf",
  "application/x-step",
  "application/octet-stream", // covers STP, DWG, STEP, IGS, IGES
  "application/zip",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
] as const;

export const MAX_NOTES_LENGTH = 5000;

// ---- Form status ----

export type SubmitStatus = "idle" | "submitting" | "success" | "error";

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface SuccessData {
  reference: string;
  projectName: string;
  submittedAt: string; // ISO date string
  email: string;
  emailSent?: boolean;
  emailError?: string;
}

// ---- Dictionary shape (mirrors the JSON structure) ----

export interface RfqFormFieldDict {
  label: string;
  placeholder?: string;
  description?: string;
  options?: Record<string, string>; // key -> display label
}

export interface RfqFormDict {
  sectionTitle: string;
  sectionDescription: string;
  sections: {
    contact: { title: string };
    partProject: { title: string };
    material: { title: string };
    quantity: { title: string };
    delivery: { title: string };
    technical: { title: string; toggleShow: string; toggleHide: string };
    files: {
      title: string;
      description: string;
      formatsLabel: string;
      formats: string;
      dropText: string;
      browseText: string;
      limits: string;
      noDrawingLabel: string;
      requireNdaLabel: string;
    };
    privacy: {
      text: string;
      checkboxLabel: string;
    };
  };
  fields: {
    // Contact
    companyName: RfqFormFieldDict;
    contactName: RfqFormFieldDict;
    email: RfqFormFieldDict;
    phone: RfqFormFieldDict;
    countryRegion: RfqFormFieldDict;
    preferredMethod: RfqFormFieldDict;
    // Part & Project
    projectName: RfqFormFieldDict;
    partNumber: RfqFormFieldDict;
    drawingNumber: RfqFormFieldDict;
    drawingRevision: RfqFormFieldDict;
    productType: RfqFormFieldDict;
    drawingAvail: RfqFormFieldDict;
    // Material
    material: RfqFormFieldDict;
    materialGrade: RfqFormFieldDict;
    thickness: RfqFormFieldDict;
    thicknessUnit: RfqFormFieldDict;
    surfaceFinish: RfqFormFieldDict;
    surfaceFinishOther: RfqFormFieldDict;
    finishColour: RfqFormFieldDict;
    criticalToleranceReq: RfqFormFieldDict;
    assemblyRequired: RfqFormFieldDict;
    hardwareInserts: RfqFormFieldDict;
    printingMarking: RfqFormFieldDict;
    // Quantity
    prototypeQuantity: RfqFormFieldDict;
    productionQuantity: RfqFormFieldDict;
    estAnnualVol: RfqFormFieldDict;
    // Delivery
    requiredDate: RfqFormFieldDict;
    requiredDateType: RfqFormFieldDict;
    deliveryRegion: RfqFormFieldDict;
    postalCode: RfqFormFieldDict;
    shippingQuoteRequired: RfqFormFieldDict;
    // Technical
    approxDimensions: RfqFormFieldDict;
    operatingEnv: RfqFormFieldDict;
    protectionReq: RfqFormFieldDict;
    protectionReqOther: RfqFormFieldDict;
    inspectionReq: RfqFormFieldDict;
    certReport: RfqFormFieldDict;
    specialReqNotes: RfqFormFieldDict;
  };
  countryList: string[];
  submit: string;
  submitting: string;
  validation: Record<string, string>;
  success: {
    title: string;
    message: string;
    referenceLabel: string;
    projectLabel: string;
    dateLabel: string;
    emailLabel: string;
    newSubmission: string;
    emailWarningTitle: string;
    emailWarningDesc: string;
  };
  errorMessage: string;
  rateLimitError: string;
}

// ---- Server-side field input shape (after parsing FormData) ----

export interface RfqFields {
  // Contact
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  country_region: string;
  preferred_method: string;
  // Part & Project
  project_name: string;
  part_number: string;
  drawing_code: string;
  drawing_revision: string;
  product_type: string[];
  drawing_avail: string;
  // Material
  material: string;
  material_grade: string;
  thickness: string;
  thickness_unit: string;
  surface_finish: string;
  surface_finish_other: string;
  finish_color: string;
  critical_tolerance_req: string;
  assembly_required: string;
  hardware_inserts: string;
  printing_marking: string[];
  // Quantity
  prototype_quantity: number | null;
  production_quantity: number;
  est_annual_vol: string;
  // Delivery
  required_date: string;
  required_date_type: string;
  delivery_region: string;
  postal_code: string;
  shipping_quote_required: string;
  // Technical
  approx_dimensions: string;
  operating_env: string[];
  protection_req: string[];
  protection_req_other: string;
  inspection_req: string[];
  cert_report: string[];
  special_req_notes: string;
  // Additional options
  additional_options: string[];
  // Misc
  privacy_accepted: string;
}

export interface FileInfo {
  fileName: string;
  contentType: string;
  size: number;
}

export type ValidationResult =
  | { ok: true; data: { fields: RfqFields; files: FileInfo[] } }
  | { ok: false; errors: Record<string, string> };
