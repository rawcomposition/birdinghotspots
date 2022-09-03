import * as React from "react";
import { auth } from "lib/firebaseAuth";
import { signOut } from "firebase/auth";
import useSecureFetch from "hooks/useSecureFetch";

export default function useFirebaseLogout() {
  const [loading, setLoading] = React.useState(false);
  const secureFetch = useSecureFetch();

  const logout = async () => {
    setLoading(true);
    try {
      await secureFetch("/api/auth/logout", "post");
      await signOut(auth);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { logout, loading };
}
