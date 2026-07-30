export const sizePrices = {
  "10ML": 1299,
  "100ML": 4999
};

export function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}
