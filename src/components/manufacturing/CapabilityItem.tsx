"use client";

import { useState } from "react";
import { ActionIcon, Text } from "@mantine/core";
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

/** Inline SVG icon: open eye (media visible) */
function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx={12} cy={12} r={3} />
    </svg>
  );
}

/** Inline SVG icon: eye with slash (media hidden) */
function EyeOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="m14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1={1} y1={1} x2={23} y2={23} />
    </svg>
  );
}

export function CapabilityItem({ capability }: CapabilityItemProps) {
  const { label, media } = capability;
  const hasMedia = media && media.length > 0;
  const [showMedia, setShowMedia] = useState(false);

  return (
    <li>
      {/* Row 1: checkmark + label + toggle */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
        <span
          style={{
            color: "var(--mantine-color-green-6)",
            flexShrink: 0,
          }}
        >
          &#10003;
        </span>
        <Text component="span" fw={500} style={{ flex: 1 }}>
          {label}
        </Text>
        {hasMedia && (
          <ActionIcon
            variant="subtle"
            size="sm"
            color="gray"
            onClick={() => setShowMedia((prev) => !prev)}
            aria-label={showMedia ? "Hide media" : "Show media"}
            style={{ flexShrink: 0 }}
          >
            {showMedia ? <EyeIcon /> : <EyeOffIcon />}
          </ActionIcon>
        )}
      </div>

      {/* Media (if present and visible) */}
      {hasMedia && showMedia && (
        <div
          style={{
            marginTop: "var(--mantine-spacing-md)",
            marginBottom: "var(--mantine-spacing-lg)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--mantine-spacing-md)",
          }}
        >
          {media!.map((item, i) =>
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
