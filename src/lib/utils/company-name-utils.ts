export interface CompanyNameOptions {
  maxLength?: number;
  useFirstWord?: boolean;
  useInitials?: boolean;
  fallback?: string;
}

export function getResponsiveCompanyName(
  companyName: string | null | undefined,
  context: "header" | "admin" | "footer" | "mobile" | "full" = "full",
  options: CompanyNameOptions = {}
): string {
  const { useInitials = false, fallback = "Company" } = options;

  if (!companyName) return fallback;

  const contextConfigs = {
    header: { maxLength: 15, useFirstWord: true },
    admin: { maxLength: 8, useFirstWord: true },
    footer: { maxLength: 25, useFirstWord: false },
    mobile: { maxLength: 10, useFirstWord: true },
    full: { maxLength: undefined, useFirstWord: false },
  };

  const config = { ...contextConfigs[context], ...options };

  if (
    useInitials ||
    (config.maxLength && companyName.length > config.maxLength * 2)
  ) {
    return getCompanyInitials(companyName);
  }

  if (config.useFirstWord) {
    const firstWord = companyName.split(" ")[0];
    if (config.maxLength && firstWord.length > config.maxLength) {
      return firstWord.substring(0, config.maxLength) + "...";
    }
    return firstWord;
  }

  if (config.maxLength && companyName.length > config.maxLength) {
    return companyName.substring(0, config.maxLength) + "...";
  }

  return companyName;
}

export function getCompanyInitials(
  companyName: string | null | undefined
): string {
  if (!companyName) return "C";

  return companyName
    .split(" ")
    .filter((word) => word.length > 0)
    .slice(0, 4)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

export function getResponsiveCompanyDisplay(
  companyName: string | null | undefined
) {
  if (!companyName) return { full: "Company", short: "Company", mobile: "C" };

  return {
    full: companyName,
    short: getResponsiveCompanyName(companyName, "header"),
    mobile: getResponsiveCompanyName(companyName, "mobile"),
    initials: getCompanyInitials(companyName),
  };
}

export function isLongCompanyName(
  companyName: string | null | undefined
): boolean {
  return (companyName?.length || 0) > 20;
}
