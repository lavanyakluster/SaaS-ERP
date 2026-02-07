/**
 * Gradient Utilities
 * 
 * Centralized utilities for creating consistent gradient styles
 * across the application
 */

export interface Gradient {
  from: string;
  via: string;
  to: string;
}

/**
 * Creates a full gradient background style
 * @param gradient - Gradient configuration object
 * @returns CSS style object with gradient background
 */
export function getGradientStyle(gradient: Gradient): React.CSSProperties {
  return {
    background: `linear-gradient(135deg, ${gradient.from}, ${gradient.via}, ${gradient.to})`,
  };
}

/**
 * Creates a light/transparent gradient background style (20% opacity)
 * @param gradient - Gradient configuration object
 * @returns CSS style object with transparent gradient background
 */
export function getGradientLightStyle(gradient: Gradient): React.CSSProperties {
  return {
    background: `linear-gradient(135deg, ${gradient.from}20, ${gradient.via}20, ${gradient.to}20)`,
  };
}

/**
 * Creates a gradient text color style
 * @param gradient - Gradient configuration object
 * @returns CSS style object with gradient text
 */
export function getGradientTextStyle(gradient: Gradient): React.CSSProperties {
  return {
    backgroundImage: `linear-gradient(135deg, ${gradient.from}, ${gradient.via}, ${gradient.to})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };
}

/**
 * Gets the primary color from gradient (via color)
 * @param gradient - Gradient configuration object
 * @returns Primary gradient color
 */
export function getGradientPrimaryColor(gradient: Gradient): string {
  return gradient.via;
}

/**
 * Creates a gradient border style
 * @param gradient - Gradient configuration object
 * @param width - Border width (default: 2px)
 * @returns CSS style object with gradient border
 */
export function getGradientBorderStyle(
  gradient: Gradient,
  width: number = 2
): React.CSSProperties {
  return {
    borderImage: `linear-gradient(135deg, ${gradient.from}, ${gradient.via}, ${gradient.to}) 1`,
    borderWidth: `${width}px`,
    borderStyle: 'solid',
  };
}

/**
 * Creates Tailwind CSS gradient class string
 * Note: This requires custom Tailwind configuration for arbitrary values
 * @param gradient - Gradient configuration object
 * @returns Tailwind class string
 */
export function getGradientTailwindClass(gradient: Gradient): string {
  return `bg-gradient-to-br from-[${gradient.from}] via-[${gradient.via}] to-[${gradient.to}]`;
}
