/**
 * Admin configuration and constants
 */

export const ADMIN_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  MAX_IMAGE_SIZE_MB: 5,
  ALLOWED_IMAGE_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ],

  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_PAGE_ID_LENGTH: 100,

  AUTO_SAVE_DELAY_MS: 2000,

  SECTION_TYPES: [
    {
      key: "hero",
      name: "Hero Section",
      description: "Main banner with title, subtitle, and call-to-action",
      icon: "Star",
    },
    {
      key: "aboutServices",
      name: "About Services",
      description: "Service overview section",
      icon: "Info",
    },
    {
      key: "industries",
      name: "Industries",
      description: "Industry expertise showcase with icons",
      icon: "Building",
    },
    {
      key: "trust",
      name: "Trust & Statistics",
      description: "Statistics and trust-building content",
      icon: "Shield",
    },
    {
      key: "customers",
      name: "Customer Testimonials",
      description: "Client testimonials and reviews",
      icon: "Users",
    },
    {
      key: "callToAction",
      name: "Call to Action",
      description: "Final conversion section",
      icon: "ArrowRight",
    },
  ],

  BACKGROUND_OPTIONS: [
    { value: "bg-white", label: "White" },
    { value: "bg-gray-50", label: "Light Gray" },
    { value: "bg-gray-900", label: "Dark Gray" },
    { value: "bg-blue-600", label: "Blue" },
    { value: "bg-purple-600", label: "Purple" },
    { value: "bg-green-600", label: "Green" },
    { value: "bg-gradient-to-r", label: "Gradient" },
    { value: "bg-primary", label: "Primary" },
  ],

  TEXT_COLOR_OPTIONS: [
    { value: "text-white", label: "White" },
    { value: "text-black", label: "Black" },
    { value: "text-gray-900", label: "Dark Gray" },
    { value: "text-gray-600", label: "Medium Gray" },
    { value: "text-blue-600", label: "Blue" },
    { value: "text-primary", label: "Primary" },
    { value: "text-primary-foreground", label: "Primary Foreground" },
  ],

  PADDING_OPTIONS: [
    { value: "py-8 px-4", label: "Small" },
    { value: "py-12 px-4", label: "Medium" },
    { value: "py-20 px-4", label: "Large" },
    { value: "py-32 px-4", label: "Extra Large" },
  ],

  GRADIENT_COLOR_OPTIONS: [
    { value: "blue-600", label: "Blue" },
    { value: "purple-600", label: "Purple" },
    { value: "green-600", label: "Green" },
    { value: "red-600", label: "Red" },
    { value: "orange-600", label: "Orange" },
    { value: "pink-600", label: "Pink" },
    { value: "indigo-600", label: "Indigo" },
    { value: "teal-600", label: "Teal" },
  ],
};

export const VALIDATION_RULES = {
  pageId: {
    pattern: /^[a-z0-9-]+$/,
    minLength: 1,
    maxLength: ADMIN_CONFIG.MAX_PAGE_ID_LENGTH,
  },
  title: {
    minLength: 1,
    maxLength: ADMIN_CONFIG.MAX_TITLE_LENGTH,
  },
  description: {
    minLength: 1,
    maxLength: ADMIN_CONFIG.MAX_DESCRIPTION_LENGTH,
  },
  url: {
    pattern: /^https?:\/\/.+/,
  },
};

export const ERROR_MESSAGES = {
  REQUIRED_FIELD: "This field is required",
  INVALID_PAGE_ID:
    "Page ID can only contain lowercase letters, numbers, and hyphens",
  PAGE_ID_TOO_LONG: `Page ID must be less than ${ADMIN_CONFIG.MAX_PAGE_ID_LENGTH} characters`,
  TITLE_TOO_LONG: `Title must be less than ${ADMIN_CONFIG.MAX_TITLE_LENGTH} characters`,
  DESCRIPTION_TOO_LONG: `Description must be less than ${ADMIN_CONFIG.MAX_DESCRIPTION_LENGTH} characters`,
  INVALID_URL: "Please enter a valid URL",
  FILE_TOO_LARGE: `File size must be less than ${ADMIN_CONFIG.MAX_IMAGE_SIZE_MB}MB`,
  INVALID_FILE_TYPE: "Please select a valid image file (JPEG, PNG, GIF, WebP)",
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
};
