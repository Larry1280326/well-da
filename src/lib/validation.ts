import "server-only";
import {
  type RfqFields,
  type FileInfo,
  type ValidationResult,
  CONTACT_METHODS,
  PRODUCT_TYPES,
  DRAWING_AVAIL,
  MATERIALS,
  THICKNESS_UNITS,
  ASSEMBLY_REQ,
  PRINTING_MARKING_OPTIONS,
  REQUIRED_DATE_TYPES,
  SHIPPING_QUOTE_REQ,
  ADDITIONAL_OPTIONS,
  SURFACE_FINISH_OPTIONS,
  OPERATING_ENV_OPTIONS,
  PROTECTION_REQ_OPTIONS,
  INSPECTION_REQ_OPTIONS,
  CERT_REPORT_OPTIONS,
  MAX_FILE_SIZE,
  MAX_TOTAL_SIZE,
  MAX_FILES,
  MAX_NOTES_LENGTH,
  ACCEPTED_EXTENSIONS,
} from "@/lib/types/rfq";

// ---- Helpers ----

function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot === -1) return "";
  return fileName.slice(lastDot).toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidDate(date: string): boolean {
  if (!date) return true; // optional
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));
}

function parseJsonArray(raw: string): string[] {
  if (!raw || !raw.trim()) return [];
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((v): v is string => typeof v === "string");
}

function whitelist(value: string, allowed: readonly string[]): boolean {
  return allowed.includes(value);
}

function whitelistArray(
  values: string[],
  allowed: readonly string[],
): boolean {
  return values.every((v) => allowed.includes(v));
}

function clamp<T extends string>(
  values: string[],
  allowed: readonly T[],
): T[] {
  return values.filter((v): v is T =>
    (allowed as readonly string[]).includes(v),
  );
}

// ---- Main validation ----

export function validateRfqInput(
  rawFields: Record<string, string>,
  files: FileInfo[],
): ValidationResult {
  const errors: Record<string, string> = {};

  // ---------- Contact ----------
  const company_name = (rawFields.company_name ?? "").trim();
  if (!company_name) errors.company_name = "companyName";
  else if (company_name.length > 255) errors.company_name = "companyName";

  const contact_name = (rawFields.contact_name ?? "").trim();
  if (!contact_name) errors.contact_name = "contactName";
  else if (contact_name.length > 255) errors.contact_name = "contactName";

  const email = (rawFields.email ?? "").trim();
  if (!email) errors.email = "email";
  else if (!isValidEmail(email)) errors.email = "emailInvalid";
  else if (email.length > 255) errors.email = "email";

  const phone = (rawFields.phone ?? "").trim();
  if (phone.length > 100) errors.phone = "phone";

  const country_region = (rawFields.country_region ?? "").trim();
  if (!country_region) errors.country_region = "countryRegion";
  else if (country_region.length > 255) errors.country_region = "countryRegion";

  const preferred_method = (rawFields.preferred_method ?? "").trim();
  // Optional; if provided must be valid
  if (
    preferred_method &&
    !whitelist(preferred_method, CONTACT_METHODS)
  ) {
    errors.preferred_method = "preferredMethod";
  }

  // ---------- Part & Project ----------
  const project_name = (rawFields.project_name ?? "").trim();
  if (!project_name) errors.project_name = "projectName";
  else if (project_name.length > 255) errors.project_name = "projectName";

  const part_number = (rawFields.part_number ?? "").trim();
  if (part_number.length > 255) errors.part_number = "partNumber";

  const drawing_code = (rawFields.drawing_code ?? "").trim();
  if (drawing_code.length > 255) errors.drawing_code = "drawingNumber";

  const drawing_revision = (rawFields.drawing_revision ?? "").trim();
  if (drawing_revision.length > 100) errors.drawing_revision = "drawingRevision";

  let product_type: string[] = [];
  try {
    product_type = parseJsonArray(rawFields.product_type ?? "");
    if (!whitelistArray(product_type, PRODUCT_TYPES))
      errors.product_type = "productType";
  } catch {
    errors.product_type = "productType";
  }

  const drawing_avail = (rawFields.drawing_avail ?? "").trim();
  if (!drawing_avail) errors.drawing_avail = "drawingAvail";
  else if (!whitelist(drawing_avail, DRAWING_AVAIL))
    errors.drawing_avail = "drawingAvail";

  // ---------- Material ----------
  const material = (rawFields.material ?? "").trim();
  if (!material) errors.material = "material";
  else if (!whitelist(material, MATERIALS)) errors.material = "material";

  const material_grade = (rawFields.material_grade ?? "").trim();
  if (material_grade.length > 255) errors.material_grade = "materialGrade";

  const thickness = (rawFields.thickness ?? "").trim();
  if (thickness) {
    const n = parseFloat(thickness);
    if (isNaN(n) || n <= 0) errors.thickness = "thickness";
  }

  const thickness_unit = (rawFields.thickness_unit ?? "").trim();
  if (
    thickness_unit &&
    !whitelist(thickness_unit, THICKNESS_UNITS)
  ) {
    errors.thickness_unit = "thicknessUnit";
  }

  const surface_finish = (rawFields.surface_finish ?? "").trim();
  if (surface_finish.length > 255) errors.surface_finish = "surfaceFinish";

  const surface_finish_other = (rawFields.surface_finish_other ?? "").trim();
  if (surface_finish_other.length > 255)
    errors.surface_finish_other = "surfaceFinishOther";

  const finish_color = (rawFields.finish_color ?? "").trim();
  if (finish_color.length > 255) errors.finish_color = "finishColour";

  const critical_tolerance_req = (
    rawFields.critical_tolerance_req ?? ""
  ).trim();
  if (critical_tolerance_req.length > 2000)
    errors.critical_tolerance_req = "criticalToleranceReq";

  const assembly_required = (rawFields.assembly_required ?? "").trim();
  if (
    assembly_required &&
    !whitelist(assembly_required, ASSEMBLY_REQ)
  ) {
    errors.assembly_required = "assemblyRequired";
  }

  const hardware_inserts = (rawFields.hardware_inserts ?? "").trim();
  if (hardware_inserts.length > 2000)
    errors.hardware_inserts = "hardwareInserts";

  let printing_marking: string[] = [];
  try {
    printing_marking = parseJsonArray(
      rawFields.printing_marking ?? "",
    ).filter((v) =>
      (PRINTING_MARKING_OPTIONS as readonly string[]).includes(v),
    );
  } catch {
    // ignore — already defaulted to []
  }

  // ---------- Quantity ----------
  const prototype_quantity = (rawFields.prototype_quantity ?? "").trim();
  if (prototype_quantity && prototype_quantity.length > 255)
    errors.prototype_quantity = "prototypeQuantity";

  const production_quantity = (rawFields.production_quantity ?? "").trim();
  if (!production_quantity) errors.production_quantity = "productionQuantity";
  else if (production_quantity.length > 255)
    errors.production_quantity = "productionQuantity";

  const est_annual_vol = (rawFields.est_annual_vol ?? "").trim();
  if (est_annual_vol && est_annual_vol.length > 255)
    errors.est_annual_vol = "estAnnualVol";

  // ---------- Delivery ----------
  const required_date = (rawFields.required_date ?? "").trim();
  if (required_date && !isValidDate(required_date))
    errors.required_date = "requiredDate";

  const required_date_type = (rawFields.required_date_type ?? "").trim();
  if (
    required_date_type &&
    !whitelist(required_date_type, REQUIRED_DATE_TYPES)
  ) {
    errors.required_date_type = "requiredDateType";
  }

  const delivery_region = (rawFields.delivery_region ?? "").trim();
  if (!delivery_region) errors.delivery_region = "deliveryRegion";
  else if (delivery_region.length > 255) errors.delivery_region = "deliveryRegion";

  const postal_code = (rawFields.postal_code ?? "").trim();
  if (postal_code.length > 100) errors.postal_code = "postalCode";

  const shipping_quote_required = (
    rawFields.shipping_quote_required ?? ""
  ).trim();
  if (
    shipping_quote_required &&
    !whitelist(shipping_quote_required, SHIPPING_QUOTE_REQ)
  ) {
    errors.shipping_quote_required = "shippingQuoteRequired";
  }

  // ---------- Technical (all optional) ----------
  const approx_dimensions = (rawFields.approx_dimensions ?? "").trim();
  if (approx_dimensions.length > 255)
    errors.approx_dimensions = "approxDimensions";

  let operating_env: string[] = [];
  try {
    operating_env = clamp(
      parseJsonArray(rawFields.operating_env ?? ""),
      OPERATING_ENV_OPTIONS,
    );
  } catch {
    // ignore
  }

  let protection_req: string[] = [];
  try {
    protection_req = clamp(
      parseJsonArray(rawFields.protection_req ?? ""),
      PROTECTION_REQ_OPTIONS,
    );
  } catch {
    // ignore
  }

  const protection_req_other = (rawFields.protection_req_other ?? "").trim();
  if (protection_req_other.length > 255)
    errors.protection_req_other = "protectionReqOther";

  let inspection_req: string[] = [];
  try {
    inspection_req = clamp(
      parseJsonArray(rawFields.inspection_req ?? ""),
      INSPECTION_REQ_OPTIONS,
    );
  } catch {
    // ignore
  }

  let cert_report: string[] = [];
  try {
    cert_report = clamp(
      parseJsonArray(rawFields.cert_report ?? ""),
      CERT_REPORT_OPTIONS,
    );
  } catch {
    // ignore
  }

  const special_req_notes = (rawFields.special_req_notes ?? "").trim();
  if (special_req_notes.length > MAX_NOTES_LENGTH)
    errors.special_req_notes = "notes";

  // ---------- Additional options ----------
  let additional_options: string[] = [];
  try {
    additional_options = parseJsonArray(
      rawFields.additional_options ?? "",
    ).filter((v) =>
      (ADDITIONAL_OPTIONS as readonly string[]).includes(v),
    );
  } catch {
    // ignore
  }

  // ---------- Privacy ----------
  const privacy_accepted = (rawFields.privacy_accepted ?? "").trim();
  if (!privacy_accepted) errors.privacy_accepted = "privacyRequired";

  // ---------- File validation ----------
  const hasNoDrawing = additional_options.includes("NO_DRAWING");

  if (!hasNoDrawing && files.length === 0) {
    errors.files = "fileRequired";
  }

  if (files.length > MAX_FILES) {
    errors.files = "tooManyFiles";
  }

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  if (totalSize > MAX_TOTAL_SIZE) {
    errors.files = "totalSizeExceeded";
  }

  for (const f of files) {
    if (f.size > MAX_FILE_SIZE) {
      errors.files = "fileSize";
      break;
    }
    const ext = getFileExtension(f.fileName);
    if (!(ACCEPTED_EXTENSIONS as readonly string[]).includes(ext)) {
      errors.files = "fileType";
      break;
    }
  }

  // ---------- Return ----------
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  // Build the clean fields object
  const fields: RfqFields = {
    company_name,
    contact_name,
    email,
    phone,
    country_region,
    preferred_method,
    project_name,
    part_number,
    drawing_code,
    drawing_revision,
    product_type,
    drawing_avail,
    material,
    material_grade,
    thickness,
    thickness_unit,
    surface_finish,
    surface_finish_other,
    finish_color,
    critical_tolerance_req,
    assembly_required,
    hardware_inserts,
    printing_marking,
    prototype_quantity,
    production_quantity,
    est_annual_vol,
    required_date,
    required_date_type,
    delivery_region,
    postal_code,
    shipping_quote_required,
    approx_dimensions,
    operating_env,
    protection_req,
    protection_req_other,
    inspection_req,
    cert_report,
    special_req_notes,
    additional_options,
    privacy_accepted,
  };

  return { ok: true, data: { fields, files } };
}
