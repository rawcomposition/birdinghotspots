import React from "react";
import { auth } from "lib/firebaseAuth";
import { signInWithEmailAndPassword } from "firebase/auth";
import useSecureFetch from "hooks/useSecureFetch";

export default function useFirebaseLogin() {
  const [error, setError] = React.useState<any>();
  const [loading, setLoading] = React.useState(false);
  const { send } = useSecureFetch();

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await send({
        url: "/api/auth/init",
        method: "post",
      });
      return true;
    } catch (error) {
      setError(error);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}
