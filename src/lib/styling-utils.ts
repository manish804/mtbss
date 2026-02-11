import { cn } from "@/lib/utils";
import { ButtonStyling, CardStyling, SectionStyling } from "./content-types";

type StylingRecord = Record<string, unknown>;

function isStylingRecord(value: unknown): value is StylingRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Default styling configurations
 */
export const DEFAULT_BUTTON_STYLING: ButtonStyling = {
  backgroundColor: "bg-blue-600",
  textColor: "text-white",
  hoverBackgroundColor: "hover:bg-blue-700",
  hoverTextColor: "hover:text-white",
  borderColor: "border-transparent",
  size: "md",
  variant: "primary",
};

export const DEFAULT_CARD_STYLING: CardStyling = {
  backgroundColor: "bg-white",
  textColor: "text-gray-900",
  borderColor: "border-gray-200",
  hoverBackgroundColor: "hover:bg-gray-50",
  hoverBorderColor: "hover:border-gray-300",
  shadowColor: "shadow-sm",
  hoverShadowColor: "hover:shadow-md",
  borderRadius: "rounded-lg",
  padding: "p-6",
};

export const DEFAULT_SECTION_STYLING: SectionStyling = {
  backgroundColor: "bg-white",
  textColor: "text-gray-900",
  padding: "py-16 px-4",
  buttonStyle: DEFAULT_BUTTON_STYLING,
  cardStyle: DEFAULT_CARD_STYLING,
};

/**
 * Convert button styling object to Tailwind CSS classes
 */
export function applyButtonStyling(
  styling?: ButtonStyling,
  baseClasses: string = "",
  overrideClasses: string = ""
): string {
  const finalStyling = { ...DEFAULT_BUTTON_STYLING, ...styling };

  const classes = [
    baseClasses,
    finalStyling.backgroundColor,
    finalStyling.textColor,
    finalStyling.hoverBackgroundColor,
    finalStyling.hoverTextColor,
    finalStyling.borderColor,
    finalStyling.hoverBorderColor,
    getSizeClasses(finalStyling.size),
    getVariantClasses(finalStyling.variant),
    overrideClasses,
  ].filter(Boolean);

  return cn(...classes);
}

/**
 * Convert card styling object to Tailwind CSS classes
 */
export function applyCardStyling(
  styling?: CardStyling,
  baseClasses: string = "",
  overrideClasses: string = ""
): string {
  const finalStyling = { ...DEFAULT_CARD_STYLING, ...styling };

  const classes = [
    baseClasses,
    finalStyling.backgroundColor,
    finalStyling.textColor,
    finalStyling.borderColor,
    finalStyling.hoverBackgroundColor,
    finalStyling.hoverTextColor,
    finalStyling.hoverBorderColor,
    finalStyling.shadowColor,
    finalStyling.hoverShadowColor,
    finalStyling.borderRadius,
    finalStyling.padding,
    "border transition-all duration-200",
    overrideClasses,
  ].filter(Boolean);

  return cn(...classes);
}

/**
 * Convert section styling object to Tailwind CSS classes
 */
export function applySectionStyling(
  styling?: SectionStyling,
  baseClasses: string = "",
  overrideClasses: string = ""
): string {
  const finalStyling = { ...DEFAULT_SECTION_STYLING, ...styling };

  let backgroundClass = finalStyling.backgroundColor;

  if (finalStyling.gradientFrom && finalStyling.gradientTo) {
    const direction = finalStyling.gradientDirection || "to-r";
    backgroundClass = `bg-gradient-${direction} from-${finalStyling.gradientFrom} to-${finalStyling.gradientTo}`;
  }

  const classes = [
    baseClasses,
    backgroundClass,
    finalStyling.textColor,
    finalStyling.hoverColor,
    finalStyling.padding,
    finalStyling.margin,
    overrideClasses,
  ].filter(Boolean);

  return cn(...classes);
}

/**
 * Get button size classes
 */
function getSizeClasses(size?: string): string {
  switch (size) {
    case "sm":
      return "px-3 py-1.5 text-sm";
    case "lg":
      return "px-8 py-3 text-lg";
    case "md":
    default:
      return "px-6 py-2 text-base";
  }
}

/**
 * Get button variant classes
 */
function getVariantClasses(variant?: string): string {
  switch (variant) {
    case "secondary":
      return "bg-gray-600 hover:bg-gray-700 text-white";
    case "outline":
      return "bg-transparent border-2 hover:bg-gray-50";
    case "ghost":
      return "bg-transparent hover:bg-gray-100 border-transparent";
    case "primary":
    default:
      return "";
  }
}

/**
 * Apply styling to job card components
 */
export function applyJobCardStyling(
  styling?: {
    cardStyle?: CardStyling;
    buttonStyle?: ButtonStyling;
    badgeStyle?: CardStyling;
  },
  baseClasses: string = ""
): {
  cardClasses: string;
  buttonClasses: string;
  badgeClasses: string;
} {
  return {
    cardClasses: applyCardStyling(styling?.cardStyle, baseClasses),
    buttonClasses: applyButtonStyling(
      styling?.buttonStyle,
      "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"
    ),
    badgeClasses: applyCardStyling(
      styling?.badgeStyle,
      "inline-flex items-center px-2.5 py-0.5 text-xs font-medium",
      "border-0 shadow-none"
    ),
  };
}

/**
 * Apply styling to service card components
 */
export function applyServiceCardStyling(
  styling?: {
    cardStyle?: CardStyling;
    buttonStyle?: ButtonStyling;
  },
  baseClasses: string = ""
): {
  cardClasses: string;
  buttonClasses: string;
} {
  return {
    cardClasses: applyCardStyling(styling?.cardStyle, baseClasses),
    buttonClasses: applyButtonStyling(
      styling?.buttonStyle,
      "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"
    ),
  };
}

/**
 * Valid Tailwind CSS class patterns for validation
 */
const VALID_TAILWIND_PATTERNS = {
  backgroundColor:
    /^bg-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)$|^bg-(white|black|transparent|current|inherit)$|^bg-gradient-/,
  textColor:
    /^text-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)$|^text-(white|black|transparent|current|inherit)$/,
  hoverBackgroundColor:
    /^hover:bg-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)$|^hover:bg-(white|black|transparent|current|inherit)$/,
  hoverTextColor:
    /^hover:text-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)$|^hover:text-(white|black|transparent|current|inherit)$/,
  borderColor:
    /^border-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)$|^border-(white|black|transparent|current|inherit)$/,
  hoverBorderColor:
    /^hover:border-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)$|^hover:border-(white|black|transparent|current|inherit)$/,
  shadowColor: /^shadow-(sm|md|lg|xl|2xl|inner|none)$/,
  hoverShadowColor: /^hover:shadow-(sm|md|lg|xl|2xl|inner|none)$/,
  borderRadius: /^rounded(-none|-sm|-md|-lg|-xl|-2xl|-3xl|-full)?$/,
  padding:
    /^p(x|y|t|r|b|l)?-(0|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96)$/,
  margin:
    /^m(x|y|t|r|b|l)?-(0|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96)$/,
};

/**
 * Validate styling data to ensure valid Tailwind classes
 */
export function validateStyling(styling: unknown): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!isStylingRecord(styling)) {
    return { isValid: true, errors: [] };
  }

  for (const [key, value] of Object.entries(styling)) {
    if (typeof value !== "string") {
      errors.push(
        `Invalid styling property ${key}: expected string, got ${typeof value}`
      );
      continue;
    }

    const pattern =
      VALID_TAILWIND_PATTERNS[key as keyof typeof VALID_TAILWIND_PATTERNS];
    if (pattern && !pattern.test(value)) {
      errors.push(
        `Invalid Tailwind class for ${key}: "${value}" does not match expected pattern`
      );
    }
  }

  if (styling.buttonStyle) {
    const buttonValidation = validateStyling(styling.buttonStyle);
    errors.push(...buttonValidation.errors.map((err) => `buttonStyle.${err}`));
  }

  if (styling.cardStyle) {
    const cardValidation = validateStyling(styling.cardStyle);
    errors.push(...cardValidation.errors.map((err) => `cardStyle.${err}`));
  }

  if (styling.badgeStyle) {
    const badgeValidation = validateStyling(styling.badgeStyle);
    errors.push(...badgeValidation.errors.map((err) => `badgeStyle.${err}`));
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate and sanitize styling data, removing invalid classes
 */
export function sanitizeStyling<T extends Record<string, unknown>>(styling: T): T {
  if (!isStylingRecord(styling)) {
    return styling;
  }

  const sanitized: Record<string, unknown> = { ...styling };

  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === "string") {
      const pattern =
        VALID_TAILWIND_PATTERNS[key as keyof typeof VALID_TAILWIND_PATTERNS];
      if (pattern && !pattern.test(value)) {
        console.warn(`Removing invalid Tailwind class for ${key}: "${value}"`);
        delete sanitized[key];
      }
    } else if (isStylingRecord(value)) {
      sanitized[key] = sanitizeStyling(value);
    }
  }

  return sanitized as T;
}

/**
 * Apply dynamic styling to any element with hover state handling
 */
export function applyDynamicStyling(
  styling?: Record<string, unknown>,
  baseClasses: string = "",
  overrideClasses: string = ""
): string {
  if (!styling) {
    return cn(baseClasses, overrideClasses);
  }

  const sanitizedStyling = sanitizeStyling(styling);
  const classes = [baseClasses];

  Object.entries(sanitizedStyling).forEach(([, value]) => {
    if (typeof value === "string" && value.trim()) {
      classes.push(value);
    }
  });

  classes.push(overrideClasses);

  return cn(...classes.filter(Boolean));
}

/**
 * Create interactive element styling with hover states
 */
export function createInteractiveStyling(
  styling?: {
    backgroundColor?: string;
    textColor?: string;
    hoverBackgroundColor?: string;
    hoverTextColor?: string;
    borderColor?: string;
    hoverBorderColor?: string;
  },
  baseClasses: string = "transition-all duration-200"
): string {
  const classes = [baseClasses];

  if (styling) {
    const sanitized = sanitizeStyling(styling);

    if (sanitized.backgroundColor) classes.push(sanitized.backgroundColor);
    if (sanitized.textColor) classes.push(sanitized.textColor);
    if (sanitized.borderColor) classes.push(sanitized.borderColor);

    if (sanitized.hoverBackgroundColor)
      classes.push(sanitized.hoverBackgroundColor);
    if (sanitized.hoverTextColor) classes.push(sanitized.hoverTextColor);
    if (sanitized.hoverBorderColor) classes.push(sanitized.hoverBorderColor);
  }

  return cn(...classes.filter(Boolean));
}

/**
 * Apply badge styling with department-specific colors
 */
export function applyBadgeStyling(
  department: string,
  customStyling?: CardStyling,
  baseClasses: string = "inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border"
): string {
  const departmentColors: Record<string, CardStyling> = {
    finance: {
      backgroundColor: "bg-blue-50",
      textColor: "text-blue-800",
      borderColor: "border-blue-200",
      hoverBackgroundColor: "hover:[background-color:#8dcbdb] hover:text-white",
    },
    hr: {
      backgroundColor: "bg-green-50",
      textColor: "text-green-800",
      borderColor: "border-green-200",
      hoverBackgroundColor: "hover:[background-color:#8dcbdb] hover:text-white",
    },
    technology: {
      backgroundColor: "bg-purple-50",
      textColor: "text-purple-800",
      borderColor: "border-purple-200",
      hoverBackgroundColor: "hover:[background-color:#8dcbdb] hover:text-white",
    },
    marketing: {
      backgroundColor: "bg-orange-50",
      textColor: "text-orange-800",
      borderColor: "border-orange-200",
      hoverBackgroundColor: "hover:[background-color:#8dcbdb] hover:text-white",
    },
    default: {
      backgroundColor: "bg-gray-50",
      textColor: "text-gray-800",
      borderColor: "border-gray-200",
      hoverBackgroundColor: "hover:[background-color:#8dcbdb] hover:text-white",
    },
  };

  const defaultStyling =
    departmentColors[department] || departmentColors.default;
  const finalStyling = { ...defaultStyling, ...customStyling };

  return applyCardStyling(
    finalStyling,
    baseClasses,
    "transition-colors duration-200"
  );
}

/**
 * Get theme-based styling presets
 */
export const STYLING_PRESETS = {
  primary: {
    button: {
      backgroundColor: "bg-blue-600",
      textColor: "text-white",
      hoverBackgroundColor: "hover:bg-blue-700",
      variant: "primary",
    } as ButtonStyling,
    card: {
      backgroundColor: "bg-white",
      textColor: "text-gray-900",
      borderColor: "border-blue-200",
      hoverBorderColor: "hover:border-blue-300",
      shadowColor: "shadow-sm",
      hoverShadowColor: "hover:shadow-md",
    } as CardStyling,
  },
  secondary: {
    button: {
      backgroundColor: "bg-gray-600",
      textColor: "text-white",
      hoverBackgroundColor: "hover:bg-gray-700",
      variant: "secondary",
    } as ButtonStyling,
    card: {
      backgroundColor: "bg-gray-50",
      textColor: "text-gray-900",
      borderColor: "border-gray-200",
      hoverBorderColor: "hover:border-gray-300",
    } as CardStyling,
  },
  success: {
    button: {
      backgroundColor: "bg-green-600",
      textColor: "text-white",
      hoverBackgroundColor: "hover:bg-green-700",
      variant: "primary",
    } as ButtonStyling,
    card: {
      backgroundColor: "bg-green-50",
      textColor: "text-green-900",
      borderColor: "border-green-200",
      hoverBorderColor: "hover:border-green-300",
    } as CardStyling,
  },
  warning: {
    button: {
      backgroundColor: "bg-yellow-600",
      textColor: "text-white",
      hoverBackgroundColor: "hover:bg-yellow-700",
      variant: "primary",
    } as ButtonStyling,
    card: {
      backgroundColor: "bg-yellow-50",
      textColor: "text-yellow-900",
      borderColor: "border-yellow-200",
      hoverBorderColor: "hover:border-yellow-300",
    } as CardStyling,
  },
  danger: {
    button: {
      backgroundColor: "bg-red-600",
      textColor: "text-white",
      hoverBackgroundColor: "hover:bg-red-700",
      variant: "primary",
    } as ButtonStyling,
    card: {
      backgroundColor: "bg-red-50",
      textColor: "text-red-900",
      borderColor: "border-red-200",
      hoverBorderColor: "hover:border-red-300",
    } as CardStyling,
  },
};

/**
 * Apply preset styling theme
 */
export function applyPresetStyling(
  preset: keyof typeof STYLING_PRESETS,
  type: "button" | "card",
  baseClasses: string = "",
  overrideClasses: string = ""
): string {
  const presetStyling = STYLING_PRESETS[preset]?.[type];

  if (!presetStyling) {
    console.warn(`Unknown preset "${preset}" or type "${type}"`);
    return cn(baseClasses, overrideClasses);
  }

  if (type === "button") {
    return applyButtonStyling(
      presetStyling as ButtonStyling,
      baseClasses,
      overrideClasses
    );
  } else {
    return applyCardStyling(
      presetStyling as CardStyling,
      baseClasses,
      overrideClasses
    );
  }
}

/**
 * Merge multiple styling objects with priority
 */
export function mergeStyling<T extends Record<string, unknown>>(
  ...stylings: (T | undefined)[]
): T {
  return stylings.reduce<T>((merged, current) => {
    if (!current) return merged;
    return { ...merged, ...current };
  }, {} as T);
}

/**
 * Create a styled component wrapper that applies dynamic styling
 * Note: This is a utility function for advanced use cases
 */
export function withDynamicStyling<T extends Record<string, unknown>>(
  stylingProp: keyof T = "styling" as keyof T,
  defaultStyling?: Record<string, unknown>
) {
  return function createStyledComponent(props: T) {
    const rawStyling = props[stylingProp];
    const styling = isStylingRecord(rawStyling) ? rawStyling : undefined;
    const mergedStyling = mergeStyling<Record<string, unknown>>(
      defaultStyling,
      styling
    );

    if (mergedStyling) {
      const validation = validateStyling(mergedStyling);
      if (!validation.isValid) {
        console.warn("Invalid styling detected:", validation.errors);
      }
    }

    return mergedStyling;
  };
}

/**
 * Extract and apply styling from content objects
 */
export function extractContentStyling(
  content: { styling?: Record<string, unknown> },
  type: "button" | "card" | "section" | "badge",
  baseClasses: string = "",
  overrideClasses: string = ""
): string {
  const styling = content.styling;

  if (!styling) {
    return cn(baseClasses, overrideClasses);
  }

  switch (type) {
    case "button":
      return applyButtonStyling(
        styling.buttonStyle as ButtonStyling | undefined,
        baseClasses,
        overrideClasses
      );
    case "card":
      return applyCardStyling(
        styling.cardStyle as CardStyling | undefined,
        baseClasses,
        overrideClasses
      );
    case "section":
      return applySectionStyling(
        styling as SectionStyling,
        baseClasses,
        overrideClasses
      );
    case "badge":
      return applyCardStyling(
        styling.badgeStyle as CardStyling | undefined,
        baseClasses,
        overrideClasses
      );
    default:
      return cn(baseClasses, overrideClasses);
  }
}

/**
 * Generate CSS custom properties from styling object
 */
export function generateCSSCustomProperties(
  styling: Record<string, unknown>
): Record<string, string> {
  const cssProps: Record<string, string> = {};

  Object.entries(styling).forEach(([key, value]) => {
    if (typeof value === "string") {
      const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      cssProps[`--${cssKey}`] = value;
    }
  });

  return cssProps;
}
