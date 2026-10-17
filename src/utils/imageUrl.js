/**
 * Formats snapshot evidence URL ensuring it resolves correctly across local ports, proxies, and deployed environments.
 */
export const getEvidenceUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  const backendBase =
    import.meta.env.VITE_API_URL ||
    "https://sheriyansh-hackthon-backend.onrender.com";
  return `${backendBase.replace(/\/+$/, "")}${url.startsWith("/") ? "" : "/"}${url}`;
};
