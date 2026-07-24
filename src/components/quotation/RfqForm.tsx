"use client";

import { useState, useRef, type FormEvent } from "react";
import {
  Alert,
  Button,
  FileInput,
  Input,
  NumberInput,
  Paper,

  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCheck,
  IconFile,
  IconUpload,
} from "@tabler/icons-react";

export interface RfqFormDict {
  sectionTitle: string;
  sectionDescription: string;
  contactSection: string;
  projectSection: string;
  fileSection: string;
  companyName: string;
  companyNamePlaceholder: string;
  contactName: string;
  contactNamePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  phone: string;
  phonePlaceholder: string;
  projectName: string;
  projectNamePlaceholder: string;
  material: string;
  materialPlaceholder: string;
  quantity: string;
  tolerance: string;
  tolerancePlaceholder: string;
  surfaceFinish: string;
  surfaceFinishPlaceholder: string;
  targetDeliveryDate: string;
  notes: string;
  notesPlaceholder: string;
  fileUpload: string;
  fileUploadDescription: string;
  fileUploadPlaceholder: string;
  submit: string;
  submitting: string;
  successTitle: string;
  successMessage: string;
  errorMessage: string;
  validation: {
    companyName: string;
    contactName: string;
    email: string;
    projectName: string;
    material: string;
    quantity: string;
    tolerance: string;
    surfaceFinish: string;
    targetDeliveryDate: string;
    notes: string;
    fileRequired: string;
    fileSize: string;
    fileType: string;
    phone: string;
  };
}

interface FormErrors {
  [key: string]: string | undefined;
}

type SubmitStatus = "idle" | "submitting" | "success" | "error";

// Constants mirrored from server validation
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const MAX_NOTES_LENGTH = 5000;
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

function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot === -1) return "";
  return fileName.slice(lastDot).toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function RfqForm({ dict }: { dict: RfqFormDict }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errors, setErrors] = useState<FormErrors>({});
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  function validateClient(): FormErrors {
    const form = formRef.current;
    if (!form) return {};

    const errs: FormErrors = {};
    const formData = new FormData(form);

    const requiredFields = [
      { key: "company_name", msg: dict.validation.companyName },
      { key: "contact_name", msg: dict.validation.contactName },
      { key: "phone", msg: dict.validation.phone },
      { key: "project_name", msg: dict.validation.projectName },
      { key: "material", msg: dict.validation.material },
    ];

    for (const { key, msg } of requiredFields) {
      if (!(formData.get(key) as string)?.trim()) {
        errs[key] = msg;
      }
    }

    // Email
    const email = (formData.get("email") as string)?.trim() ?? "";
    if (!email) {
      errs.email = dict.validation.email;
    } else if (!isValidEmail(email)) {
      errs.email = dict.validation.email;
    }

    // Phone (max 50)
    const phone = (formData.get("phone") as string)?.trim() ?? "";
    if (phone.length > 50) {
      errs.phone = dict.validation.phone;
    }

    // Quantity
    const qty = parseInt((formData.get("quantity") as string) ?? "", 10);
    if (isNaN(qty) || qty < 1) {
      errs.quantity = dict.validation.quantity;
    }

    // Tolerance (optional, max 100)
    const tolerance = (formData.get("tolerance") as string)?.trim() ?? "";
    if (tolerance.length > 100) {
      errs.tolerance = dict.validation.tolerance;
    }

    // Surface finish (optional, max 100)
    const surfaceFinish = (formData.get("surface_finish") as string)?.trim() ?? "";
    if (surfaceFinish.length > 100) {
      errs.surfaceFinish = dict.validation.surfaceFinish;
    }

    // Notes (optional, max 5000)
    const notes = (formData.get("notes") as string)?.trim() ?? "";
    if (notes.length > MAX_NOTES_LENGTH) {
      errs.notes = dict.validation.notes;
    }

    // File
    if (!file || file.size === 0) {
      setFileError(dict.validation.fileRequired);
      errs.file = dict.validation.fileRequired;
    } else if (file.size > MAX_FILE_SIZE) {
      setFileError(dict.validation.fileSize);
      errs.file = dict.validation.fileSize;
    } else if (!ACCEPTED_EXTENSIONS.has(getFileExtension(file.name))) {
      setFileError(dict.validation.fileType);
      errs.file = dict.validation.fileType;
    } else {
      setFileError(null);
    }

    return errs;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setFileError(null);

    const clientErrors = validateClient();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setStatus("submitting");

    try {
      const form = formRef.current!;
      const formData = new FormData(form);

      // Append the file from state (FileInput works via state, not form)
      if (file) {
        formData.delete("file");
        formData.append("file", file);
      }

      const res = await fetch("/api/rfq", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400 && data.errors) {
          // Map server error keys to display messages
          const mappedErrors: FormErrors = {};
          for (const [key, errorKey] of Object.entries(data.errors)) {
            const validationDict = dict.validation as Record<string, string>;
            mappedErrors[key] = validationDict[errorKey as string] ?? (errorKey as string);
          }
          setErrors(mappedErrors);
          setStatus("idle");
          return;
        }
        throw new Error(data.error || dict.errorMessage);
      }

      // Success
      setStatus("success");
      form.reset();
      setFile(null);
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch {
      setStatus("error");
    }
  }

  function handleFileChange(newFile: File | null) {
    setFile(newFile);

    if (!newFile || newFile.size === 0) {
      setFileError(dict.validation.fileRequired);
    } else if (newFile.size > MAX_FILE_SIZE) {
      setFileError(dict.validation.fileSize);
    } else if (!ACCEPTED_EXTENSIONS.has(getFileExtension(newFile.name))) {
      setFileError(dict.validation.fileType);
    } else {
      setFileError(null);
    }
  }

  const isSubmitting = status === "submitting";

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate suppressHydrationWarning>
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Title order={2} mb="xs">
            {dict.sectionTitle}
          </Title>
          <Text c="dimmed">{dict.sectionDescription}</Text>
        </div>

        {/* Section 1: Contact Information */}
        <Paper p="xl" radius="md" withBorder>
          <Title order={3} mb="lg">
            {dict.contactSection}
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput
              name="company_name"
              label={dict.companyName}
              placeholder={dict.companyNamePlaceholder}
              required
              disabled={isSubmitting}
              error={errors.company_name}
            />
            <TextInput
              name="contact_name"
              label={dict.contactName}
              placeholder={dict.contactNamePlaceholder}
              required
              disabled={isSubmitting}
              error={errors.contact_name}
            />
            <TextInput
              name="email"
              type="email"
              label={dict.email}
              placeholder={dict.emailPlaceholder}
              required
              disabled={isSubmitting}
              error={errors.email}
            />
            <TextInput
              name="phone"
              type="tel"
              label={dict.phone}
              placeholder={dict.phonePlaceholder}
              required
              disabled={isSubmitting}
              error={errors.phone}
            />
          </SimpleGrid>
        </Paper>

        {/* Section 2: Project Specifications */}
        <Paper p="xl" radius="md" withBorder>
          <Title order={3} mb="lg">
            {dict.projectSection}
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput
              name="project_name"
              label={dict.projectName}
              placeholder={dict.projectNamePlaceholder}
              required
              disabled={isSubmitting}
              error={errors.project_name}
            />
            <TextInput
              name="material"
              label={dict.material}
              placeholder={dict.materialPlaceholder}
              required
              disabled={isSubmitting}
              error={errors.material}
            />
            <NumberInput
              name="quantity"
              label={dict.quantity}
              placeholder="1"
              min={1}
              required
              disabled={isSubmitting}
              error={errors.quantity}
            />
            <TextInput
              name="tolerance"
              label={dict.tolerance}
              placeholder={dict.tolerancePlaceholder}
              disabled={isSubmitting}
              error={errors.tolerance}
            />
            <TextInput
              name="surface_finish"
              label={dict.surfaceFinish}
              placeholder={dict.surfaceFinishPlaceholder}
              disabled={isSubmitting}
              error={errors.surfaceFinish}
            />
            <Input.Wrapper label={dict.targetDeliveryDate} error={errors.target_delivery_date}>
              <Input
                component="input"
                type="date"
                name="target_delivery_date"
                disabled={isSubmitting}
              />
            </Input.Wrapper>
          </SimpleGrid>
          <Textarea
            name="notes"
            label={dict.notes}
            placeholder={dict.notesPlaceholder}
            mt="md"
            minRows={3}
            maxRows={6}
            maxLength={MAX_NOTES_LENGTH}
            disabled={isSubmitting}
            error={errors.notes}
          />
        </Paper>

        {/* Section 3: File Upload */}
        <Paper p="xl" radius="md" withBorder>
          <Title order={3} mb="xs">
            {dict.fileSection}
          </Title>
          <Text size="sm" c="dimmed" mb="md">
            {dict.fileUploadDescription}
          </Text>
          <FileInput
            name="file"
            label={dict.fileUpload}
            placeholder={dict.fileUploadPlaceholder}
            leftSection={<IconUpload size={18} stroke={1.5} />}
            accept=".pdf,.dwg,.dxf,.step,.stp,.igs,.iges,.stl,.jpg,.jpeg,.png,.zip,.rar"
            value={file}
            onChange={handleFileChange}
            disabled={isSubmitting}
            error={fileError}
            clearable
          />
        </Paper>

        {/* Submit Button */}
        <div>
          <Button
            type="submit"
            size="lg"
            loading={isSubmitting}
            loaderProps={{ children: dict.submitting }}
          >
            {isSubmitting ? dict.submitting : dict.submit}
          </Button>
        </div>

        {/* Success Alert */}
        {status === "success" && (
          <Alert
            variant="light"
            color="green"
            title={dict.successTitle}
            icon={<IconCheck size={20} />}
            withCloseButton
            onClose={() => setStatus("idle")}
          >
            {dict.successMessage}
          </Alert>
        )}

        {/* Error Alert */}
        {status === "error" && (
          <Alert
            variant="light"
            color="red"
            title="Error"
            icon={<IconAlertCircle size={20} />}
            withCloseButton
            onClose={() => setStatus("idle")}
          >
            {dict.errorMessage}
          </Alert>
        )}
      </Stack>
    </form>
  );
}
