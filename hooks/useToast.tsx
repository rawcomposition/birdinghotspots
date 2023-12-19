import React from "react";
import toast from "react-hot-toast";

type Options = {
  url: string;
  method?: string;
  data?: any;
  success?: string;
  error?: string;
  loading?: string;
};

type sendOptions = {
  url: string;
  method?: string;
  data?: any;
};

export default function useToast() {
  const [loading, setLoading] = React.useState(false);

  const send = async ({ url, method, data }: sendOptions) => {
    setLoading(true);
    const response = await fetch(url, {
      method: method || "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : null,
    });
    setLoading(false);
    let json: any = {};
    try {
      json = await response.json();
    } catch (error) {}
    if (response.status === 504) return Promise.reject("Please try again, operation timed out.");
    if (response.status === 404) return Promise.reject("Route not found");
    if (!response.ok || !json.success) {
      return Promise.reject(json.error || "An error ocurred");
    }
    return json;
  };

  const wrappedSend = async ({ success, error, loading, ...options }: Options) => {
    try {
      return await toast.promise(send(options), {
        loading: loading || "loading...",
        success: <b>{success || "Success"}</b>,
        error: (message) => <b>{error || message.toString() || "An error occurred"}</b>,
      });
    } catch (error) {
      setLoading(false);
      return {};
    }
  };

  return { send: wrappedSend, loading };
}
