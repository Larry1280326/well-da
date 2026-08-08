"use client";

import { useEffect, useState } from "react";
import {
  Title,
  Card,
  Group,
  Stack,
  Text,
  Badge,
  Loader,
  Center,
  Alert,
  Anchor,
  Grid,
  Divider,
  Select,
} from "@mantine/core";
import { IconAlertCircle, IconArrowLeft, IconDownload } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { RFQ_STATUSES, type AdminRole } from "@/lib/auth/types";

interface FileRecord {
  id: number;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size_bytes: number;
  additional_option: string[] | null;
}

interface RfqDetailData {
  id: number;
  status: string;
  created_at: string;
  confirmation_email_sent: boolean;
  // Customer (owner/root only)
  company_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  country_region?: string;
  preferred_method?: string;
  // Project
  project_name: string;
  part_number: string;
  drawing_code: string;
  drawing_revision: string;
  product_type: string[] | null;
  drawing_avail: string;
  // Material
  material: string;
  material_grade: string;
  thickness: number;
  thickness_unit: string;
  surface_finish: string;
  finish_color: string;
  critical_tolerance_req: string;
  assembly_required: string;
  hardware_inserts: string;
  printing_marking: string[] | null;
  // Quantity
  prototype_quantity: number;
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
  operating_env: string | null;
  protection_req: string | null;
  inspection_req: string | null;
  cert_report: string | null;
  special_req_notes: string;
  // Files
  files: FileRecord[];
}

interface RfqDetailProps {
  rfqId: string;
  role: AdminRole;
  lang: string;
  dict: RfqDetailDict;
}

export interface RfqDetailDict {
  backToList: string;
  sections: {
    contactInfo: string;
    partProjectInfo: string;
    materialManufacturing: string;
    quantity: string;
    deliveryRequirements: string;
    technicalRequirements: string;
    drawingFiles: string;
  };
  fields: {
    company: string;
    contactName: string;
    email: string;
    phone: string;
    countryRegion: string;
    preferredMethod: string;
    projectName: string;
    partNumber: string;
    drawingNumber: string;
    drawingRevision: string;
    drawingAvailability: string;
    productType: string;
    material: string;
    grade: string;
    thickness: string;
    surfaceFinish: string;
    finishColour: string;
    criticalTolerance: string;
    assemblyRequired: string;
    hardwareInserts: string;
    printingMarking: string;
    prototypeQuantity: string;
    productionQuantity: string;
    estAnnualVol: string;
    requiredDate: string;
    dateType: string;
    shippingQuote: string;
    deliveryRegion: string;
    postalCode: string;
    approxDimensions: string;
    operatingEnv: string;
    protectionReq: string;
    inspectionReq: string;
    certReport: string;
    specialReq: string;
  };
  noFiles: string;
  ndaRequired: string;
  submitted: string;
  confirmationEmail: string;
  sent: string;
  notSent: string;
  errors: {
    notFound: string;
    load: string;
    updateStatus: string;
  };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatJsonField(value: string | null): string {
  if (!value) return "—";
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.join(", ");
    if (typeof parsed === "object" && parsed !== null) {
      const parts: string[] = [];
      if (Array.isArray(parsed.selected)) parts.push(parsed.selected.join(", "));
      if (parsed.other) parts.push(`Other: ${parsed.other}`);
      return parts.join("; ") || "—";
    }
    return String(value);
  } catch {
    return value;
  }
}

export function RfqDetail({ rfqId, role, lang, dict }: RfqDetailProps) {
  const router = useRouter();
  const dateLocale = lang === "zh" ? "zh-HK" : "en-GB";
  const [rfq, setRfq] = useState<RfqDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const isEngineer = role === "engineer";
  const canEdit = role === "root" || role === "owner";

  const handleStatusChange = async (value: string | null) => {
    if (!value || !rfq) return;
    setUpdating(true);
    setUpdateError(null);
    try {
      const res = await fetch(`/api/admin/rfqs/${rfqId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setUpdateError(data.error ?? dict.errors.updateStatus);
      } else {
        setRfq({ ...rfq, status: data.status });
      }
    } catch {
      setUpdateError(dict.errors.updateStatus);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    Promise.resolve()
      .then(() => {
        if (cancelled) return;
        setLoading(true);
        setError(null);
        return fetch(`/api/admin/rfqs/${rfqId}`);
      })
      .then((r) => {
        if (cancelled || !r) return;
        if (!r.ok) throw new Error(r.status === 404 ? dict.errors.notFound : dict.errors.load);
        return r.json();
      })
      .then((d) => {
        if (!cancelled) {
          setRfq(d.rfq);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [rfqId]);

  if (loading) {
    return (
      <Center py="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  if (error || !rfq) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
        {error ?? dict.errors.notFound}
      </Alert>
    );
  }

  const reference = `RFQ-${new Date(rfq.created_at).getFullYear()}-${String(rfq.id).padStart(6, "0")}`;
  const statusColor = (s: string): string =>
    s === "initiated" ? "blue" : s === "reviewing" ? "yellow" : s === "quoted" ? "green" : "gray";

  return (
    <Stack>
      <Group justify="space-between">
        <Group>
          <Anchor
            component="button"
            onClick={() => router.push(`/${lang}/administrator`)}
            c="dimmed"
            size="sm"
          >
            <Group gap={4}>
              <IconArrowLeft size={16} />
              {dict.backToList}
            </Group>
          </Anchor>
        </Group>

        {canEdit ? (
          <Group gap="xs" align="center">
            <Select
              data={RFQ_STATUSES.map((s) => ({ value: s, label: s }))}
              value={rfq.status}
              onChange={handleStatusChange}
              disabled={updating}
              w={150}
            />
            {updateError && (
              <Text size="xs" c="red">{updateError}</Text>
            )}
          </Group>
        ) : (
          <Badge color={statusColor(rfq.status)} variant="filled" size="lg">
            {rfq.status}
          </Badge>
        )}
      </Group>

      <Group>
        <Title order={2}>{rfq.project_name}</Title>
        <Text c="dimmed" size="sm">
          {reference}
        </Text>
      </Group>

      {/* Contact Information — ONLY for owner/root */}
      {!isEngineer && rfq.company_name !== undefined && (
        <Card withBorder>
          <Title order={4} mb="sm">{dict.sections.contactInfo}</Title>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Text size="sm" c="dimmed">{dict.fields.company}</Text>
              <Text>{rfq.company_name}</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Text size="sm" c="dimmed">{dict.fields.contactName}</Text>
              <Text>{rfq.contact_name}</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Text size="sm" c="dimmed">{dict.fields.email}</Text>
              <Text>{rfq.email}</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Text size="sm" c="dimmed">{dict.fields.phone}</Text>
              <Text>{rfq.phone || "—"}</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Text size="sm" c="dimmed">{dict.fields.countryRegion}</Text>
              <Text>{rfq.country_region}</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Text size="sm" c="dimmed">{dict.fields.preferredMethod}</Text>
              <Text>{rfq.preferred_method || "—"}</Text>
            </Grid.Col>
          </Grid>
        </Card>
      )}

      {/* Part & Project Information */}
      <Card withBorder>
        <Title order={4} mb="sm">{dict.sections.partProjectInfo}</Title>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="sm" c="dimmed">{dict.fields.projectName}</Text>
            <Text>{rfq.project_name}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="sm" c="dimmed">{dict.fields.partNumber}</Text>
            <Text>{rfq.part_number || "—"}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Text size="sm" c="dimmed">{dict.fields.drawingNumber}</Text>
            <Text>{rfq.drawing_code || "—"}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Text size="sm" c="dimmed">{dict.fields.drawingRevision}</Text>
            <Text>{rfq.drawing_revision || "—"}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Text size="sm" c="dimmed">{dict.fields.drawingAvailability}</Text>
            <Text>{rfq.drawing_avail}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="sm" c="dimmed">{dict.fields.productType}</Text>
            <Text>{Array.isArray(rfq.product_type) ? rfq.product_type.join(", ") : "—"}</Text>
          </Grid.Col>
        </Grid>
      </Card>

      {/* Material & Manufacturing */}
      <Card withBorder>
        <Title order={4} mb="sm">{dict.sections.materialManufacturing}</Title>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Text size="sm" c="dimmed">{dict.fields.material}</Text>
            <Text>{rfq.material}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Text size="sm" c="dimmed">{dict.fields.grade}</Text>
            <Text>{rfq.material_grade || "—"}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Text size="sm" c="dimmed">{dict.fields.thickness}</Text>
            <Text>
              {rfq.thickness ? `${rfq.thickness} ${rfq.thickness_unit || ""}` : "—"}
            </Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="sm" c="dimmed">{dict.fields.surfaceFinish}</Text>
            <Text>{rfq.surface_finish || "—"}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="sm" c="dimmed">{dict.fields.finishColour}</Text>
            <Text>{rfq.finish_color || "—"}</Text>
          </Grid.Col>
          <Grid.Col span={12}>
            <Text size="sm" c="dimmed">{dict.fields.criticalTolerance}</Text>
            <Text>{rfq.critical_tolerance_req || "—"}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Text size="sm" c="dimmed">{dict.fields.assemblyRequired}</Text>
            <Text>{rfq.assembly_required || "—"}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 8 }}>
            <Text size="sm" c="dimmed">{dict.fields.hardwareInserts}</Text>
            <Text>{rfq.hardware_inserts || "—"}</Text>
          </Grid.Col>
          <Grid.Col span={12}>
            <Text size="sm" c="dimmed">{dict.fields.printingMarking}</Text>
            <Text>
              {Array.isArray(rfq.printing_marking) ? rfq.printing_marking.join(", ") : "—"}
            </Text>
          </Grid.Col>
        </Grid>
      </Card>

      {/* Quantity */}
      <Card withBorder>
        <Title order={4} mb="sm">{dict.sections.quantity}</Title>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Text size="sm" c="dimmed">{dict.fields.prototypeQuantity}</Text>
            <Text>{rfq.prototype_quantity ?? "—"}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Text size="sm" c="dimmed">{dict.fields.productionQuantity}</Text>
            <Text fw={500}>{rfq.production_quantity}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Text size="sm" c="dimmed">{dict.fields.estAnnualVol}</Text>
            <Text>{rfq.est_annual_vol || "—"}</Text>
          </Grid.Col>
        </Grid>
      </Card>

      {/* Delivery Requirements */}
      <Card withBorder>
        <Title order={4} mb="sm">{dict.sections.deliveryRequirements}</Title>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Text size="sm" c="dimmed">{dict.fields.requiredDate}</Text>
            <Text>{rfq.required_date || "—"}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Text size="sm" c="dimmed">{dict.fields.dateType}</Text>
            <Text>{rfq.required_date_type || "—"}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Text size="sm" c="dimmed">{dict.fields.shippingQuote}</Text>
            <Text>{rfq.shipping_quote_required || "—"}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="sm" c="dimmed">{dict.fields.deliveryRegion}</Text>
            <Text>{rfq.delivery_region}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="sm" c="dimmed">{dict.fields.postalCode}</Text>
            <Text>{rfq.postal_code || "—"}</Text>
          </Grid.Col>
        </Grid>
      </Card>

      {/* Additional Technical Requirements */}
      <Card withBorder>
        <Title order={4} mb="sm">{dict.sections.technicalRequirements}</Title>
        <Grid>
          <Grid.Col span={12}>
            <Text size="sm" c="dimmed">{dict.fields.approxDimensions}</Text>
            <Text>{rfq.approx_dimensions || "—"}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Text size="sm" c="dimmed">{dict.fields.operatingEnv}</Text>
            <Text>{formatJsonField(rfq.operating_env)}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Text size="sm" c="dimmed">{dict.fields.protectionReq}</Text>
            <Text>{formatJsonField(rfq.protection_req)}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Text size="sm" c="dimmed">{dict.fields.inspectionReq}</Text>
            <Text>{formatJsonField(rfq.inspection_req)}</Text>
          </Grid.Col>
          <Grid.Col span={12}>
            <Text size="sm" c="dimmed">{dict.fields.certReport}</Text>
            <Text>{formatJsonField(rfq.cert_report)}</Text>
          </Grid.Col>
          <Grid.Col span={12}>
            <Text size="sm" c="dimmed">{dict.fields.specialReq}</Text>
            <Text style={{ whiteSpace: "pre-wrap" }}>
              {rfq.special_req_notes || "—"}
            </Text>
          </Grid.Col>
        </Grid>
      </Card>

      {/* Drawing & Specification Files */}
      <Card withBorder>
        <Title order={4} mb="sm">{dict.sections.drawingFiles}</Title>
        {rfq.files.length === 0 ? (
          <Text c="dimmed">{dict.noFiles}</Text>
        ) : (
          <Stack gap="xs">
            {rfq.files.map((file) => (
              <Group key={file.id} justify="space-between" wrap="nowrap">
                <Group gap="xs">
                  <IconDownload size={16} />
                  <div>
                    <Anchor href={file.file_url} target="_blank" size="sm">
                      {file.file_name}
                    </Anchor>
                    <Text size="xs" c="dimmed">
                      {file.file_type} &middot; {formatBytes(file.file_size_bytes)}
                    </Text>
                  </div>
                </Group>
                {file.additional_option && file.additional_option.length > 0 && (
                  <Badge size="xs" variant="light">
                    {file.additional_option.map((o) =>
                      o === "REQUIRE_NDA" ? dict.ndaRequired : o
                    ).join(", ")}
                  </Badge>
                )}
              </Group>
            ))}
          </Stack>
        )}
      </Card>

      <Divider />

      <Group justify="space-between">
        <Text size="xs" c="dimmed">
          {dict.submitted}: {new Date(rfq.created_at).toLocaleString(dateLocale)}
        </Text>
        <Text size="xs" c="dimmed">
          {dict.confirmationEmail}: {rfq.confirmation_email_sent ? dict.sent : dict.notSent}
        </Text>
      </Group>
    </Stack>
  );
}
