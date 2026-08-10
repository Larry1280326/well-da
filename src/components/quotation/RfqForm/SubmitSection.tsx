"use client";

import { Button } from "@mantine/core";
import type { RfqFormDict } from "@/lib/types/rfq";

interface Props {
  dict: RfqFormDict;
  isSubmitting: boolean;
}

export function SubmitSection({ dict, isSubmitting }: Props) {
  return (
    <div>
      {/* Honeypot — hidden field; bots fill it, humans don't */}
      <input
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        style={{
          position: "absolute",
          opacity: 0,
          height: 0,
          width: 0,
          pointerEvents: "none",
        }}
        aria-hidden="true"
        suppressHydrationWarning
      />

      <Button
        type="submit"
        size="lg"
        loading={isSubmitting}
        loaderProps={{ children: dict.submitting }}
      >
        {isSubmitting ? dict.submitting : dict.submit}
      </Button>
    </div>
  );
}
