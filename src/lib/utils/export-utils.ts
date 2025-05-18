import toast from "react-hot-toast";

export interface ExportOptions {
    /**
     * The file name to use for the export (without extension)
     */
    fileName: string;
    /**
     * The data to be exported
     */
    data: Record<string, unknown>[] | Record<string, unknown>;
    /**
     * The format to export (currently supports 'csv' and 'json')
     */
    format: "csv" | "json";
}

/**
 * Flattens a nested object for CSV export
 */
const flattenObject = (
    obj: Record<string, unknown>,
    prefix = "",
): Record<string, string> => {
    return Object.keys(obj).reduce(
        (acc: Record<string, string>, key: string) => {
            const propKey = prefix ? `${prefix}.${key}` : key;
            const value = obj[key];

            if (
                value !== null && typeof value === "object" &&
                !Array.isArray(value)
            ) {
                Object.assign(
                    acc,
                    flattenObject(value as Record<string, unknown>, propKey),
                );
            } else if (Array.isArray(value)) {
                acc[propKey] = JSON.stringify(value);
            } else {
                acc[propKey] = value?.toString() || "";
            }

            return acc;
        },
        {},
    );
};

/**
 * Process value for CSV format
 */
const processValueForCsv = (value: unknown): string => {
    if (value === null || value === undefined) return "";

    const strValue = typeof value === "object"
        ? JSON.stringify(value)
        : String(value);

    // Escape values that contain commas, quotes, or newlines
    if (
        strValue.includes(",") || strValue.includes('"') ||
        strValue.includes("\n")
    ) {
        return `"${strValue.replace(/"/g, '""')}"`;
    }

    return strValue;
};

/**
 * Exports data to a file (CSV or JSON)
 */
export const exportDataToFile = (
    { fileName, data, format }: ExportOptions,
): void => {
    try {
        if (!data || (Array.isArray(data) && data.length === 0)) {
            throw new Error("No data to export");
        }

        let content: string;
        let mimeType: string;
        let extension: string;

        if (format === "csv") {
            if (Array.isArray(data) && data.length > 0) {
                // Flatten all objects in the array to handle nested structures
                const flattenedData = data.map((item) => flattenObject(item));

                // Get all unique headers from all objects
                const headers = Array.from(
                    new Set(flattenedData.flatMap((obj) => Object.keys(obj))),
                );

                // Create CSV rows
                const csvRows = [
                    headers.join(","), // Header row
                    ...flattenedData.map((row) =>
                        headers.map((header) => processValueForCsv(row[header]))
                            .join(",")
                    ),
                ];
                content = csvRows.join("\n");
            } else if (!Array.isArray(data)) {
                // Handle single object case
                const flattenedData = flattenObject(data);
                const entries = Object.entries(flattenedData);
                content = "Property,Value\n" +
                    entries.map(([key, value]) =>
                        `${processValueForCsv(key)},${
                            processValueForCsv(value)
                        }`
                    ).join("\n");
            } else {
                throw new Error("Invalid data format for export");
            }
            mimeType = "text/csv";
            extension = "csv";
        } else {
            // JSON format
            content = JSON.stringify(data, null, 2);
            mimeType = "application/json";
            extension = "json";
        }

        // Create and download the file
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${fileName}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Clean up to avoid memory leaks

        toast.success(`Data exported as ${fileName}.${extension}`);
    } catch (error) {
        console.error("Error exporting data:", error);
        toast.error(
            `Failed to export data: ${
                error instanceof Error ? error.message : "Unknown error"
            }`,
        );
    }
};
