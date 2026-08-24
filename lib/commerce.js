export const sizePrices = {
  "10ML": 50,
  "100ML": 194
};

export function formatPrice(value) {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0
  }).format(value);
}
