import { colorToStyles, normalizeColorValue, tailwindToHex } from "@/lib/color-utils";

/**
 * Section styling interface for frontend components
 */
export interface SectionStyling {
  backgroundColor?: string | string[];
  textColor?: string;
  padding?: string;
  gradientDirection?: string;
  buttonStyle?: {
    backgroundColor?: string | string[];
    textColor?: string;
    hoverBackgroundColor?: string | string[];
    hoverTextColor?: string;
    size?: string;
    variant?: string;
  };
  cardStyle?: {
    backgroundColor?: string | string[];
    hoverBackgroundColor?: string | string[];
    borderColor?: string;
    hoverBorderColor?: string;
    shadowColor?: string;
    hoverShadowColor?: string;
    borderRadius?: string;
    padding?: string;
  };
}

type GradientDirection = "to-r" | "to-b" | "to-br" | "to-bl";

function normalizeGradientDirection(direction?: string): GradientDirection {
  const validDirections: GradientDirection[] = ["to-r", "to-b", "to-br", "to-bl"];
  if (direction && validDirections.includes(direction as GradientDirection)) {
    return direction as GradientDirection;
  }
  return "to-r";
}

/**
 * Generates CSS styles for a section based on styling configuration
 */
export function generateSectionStyles(styling?: SectionStyling) {
  if (!styling) {
    return {
      sectionStyles: {},
      textStyles: {},
      paddingClass: "py-12 md:py-16",
    };
  }

  const sectionStyles = styling.backgroundColor
    ? colorToStyles(
        styling.backgroundColor,
        "background",
        normalizeGradientDirection(styling.gradientDirection)
      )
    : {};

  const textStyles = styling.textColor
    ? colorToStyles(styling.textColor, "text")
    : {};

  const paddingClass = styling.padding || "py-12 md:py-16";

  return {
    sectionStyles,
    textStyles,
    paddingClass,
  };
}

/**
 * Generates CSS styles for cards based on styling configuration
 */
export function generateCardStyles(cardStyle?: SectionStyling["cardStyle"]) {
  if (!cardStyle) {
    return {
      cardStyles: {},
      hoverStyles: {},
    };
  }

  const cardStyles = cardStyle.backgroundColor
    ? colorToStyles(cardStyle.backgroundColor, "background")
    : {};

  const hoverStyles = cardStyle.hoverBackgroundColor
    ? colorToStyles(cardStyle.hoverBackgroundColor, "background")
    : {};

  return {
    cardStyles,
    hoverStyles,
    borderRadius: cardStyle.borderRadius || "rounded-lg",
    padding: cardStyle.padding || "p-6",
  };
}

export function resolveBackgroundStyle(background?: string | string[]) {
  if (!background) {
    return { backgroundClassName: "", backgroundStyle: {} };
  }

  const backgroundClassName =
    typeof background === "string" && background.startsWith("bg-")
      ? background
      : "";
  const backgroundStyle =
    background && !backgroundClassName
      ? colorToStyles(normalizeColorValue(background), "background")
      : {};

  return { backgroundClassName, backgroundStyle };
}

/**
 * Generates CSS styles for buttons based on styling configuration
 */
export function generateButtonStyles(
  buttonStyle?: SectionStyling["buttonStyle"]
) {
  if (!buttonStyle) {
    return {
      buttonStyles: {},
      hoverStyles: {},
    };
  }

  const buttonStyles = buttonStyle.backgroundColor
    ? colorToStyles(buttonStyle.backgroundColor, "background")
    : {};

  const textStyles = buttonStyle.textColor
    ? colorToStyles(buttonStyle.textColor, "text")
    : {};

  const hoverStyles = buttonStyle.hoverBackgroundColor
    ? colorToStyles(buttonStyle.hoverBackgroundColor, "background")
    : {};

  return {
    buttonStyles: { ...buttonStyles, ...textStyles },
    hoverStyles,
    size: buttonStyle.size || "default",
    variant: buttonStyle.variant || "default",
  };
}

/**
 * Converts legacy Tailwind classes to modern hex colors for backward compatibility
 */
export function migrateLegacyColors(styling?: SectionStyling): SectionStyling {
  const migratedStyling: SectionStyling = { ...(styling || {}) };

  if (
    migratedStyling.backgroundColor &&
    typeof migratedStyling.backgroundColor === "string"
  ) {
    if (migratedStyling.backgroundColor.startsWith("bg-")) {
      migratedStyling.backgroundColor = tailwindToHex(
        migratedStyling.backgroundColor
      );
    }
  }

  if (
    migratedStyling.textColor &&
    migratedStyling.textColor.startsWith("text-")
  ) {
    migratedStyling.textColor = tailwindToHex(migratedStyling.textColor);
  }

  if (migratedStyling.buttonStyle) {
    if (
      typeof migratedStyling.buttonStyle.backgroundColor === "string" &&
      migratedStyling.buttonStyle.backgroundColor.startsWith("bg-")
    ) {
      migratedStyling.buttonStyle.backgroundColor = tailwindToHex(
        migratedStyling.buttonStyle.backgroundColor
      );
    }
    if (migratedStyling.buttonStyle.textColor?.startsWith("text-")) {
      migratedStyling.buttonStyle.textColor = tailwindToHex(
        migratedStyling.buttonStyle.textColor
      );
    }
  }

  if (migratedStyling.cardStyle) {
    if (
      typeof migratedStyling.cardStyle.backgroundColor === "string" &&
      migratedStyling.cardStyle.backgroundColor.startsWith("bg-")
    ) {
      migratedStyling.cardStyle.backgroundColor = tailwindToHex(
        migratedStyling.cardStyle.backgroundColor
      );
    }
  }

  return migratedStyling;
}
