import { useState, useContext } from "react";

// context-API:
import { AuthContext } from "../context/AuthContext";

// material-ui:
import {
	Box,
	Card,
	TextField,
	Button,
	Alert,
	Typography,
	Container,
	CircularProgress,
} from "@mui/material";

const LoginPage = () => {
	// context:
	const { login, loading } = useContext(AuthContext);

	// states:
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	// functions:
	const _handleSubmitClick = async (e) => {
		e?.preventDefault();
		setError("");

		if (!username || !password) {
			setError("Username and password are required");
			return;
		}

		const allowedUsernames = ["admin", "admin123", "user", "user123"];

		if (!allowedUsernames.includes(username)) {
			setError("Invalid credentials, please try again");
			return;
		}

		try {
			await login(username, password);
		} catch (error) {
			setError(error.message || "Login failed");
		}
	};

	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				minHeight: "100vh",
				background: "#000",
			}}>
			<Container maxWidth="sm">
				<Card
					sx={{
						padding: 3,
					}}>
					<Typography
						variant="h4"
						component="h1"
						sx={{ textAlign: "center", mb: 2, fontWeight: 600 }}>
						Product Inventory System
					</Typography>

					<Box
						component="form"
						onSubmit={_handleSubmitClick}
						sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
						<TextField
							fullWidth
							label="Username"
							value={username}
							onChange={(e) => setUsername(e?.target?.value)}
							disabled={loading}
							placeholder="Enter your username"
						/>

						<TextField
							fullWidth
							type="password"
							label="Password"
							value={password}
							onChange={(e) => setPassword(e?.target?.value)}
							disabled={loading}
							placeholder="Enter your password"
						/>

						{error && <Alert severity="error">{error}</Alert>}

						<Button
							type="submit"
							fullWidth
							variant="contained"
							disabled={loading}
							sx={{ padding: "10px", fontSize: "1rem", fontWeight: 500 }}>
							{loading ? <CircularProgress size={24} /> : "Login"}
						</Button>
					</Box>

					<Box
						sx={{
							mt: 3,
							p: 2,
							backgroundColor: "#f9f9f9",
							borderRadius: 1,
							borderColor: "primary.main",
						}}>
						<Typography variant="h6" sx={{ mb: 1 }}>
							Test Credentials:(username / password)
						</Typography>
						<Typography variant="body2">
							<strong>Admin:</strong> admin / admin123
						</Typography>
						<Typography variant="body2">
							<strong>User:</strong> user / user123
						</Typography>
					</Box>
				</Card>
			</Container>
		</Box>
	);
};

export default LoginPage;
