"use client";

interface YouTubeEmbedProps {
  videoId: string;
  caption?: string;
}

export function YouTubeEmbed({ videoId, caption }: YouTubeEmbedProps) {
  return (
    <figure style={{ margin: 0 }}>
      <div
        style={{
          position: "relative",
          paddingBottom: "56.25%", // 16:9 aspect ratio
          height: 0,
          overflow: "hidden",
          maxWidth: 640,
          borderRadius: "var(--mantine-radius-md)",
        }}
      >
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: 0,
          }}
        />
      </div>
      {caption && (
        <figcaption
          style={{
            marginTop: "var(--mantine-spacing-xs)",
            fontSize: "var(--mantine-font-size-sm)",
            color: "var(--mantine-color-dimmed)",
            maxWidth: 640,
          }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
