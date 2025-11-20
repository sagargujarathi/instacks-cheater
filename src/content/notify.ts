export const toast = (
  message: string,
  variant: "info" | "warn" | "error" = "info",
  timeout = 2500
) => {
  const div = document.createElement("div");
  const base =
    "position:fixed;bottom:10px;right:10px;padding:8px 12px;font-size:12px;border-radius:4px;z-index:9999;box-shadow:0 2px 4px rgba(0,0,0,.2);";
  const color =
    variant === "error"
      ? "background:#dc2626;color:#fff;"
      : variant === "warn"
        ? "background:#f59e0b;color:#fff;"
        : "background:#2563eb;color:#fff;";
  div.style.cssText = base + color;
  div.textContent = message;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), timeout);
};
