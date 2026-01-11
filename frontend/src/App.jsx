import React, { useContext, useEffect, useState } from "react";

// context-API:
import { AuthContext } from "./context/AuthContext";
import { ProductContext } from "./context/ProductContext";

// material-ui:
import { Box, CircularProgress } from "@mui/material";

// components:
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

function App() {
	// context:
	const { isAuthenticated, initializeUser } = useContext(AuthContext);

	// states:
	const [initialized, setInitialized] = useState(false);

	useEffect(() => {
		initializeUser();
		setInitialized(true);
	}, []);

	if (!initialized) {
		return (
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				minHeight="100vh">
				<CircularProgress />
			</Box>
		);
	}

	return (
		<React.Fragment>
			{!isAuthenticated ? <LoginPage /> : <DashboardPage />}
		</React.Fragment>
	);
}

export default App;
