export async function rpcCall(method: string, params: any[]) {
  const response = await fetch(
    "https://mainnet.sandshrew.io/v1/154f9aaa25a986241357836c37f8d71",
    {
      method: "POST",
      body: JSON.stringify({
        method,
        params,
        jsonrpc: "2.0",
        id: Date.now(),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return (await response.json()).result;
}