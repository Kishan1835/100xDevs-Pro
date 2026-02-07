"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getChai(kind) {
    if (typeof kind === "string") {
        return `Making ${kind} chai...`;
    }
    return `Chai order:${kind}`;
}
function serveChai(messga) {
    if (messga) {
        return `serving ${messga}`;
    }
    return `Serving masala chai`;
}
function orderChain(size) {
    if (size === "small") {
        return `Small Chai`;
    }
    if (size === "medium" || size === "large") {
        return `make extra chai`;
    }
    return `chai order#${size}`;
}
class kulharChai {
    serve() {
        return `Serving khlhad chai `;
    }
}
class Cutting {
    serve() {
        return `serving cutting chai `;
    }
}
function serve(chai) {
    if (chai instanceof kulharChai) {
        return chai.serve();
    }
}
function isChaiOrder(obj) {
    return (typeof obj === "object" &&
        obj !== null &&
        typeof obj.type == "string" &&
        typeof obj.type == "number");
}
function serverOrder(item) {
    if (isChaiOrder(item)) {
        return `serving `;
    }
}
//# sourceMappingURL=typesNarrowing.js.map