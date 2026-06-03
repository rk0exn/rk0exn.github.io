export class JSONParser {
    parse(jsonString) {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            throw new Error(`Invalid JSON: ${error.message}`);
        }
    }

    getType(value) {
        if (value === null) return 'null';
        if (Array.isArray(value)) return 'array';
        return typeof value;
    }

    isExpandable(value) {
        return typeof value === 'object' && value !== null;
    }

    getItemCount(value) {
        if (Array.isArray(value)) {
            return value.length;
        }
        if (typeof value === 'object' && value !== null) {
            return Object.keys(value).length;
        }
        return 0;
    }
}