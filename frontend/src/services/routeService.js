const API_BASE_URL = "https://goroute-api.onrender.com";

export async function getRoutes(routeData) {
  const response = await fetch(`${API_BASE_URL}/routes/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(routeData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData
        ? JSON.stringify(errorData)
        : `Request failed with status ${response.status}`,
    );
  }

  return response.json();
}