// Helpers for Handlebars

// Return true if the two parameters are equal
export const ifeq = function(this: any, a: any, b: any, options: any) {
    // tslint:disable-next-line: triple-equals
    if (a == b) {
        return options.fn(this);
    }
    return options.inverse(this);
};

// Return true if the two parameters are not equal
export const ifnoteq = function(this: any, a: any, b: any, options: any) {
    // tslint:disable-next-line: triple-equals
    if (a != b) {
        return options.fn(this);
    }
    return options.inverse(this);
};

export default {
    ifeq,
    ifnoteq,
};
