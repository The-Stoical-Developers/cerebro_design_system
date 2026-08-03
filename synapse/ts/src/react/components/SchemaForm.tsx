"use client";
import { Input } from "./Input";

/**
 * Renders a form from a JSON Schema object.
 * Supports: type "string", format "password", required fields.
 */


type SchemaShape = {
  type?: string;
  required?: string[];
  properties?: Record<string, { type: string; format?: string; pattern?: string; description?: string }>;
};

interface SchemaFormProps {
  schema: SchemaShape;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  hints?: Record<string, string>; // existing value hints (last 4 chars) for masked fields
}

export function SchemaForm({ schema, values, onChange, hints = {} }: SchemaFormProps) {
  const properties = schema.properties ?? {};
  const required = schema.required ?? [];

  const labelStyle: React.CSSProperties = {
    fontSize: "12px",
    fontWeight: 500,
    color: "#374151",
    display: "block",
    marginBottom: "5px",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {Object.entries(properties).map(([key, prop]) => {
        const isPassword = prop.format === "password";
        const isRequired = required.includes(key);
        const hint = hints[key];
        const placeholder = hint ? `••••${hint}` : (isPassword ? "••••••••" : "");

        return (
          <div key={key}>
            <label style={labelStyle}>
              {key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
              {isRequired && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
            </label>
            {prop.description && (
              <p style={{ margin: "0 0 5px", fontSize: "11px", color: "#6b7280" }}>
                {prop.description}
              </p>
            )}
            <Input
              type={isPassword ? "password" : "text"}
              value={values[key] ?? ""}
              onChange={e => onChange(key, e.target.value)}
              placeholder={placeholder}
            />
          </div>
        );
      })}
    </div>
  );
}
