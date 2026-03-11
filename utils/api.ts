// utils/api.ts
export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://payments-webservice.onrender.com"
      : "http://localhost:5000");

  if (!baseUrl) throw new Error("NEXT_PUBLIC_API_URL is not defined");

  const isFormData = options.body instanceof FormData;

  return fetch(`${baseUrl}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      // Only set JSON content type if NOT FormData
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  });
};