export function updateIfChanged(dst, src) {
  for (const key of Object.keys(src)) {
    if (dst[key] !== src[key]) {
      const result = Object.assign({}, dst, src);
      Object.freeze(result);
      return result;
    }
  }
  return dst;
}

export function x() {}
