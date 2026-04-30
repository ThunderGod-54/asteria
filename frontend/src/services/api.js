const BASE_URL = "http://localhost:5000/api";

// Focus
export const getFocusData = async () => {
  const res = await fetch(`${BASE_URL}/focus`);
  return res.json();
};

// AI
export const getAIInsights = async (data) => {
  const res = await fetch(`${BASE_URL}/ai`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

//  Apps
export const getAppUsage = async () => {
  const res = await fetch(`${BASE_URL}/apps`);
  return res.json();
};

// Face
export const getFaceState = async () => {
  const res = await fetch(`${BASE_URL}/face`);
  return res.json();
};
