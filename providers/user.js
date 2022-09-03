import * as React from "react";
import { onAuthStateChanged, onIdTokenChanged } from "firebase/auth";
import { auth } from "lib/firebaseAuth";
import useSecureFetch from "hooks/useSecureFetch";

export const UserContext = React.createContext();

const UserProvider = ({ children }) => {
	const [user, setUser] = React.useState();
	const [loading, setLoading] = React.useState(true);
	const secureFetch = useSecureFetch();

	const refreshUser = React.useCallback(async () => {
		await auth.currentUser.reload();
		setUser({...auth.currentUser});
	}, []);

	React.useEffect(() => {
		onAuthStateChanged(auth, (user) => {
			setUser(user);
			setLoading(false);
		});
		onIdTokenChanged(auth, async (user) => {
      if (!user) {
        await fetch("/api/auth/logout");
      } else {
				const result = await user.getIdTokenResult();
				const claims = result.claims;
				const role = claims.role;
				const regions = claims.regions;
				setUser(prev => ({...prev, role, regions}));
				await secureFetch("/api/auth/init");
      }
    });
	}, []);

	return <UserContext.Provider value={{user, refreshUser, loading}}>{children}</UserContext.Provider>;
};

const useUser = () => {
	const state = React.useContext(UserContext);
	return { ...state };
};

export { UserProvider, useUser };