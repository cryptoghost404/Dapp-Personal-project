



export async function GetSwapData(quote) {
  const response = await fetch("/api/swap", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      quote:quote
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || data.message || data.error || "Quote failed"
    );
  }

  return data;
}