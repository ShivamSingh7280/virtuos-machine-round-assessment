import React, { createContext, useState, useCallback } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	// states:
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// localStorage:
	const [token, setToken] = useState(localStorage.getItem("token"));

	const login = useCallback(async (username, password) => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch("http://localhost:5000/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});

			if (![200, 201].includes(response?.status)) {
				throw new Error("Invalid credentials");
			}

			const data = await response?.json();
			localStorage.setItem("token", data?.token);
			localStorage.setItem("user", JSON.stringify(data?.user));

			setToken(data?.token);
			setUser(data?.user);

			setLoading(false);
			return data;
		} catch (error) {
			setError(error?.message);
			setLoading(false);
			console.log("Error found while login: ", error);
		}
	}, []);

	const logout = useCallback(() => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		setToken(null);
		setUser(null);
		setError(null);
	}, []);

	const initializeUser = useCallback(() => {
		const storedToken = localStorage.getItem("token");
		const storedUser = localStorage.getItem("user");

		if (storedToken && storedUser) {
			setToken(storedToken);
			setUser(JSON.parse(storedUser));
		}
	}, []);

	const value = {
		user,
		token,
		loading,
		error,
		login,
		logout,
		initializeUser,
		isAuthenticated: !!token,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
