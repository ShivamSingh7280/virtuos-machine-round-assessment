import React, { useState, useContext, useEffect } from "react";

// context-API:
import { AuthContext } from "../context/AuthContext";
import { ProductContext } from "../context/ProductContext";

// material-ui:
import {
	Box,
	Toolbar,
	Typography,
	Button,
	TextField,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Chip,
	Container,
	Alert,
	CircularProgress,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Tooltip,
	Stepper,
	Step,
	StepLabel,
} from "@mui/material";

const DashboardPage = () => {
	// context:
	const { user, token, logout } = useContext(AuthContext);
	const {
		products,
		loading,
		error,
		successMessage,
		fetchProducts,
		addProduct,
		updateProduct,
		deleteProduct,
		setError,
		setSuccessMessage,
		updateProductPrice,
	} = useContext(ProductContext);

	// states:
	const [searchVal, setSearchVal] = useState("");
	const [filterCategory, setFilterCategory] = useState("");
	const [filterStatus, setFilterStatus] = useState("");
	const [showAddModal, setShowAddModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [formData, setFormData] = useState({
		name: "",
		category: "",
		price: "",
		quantity: "",
	});
	const [editQuantity, setEditQuantity] = useState("");

	const [editingPriceId, setEditingPriceId] = useState(null);
	const [editPrice, setEditPrice] = useState("");

	const [isNextClick, setIsNextClick] = useState(false);

	// functions:

	const categories = [...new Set((products || [])?.map((p) => p?.category))];

	const filteredProducts = (products || [])?.filter((product) => {
		const matchesSearch = product?.name
			?.toLowerCase()
			?.includes(searchVal?.toLowerCase());
		const matchesCategory =
			!filterCategory || product?.category === filterCategory;
		const matchesStatus = !filterStatus || product?.status === filterStatus;
		return matchesSearch && matchesCategory && matchesStatus;
	});

	const _handleAddProduct = async (e) => {
		e?.preventDefault();

		console.log("_handleAddProduct: formData: ", formData);
		if (
			!formData?.name ||
			!formData?.category ||
			!formData?.price ||
			!formData?.quantity
		) {
			setError("All fields are required");
			return;
		}

		try {
			await addProduct(token, {
				name: formData?.name,
				category: formData?.category,
				price: parseFloat(formData?.price),
				quantity: parseInt(formData?.quantity, 10),
			});
			setFormData({ name: "", category: "", price: "", quantity: "" });
			setShowAddModal(false);
			setTimeout(() => setSuccessMessage(null), 3000);
		} catch (error) {
			console.log("Error found in _handleAddProduct: ", error);
		}
	};

	const _handleEditQuantity = async (e) => {
		e?.preventDefault();

		console.log("editQuantity:", editQuantity);
		if (+editQuantity < 0) {
			setError("Please enter a valid quantity");
			return;
		}

		console.log(token, selectedProduct);
		try {
			await updateProduct(
				token,
				selectedProduct?.id,
				parseInt(editQuantity, 10)
			);
			setShowEditModal(false);
			setSelectedProduct(null);
			setEditQuantity("");
			setTimeout(() => setSuccessMessage(null), 3000);
		} catch (error) {
			console.log("Error found in _handleEditQuantity: ", error);
		}
	};

	const _handleEditPrice = async () => {
		if (+editPrice < 0) {
			setError("Please enter a valid price");
			return;
		}

		try {
			await updateProductPrice(token, editingPriceId, parseFloat(editPrice));
			setEditingPriceId(null);
			setEditPrice("");
			setTimeout(() => setSuccessMessage(null), 3000);
		} catch (error) {
			console.log("Error found in _handleEditPrice: ", error);
		}
	};

	const _handleDeleteProduct = async () => {
		try {
			console.log(token, selectedProduct);
			await deleteProduct(token, selectedProduct?.id);
			setShowDeleteConfirm(false);
			setSelectedProduct(null);
			setTimeout(() => setSuccessMessage(null), 3000);
		} catch (error) {
			console.log("Error found in _handleDeleteProduct: ", error);
		}
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "in-stock":
				return "success";
			case "low-stock":
				return "warning";
			case "out-of-stock":
				return "error";
			default:
				return "default";
		}
	};

	const handleLogout = () => logout();

	// useEffect:
	useEffect(() => {
		if (!token) return;
		fetchProducts(token);
	}, [token]);

	const _handleNextClick = () => {
		if (!formData?.name || !formData?.category) {
			setError("All fields are required");
			return;
		} else {
			setIsNextClick(true);
		}
	};

	const _handlePreviousClick = () => {
		setIsNextClick(false);
	};

	return (
		<Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
			<Toolbar sx={{ justifyContent: "space-between" }}>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 2,
						width: "100%",
						justifyContent: "space-between",
					}}>
					<Typography
						variant="body1"
						sx={{ fontWeight: "600", fontSize: "1rem" }}>
						{user?.username === "user" ? "User" : "Admin"}
					</Typography>

					<Tooltip title="Logout">
						<Typography
							onClick={handleLogout}
							variant="body1"
							sx={{ fontWeight: 600, cursor: "pointer" }}>
							Logout
						</Typography>
					</Tooltip>
				</Box>
			</Toolbar>

			<Box sx={{ flex: 1, p: 3, backgroundColor: "#f5f7fa" }}>
				<Container maxWidth="lg">
					{error && (
						<Alert
							severity="error"
							onClose={() => setError(null)}
							sx={{ mb: 2 }}>
							{error}
						</Alert>
					)}

					{successMessage && (
						<Alert
							severity="success"
							onClose={() => setSuccessMessage(null)}
							sx={{ mb: 2 }}>
							{successMessage}
						</Alert>
					)}

					<Box
						sx={{
							display: "flex",
							gap: 2,
							mb: 3,
							flexWrap: "wrap",
							alignItems: "center",
						}}>
						<TextField
							label="Search by product name"
							value={searchVal}
							onChange={(e) => setSearchVal(e?.target?.value)}
							size="small"
							sx={{ flex: "1 1 200px", minWidth: 200 }}
						/>

						<FormControl size="small" sx={{ minWidth: 150 }}>
							<InputLabel>Category</InputLabel>
							<Select
								value={filterCategory}
								label="Category"
								onChange={(e) => setFilterCategory(e?.target?.value)}>
								<MenuItem value="">All Categories</MenuItem>
								{categories?.map((catogory) => (
									<MenuItem key={catogory} value={catogory}>
										{catogory}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						<FormControl size="small" sx={{ minWidth: 150 }}>
							<InputLabel>Status</InputLabel>
							<Select
								value={filterStatus}
								label="Status"
								onChange={(e) => setFilterStatus(e?.target?.value)}>
								<MenuItem value="">All Status</MenuItem>
								<MenuItem value="in-stock">In Stock</MenuItem>
								<MenuItem value="low-stock">Low Stock</MenuItem>
								<MenuItem value="out-of-stock">Out of Stock</MenuItem>
							</Select>
						</FormControl>

						{user?.role === "admin" && (
							<Button variant="contained" onClick={() => setShowAddModal(true)}>
								Add Product
							</Button>
						)}
					</Box>

					{loading ? (
						<Box
							sx={{
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								minHeight: 200,
							}}>
							<CircularProgress />
						</Box>
					) : (
						<TableContainer component={Paper}>
							{filteredProducts?.length === 0 ? (
								<Box sx={{ p: 3, textAlign: "center", color: "#7f8c8d" }}>
									<Typography>No products found</Typography>
								</Box>
							) : (
								<Table>
									<TableHead>
										<TableRow>
											<TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
											<TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
											<TableCell sx={{ fontWeight: 600 }} align="right">
												Price
											</TableCell>
											<TableCell sx={{ fontWeight: 600 }} align="center">
												Quantity
											</TableCell>
											<TableCell sx={{ fontWeight: 600 }} align="center">
												Status
											</TableCell>
											{user?.role === "admin" && (
												<TableCell sx={{ fontWeight: 600 }} align="center">
													Actions
												</TableCell>
											)}
										</TableRow>
									</TableHead>
									<TableBody>
										{filteredProducts?.map((product) => (
											<TableRow
												key={product?.id}
												sx={{ "&:hover": { backgroundColor: "#fff" } }}>
												<TableCell>{product?.name}</TableCell>
												<TableCell>{product?.category}</TableCell>

												<TableCell align="right">
													{editingPriceId === product.id ? (
														<input
															autoFocus
															value={editPrice}
															onChange={(e) => setEditPrice(e.target.value)}
															onBlur={_handleEditPrice}
															style={{ width: "80px" }}
														/>
													) : (
														<span
															onClick={() => {
																setEditingPriceId(product.id);
																setEditPrice(product.price.toFixed(2));
															}}
															style={{ cursor: "pointer" }}>
															${product.price.toFixed(2)}
														</span>
													)}
												</TableCell>

												<TableCell align="center">
													{product?.quantity}
												</TableCell>
												<TableCell align="center">
													<Chip
														label={product?.status}
														color={getStatusColor(product?.status)}
														size="small"
														variant="outlined"
														sx={{ padding: "1rem", fontWeight: "600" }}
													/>
												</TableCell>

												{user?.role === "admin" && (
													<TableCell align="center">
														<Tooltip title="Edit Quantity" sx={{}}>
															<span
																onClick={() => {
																	setSelectedProduct(product);
																	setEditQuantity(product.quantity.toString());
																	setShowEditModal(true);
																}}
																style={{
																	fontWeight: "500",
																	fontSize: "1rem",
																	padding: "0 0.5rem 0 0",
																	cursor: "pointer",
																}}>
																Edit
															</span>
														</Tooltip>

														<Tooltip title="Delete">
															<span
																onClick={() => {
																	setSelectedProduct(product);
																	setShowDeleteConfirm(true);
																}}
																style={{
																	fontWeight: "500",
																	fontSize: "1rem",
																	cursor: "pointer",
																	padding: "0 0 0 0.5rem",
																}}>
																Delete
															</span>
														</Tooltip>
													</TableCell>
												)}
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</TableContainer>
					)}
				</Container>
			</Box>

			<Dialog open={showAddModal} onClose={() => setShowAddModal(false)}>
				<DialogTitle>Add New Product</DialogTitle>

				<DialogContent sx={{ minWidth: 360, pt: 2 }}>
					{/* Stepper */}
					<Stepper
						activeStep={isNextClick ? 1 : 0}
						alternativeLabel
						sx={{ mb: 2 }}>
						<Step>
							<StepLabel>Basic Info</StepLabel>
						</Step>
						<Step>
							<StepLabel>Pricing</StepLabel>
						</Step>
					</Stepper>

					{!isNextClick ? (
						<>
							<TextField
								fullWidth
								label="Product Name"
								value={formData?.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								margin="normal"
							/>

							<TextField
								fullWidth
								label="Category"
								value={formData?.category}
								onChange={(e) =>
									setFormData({ ...formData, category: e.target.value })
								}
								margin="normal"
							/>

							<DialogActions sx={{ px: 0, mt: 2 }}>
								<Button variant="contained" onClick={_handleNextClick}>
									Next
								</Button>
								<Button onClick={() => setShowAddModal(false)}>Cancel</Button>
							</DialogActions>
						</>
					) : (
						<>
							<TextField
								fullWidth
								label="Price"
								type="number"
								inputProps={{ step: "0.01" }}
								value={formData?.price}
								onChange={(e) =>
									setFormData({ ...formData, price: e.target.value })
								}
								margin="normal"
							/>

							<TextField
								fullWidth
								label="Quantity"
								type="number"
								value={formData?.quantity}
								onChange={(e) =>
									setFormData({ ...formData, quantity: e.target.value })
								}
								margin="normal"
							/>

							<DialogActions sx={{ px: 0, mt: 2 }}>
								<Button onClick={_handlePreviousClick}>Previous</Button>
								<Button variant="contained" onClick={_handleAddProduct}>
									Add Product
								</Button>
								<Button onClick={() => setShowAddModal(false)}>Cancel</Button>
							</DialogActions>
						</>
					)}
				</DialogContent>
			</Dialog>

			<Dialog open={showEditModal} onClose={() => setShowEditModal(false)}>
				<DialogTitle>Edit Product Quantity</DialogTitle>
				<DialogContent sx={{ minWidth: 360, pt: 2 }}>
					<Typography variant="body2" sx={{ mb: 1 }}>
						<strong>Product:</strong> {selectedProduct?.name}
					</Typography>
					<Typography variant="body2" sx={{ mb: 2 }}>
						<strong>Current Quantity:</strong> {selectedProduct?.quantity}
					</Typography>
					<TextField
						fullWidth
						label="New Quantity"
						type="number"
						value={editQuantity}
						onChange={(e) => setEditQuantity(e?.target?.value)}
						inputProps={{ min: 0 }}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setShowEditModal(false)}>Cancel</Button>
					<Button variant="contained" onClick={_handleEditQuantity}>
						Update Quantity
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				open={showDeleteConfirm}
				onClose={() => setShowDeleteConfirm(false)}>
				<DialogTitle>Confirm Delete</DialogTitle>
				<DialogContent>
					<Typography>
						Are you sure you want to delete{" "}
						<strong>{selectedProduct?.name}</strong>?
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
					<Button
						variant="contained"
						color="error"
						onClick={_handleDeleteProduct}>
						Delete
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default DashboardPage;
