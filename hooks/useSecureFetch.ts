import React from "react";
import { auth } from "lib/firebaseAuth";
import toast from "react-hot-toast";

type Options = {
  url: string;
  method?: string;
  data?: any;
  error?: string;
};

export default function useFetch() {
  const [loading, setLoading] = React.useState(false);

  const send = async ({ url, method, data }: Options) => {
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(url, {
        method: method || "GET",
        body: data ? JSON.stringify(data) : null,
        headers: {
          Authorization: token || "",
          "Content-Type": "application/json",
        },
      });

      setLoading(false);
      let json: any = {};
      try {
        json = await response.json();
      } catch (error) {}
      if (!response.ok) {
        toast.error(response.status === 404 ? "Route not found" : json.error || "An error ocurred");
        return {};
      }
      if (!json.success) {
        toast.error(json.error || "An error ocurred");
        return {};
      }

      return json;
    } catch (error) {
      toast.error("An error ocurred");
    } finally {
      setLoading(false);
    }
  };

  return { send, loading };
}
