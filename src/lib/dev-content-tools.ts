/**
 * Development Content Tools
 *
 * Command-line and development utilities for content management,
 * validation, and testing. These tools help developers work with
 * dynamic content during development.
 */

import {
  ContentDevUtils,
  ContentLoader,
  contentCache,
  validateContentItem,
} from "./content-management";
import { validateStyling, STYLING_PRESETS } from "./styling-utils";
import contentData from "./content-data.json" with { type: 'json' };

/**
 * Development command interface
 */
interface DevCommand {
  name: string;
  description: string;
  execute: (args: string[]) => Promise<void> | void;
}

/**
 * Available development commands
 */
export const DEV_COMMANDS: DevCommand[] = [
  {
    name: "validate",
    description: "Validate all content in the site",
    execute: validateAllContent,
  },
  {
    name: "report",
    description: "Generate a detailed validation report",
    execute: generateReport,
  },
  {
    name: "analyze",
    description: "Analyze content performance and suggest optimizations",
    execute: analyzeContent,
  },
  {
    name: "cache-stats",
    description: "Show content cache statistics",
    execute: showCacheStats,
  },
  {
    name: "cache-clear",
    description: "Clear the content cache",
    execute: clearCache,
  },
  {
    name: "preview-styling",
    description:
      "Preview styling changes (usage: preview-styling <original> <new>)",
    execute: previewStyling,
  },
  {
    name: "test-sample",
    description: "Test with sample content",
    execute: testSampleContent,
  },
  {
    name: "validate-styling",
    description: "Validate styling presets",
    execute: validateStylingPresets,
  },
  {
    name: "help",
    description: "Show available commands",
    execute: showHelp,
  },
];

/**
 * Validate all content
 */
async function validateAllContent(): Promise<void> {
  console.log("🔍 Validating all content...\n");

  const validation = ContentDevUtils.validateSiteContent(contentData);
  const { summary } = validation;

  console.log("📊 Validation Summary:");
  console.log(`   Total Items: ${summary.totalItems}`);
  console.log(`   Valid Items: ${summary.validItems} ✅`);
  console.log(
    `   Invalid Items: ${summary.invalidItems} ${
      summary.invalidItems > 0 ? "❌" : "✅"
    }`
  );
  console.log(
    `   Warnings: ${summary.warnings} ${summary.warnings > 0 ? "⚠️" : "✅"}`
  );
  console.log(
    `   Overall Status: ${validation.isValid ? "✅ VALID" : "❌ INVALID"}\n`
  );

  if (!validation.isValid || summary.warnings > 0) {
    console.log('💡 Run "report" command for detailed information');
  }
}

/**
 * Generate detailed validation report
 */
async function generateReport(): Promise<void> {
  console.log("📝 Generating validation report...\n");

  const report = ContentDevUtils.generateValidationReport(contentData);
  console.log(report);
}

/**
 * Analyze content performance
 */
async function analyzeContent(): Promise<void> {
  console.log("📈 Analyzing content performance...\n");

  const { analysis, suggestions } =
    ContentDevUtils.analyzeContentPerformance(contentData);

  console.log("📊 Content Analysis:");
  console.log(`   Total Size: ${(analysis.totalSize / 1024).toFixed(2)} KB`);
  console.log("   Item Counts:");

  for (const [type, count] of Object.entries(analysis.itemCounts)) {
    const avgSize = analysis.averageSizes[type];
    console.log(
      `     ${type}: ${count} items (avg: ${(avgSize / 1024).toFixed(
        2
      )} KB each)`
    );
  }

  if (analysis.largestItems.length > 0) {
    console.log("\n   Largest Items:");
    analysis.largestItems.slice(0, 5).forEach((item, index) => {
      console.log(
        `     ${index + 1}. ${item.type}:${item.id} - ${(
          item.size / 1024
        ).toFixed(2)} KB`
      );
    });
  }

  if (suggestions.length > 0) {
    console.log("\n💡 Optimization Suggestions:");
    suggestions.forEach((suggestion, index) => {
      console.log(`   ${index + 1}. ${suggestion}`);
    });
  }
}

/**
 * Show cache statistics
 */
async function showCacheStats(): Promise<void> {
  console.log("📊 Content Cache Statistics:\n");

  const stats = contentCache.getStats();

  console.log(`   Total Entries: ${stats.totalEntries}`);
  console.log(`   Total Hits: ${stats.totalHits}`);
  console.log(`   Total Misses: ${stats.totalMisses}`);
  console.log(`   Hit Rate: ${stats.hitRate}%`);
  console.log(`   Memory Usage: ${(stats.memoryUsage / 1024).toFixed(2)} KB`);

  if (stats.totalEntries === 0) {
    console.log(
      "\n💡 Cache is empty. Content will be cached as it's accessed."
    );
  }
}

/**
 * Clear content cache
 */
async function clearCache(): Promise<void> {
  const statsBefore = contentCache.getStats();
  contentCache.clear();

  console.log("🗑️  Content cache cleared!");
  console.log(`   Removed ${statsBefore.totalEntries} entries`);
  console.log(
    `   Freed ${(statsBefore.memoryUsage / 1024).toFixed(2)} KB of memory`
  );
}

/**
 * Preview styling changes
 */
async function previewStyling(args: string[]): Promise<void> {
  if (args.length < 2) {
    console.log("❌ Usage: preview-styling <original-preset> <new-preset>");
    console.log(
      "   Available presets: primary, secondary, success, warning, danger"
    );
    return;
  }

  const [originalPreset, newPreset] = args;

  if (!(originalPreset in STYLING_PRESETS) || !(newPreset in STYLING_PRESETS)) {
    console.log(
      "❌ Invalid preset. Available presets: primary, secondary, success, warning, danger"
    );
    return;
  }

  const original =
    STYLING_PRESETS[originalPreset as keyof typeof STYLING_PRESETS];
  const newStyling = STYLING_PRESETS[newPreset as keyof typeof STYLING_PRESETS];

  console.log(
    `🎨 Previewing styling change: ${originalPreset} → ${newPreset}\n`
  );

  const preview = ContentDevUtils.previewStyling(
    original.button,
    newStyling.button
  );

  console.log("📋 Button Styling Changes:");
  if (preview.changes.added.length > 0) {
    console.log("   Added:", preview.changes.added.join(", "));
  }
  if (preview.changes.modified.length > 0) {
    console.log("   Modified:", preview.changes.modified.join(", "));
  }
  if (preview.changes.removed.length > 0) {
    console.log("   Removed:", preview.changes.removed.join(", "));
  }

  console.log("\n🔍 Validation Result:");
  console.log(`   Valid: ${preview.validation.isValid ? "✅" : "❌"}`);

  if (preview.validation.errors.length > 0) {
    console.log("   Errors:");
    preview.validation.errors.forEach((error) => {
      console.log(`     - ${error.message}`);
    });
  }

  console.log("\n🎯 Preview Result:");
  console.log("  ", JSON.stringify(preview.preview, null, 2));
}

/**
 * Test with sample content
 */
async function testSampleContent(): Promise<void> {
  console.log("🧪 Testing with sample content...\n");

  const samples = ContentDevUtils.generateSampleContent();

  console.log("📝 Generated Sample Content:");
  console.log(`   Job: ${samples.job.title} (${samples.job.department})`);
  console.log(`   Service: ${samples.service.title} (${samples.service.slug})`);
  console.log(
    `   Page: ${samples.page.pageId} (${samples.page.sections.length} sections)`
  );

  console.log("\n🔄 Testing content loading...");

  const loadResults = await ContentLoader.loadMultiple([
    {
      key: "test-job",
      loader: () => samples.job,
      options: { useCache: true, cacheTTL: 60000 },
    },
    {
      key: "test-service",
      loader: () => samples.service,
      options: { useCache: true, cacheTTL: 60000 },
    },
    {
      key: "test-page",
      loader: () => samples.page,
      options: { useCache: true, cacheTTL: 60000 },
    },
  ]);

  loadResults.forEach((result) => {
    const status = result.error ? "❌" : "✅";
    const cache = result.fromCache ? "(cached)" : "(fresh)";
    console.log(`   ${status} ${result.key} ${cache}`);

    if (result.error) {
      console.log(`     Error: ${result.error.message}`);
    }
  });

  console.log("\n📊 Cache Stats After Test:");
  const stats = contentCache.getStats();
  console.log(
    `   Entries: ${stats.totalEntries}, Hits: ${stats.totalHits}, Hit Rate: ${stats.hitRate}%`
  );
}

/**
 * Validate styling presets
 */
async function validateStylingPresets(): Promise<void> {
  console.log("🎨 Validating styling presets...\n");

  let allValid = true;

  for (const [presetName, preset] of Object.entries(STYLING_PRESETS)) {
    console.log(`🔍 Validating preset: ${presetName}`);

    const buttonValidation = validateStyling(preset.button);
    const buttonStatus = buttonValidation.isValid ? "✅" : "❌";
    console.log(`   Button: ${buttonStatus}`);

    if (!buttonValidation.isValid) {
      allValid = false;
      buttonValidation.errors.forEach((error) => {
        console.log(`     - ${error}`);
      });
    }

    const cardValidation = validateStyling(preset.card);
    const cardStatus = cardValidation.isValid ? "✅" : "❌";
    console.log(`   Card: ${cardStatus}`);

    if (!cardValidation.isValid) {
      allValid = false;
      cardValidation.errors.forEach((error) => {
        console.log(`     - ${error}`);
      });
    }

    console.log("");
  }

  console.log(
    `🎯 Overall Status: ${
      allValid ? "✅ All presets valid" : "❌ Some presets have issues"
    }`
  );
}

/**
 * Show help information
 */
async function showHelp(): Promise<void> {
  console.log("🛠️  Content Development Tools\n");
  console.log("Available commands:\n");

  DEV_COMMANDS.forEach((command) => {
    console.log(`   ${command.name.padEnd(15)} - ${command.description}`);
  });

  console.log('\n💡 Usage: runDevCommand("<command-name>", [args])');
  console.log('   Example: runDevCommand("validate")');
  console.log(
    '   Example: runDevCommand("preview-styling", ["primary", "success"])'
  );
}

/**
 * Run a development command
 */
export async function runDevCommand(
  commandName: string,
  args: string[] = []
): Promise<void> {
  const command = DEV_COMMANDS.find((cmd) => cmd.name === commandName);

  if (!command) {
    console.log(`❌ Unknown command: ${commandName}`);
    console.log('💡 Run "help" to see available commands');
    return;
  }

  try {
    await command.execute(args);
  } catch (error) {
    console.error(
      `❌ Command failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Browser-friendly development utilities
 */
export const BrowserDevUtils = {
  /**
   * Add development utilities to window object for browser console access
   */
  attachToWindow(): void {
    if (typeof window !== "undefined") {
      const windowWithTools = window as Window & {
        contentDevTools?: {
          validate: () => Promise<void>;
          report: () => Promise<void>;
          analyze: () => Promise<void>;
          cacheStats: () => Promise<void>;
          clearCache: () => Promise<void>;
          testSample: () => Promise<void>;
          validateStyling: () => Promise<void>;
          help: () => Promise<void>;
          ContentDevUtils: typeof ContentDevUtils;
          ContentLoader: typeof ContentLoader;
          contentCache: typeof contentCache;
          quickValidate: (
            item: unknown,
            type: "job" | "service" | "page"
          ) => ReturnType<typeof validateContentItem>;
          quickStylePreview: (
            original: object,
            newStyling: object
          ) => ReturnType<typeof ContentDevUtils.previewStyling>;
        };
      };

      windowWithTools.contentDevTools = {
        validate: () => runDevCommand("validate"),
        report: () => runDevCommand("report"),
        analyze: () => runDevCommand("analyze"),
        cacheStats: () => runDevCommand("cache-stats"),
        clearCache: () => runDevCommand("cache-clear"),
        testSample: () => runDevCommand("test-sample"),
        validateStyling: () => runDevCommand("validate-styling"),
        help: () => runDevCommand("help"),

        ContentDevUtils,
        ContentLoader,
        contentCache,

        quickValidate: (item: unknown, type: "job" | "service" | "page") => {
          return validateContentItem(item, type);
        },

        quickStylePreview: (original: object, newStyling: object) => {
          return ContentDevUtils.previewStyling(original, newStyling);
        },
      };

      console.log(
        "🛠️  Content development tools attached to window.contentDevTools"
      );
      console.log("💡 Try: contentDevTools.help()");
    }
  },

  /**
   * Create a development panel for content management
   */
  createDevPanel(): HTMLElement | null {
    if (typeof document === "undefined") return null;

    const panel = document.createElement("div");
    panel.id = "content-dev-panel";
    panel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
      background: white;
      border: 1px solid #ccc;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      z-index: 10000;
      font-family: monospace;
      font-size: 12px;
      max-height: 400px;
      overflow-y: auto;
    `;

    panel.innerHTML = `
      <h3 style="margin: 0 0 12px 0; font-size: 14px;">Content Dev Tools</h3>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <button onclick="contentDevTools.validate()" style="padding: 4px 8px; border: 1px solid #ccc; border-radius: 4px; background: #f5f5f5; cursor: pointer;">Validate Content</button>
        <button onclick="contentDevTools.analyze()" style="padding: 4px 8px; border: 1px solid #ccc; border-radius: 4px; background: #f5f5f5; cursor: pointer;">Analyze Performance</button>
        <button onclick="contentDevTools.cacheStats()" style="padding: 4px 8px; border: 1px solid #ccc; border-radius: 4px; background: #f5f5f5; cursor: pointer;">Cache Stats</button>
        <button onclick="contentDevTools.clearCache()" style="padding: 4px 8px; border: 1px solid #ccc; border-radius: 4px; background: #f5f5f5; cursor: pointer;">Clear Cache</button>
        <button onclick="contentDevTools.testSample()" style="padding: 4px 8px; border: 1px solid #ccc; border-radius: 4px; background: #f5f5f5; cursor: pointer;">Test Sample</button>
        <button onclick="document.getElementById('content-dev-panel').remove()" style="padding: 4px 8px; border: 1px solid #ccc; border-radius: 4px; background: #ffebee; cursor: pointer;">Close Panel</button>
      </div>
      <div style="margin-top: 12px; font-size: 10px; color: #666;">
        Check browser console for output
      </div>
    `;

    document.body.appendChild(panel);
    return panel;
  },
};

/**
 * Performance monitoring utilities
 */
export class ContentPerformanceMonitor {
  private static metrics = new Map<
    string,
    {
      calls: number;
      totalTime: number;
      averageTime: number;
      lastCall: number;
    }
  >();

  /**
   * Start timing an operation
   */
  static startTiming(operation: string): () => void {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.recordMetric(operation, duration);
    };
  }

  /**
   * Record a performance metric
   */
  static recordMetric(operation: string, duration: number): void {
    const existing = this.metrics.get(operation);

    if (existing) {
      existing.calls++;
      existing.totalTime += duration;
      existing.averageTime = existing.totalTime / existing.calls;
      existing.lastCall = Date.now();
    } else {
      this.metrics.set(operation, {
        calls: 1,
        totalTime: duration,
        averageTime: duration,
        lastCall: Date.now(),
      });
    }
  }

  /**
   * Get performance metrics
   */
  static getMetrics(): Record<
    string,
    {
      calls: number;
      totalTime: number;
      averageTime: number;
      lastCall: number;
    }
  > {
    const result: Record<
      string,
      {
        calls: number;
        totalTime: number;
        averageTime: number;
        lastCall: number;
      }
    > = {};

    for (const [operation, metrics] of this.metrics.entries()) {
      result[operation] = { ...metrics };
    }

    return result;
  }

  /**
   * Clear all metrics
   */
  static clearMetrics(): void {
    this.metrics.clear();
  }

  /**
   * Get performance report
   */
  static getPerformanceReport(): string {
    const metrics = this.getMetrics();
    let report = "# Content Performance Report\n\n";

    if (Object.keys(metrics).length === 0) {
      report += "No performance data available.\n";
      return report;
    }

    report +=
      "| Operation | Calls | Avg Time (ms) | Total Time (ms) | Last Call |\n";
    report +=
      "|-----------|-------|---------------|-----------------|----------|\n";

    for (const [operation, data] of Object.entries(metrics)) {
      const lastCallDate = new Date(data.lastCall).toLocaleTimeString();
      report += `| ${operation} | ${data.calls} | ${data.averageTime.toFixed(
        2
      )} | ${data.totalTime.toFixed(2)} | ${lastCallDate} |\n`;
    }

    return report;
  }
}

const devContentTools = {
  commands: DEV_COMMANDS,
  run: runDevCommand,
  browser: BrowserDevUtils,
  performance: ContentPerformanceMonitor,
};

export default devContentTools;
