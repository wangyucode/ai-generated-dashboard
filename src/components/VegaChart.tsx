"use client";

import { useEffect, useMemo, useState } from "react";
import { VegaEmbed } from "react-vega";

interface VegaChartProps {
  spec: string | object;
  data: Record<string, unknown>[];
  width?: number | "container";
  height?: number;
}

export function VegaChart({
  spec,
  data,
  width = "container",
  height = 200,
}: VegaChartProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const finalSpec = useMemo(() => {
    try {
      const parsedSpec =
        typeof spec === "string" ? JSON.parse(spec) : { ...spec };

      // Inject data into the spec
      return {
        ...parsedSpec,
        data: { values: data },
        width: width === "container" ? "container" : width,
        height: height,
        autosize: { type: "fit", contains: "padding" },
        config: {
          ...parsedSpec.config,
          background: "transparent",
        },
      };
    } catch (e) {
      console.error("Failed to parse Vega-Lite spec", e);
      return null;
    }
  }, [spec, data, width, height]);

  if (!isClient || !finalSpec) {
    return (
      <div
        className="w-full flex items-center justify-center bg-muted/20 rounded-md border border-dashed"
        style={{ height }}
      >
        <span className="text-xs text-muted-foreground italic">
          图表加载中...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-md bg-white p-2 border shadow-sm">
      <VegaEmbed
        spec={finalSpec}
        options={{ actions: false }}
        style={{ width: "100%" }}
      />
    </div>
  );
}
