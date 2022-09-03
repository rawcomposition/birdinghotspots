import * as React from "react";
import { auth } from "lib/firebaseAuth";
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
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(url, {
      method: method || "POST",
      headers: {
        Authorization: token || "",
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : null,
    });
    setLoading(false);
    const json = await response.json();
    if (!json.success) {
      return Promise.reject(json.message || "An error ocurred");
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
      return {};
    }
    setLoading(false);
  };

  return { send: wrappedSend, loading };
}
