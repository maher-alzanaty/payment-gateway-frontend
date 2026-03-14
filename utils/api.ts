// utils/api.ts
export const apiFetch = async (path: string, options: RequestInit = {}) => {
  // const baseUrl =
  //   process.env.NEXT_PUBLIC_API_URL ||
  //   (process.env.NODE_ENV === "production"
  //     ? "https://payment-backend-app.onrender.com"
  //     : "http://localhost:5000");
  // Use full backend URL
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || // set in Vercel environment variables
    "https://payment-backend-app.onrender.com";



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