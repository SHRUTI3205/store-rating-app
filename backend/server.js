const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

const PORT = 5000;
const JWT_SECRET = "store_rating_secret_2026";

app.use(cors());
app.use(express.json());

/* =========================
   DATABASE
========================= */

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "shruti123",
  database: "store_rating_app",
});

db.connect((err) => {
  if (err) {
    console.error("MySQL Connection Failed:", err.message);
    return;
  }

  console.log("MySQL Connected Successfully!");
});


/* =========================
   HELPER FUNCTIONS
========================= */

function validateName(name) {
  return (
    typeof name === "string" &&
    name.trim().length >= 20 &&
    name.trim().length <= 60
  );
}

function validateEmail(email) {
  return (
    typeof email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

function validatePassword(password) {
  if (
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 16
  ) {
    return false;
  }

  if (!/[A-Z]/.test(password)) {
    return false;
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return false;
  }

  return true;
}


/* =========================
   AUTHENTICATION MIDDLEWARE
========================= */

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Authentication token required",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Invalid authentication token",
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        message: "Invalid or expired token",
      });
    }

    req.user = user;
    next();
  });
}


function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Administrator access required",
    });
  }

  next();
}


function requireOwner(req, res, next) {
  if (!req.user || req.user.role !== "store_owner") {
    return res.status(403).json({
      message: "Store owner access required",
    });
  }

  next();
}


/* =========================
   HOME
========================= */

app.get("/", (req, res) => {
  res.json({
    message: "Store Rating API is running",
  });
});


/* =========================
   REGISTER NORMAL USER
========================= */

app.post("/register", async (req, res) => {
  try {
    const { name, email, address, password } = req.body;

    if (!validateName(name)) {
      return res.status(400).json({
        message: "Name must be between 20 and 60 characters",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    if (
      typeof address !== "string" ||
      address.trim().length === 0 ||
      address.length > 400
    ) {
      return res.status(400).json({
        message: "Address is required and cannot exceed 400 characters",
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message:
          "Password must be 8-16 characters and contain at least one uppercase letter and one special character",
      });
    }

    db.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            message: "Database error",
          });
        }

        if (results.length > 0) {
          return res.status(409).json({
            message: "Email is already registered",
          });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
          `INSERT INTO users
           (name, email, password, role, address)
           VALUES (?, ?, ?, 'user', ?)`,
          [
            name.trim(),
            email.trim(),
            hashedPassword,
            address.trim(),
          ],
          (insertErr, result) => {
            if (insertErr) {
              console.error(insertErr);

              return res.status(500).json({
                message: "Unable to register user",
              });
            }

            res.status(201).json({
              message: "Registration successful",
              userId: result.insertId,
            });
          }
        );
      }
    );
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});


/* =========================
   LOGIN
========================= */

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!validateEmail(email)) {
    return res.status(400).json({
      message: "Please enter a valid email address",
    });
  }

  if (!password) {
    return res.status(400).json({
      message: "Password is required",
    });
  }

  db.query(
    `SELECT id, name, email, password, role, address
     FROM users
     WHERE email = ?`,
    [email],
    async (err, results) => {
      if (err) {
        console.error(err);

        return res.status(500).json({
          message: "Database error",
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      const user = results[0];

      const passwordMatch = await bcrypt.compare(
        password,
        user.password
      );

      if (!passwordMatch) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          address: user.address,
        },
      });
    }
  );
});


/* =========================
   CURRENT USER
========================= */

app.get("/me", authenticateToken, (req, res) => {
  db.query(
    `SELECT id, name, email, role, address
     FROM users
     WHERE id = ?`,
    [req.user.id],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          message: "Database error",
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      res.json(results[0]);
    }
  );
});


/* =========================
   GET STORES
   PUBLIC + LOGGED-IN USER
========================= */

app.get("/stores", (req, res) => {
  let userId = null;

  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch (error) {
        userId = null;
      }
    }
  }

  const query = `
    SELECT
      s.id,
      s.name,
      s.email,
      s.address,
      s.owner_id,
      COALESCE(ROUND(AVG(r.rating), 1), 0) AS overall_rating,
      COUNT(r.id) AS total_ratings,
      COALESCE(
        MAX(
          CASE
            WHEN r.user_id = ? THEN r.rating
            ELSE NULL
          END
        ),
        0
      ) AS user_rating
    FROM stores s
    LEFT JOIN ratings r
      ON s.id = r.store_id
    GROUP BY
      s.id,
      s.name,
      s.email,
      s.address,
      s.owner_id
    ORDER BY s.name ASC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error(err);

      return res.status(500).json({
        message: "Unable to fetch stores",
      });
    }

    res.json(results);
  });
});


/* =========================
   SEARCH STORES
========================= */

app.get("/stores/search", (req, res) => {
  const search = req.query.search || "";

  db.query(
    `SELECT
       s.id,
       s.name,
       s.email,
       s.address,
       s.owner_id,
       COALESCE(ROUND(AVG(r.rating), 1), 0) AS overall_rating,
       COUNT(r.id) AS total_ratings
     FROM stores s
     LEFT JOIN ratings r
       ON s.id = r.store_id
     WHERE
       s.name LIKE ?
       OR s.address LIKE ?
     GROUP BY
       s.id,
       s.name,
       s.email,
       s.address,
       s.owner_id
     ORDER BY s.name ASC`,
    [`%${search}%`, `%${search}%`],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          message: "Unable to search stores",
        });
      }

      res.json(results);
    }
  );
});


/* =========================
   SUBMIT / UPDATE RATING
========================= */

app.post(
  "/ratings",
  authenticateToken,
  (req, res) => {
    const { store_id, rating } = req.body;

    if (req.user.role !== "user") {
      return res.status(403).json({
        message: "Only normal users can submit ratings",
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    db.query(
      `SELECT id
       FROM ratings
       WHERE user_id = ? AND store_id = ?`,
      [req.user.id, store_id],
      (err, results) => {
        if (err) {
          return res.status(500).json({
            message: "Database error",
          });
        }

        if (results.length > 0) {
          db.query(
            `UPDATE ratings
             SET rating = ?
             WHERE user_id = ? AND store_id = ?`,
            [
              numericRating,
              req.user.id,
              store_id,
            ],
            (updateErr) => {
              if (updateErr) {
                console.error(updateErr);

                return res.status(500).json({
                  message: "Unable to update rating",
                });
              }

              return res.json({
                message: "Rating updated successfully",
              });
            }
          );
        } else {
          db.query(
            `INSERT INTO ratings
             (user_id, store_id, rating)
             VALUES (?, ?, ?)`,
            [
              req.user.id,
              store_id,
              numericRating,
            ],
            (insertErr) => {
              if (insertErr) {
                console.error(insertErr);

                return res.status(500).json({
                  message: "Unable to submit rating",
                });
              }

              return res.status(201).json({
                message: "Rating submitted successfully",
              });
            }
          );
        }
      }
    );
  }
);


/* =========================
   MY RATINGS
========================= */

app.get(
  "/my-ratings",
  authenticateToken,
  (req, res) => {
    db.query(
      `SELECT
         r.id,
         r.rating,
         s.id AS store_id,
         s.name AS store_name,
         s.address AS store_address
       FROM ratings r
       JOIN stores s
         ON r.store_id = s.id
       WHERE r.user_id = ?
       ORDER BY s.name ASC`,
      [req.user.id],
      (err, results) => {
        if (err) {
          return res.status(500).json({
            message: "Unable to fetch ratings",
          });
        }

        res.json(results);
      }
    );
  }
);


/* =========================
   UPDATE PASSWORD
========================= */

app.put(
  "/update-password",
  authenticateToken,
  async (req, res) => {
    const { newPassword } = req.body;

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be 8-16 characters and contain at least one uppercase letter and one special character",
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(
        newPassword,
        10
      );

      db.query(
        `UPDATE users
         SET password = ?
         WHERE id = ?`,
        [
          hashedPassword,
          req.user.id,
        ],
        (err) => {
          if (err) {
            console.error(err);

            return res.status(500).json({
              message: "Unable to update password",
            });
          }

          res.json({
            message: "Password updated successfully",
          });
        }
      );
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);


/* =========================================================
   ADMIN SECTION
========================================================= */


/* =========================
   ADMIN DASHBOARD STATS
========================= */

app.get(
  "/admin/stats",
  authenticateToken,
  requireAdmin,
  (req, res) => {
    const queries = {
      users: "SELECT COUNT(*) AS total FROM users",
      stores: "SELECT COUNT(*) AS total FROM stores",
      ratings: "SELECT COUNT(*) AS total FROM ratings",
    };

    db.query(
      queries.users,
      (err, userResults) => {
        if (err) {
          return res.status(500).json({
            message: "Unable to fetch statistics",
          });
        }

        db.query(
          queries.stores,
          (storeErr, storeResults) => {
            if (storeErr) {
              return res.status(500).json({
                message: "Unable to fetch statistics",
              });
            }

            db.query(
              queries.ratings,
              (ratingErr, ratingResults) => {
                if (ratingErr) {
                  return res.status(500).json({
                    message: "Unable to fetch statistics",
                  });
                }

                res.json({
                  total_users:
                    userResults[0].total,
                  total_stores:
                    storeResults[0].total,
                  total_ratings:
                    ratingResults[0].total,
                });
              }
            );
          }
        );
      }
    );
  }
);


/* =========================
   ADMIN GET USERS
========================= */

app.get(
  "/admin/users",
  authenticateToken,
  requireAdmin,
  (req, res) => {
    const {
      name = "",
      email = "",
      address = "",
      role = "",
      sortBy = "name",
      order = "ASC",
    } = req.query;

    const allowedSortColumns = {
      name: "u.name",
      email: "u.email",
      address: "u.address",
      role: "u.role",
    };

    const sortColumn =
      allowedSortColumns[sortBy] || "u.name";

    const sortOrder =
      String(order).toUpperCase() === "DESC"
        ? "DESC"
        : "ASC";

    const query = `
      SELECT
        u.id,
        u.name,
        u.email,
        u.address,
        u.role,
        CASE
          WHEN u.role = 'store_owner' THEN
            COALESCE(
              (
                SELECT ROUND(AVG(r.rating), 1)
                FROM ratings r
                JOIN stores s
                  ON r.store_id = s.id
                WHERE s.owner_id = u.id
              ),
              0
            )
          ELSE NULL
        END AS owner_rating
      FROM users u
      WHERE
        u.name LIKE ?
        AND u.email LIKE ?
        AND u.address LIKE ?
        AND u.role LIKE ?
      ORDER BY ${sortColumn} ${sortOrder}
    `;

    db.query(
      query,
      [
        `%${name}%`,
        `%${email}%`,
        `%${address}%`,
        `%${role}%`,
      ],
      (err, results) => {
        if (err) {
          console.error(err);

          return res.status(500).json({
            message: "Unable to fetch users",
          });
        }

        res.json(results);
      }
    );
  }
);


/* =========================
   ADMIN USER DETAILS
========================= */

app.get(
  "/admin/users/:id",
  authenticateToken,
  requireAdmin,
  (req, res) => {
    const userId = req.params.id;

    db.query(
      `SELECT
         id,
         name,
         email,
         address,
         role
       FROM users
       WHERE id = ?`,
      [userId],
      (err, userResults) => {
        if (err) {
          return res.status(500).json({
            message: "Database error",
          });
        }

        if (userResults.length === 0) {
          return res.status(404).json({
            message: "User not found",
          });
        }

        const user = userResults[0];

        if (user.role !== "store_owner") {
          return res.json(user);
        }

        db.query(
          `SELECT
             s.id,
             s.name,
             s.email,
             s.address,
             COALESCE(ROUND(AVG(r.rating), 1), 0)
               AS rating
           FROM stores s
           LEFT JOIN ratings r
             ON s.id = r.store_id
           WHERE s.owner_id = ?
           GROUP BY
             s.id,
             s.name,
             s.email,
             s.address`,
          [userId],
          (storeErr, stores) => {
            if (storeErr) {
              return res.status(500).json({
                message: "Unable to fetch owner details",
              });
            }

            res.json({
              ...user,
              stores,
            });
          }
        );
      }
    );
  }
);


/* =========================
   ADMIN ADD USER
========================= */

app.post(
  "/admin/users",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    const {
      name,
      email,
      address,
      password,
      role,
    } = req.body;

    if (!validateName(name)) {
      return res.status(400).json({
        message: "Name must be between 20 and 60 characters",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    if (
      typeof address !== "string" ||
      address.trim().length === 0 ||
      address.length > 400
    ) {
      return res.status(400).json({
        message: "Address is required and cannot exceed 400 characters",
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message:
          "Password must be 8-16 characters and contain at least one uppercase letter and one special character",
      });
    }

    const allowedRoles = [
      "user",
      "admin",
      "store_owner",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid user role",
      });
    }

    db.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) {
          return res.status(500).json({
            message: "Database error",
          });
        }

        if (results.length > 0) {
          return res.status(409).json({
            message: "Email is already registered",
          });
        }

        try {
          const hashedPassword =
            await bcrypt.hash(password, 10);

          db.query(
            `INSERT INTO users
             (name, email, password, role, address)
             VALUES (?, ?, ?, ?, ?)`,
            [
              name.trim(),
              email.trim(),
              hashedPassword,
              role,
              address.trim(),
            ],
            (insertErr, result) => {
              if (insertErr) {
                console.error(insertErr);

                return res.status(500).json({
                  message: "Unable to create user",
                });
              }

              res.status(201).json({
                message: "User created successfully",
                userId: result.insertId,
              });
            }
          );
        } catch (error) {
          console.error(error);

          res.status(500).json({
            message: "Server error",
          });
        }
      }
    );
  }
);


/* =========================
   ADMIN GET RATINGS
========================= */

app.get(
  "/admin/ratings",
  authenticateToken,
  requireAdmin,
  (req, res) => {
    db.query(
      `SELECT
         r.id,
         r.rating,
         u.name AS user_name,
         u.email AS user_email,
         s.name AS store_name,
         s.address AS store_address
       FROM ratings r
       JOIN users u
         ON r.user_id = u.id
       JOIN stores s
         ON r.store_id = s.id
       ORDER BY r.id DESC`,
      (err, results) => {
        if (err) {
          return res.status(500).json({
            message: "Unable to fetch ratings",
          });
        }

        res.json(results);
      }
    );
  }
);


/* =========================
   ADMIN GET STORES
========================= */

app.get(
  "/admin/stores",
  authenticateToken,
  requireAdmin,
  (req, res) => {
    const {
      name = "",
      email = "",
      address = "",
      sortBy = "name",
      order = "ASC",
    } = req.query;

    const allowedSortColumns = {
      name: "s.name",
      email: "s.email",
      address: "s.address",
      rating: "rating",
    };

    const sortColumn =
      allowedSortColumns[sortBy] || "s.name";

    const sortOrder =
      String(order).toUpperCase() === "DESC"
        ? "DESC"
        : "ASC";

    const query = `
      SELECT
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id,
        COALESCE(ROUND(AVG(r.rating), 1), 0)
          AS rating,
        COUNT(r.id) AS total_ratings,
        owner.name AS owner_name
      FROM stores s
      LEFT JOIN ratings r
        ON s.id = r.store_id
      LEFT JOIN users owner
        ON s.owner_id = owner.id
      WHERE
        s.name LIKE ?
        AND s.email LIKE ?
        AND s.address LIKE ?
      GROUP BY
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id,
        owner.name
      ORDER BY ${sortColumn} ${sortOrder}
    `;

    db.query(
      query,
      [
        `%${name}%`,
        `%${email}%`,
        `%${address}%`,
      ],
      (err, results) => {
        if (err) {
          console.error(err);

          return res.status(500).json({
            message: "Unable to fetch stores",
          });
        }

        res.json(results);
      }
    );
  }
);


/* =========================
   ADMIN ADD STORE
========================= */

app.post(
  "/admin/stores",
  authenticateToken,
  requireAdmin,
  (req, res) => {
    const {
      name,
      email,
      address,
      owner_id,
    } = req.body;

    if (
      typeof name !== "string" ||
      name.trim().length === 0
    ) {
      return res.status(400).json({
        message: "Store name is required",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        message: "Please enter a valid store email",
      });
    }

    if (
      typeof address !== "string" ||
      address.trim().length === 0 ||
      address.length > 400
    ) {
      return res.status(400).json({
        message: "Address is required and cannot exceed 400 characters",
      });
    }

    const insertStore = () => {
      db.query(
        `INSERT INTO stores
         (name, email, address, owner_id)
         VALUES (?, ?, ?, ?)`,
        [
          name.trim(),
          email.trim(),
          address.trim(),
          owner_id || null,
        ],
        (err, result) => {
          if (err) {
            console.error(err);

            return res.status(500).json({
              message: "Unable to create store",
            });
          }

          res.status(201).json({
            message: "Store created successfully",
            storeId: result.insertId,
          });
        }
      );
    };

    if (owner_id) {
      db.query(
        `SELECT id
         FROM users
         WHERE id = ? AND role = 'store_owner'`,
        [owner_id],
        (err, results) => {
          if (err) {
            return res.status(500).json({
              message: "Database error",
            });
          }

          if (results.length === 0) {
            return res.status(400).json({
              message: "Selected store owner does not exist",
            });
          }

          insertStore();
        }
      );
    } else {
      insertStore();
    }
  }
);


/* =========================
   ADMIN GET STORE OWNERS
========================= */

app.get(
  "/admin/owners",
  authenticateToken,
  requireAdmin,
  (req, res) => {
    db.query(
      `SELECT
         id,
         name,
         email,
         address
       FROM users
       WHERE role = 'store_owner'
       ORDER BY name ASC`,
      (err, results) => {
        if (err) {
          return res.status(500).json({
            message: "Unable to fetch store owners",
          });
        }

        res.json(results);
      }
    );
  }
);


/* =========================================================
   STORE OWNER SECTION
========================================================= */


/* =========================
   OWNER DASHBOARD
========================= */

app.get(
  "/owner/dashboard",
  authenticateToken,
  requireOwner,
  (req, res) => {
    const ownerId = req.user.id;

    db.query(
      `SELECT
         s.id,
         s.name,
         s.email,
         s.address,
         COALESCE(ROUND(AVG(r.rating), 1), 0)
           AS average_rating,
         COUNT(r.id) AS total_ratings
       FROM stores s
       LEFT JOIN ratings r
         ON s.id = r.store_id
       WHERE s.owner_id = ?
       GROUP BY
         s.id,
         s.name,
         s.email,
         s.address`,
      [ownerId],
      (err, stores) => {
        if (err) {
          console.error(err);

          return res.status(500).json({
            message: "Unable to fetch owner dashboard",
          });
        }

        db.query(
          `SELECT
             r.id,
             r.rating,
             u.name AS user_name,
             u.email AS user_email,
             s.name AS store_name
           FROM ratings r
           JOIN users u
             ON r.user_id = u.id
           JOIN stores s
             ON r.store_id = s.id
           WHERE s.owner_id = ?
           ORDER BY r.id DESC`,
          [ownerId],
          (ratingErr, ratings) => {
            if (ratingErr) {
              return res.status(500).json({
                message: "Unable to fetch owner ratings",
              });
            }

            res.json({
              stores,
              ratings,
            });
          }
        );
      }
    );
  }
);


/* =========================
   OWNER RATINGS
========================= */

app.get(
  "/owner/ratings",
  authenticateToken,
  requireOwner,
  (req, res) => {
    db.query(
      `SELECT
         r.id,
         r.rating,
         u.name AS user_name,
         u.email AS user_email,
         s.name AS store_name,
         s.address AS store_address
       FROM ratings r
       JOIN users u
         ON r.user_id = u.id
       JOIN stores s
         ON r.store_id = s.id
       WHERE s.owner_id = ?
       ORDER BY r.id DESC`,
      [req.user.id],
      (err, results) => {
        if (err) {
          return res.status(500).json({
            message: "Unable to fetch ratings",
          });
        }

        res.json(results);
      }
    );
  }
);


/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});