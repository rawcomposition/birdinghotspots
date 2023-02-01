import * as React from "react";
import { auth } from "lib/firebaseAuth";
import { signOut } from "firebase/auth";
import useSecureFetch from "hooks/useSecureFetch";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

export default function useFirebaseLogout() {
  const [loading, setLoading] = React.useState(false);
  const { send } = useSecureFetch();
  const router = useRouter();

  const logout = async () => {
    setLoading(true);
    try {
      await send({
        url: "/api/auth/logout",
        method: "post",
      });
      await signOut(auth);
      toast.success("Logged out");
      router.push("/");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { logout, loading };
}
