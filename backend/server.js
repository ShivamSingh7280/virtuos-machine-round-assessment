const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const JWT_SECRET = "secret_key";

// Middleware
app.use(cors());
app.use(express.json());

let products = [
	{
		id: 1,
		name: "Laptop",
		category: "Electronics",
		price: 999,
		quantity: 15,
		status: "in-stock",
	},
	{
		id: 2,
		name: "Mouse",
		category: "Electronics",
		price: 25,
		quantity: 8,
		status: "low-stock",
	},
	{
		id: 3,
		name: "Keyboard",
		category: "Electronics",
		price: 75,
		quantity: 0,
		status: "out-of-stock",
	},
	{
		id: 4,
		name: "Monitor",
		category: "Electronics",
		price: 299,
		quantity: 5,
		status: "low-stock",
	},
	{
		id: 5,
		name: "Desk Chair",
		category: "Furniture",
		price: 199,
		quantity: 12,
		status: "in-stock",
	},
];

let nextProductId = 6;

const users = [
	{ username: "admin", password: "admin123", role: "admin" },
	{ username: "user", password: "user123", role: "user" },
];

const calculateStatus = (quantity) => {
	if (quantity > 10) return "in-stock";
	if (quantity > 0 && quantity <= 10) return "low-stock";
	return "out-of-stock";
};

const updateProductStatus = (product) => {
	product.status = calculateStatus(product.quantity);
	return product;
};

const authenticateToken = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) {
		return res.status(401).json({ message: "No token provided" });
	}

	jwt.verify(token, JWT_SECRET, (err, user) => {
		if (err) {
			return res.status(403).json({ message: "Invalid token" });
		}
		req.user = user;
		next();
	});
};

const authorizeAdmin = (req, res, next) => {
	if (req.user.role !== "admin") {
		return res.status(403).json({ message: "Access denied. Admin only." });
	}
	next();
};

// POST /api/auth/login:
app.post("/api/auth/login", (req, res) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res
			.status(400)
			.json({ message: "Username and password are required" });
	}

	const user = users.find(
		(u) => u.username === username && u.password === password
	);

	if (!user) {
		return res.status(401).json({ message: "Invalid credentials" });
	}

	const token = jwt.sign(
		{ username: user.username, role: user.role },
		JWT_SECRET,
		{
			expiresIn: "24h",
		}
	);

	res.status(200).json({
		token,
		user: {
			username: user.username,
			role: user.role,
		},
	});
});

// ==================== PRODUCT ENDPOINTS ====================

// GET /api/products - Get all products
app.get("/api/products", authenticateToken, (req, res) => {
	res.status(200).json(products);
});

// POST /api/products - Create product (admin only)
app.post("/api/products", authenticateToken, authorizeAdmin, (req, res) => {
	const { name, category, price, quantity } = req.body;

	if (!name || !category || price === undefined || quantity === undefined) {
		return res.status(400).json({ message: "All fields are required" });
	}

	if (typeof price !== "number" || price < 0) {
		return res.status(400).json({ message: "Price must be a positive number" });
	}

	if (typeof quantity !== "number" || quantity < 0) {
		return res
			.status(400)
			.json({ message: "Quantity must be a positive number" });
	}

	const newProduct = {
		id: nextProductId++,
		name,
		category,
		price,
		quantity,
		status: calculateStatus(quantity),
	};

	products.push(newProduct);
	res.status(201).json(newProduct);
});

// PUT /api/products/:id - Update product quantity (admin only)
app.put("/api/products/:id", authenticateToken, authorizeAdmin, (req, res) => {
	const { id } = req.params;
	const { quantity } = req.body;

	// Validation
	if (quantity === undefined) {
		return res.status(400).json({ message: "Quantity is required" });
	}

	if (typeof quantity !== "number" || quantity < 0) {
		return res
			.status(400)
			.json({ message: "Quantity must be a positive number" });
	}

	const product = products.find((p) => p.id === parseInt(id));

	if (!product) {
		return res.status(404).json({ message: "Product not found" });
	}

	product.quantity = quantity;
	updateProductStatus(product);

	res.status(200).json(product);
});

// PUT /api/products/:id - Update product price (admin only)
app.put(
	"/api/products-price/:id",
	authenticateToken,
	authorizeAdmin,
	(req, res) => {
		const { id } = req.params;
		const { price } = req.body;

		// Validation
		if (price === undefined) {
			return res.status(400).json({ message: "Quantity is required" });
		}

		if (typeof price !== "number" || price < 0) {
			return res
				.status(400)
				.json({ message: "price must be a positive number" });
		}

		const product = products.find((p) => p.id === parseInt(id));

		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		product.price = price;
		updateProductStatus(product);

		res.status(200).json(product);
	}
);

// DELETE /api/products/:id - Delete product (admin only)
app.delete(
	"/api/products/:id",
	authenticateToken,
	authorizeAdmin,
	(req, res) => {
		const { id } = req.params;
		const index = products.findIndex((p) => p.id === parseInt(id));

		if (index === -1) {
			return res.status(404).json({ message: "Product not found" });
		}

		const deletedProduct = products.splice(index, 1);
		res.status(200).json({
			message: "Product deleted successfully",
			product: deletedProduct[0],
		});
	}
);

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).json({ message: "Internal server error" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	console.log("Test credentials:");
	console.log("Admin: admin / admin123");
	console.log("User: user / user123");
});
