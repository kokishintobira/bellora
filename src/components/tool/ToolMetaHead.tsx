import type { Tool } from "@/types";
import { JsonLd } from "@/components/common/JsonLd";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export function ToolMetaHead({ tool }: { tool: Tool }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    url: tool.url,
    applicationCategory: "AI Tool",
    operatingSystem: "Web",
    author: {
      "@type": "Organization",
      name: tool.vendor,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  return <JsonLd data={jsonLd} />;
}
