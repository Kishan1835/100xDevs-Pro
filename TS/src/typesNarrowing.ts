function getChai(kind: string | number) {
    if (typeof kind === "string") {
        return `Making ${kind} chai...`
    }
    return `Chai order:${kind}`
}


function serveChai(messga?: string) {
    if (messga) {
        return `serving ${messga}`
    }
    return `Serving masala chai`
}


function orderChain(size: "small" | "medium" | "large" | number) {

    if (size === "small") {
        return `Small Chai`
    }
    if (size === "medium" || size === "large") {
        return `make extra chai`
    }
    return `chai order#${size}`

}


class kulharChai {
    serve() {
        return `Serving khlhad chai `
    }
}

class Cutting {
    serve() {
        return `serving cutting chai `
    }
}

function serve(chai: kulharChai | Cutting) {
    if (chai instanceof kulharChai) {
        return chai.serve()
    }
}

type chaiOrder = {
    type: string
    sugar: number
}


function isChaiOrder(obj: any): obj is chaiOrder {
    return (
        typeof obj === "object" &&
        obj !== null &&
        typeof obj.type == "string" &&
        typeof obj.type == "number"
    )
}


function serverOrder(item: chaiOrder | string) {
    if (isChaiOrder(item)) {
        return `serving ${item.type} chai with ${item.sugar}`
    }
    return `Serving custom Order ${item}`
}



type MasalaChai = {
    type: "masala";
    speiceLevel: number
}
type GinerChai = {
    type: "giner";
    amount: number
}
type ElaichiChai = {
    type: "elaichi";
    aroma: number
}


type Chai = MasalaChai | GinerChai | ElaichiChai;

function MakeChai(chaitype: Chai) {
    switch (chaitype.type) {
        case "masala":
            return "masala chai"
        case "elaichi":
            return "elaichi chai"
        case "giner":
            return "ginger chai"
            break;

    }
}

function brew(order: MasalaChai | GinerChai) {
    if ("spicelevel" in order) {

    }
}

function isStringArr(arr: unknown): arr is string[]{
    return
}