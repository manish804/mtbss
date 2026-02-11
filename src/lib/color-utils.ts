/**
 * Utility functions for color handling and CSS generation
 */

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

/**
 * Validates if a string is a valid hex color
 */
export function isValidHexColor(color: string): boolean {
  return HEX_COLOR_REGEX.test(color);
}

/**
 * Validates if a value is a valid color (single hex or gradient array)
 */
export function isValidColor(color: string | string[]): boolean {
  if (typeof color === "string") {
    return isValidHexColor(color);
  }

  if (Array.isArray(color)) {
    return color.length === 2 && color.every(isValidHexColor);
  }

  return false;
}

/**
 * Generates CSS background style from color value
 */
export function generateBackgroundStyle(
  color: string | string[],
  direction: "to-r" | "to-b" | "to-br" | "to-bl" = "to-r"
): string {
  if (Array.isArray(color) && color.length === 2) {
    const [color1, color2] = color;

    if (!isValidHexColor(color1) || !isValidHexColor(color2)) {
      return "#000000";
    }

    return `linear-gradient(${direction}, ${color1}, ${color2})`;
  }

  if (typeof color === "string") {
    if (!isValidHexColor(color)) {
      return "#000000";
    }
    return color;
  }

  return "#000000";
}

/**
 * Generates CSS text color style from color value
 */
export function generateTextColorStyle(color: string): string {
  if (!isValidHexColor(color)) {
    return "#000000";
  }
  return color;
}

/**
 * Converts a color value to inline CSS styles object
 */
export function colorToStyles(
  color: string | string[],
  type: "background" | "text" = "background",
  direction: "to-r" | "to-b" | "to-br" | "to-bl" = "to-r"
): React.CSSProperties {
  if (type === "text") {
    const textColor = typeof color === "string" ? color : color[0] || "#000000";
    return {
      color: generateTextColorStyle(textColor),
    };
  }

  const backgroundValue = generateBackgroundStyle(color, direction);

  if (backgroundValue.startsWith("linear-gradient")) {
    return {
      background: backgroundValue,
    };
  }

  return {
    backgroundColor: backgroundValue,
  };
}

/**
 * Gets a fallback color when no color is provided
 */
export function getDefaultColor(
  type: "background" | "text" = "background"
): string {
  return type === "background" ? "#ffffff" : "#000000";
}

/**
 * Normalizes color value to ensure it's in the correct format
 */
export function normalizeColorValue(
  color: string | string[] | undefined
): string | string[] {
  if (!color) {
    return getDefaultColor();
  }

  if (typeof color === "string") {
    if (isValidHexColor(color)) {
      return color;
    }

    if (color.startsWith("bg-") || color.startsWith("text-")) {
      return tailwindToHex(color);
    }

    return getDefaultColor();
  }

  if (Array.isArray(color)) {
    if (color.length === 2 && color.every(isValidHexColor)) {
      return color;
    }

    const convertedColors = color.map((c) => {
      if (isValidHexColor(c)) return c;
      if (c.startsWith("bg-") || c.startsWith("text-")) return tailwindToHex(c);
      return getDefaultColor();
    });

    if (convertedColors.length === 2) {
      return convertedColors;
    }

    const validColor =
      color.find(isValidHexColor) ||
      convertedColors.find((c) => c !== getDefaultColor());
    return validColor || getDefaultColor();
  }

  return getDefaultColor();
}

/**
 * Converts Tailwind color classes to hex values (for backward compatibility)
 */
export function tailwindToHex(tailwindClass: string): string {
  const colorMap: Record<string, string> = {
    "bg-background": "#ffffff",
    "bg-card": "#ffffff",
    "bg-muted": "#f1f5f9",
    "bg-muted/50": "#f8fafc",
    "bg-primary": "#0ea5e9",
    "bg-primary/5": "#f0f9ff",
    "bg-primary/10": "#e0f2fe",
    "bg-secondary": "#f1f5f9",
    "bg-secondary/10": "#f8fafc",
    "bg-white": "#ffffff",
    "bg-black": "#000000",
    "bg-gray-50": "#f9fafb",
    "bg-gray-100": "#f3f4f6",
    "bg-gray-900": "#111827",
    "bg-blue-600": "#2563eb",
    "bg-green-600": "#16a34a",
    "bg-purple-600": "#9333ea",
    "bg-red-600": "#dc2626",
    "bg-yellow-600": "#ca8a04",
    "bg-gradient-to-r": "#0ea5e9",
    "bg-accent": "#f1f5f9",
    "bg-card/50": "#ffffff80",

    "text-foreground": "#0f172a",
    "text-card-foreground": "#0f172a",
    "text-muted-foreground": "#64748b",
    "text-primary": "#0ea5e9",
    "text-primary-foreground": "#ffffff",
    "text-secondary": "#64748b",
    "text-white": "#ffffff",
    "text-black": "#000000",
    "text-gray-700": "#374151",
    "text-gray-900": "#111827",
    "text-blue-600": "#2563eb",
    "text-green-600": "#16a34a",
    "text-purple-600": "#9333ea",
    "text-red-600": "#dc2626",

    "hover:bg-card/80": "#ffffff",
    "hover:bg-muted/50": "#f8fafc",
    "hover:bg-primary/5": "#f0f9ff",
    "hover:bg-secondary/10": "#f8fafc",
  };

  return colorMap[tailwindClass] || "#000000";
}
