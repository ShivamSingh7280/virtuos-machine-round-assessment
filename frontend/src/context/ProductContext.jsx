import React, { createContext, useState, useCallback } from "react";

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
	// states:
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [successMessage, setSuccessMessage] = useState(null);

	const fetchProducts = useCallback(async (token) => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch("http://localhost:5000/api/products", {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});

			if (![200, 201].includes(response?.status)) {
				throw new Error("Failed to fetch products");
			}

			const data = await response?.json();
			setProducts(data);
			setLoading(false);
			return data;
		} catch (error) {
			setLoading(false);
			setError(error.message || "Error found while fetching the products.");
		}
	}, []);

	const addProduct = useCallback(
		async (token, product) => {
			setLoading(true);
			setError(null);
			setSuccessMessage(null);
			try {
				const response = await fetch("http://localhost:5000/api/products", {
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(product),
				});

				if (![200, 201].includes(response?.status)) {
					const errorData = await response?.json();
					throw new Error(errorData?.message || "Failed to add product");
				}

				const data = await response?.json();
				setProducts([...products, data]);
				setSuccessMessage("Product added successfully");
				setLoading(false);
				return data;
			} catch (error) {
				setLoading(false);
				setError(error.message || "Error found while adding the product.");
			}
		},
		[products]
	);

	const updateProduct = useCallback(
		async (token, id, quantity) => {
			setLoading(true);
			setError(null);
			setSuccessMessage(null);
			try {
				const response = await fetch(
					`http://localhost:5000/api/products/${id}`,
					{
						method: "PUT",
						headers: {
							Authorization: `Bearer ${token}`,
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ quantity }),
					}
				);

				if (![200, 201].includes(response?.status)) {
					const errorData = await response?.json();
					throw new Error(errorData?.message || "Failed to update product");
				}

				const data = await response?.json();
				setProducts(products.map((p) => (p?.id === id ? data : p)));
				setSuccessMessage("Product updated successfully");
				setLoading(false);
				return data;
			} catch (error) {
				setLoading(false);
				setError(error.message || "Error found while updating.");
			}
		},
		[products]
	);

	const deleteProduct = useCallback(
		async (token, id) => {
			setLoading(true);
			setError(null);
			setSuccessMessage(null);
			try {
				const response = await fetch(
					`http://localhost:5000/api/products/${id}`,
					{
						method: "DELETE",
						headers: {
							Authorization: `Bearer ${token}`,
							"Content-Type": "application/json",
						},
					}
				);

				if (![200, 201].includes(response?.status)) {
					const errorData = await response?.json();
					throw new Error(errorData?.message || "Failed to delete product");
				}

				setProducts(products?.filter((p) => p?.id !== id));
				setLoading(false);
				setSuccessMessage("Product deleted successfully");
			} catch (error) {
				setLoading(false);
				setError(error.message || "Error found while deleting.");
			}
		},
		[products]
	);

	const value = {
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
	};

	return (
		<ProductContext.Provider value={value}>{children}</ProductContext.Provider>
	);
};
