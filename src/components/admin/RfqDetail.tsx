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

export function RfqDetail({ rfqId, role, lang }: RfqDetailProps) {
  const router = useRouter();
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
        setUpdateError(data.error ?? "Failed to update status.");
      } else {
        setRfq({ ...rfq, status: data.status });
      }
    } catch {
      setUpdateError("Failed to update status.");
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
        if (!r.ok) throw new Error(r.status === 404 ? "RFQ not found." : "Failed to load RFQ.");
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
        {error ?? "RFQ not found."}
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
              Back to List
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
          <Title order={4} mb="sm">Contact Information</Title>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Text size="sm" c="dimmed">Company</Text>
              <Text>{rfq.company_name}</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Text size="sm" c="dimmed">Contact Name</Text>
              <Text>{rfq.contact_name}</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Text size="sm" c="dimmed">Email</Text>
              <Text>{rfq.email}</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Text size="sm" c="dimmed">Phone</Text>
              <Text>{rfq.phone || "—"}</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Text size="sm" c="dimmed">Country / Region</Text>
              <Text>{rfq.country_region}</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Text size="sm" c="dimmed">Preferred Method</Text>
              <Text>{rfq.preferred_method || "—"}</Text>
            </Grid.Col>
          </Grid>
        </Card>
      )}

      {/* Part & Project Information */}
      <Card withBorder>
        <Title order={4} mb="sm">Part &amp; Project Information</Title>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="sm" c="dimmed">Project Name</Text>
            <Text>{rfq.project_name}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="sm" c="dimmed">Part Number</Text>
            <Text>{rfq.part_number || "—"}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Text size="sm" c="dimmed">Drawing Number</Text>
            <Text>{rfq.drawing_code || "—"}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Text size="sm" c="dimmed">Drawing Revision</Text>
            <Text>{rfq.drawing_revision || "—"}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Text size="sm" c="dimmed">Drawing Availability</Text>
            <Text>{rfq.drawing_avail}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="sm" c="dimmed">Product Type</Text>
            <Text>{Array.isArray(rfq.product_type) ? rfq.product_type.join(", ") : "—"}</Text>
          </Grid.Col>
        </Grid>
      </Card>

      {/* Material & Manufacturing */}
      <Card withBorder>
        <Title order={4} mb="sm">Material &amp; Manufacturing</Title>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Text size="sm" c="dimmed">Material</Text>
            <Text>{rfq.material}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Text size="sm" c="dimmed">Grade</Text>
            <Text>{rfq.material_grade || "—"}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Text size="sm" c="dimmed">Thickness</Text>
            <Text>
              {rfq.thickness ? `${rfq.thickness} ${rfq.thickness_unit || ""}` : "—"}
            </Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="sm" c="dimmed">Surface Finish</Text>
            <Text>{rfq.surface_finish || "—"}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="sm" c="dimmed">Finish Colour</Text>
            <Text>{rfq.finish_color || "—"}</Text>
          </Grid.Col>
          <Grid.Col span={12}>
            <Text size="sm" c="dimmed">Critical Tolerance Requirements</Text>
            <Text>{rfq.critical_tolerance_req || "—"}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Text size="sm" c="dimmed">Assembly Required</Text>
            <Text>{rfq.assembly_required || "—"}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 8 }}>
            <Text size="sm" c="dimmed">Hardware Inserts</Text>
            <Text>{rfq.hardware_inserts || "—"}</Text>
          </Grid.Col>
          <Grid.Col span={12}>
            <Text size="sm" c="dimmed">Printing / Marking</Text>
            <Text>
              {Array.isArray(rfq.printing_marking) ? rfq.printing_marking.join(", ") : "—"}
            </Text>
          </Grid.Col>
        </Grid>
      </Card>

      {/* Quantity */}
      <Card withBorder>
        <Title order={4} mb="sm">Quantity</Title>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Text size="sm" c="dimmed">Prototype Quantity</Text>
            <Text>{rfq.prototype_quantity ?? "—"}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Text size="sm" c="dimmed">Production Quantity</Text>
            <Text fw={500}>{rfq.production_quantity}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Text size="sm" c="dimmed">Est. Annual Volume</Text>
            <Text>{rfq.est_annual_vol || "—"}</Text>
          </Grid.Col>
        </Grid>
      </Card>

      {/* Delivery Requirements */}
      <Card withBorder>
        <Title order={4} mb="sm">Delivery Requirements</Title>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Text size="sm" c="dimmed">Required Date</Text>
            <Text>{rfq.required_date || "—"}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Text size="sm" c="dimmed">Date Type</Text>
            <Text>{rfq.required_date_type || "—"}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Text size="sm" c="dimmed">Shipping Quote</Text>
            <Text>{rfq.shipping_quote_required || "—"}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="sm" c="dimmed">Delivery Region</Text>
            <Text>{rfq.delivery_region}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="sm" c="dimmed">Postal Code</Text>
            <Text>{rfq.postal_code || "—"}</Text>
          </Grid.Col>
        </Grid>
      </Card>

      {/* Additional Technical Requirements */}
      <Card withBorder>
        <Title order={4} mb="sm">Additional Technical Requirements</Title>
        <Grid>
          <Grid.Col span={12}>
            <Text size="sm" c="dimmed">Approx. Dimensions</Text>
            <Text>{rfq.approx_dimensions || "—"}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Text size="sm" c="dimmed">Operating Environment</Text>
            <Text>{formatJsonField(rfq.operating_env)}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Text size="sm" c="dimmed">Protection Requirements</Text>
            <Text>{formatJsonField(rfq.protection_req)}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Text size="sm" c="dimmed">Inspection Requirements</Text>
            <Text>{formatJsonField(rfq.inspection_req)}</Text>
          </Grid.Col>
          <Grid.Col span={12}>
            <Text size="sm" c="dimmed">Certifications / Reports</Text>
            <Text>{formatJsonField(rfq.cert_report)}</Text>
          </Grid.Col>
          <Grid.Col span={12}>
            <Text size="sm" c="dimmed">Special Requirements</Text>
            <Text style={{ whiteSpace: "pre-wrap" }}>
              {rfq.special_req_notes || "—"}
            </Text>
          </Grid.Col>
        </Grid>
      </Card>

      {/* Drawing & Specification Files */}
      <Card withBorder>
        <Title order={4} mb="sm">Drawing &amp; Specification Files</Title>
        {rfq.files.length === 0 ? (
          <Text c="dimmed">No files uploaded.</Text>
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
                      o === "REQUIRE_NDA" ? "NDA Required" : o
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
          Submitted: {new Date(rfq.created_at).toLocaleString("en-GB")}
        </Text>
        <Text size="xs" c="dimmed">
          Confirmation Email: {rfq.confirmation_email_sent ? "Sent" : "Not sent"}
        </Text>
      </Group>
    </Stack>
  );
}
