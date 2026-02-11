"use client";

import React, { useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { isValidHexColor } from "@/lib/color-utils";
import { AlertCircle, CheckCircle } from "lucide-react";

const supportsColorInput = () => {
  if (typeof window === "undefined") return true;
  const input = document.createElement("input");
  input.type = "color";
  return input.type === "color";
};

interface ColorPickerInputProps {
  label: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  supportGradient?: boolean;
  gradientDirection?: "to-r" | "to-b" | "to-br" | "to-bl";
  className?: string;
  disabled?: boolean;
  error?: string;
  showValidation?: boolean;
}

export function ColorPickerInput({
  label,
  value,
  onChange,
  supportGradient = false,
  gradientDirection = "to-r",
  className,
  disabled = false,
  error,
  showValidation = true,
}: ColorPickerInputProps) {
  const isGradientMode = Array.isArray(value) && value.length === 2;
  const [gradientEnabled, setGradientEnabled] = useState(isGradientMode);
  const [browserSupportsColor] = useState(supportsColorInput);

  const getSingleColor = useCallback(() => {
    if (Array.isArray(value)) {
      return value[0] || "#000000";
    }
    return value || "#000000";
  }, [value]);

  const getGradientColors = useCallback(() => {
    if (Array.isArray(value) && value.length === 2) {
      return value;
    }
    const singleColor = getSingleColor();
    return [singleColor, singleColor];
  }, [value, getSingleColor]);

  const validateColor = useCallback((color: string) => {
    return isValidHexColor(color);
  }, []);

  const getValidationStatus = useCallback(() => {
    if (!showValidation) return null;

    if (Array.isArray(value)) {
      const allValid = value.every(validateColor);
      return allValid ? "valid" : "invalid";
    }

    return validateColor(value as string) ? "valid" : "invalid";
  }, [value, validateColor, showValidation]);

  const handleSingleColorChange = useCallback(
    (newColor: string) => {
      if (!validateColor(newColor)) {
        console.warn(`Invalid color format: ${newColor}`);
        return;
      }

      if (gradientEnabled && supportGradient) {
        const [, secondColor] = getGradientColors();
        onChange([newColor, secondColor]);
      } else {
        onChange(newColor);
      }
    },
    [
      gradientEnabled,
      supportGradient,
      getGradientColors,
      onChange,
      validateColor,
    ]
  );

  const handleGradientColorChange = useCallback(
    (index: 0 | 1, newColor: string) => {
      if (!validateColor(newColor)) {
        console.warn(`Invalid color format: ${newColor}`);
        return;
      }

      const currentColors = getGradientColors();
      const newColors = [...currentColors];
      newColors[index] = newColor;
      onChange(newColors);
    },
    [getGradientColors, onChange, validateColor]
  );

  const handleGradientToggle = useCallback(
    (enabled: boolean) => {
      setGradientEnabled(enabled);
      if (enabled) {
        const singleColor = getSingleColor();
        onChange([singleColor, singleColor]);
      } else {
        const singleColor = getSingleColor();
        onChange(singleColor);
      }
    },
    [getSingleColor, onChange]
  );

  const getPreviewStyle = useCallback(() => {
    if (gradientEnabled && Array.isArray(value) && value.length === 2) {
      return {
        background: `linear-gradient(${gradientDirection}, ${value[0]}, ${value[1]})`,
      };
    }
    const singleColor = getSingleColor();
    return {
      backgroundColor: singleColor,
    };
  }, [gradientEnabled, value, gradientDirection, getSingleColor]);

  const validationStatus = getValidationStatus();

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Label className="text-sm font-medium">{label}</Label>
          {showValidation && validationStatus && (
            <div className="flex items-center">
              {validationStatus === "valid" ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          )}
        </div>
        {supportGradient && (
          <div className="flex items-center space-x-2">
            <Label
              htmlFor={`gradient-${label}`}
              className="text-xs text-muted-foreground"
            >
              Gradient
            </Label>
            <Switch
              id={`gradient-${label}`}
              checked={gradientEnabled}
              onCheckedChange={handleGradientToggle}
              disabled={disabled}
            />
          </div>
        )}
      </div>

      <div className="space-y-3">
        {gradientEnabled && supportGradient ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Color 1</Label>
              <div className="flex items-center space-x-2">
                {browserSupportsColor ? (
                  <input
                    type="color"
                    value={getGradientColors()[0]}
                    onChange={(e) =>
                      handleGradientColorChange(0, e.target.value)
                    }
                    disabled={disabled}
                    className="w-12 h-8 rounded border border-input cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`${label} - First gradient color`}
                  />
                ) : (
                  <input
                    type="text"
                    value={getGradientColors()[0]}
                    onChange={(e) =>
                      handleGradientColorChange(0, e.target.value)
                    }
                    disabled={disabled}
                    placeholder="#000000"
                    className="w-20 h-8 px-2 text-xs rounded border border-input disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`${label} - First gradient color (hex)`}
                  />
                )}
                <span className="text-xs font-mono text-muted-foreground">
                  {getGradientColors()[0]}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Color 2</Label>
              <div className="flex items-center space-x-2">
                {browserSupportsColor ? (
                  <input
                    type="color"
                    value={getGradientColors()[1]}
                    onChange={(e) =>
                      handleGradientColorChange(1, e.target.value)
                    }
                    disabled={disabled}
                    className="w-12 h-8 rounded border border-input cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`${label} - Second gradient color`}
                  />
                ) : (
                  <input
                    type="text"
                    value={getGradientColors()[1]}
                    onChange={(e) =>
                      handleGradientColorChange(1, e.target.value)
                    }
                    disabled={disabled}
                    placeholder="#000000"
                    className="w-20 h-8 px-2 text-xs rounded border border-input disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`${label} - Second gradient color (hex)`}
                  />
                )}
                <span className="text-xs font-mono text-muted-foreground">
                  {getGradientColors()[1]}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            {browserSupportsColor ? (
              <input
                type="color"
                value={getSingleColor()}
                onChange={(e) => handleSingleColorChange(e.target.value)}
                disabled={disabled}
                className="w-12 h-8 rounded border border-input cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={`${label} color picker`}
              />
            ) : (
              <input
                type="text"
                value={getSingleColor()}
                onChange={(e) => handleSingleColorChange(e.target.value)}
                disabled={disabled}
                placeholder="#000000"
                className="w-20 h-8 px-2 text-xs rounded border border-input disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={`${label} color (hex)`}
              />
            )}
            <span className="text-xs font-mono text-muted-foreground">
              {getSingleColor()}
            </span>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Preview</Label>
          <div
            className="w-full h-8 rounded border border-input"
            style={getPreviewStyle()}
            aria-label={`Color preview for ${label}`}
          />
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {!browserSupportsColor && (
          <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border">
            Your browser doesn&apos;t support color picker. Please enter hex color
            codes manually (e.g., #ff0000).
          </div>
        )}

        <noscript>
          <div className="text-xs text-muted-foreground">
            Color picker requires JavaScript. Please enter hex color codes
            manually.
          </div>
        </noscript>
      </div>
    </div>
  );
}
