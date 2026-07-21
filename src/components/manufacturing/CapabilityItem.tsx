import { Text } from "@mantine/core";
import Image from "next/image";
import { YouTubeEmbed } from "@/components/ui/YouTubeEmbed";

export interface CapabilityMedia {
  type: "image" | "youtube" | "video";
  src: string;
  alt?: string;
  caption?: string;
}

export interface Capability {
  label: string;
  media?: CapabilityMedia[];
}

interface CapabilityItemProps {
  capability: Capability;
}

export function CapabilityItem({ capability }: CapabilityItemProps) {
  const { label, media } = capability;

  return (
    <li>
      {/* Row 1: checkmark + label */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
        <span
          style={{
            color: "var(--mantine-color-green-6)",
            flexShrink: 0,
          }}
        >
          &#10003;
        </span>
        <Text component="span" fw={500}>
          {label}
        </Text>
      </div>

      {/* Media (if present) */}
      {media && media.length > 0 && (
        <div
          style={{
            marginTop: "var(--mantine-spacing-md)",
            marginBottom: "var(--mantine-spacing-lg)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--mantine-spacing-md)",
          }}
        >
          {media.map((item, i) =>
            item.type === "image" ? (
              <figure key={i} style={{ margin: 0 }}>
                <Image
                  src={item.src}
                  alt={item.alt ?? ""}
                  width={640}
                  height={480}
                  sizes="(max-width: 768px) 100vw, 640px"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    borderRadius: "var(--mantine-radius-md)",
                  }}
                />
                {item.caption && (
                  <figcaption
                    style={{
                      marginTop: "var(--mantine-spacing-xs)",
                      fontSize: "var(--mantine-font-size-sm)",
                      color: "var(--mantine-color-dimmed)",
                      maxWidth: 640,
                    }}
                  >
                    {item.caption}
                  </figcaption>
                )}
              </figure>
            ) : (
              <YouTubeEmbed key={i} videoId={item.src} caption={item.caption} />
            )
          )}
        </div>
      )}
    </li>
  );
}
