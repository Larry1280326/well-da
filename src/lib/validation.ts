import "server-only";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const MAX_NOTES_LENGTH = 5000;

const ACCEPTED_MIME_TYPES = new Set([
  "application/pdf",
  "image/vnd.dxf",
  "application/x-step",
  "application/octet-stream", // for STP, DWG, STEP, IGS, IGES, STL
  "application/zip",
  "application/x-rar-compressed",
  "application/vnd.rar",
  "image/png",
  "image/jpeg",
]);

// Also check by file extension since browser MIME types can be unreliable
const ACCEPTED_EXTENSIONS = new Set([
  ".pdf",
  ".dwg",
  ".dxf",
  ".step",
  ".stp",
  ".igs",
  ".iges",
  ".stl",
  ".jpg",
  ".jpeg",
  ".png",
  ".zip",
  ".rar",
]);

export interface RfqInput {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  project_name: string;
  material: string;
  quantity: number;
  tolerance: string;
  surface_finish: string;
  target_delivery_date: string;
  notes: string;
}

export interface FileInfo {
  buffer: Buffer;
  fileName: string;
  contentType: string;
  size: number;
}

export type ValidationResult =
  | { ok: true; data: { fields: RfqInput; file: FileInfo } }
  | { ok: false; errors: Record<string, string> };

function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot === -1) return "";
  return fileName.slice(lastDot).toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidDateFormat(date: string): boolean {
  if (!date) return true; // optional
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));
}

export function validateRfqInput(
  fields: Record<string, string>,
  file: File | null,
): ValidationResult {
  const errors: Record<string, string> = {};

  // Required text fields
  const requiredFields = [
    { key: "company_name", label: "companyName", max: 255 },
    { key: "contact_name", label: "contactName", max: 255 },
    { key: "email", label: "email", max: 255 },
    { key: "phone", label: "phone", max: 50 },
    { key: "project_name", label: "projectName", max: 255 },
    { key: "material", label: "material", max: 100 },
  ];

  for (const { key, label, max } of requiredFields) {
    const value = (fields[key] ?? "").trim();
    if (!value) {
      errors[key] = label;
    } else if (value.length > max) {
      errors[key] = label;
    }
  }

  // Email format
  const email = (fields.email ?? "").trim();
  if (email && !isValidEmail(email)) {
    errors.email = "emailInvalid";
  }

  // Phone (already validated as required above; extract for return)
  const phone = (fields.phone ?? "").trim();

  // Quantity
  const quantityRaw = (fields.quantity ?? "").trim();
  const quantity = parseInt(quantityRaw, 10);
  if (!quantityRaw || isNaN(quantity) || quantity < 1) {
    errors.quantity = "quantity";
  }

  // Optional fields max lengths
  const tolerance = (fields.tolerance ?? "").trim();
  if (tolerance.length > 100) errors.tolerance = "tolerance";

  const surfaceFinish = (fields.surface_finish ?? "").trim();
  if (surfaceFinish.length > 100) errors.surface_finish = "surfaceFinish";

  // Target delivery date (optional, valid date)
  const deliveryDate = (fields.target_delivery_date ?? "").trim();
  if (deliveryDate && !isValidDateFormat(deliveryDate)) {
    errors.target_delivery_date = "targetDeliveryDate";
  }

  // Notes (optional, max length)
  const notes = (fields.notes ?? "").trim();
  if (notes.length > MAX_NOTES_LENGTH) {
    errors.notes = "notes";
  }

  // File validation
  if (!file || file.size === 0) {
    errors.file = "fileRequired";
  } else if (file.size > MAX_FILE_SIZE) {
    errors.file = "fileSize";
  } else {
    const ext = getFileExtension(file.name);
    if (!ACCEPTED_EXTENSIONS.has(ext)) {
      errors.file = "fileType";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      fields: {
        company_name: (fields.company_name ?? "").trim(),
        contact_name: (fields.contact_name ?? "").trim(),
        email,
        phone,
        project_name: (fields.project_name ?? "").trim(),
        material: (fields.material ?? "").trim(),
        quantity,
        tolerance,
        surface_finish: surfaceFinish,
        target_delivery_date: deliveryDate,
        notes,
      },
      file: {
        buffer: Buffer.alloc(0), // will be filled by route handler
        fileName: file!.name,
        contentType: file!.type || "application/octet-stream",
        size: file!.size,
      },
    },
  };
}
