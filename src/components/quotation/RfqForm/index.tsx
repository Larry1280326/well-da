"use client";

import { useState, useRef, type FormEvent } from "react";
import { Stack, Alert, Title, Text } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import type { RfqFormDict, FormErrors, SubmitStatus, SuccessData } from "@/lib/types/rfq";
import {
  ACCEPTED_EXTENSIONS,
  MAX_FILE_SIZE,
  MAX_TOTAL_SIZE,
  MAX_FILES,
  MAX_NOTES_LENGTH,
} from "@/lib/types/rfq";
import { ContactSection } from "./ContactSection";
import { PartProjectSection } from "./PartProjectSection";
import { MaterialSection } from "./MaterialSection";
import { QuantitySection } from "./QuantitySection";
import { DeliverySection } from "./DeliverySection";
import { TechnicalSection } from "./TechnicalSection";
import { FileUploadSection } from "./FileUploadSection";
import { PrivacySection } from "./PrivacySection";
import { SubmitSection } from "./SubmitSection";
import { SuccessPanel } from "./SuccessPanel";
import { parseQuantity, sourcePage } from "@/lib/rfq-source";
import { trackRfqSuccess } from "@/lib/rfq-measurement";

// ---- Validation helpers ----

function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot === -1) return "";
  return fileName.slice(lastDot).toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function RfqForm({ dict, lang }: { dict: RfqFormDict; lang: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  // ---- State ----
  const [controlledValues, setControlledValues] = useState<Record<string, string>>({});
  const [controlledArrays, setControlledArrays] = useState<Record<string, string[]>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [additionalOptions, setAdditionalOptions] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [emailWarning, setEmailWarning] = useState<string>("");

  const isSubmitting = status === "submitting";

  function focusFirstError() {
    requestAnimationFrame(() => {
      const first = formRef.current?.querySelector<HTMLElement>('input[data-error], [data-error] input, [aria-invalid="true"]');
      first?.focus({ preventScroll: true });
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  // ---- Controlled value handlers ----
  function handleValueChange(key: string, value: string) {
    setControlledValues((prev) => ({ ...prev, [key]: value }));
    // Clear error for this field on change
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function handleArrayChange(key: string, value: string[]) {
    setControlledArrays((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  // ---- Client-side validation ----
  function validateClient(): FormErrors {
    const form = formRef.current;
    if (!form) return {};

    const errs: FormErrors = {};
    const formData = new FormData(form);

    const get = (name: string) => (formData.get(name) as string)?.trim() ?? "";
    const v = controlledValues;

    // Contact (required: company_name, contact_name, email, country_region)
    if (!get("company_name")) errs.company_name = dict.validation.companyName;
    if (!get("contact_name")) errs.contact_name = dict.validation.contactName;
    const email = get("email");
    if (!email) errs.email = dict.validation.email;
    else if (!isValidEmail(email)) errs.email = dict.validation.emailInvalid;
    if (!v.country_region) errs.country_region = dict.validation.countryRegion;

    // Part & Project (required: project_name, drawing_avail)
    if (!get("project_name")) errs.project_name = dict.validation.projectName;
    if (!v.drawing_avail) errs.drawing_avail = dict.validation.drawingAvail;

    // Material (required: material)
    if (!v.material) errs.material = dict.validation.material;

    // Quantity (required: production_quantity must be positive integer)
    const prodQtyRaw = get("production_quantity");
    if (!prodQtyRaw) {
      errs.production_quantity = dict.validation.productionQuantity;
    } else {
      if (parseQuantity(prodQtyRaw) === null) {
        errs.production_quantity = dict.validation.productionQuantityInvalid;
      }
    }

    // Delivery (required: delivery_region)
    if (!v.delivery_region) errs.delivery_region = dict.validation.deliveryRegion;

    // Optional field length checks
    const phone = get("phone");
    if (phone.length > 100) errs.phone = dict.validation.phone;

    const partNumber = get("part_number");
    if (partNumber.length > 255) errs.part_number = dict.validation.partNumber;

    const drawingCode = get("drawing_code");
    if (drawingCode.length > 255) errs.drawing_code = dict.validation.drawingNumber;

    const drawingRevision = get("drawing_revision");
    if (drawingRevision.length > 100) errs.drawing_revision = dict.validation.drawingRevision;

    const materialGrade = get("material_grade");
    if (materialGrade.length > 255) errs.material_grade = dict.validation.materialGrade;

    const thicknessRaw = get("thickness");
    if (thicknessRaw) {
      const n = Number(thicknessRaw);
      if (!Number.isFinite(n) || n <= 0) errs.thickness = dict.validation.thickness;
    }

    const surfaceFinishOther = get("surface_finish_other");
    if (surfaceFinishOther.length > 255) errs.surface_finish_other = dict.validation.surfaceFinishOther;

    const finishColor = get("finish_color");
    if (finishColor.length > 255) errs.finish_color = dict.validation.finishColour;

    const tolerance = get("critical_tolerance_req");
    if (tolerance.length > 2000) errs.critical_tolerance_req = dict.validation.criticalToleranceReq;

    const hardware = get("hardware_inserts");
    if (hardware.length > 2000) errs.hardware_inserts = dict.validation.hardwareInserts;

    const protoQty = get("prototype_quantity");
    if (protoQty) {
      if (parseQuantity(protoQty) === null)
        errs.prototype_quantity = dict.validation.prototypeQuantityInvalid;
    }

    const estVol = get("est_annual_vol");
    if (estVol.length > 255) errs.est_annual_vol = dict.validation.estAnnualVol;

    const requiredDate = get("required_date");
    if (requiredDate && !/^\d{4}-\d{2}-\d{2}$/.test(requiredDate))
      errs.required_date = dict.validation.requiredDate;

    const postalCode = get("postal_code");
    if (postalCode.length > 100) errs.postal_code = dict.validation.postalCode;

    const approxDims = get("approx_dimensions");
    if (approxDims.length > 255) errs.approx_dimensions = dict.validation.approxDimensions;

    const protOther = get("protection_req_other");
    if (protOther.length > 255) errs.protection_req_other = dict.validation.protectionReqOther;

    const notes = get("special_req_notes");
    if (notes.length > MAX_NOTES_LENGTH) errs.special_req_notes = dict.validation.notes;

    // Files
    const hasNoDrawing = additionalOptions.includes("NO_DRAWING");
    if (!hasNoDrawing && files.length === 0) {
      errs.files = dict.validation.fileRequired;
    }
    if (files.length > MAX_FILES) {
      errs.files = dict.validation.tooManyFiles;
    }
    const totalSize = files.reduce((s, f) => s + f.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      errs.files = dict.validation.totalSizeExceeded;
    }
    for (const f of files) {
      if (f.size > MAX_FILE_SIZE) {
        errs.files = dict.validation.fileSize;
        break;
      }
      if (!(ACCEPTED_EXTENSIONS as readonly string[]).includes(getFileExtension(f.name))) {
        errs.files = dict.validation.fileType;
        break;
      }
    }

    // Privacy
    if (!get("privacy_accepted")) {
      errs.privacy_accepted = dict.validation.privacyRequired;
    }

    return errs;
  }

  // ---- Submit handler ----
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;
    setErrors({});

    const clientErrors = validateClient();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      // Scroll to first error
      focusFirstError();
      return;
    }

    setStatus("submitting");

    try {
      const form = formRef.current!;
      const formData = new FormData(form);

      // Append controlled single values
      for (const [key, value] of Object.entries(controlledValues)) {
        if (value) formData.set(key, value);
      }

      // Append controlled array values as JSON
      for (const [key, value] of Object.entries(controlledArrays)) {
        if (value.length > 0) {
          formData.set(key, JSON.stringify(value));
        }
      }

      // Append additional options as JSON
      if (additionalOptions.length > 0) {
        formData.append("additional_options", JSON.stringify(additionalOptions));
      }

      // Append files (remove any pre-existing 'files' entries first, then add all)
      formData.delete("files");
      for (const f of files) {
        formData.append("files", f);
      }

      const source = sourcePage(new URLSearchParams(window.location.search).get("source")) ?? `/${lang}/quotation`;
      formData.set("source_page", source);
      for (const name of ["production_quantity", "prototype_quantity"]) {
        const raw = formData.get(name)?.toString() ?? "";
        if (raw) formData.set(name, String(parseQuantity(raw)));
      }

      const res = await fetch("/api/rfq", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => null);
      if (!data) throw new Error(res.status === 413 ? dict.validation.totalSizeExceeded : dict.errorMessage);

      if (!res.ok) {
        if (res.status === 400 && data.errors) {
          // Map server error keys to display messages
          const mappedErrors: FormErrors = {};
          const validationDict = dict.validation as Record<string, string>;
          for (const [key, errorKey] of Object.entries(data.errors)) {
            mappedErrors[key] = validationDict[errorKey as string] ?? (errorKey as string);
          }
          setErrors(mappedErrors);
          setStatus("idle");
          focusFirstError();
          return;
        }
        if (res.status === 429) {
          setErrorMessage(dict.rateLimitError);
          setStatus("error");
          return;
        }
        throw new Error(res.status === 413 ? dict.validation.totalSizeExceeded : dict.errorMessage);
      }

      // A transport success or honeypot response is not proof of persistence.
      if (data.success !== true || data.persisted !== true || !data.data?.reference) throw new Error(dict.errorMessage);
      trackRfqSuccess(source, lang);
      // Success
      setSuccessData(data.data ?? {
        reference: data.reference,
        projectName: controlledValues.project_name || formData.get("project_name")?.toString() || "",
        submittedAt: new Date().toISOString(),
        email: formData.get("email")?.toString() || "",
      });

      // Check if confirmation email failed
      if (data.data?.emailSent === false && data.data?.emailError) {
        setEmailWarning(data.data.emailError);
      }

      setStatus("success");
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : dict.errorMessage);
      setStatus("error");
    }
  }

  function handleReset() {
    setStatus("idle");
    setErrors({});
    setFiles([]);
    setAdditionalOptions([]);
    setControlledValues({});
    setControlledArrays({});
    setSuccessData(null);
    setErrorMessage("");
    setEmailWarning("");
    formRef.current?.reset();
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  // ---- If success, show success panel ----
  if (status === "success" && successData) {
    return <SuccessPanel dict={dict} data={successData} emailWarning={emailWarning || undefined} onReset={handleReset} />;
  }

  // ---- Form ----
  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate suppressHydrationWarning>
      <input type="hidden" name="lang" value={lang} />
      <Stack gap="xl">
        <div>
          <Title order={2} mb="sm">{dict.sectionTitle}</Title>
          <Text>{dict.sectionDescription}</Text>
        </div>
        <ContactSection
          dict={dict}
          disabled={isSubmitting}
          errors={errors}
          controlledValues={controlledValues}
          onValueChange={handleValueChange}
        />
        <PartProjectSection
          dict={dict}
          disabled={isSubmitting}
          errors={errors}
          controlledValues={controlledValues}
          controlledArrays={controlledArrays}
          onValueChange={handleValueChange}
          onArrayChange={handleArrayChange}
        />
        <MaterialSection
          dict={dict}
          disabled={isSubmitting}
          errors={errors}
          controlledValues={controlledValues}
          controlledArrays={controlledArrays}
          onValueChange={handleValueChange}
          onArrayChange={handleArrayChange}
        />
        <QuantitySection
          dict={dict}
          disabled={isSubmitting}
          errors={errors}
        />
        <DeliverySection
          dict={dict}
          disabled={isSubmitting}
          errors={errors}
          controlledValues={controlledValues}
          onValueChange={handleValueChange}
        />
        <TechnicalSection
          dict={dict}
          disabled={isSubmitting}
          errors={errors}
          controlledValues={controlledValues}
          controlledArrays={controlledArrays}
          onValueChange={handleValueChange}
          onArrayChange={handleArrayChange}
        />
        <FileUploadSection
          dict={dict}
          disabled={isSubmitting}
          errors={errors}
          files={files}
          additionalOptions={additionalOptions}
          onFilesChange={setFiles}
          onAdditionalOptionsChange={setAdditionalOptions}
        />
        <PrivacySection
          dict={dict}
          disabled={isSubmitting}
          error={errors.privacy_accepted}
        />
        <SubmitSection dict={dict} isSubmitting={isSubmitting} />

        {/* Error Alert */}
        {status === "error" && (
          <Alert
            variant="light"
            color="red"
            title={lang === "zh" ? "未能提交" : "Submission failed"}
            icon={<IconAlertCircle size={20} />}
            withCloseButton
            onClose={() => { setStatus("idle"); setErrorMessage(""); }}
          >
            {errorMessage || dict.errorMessage}
          </Alert>
        )}
      </Stack>
    </form>
  );
}
