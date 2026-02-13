/**
 * JSON-LD Schema Script Component
 * Renders structured data as a script tag
 */

interface JsonLdProps {
  schema: Record<string, any>;
}

export const JsonLd: React.FC<JsonLdProps> = ({ schema }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(schema),
    }}
  />
);

export default JsonLd;
