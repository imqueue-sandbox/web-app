export function clone(obj) {
    return Object.keys(obj).reduce((v, d) => Object.assign(v, {
        [d]: (obj[d].constructor === Object) ? clone(obj[d]) : obj[d]
    }), {});
}
