
import http from "http";
import pool from "./db.js";
import crypto from "crypto";
import bcrypt from "bcrypt";

const server = http.createServer(async (req, res) => {

    async function authenticate(req, res) {

        try {
            const cookie = req.headers.cookie;

            if (!cookie) {
                res.writeHead(401, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    message: "Invalid Session_Id or Session_Id Expired"
                }));

                return null;
            }

            const sessionCookie = cookie.split(";").find((item) => {
                return item.trim().startsWith("sessionId=");
            });

            if (!sessionCookie) {
                res.writeHead(401, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    message: "Invalid Session_Id or Session_Id Expired"
                }));

                return null;
            }

            const sessionId = sessionCookie.split("=")[1];

            const result = await pool.query(
                `SELECT user_id
                 FROM sessions
                 WHERE session_id = $1
                 AND expires_at > NOW()`,
                [sessionId]
            );

            if (result.rows.length === 0) {
                res.writeHead(401, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    message: "Session invalid or expired"
                }));

                return null;
            }

            return result.rows[0].user_id;

        } catch (error) {
            console.error(error);

            res.writeHead(500, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                message: "Internal server error"
            }));

            return null;
        }
    }

    console.log("METHOD:", req.method);
    console.log("URL:", req.url);

    // CORS configuration
    res.setHeader(
        "Access-Control-Allow-Origin",
        "http://localhost:5173"
    );

    res.setHeader(
        "Access-Control-Allow-Credentials",
        "true"
    );

    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );

    // Handle preflight request
    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    // ---------------- GET REQUEST ----------------

    if (req.method === "GET" && req.url === "/todo") {

        try {
            let user_Id = await authenticate(req, res);

            if (!user_Id) {
                return;
            }

            const result = await pool.query(
                "SELECT * FROM task_table WHERE user_id = $1 ORDER BY id ASC",
                [user_Id]
            );

            res.writeHead(200, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify(result.rows));

        } catch (error) {
            console.error(error);

            res.writeHead(500, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                message: "Database error"
            }));
        }

        return;
    }

    // ---------------- POST TODO REQUEST ----------------

    else if (req.method === "POST" && req.url === "/todo") {

        let user_Id = await authenticate(req, res);

        if (!user_Id) {
            return;
        }

        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", async () => {

            try {
                const todo = JSON.parse(body);

                const result = await pool.query(
                    "INSERT INTO task_table (task, user_id) VALUES ($1, $2) RETURNING *",
                    [todo.task, user_Id]
                );

                res.writeHead(201, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    message: "Todo was created successfully",
                    Added_Row: result.rows[0]
                }));

            } catch (error) {
                console.error(error);

                res.writeHead(500, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    message: "Something went wrong"
                }));
            }
        });

        return;
    }

    // ---------------- LOGIN REQUEST ----------------

    else if (req.method === "POST" && req.url === "/login") {

        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", async () => {

            try {
                const data = JSON.parse(body);

                let result;

                if (data.userDetails.endsWith("@gmail.com")) {

                    result = await pool.query(
                        "SELECT * FROM users WHERE email = $1",
                        [data.userDetails]
                    );

                } else {

                    result = await pool.query(
                        "SELECT * FROM users WHERE username = $1",
                        [data.userDetails]
                    );
                }

                if (result.rows.length === 0) {
                    res.writeHead(401, {
                        "Content-Type": "application/json"
                    });

                    return res.end(JSON.stringify({
                        message: "User not found"
                    }));
                }

                const user = result.rows[0];

                const isValid = await bcrypt.compare(
                    data.password,
                    user.password
                );

                if (!isValid) {
                    res.writeHead(401, {
                        "Content-Type": "application/json"
                    });

                    return res.end(JSON.stringify({
                        message: "Invalid password"
                    }));
                }

                const sessionId = crypto.randomBytes(32).toString("hex");

                const expiresAt = new Date(
                    Date.now() + 30 * 60 * 1000
                );

                await pool.query(
                    `INSERT INTO sessions (session_id, expires_at, user_id)
                     VALUES ($1, $2, $3)`,
                    [sessionId, expiresAt, user.id]
                );

                res.setHeader(
                    "Set-Cookie",
                    `sessionId=${sessionId}; HttpOnly; Path=/; SameSite=Lax`
                );

                res.writeHead(200, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    message: "Logined successfully",
                    user_id: user.id
                }));

            } catch (error) {
                console.error(error);

                res.writeHead(500, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    message: "Internal server error"
                }));
            }
        });

        return;
    }

    // ---------------- CREATE NEW ACCOUNT ----------------

    else if (req.method === "POST" && req.url === "/NewAccount") {

        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", async () => {

            try {
                body = JSON.parse(body);

                const hash_password = await bcrypt.hash(body.Password, 10);

                const user_result = await pool.query(
                    "INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *",
                    [body.UserName, hash_password, body.Email]
                );

                const session_Id = crypto.randomBytes(32).toString("hex");

                const expires_at = new Date(
                    Date.now() + 30 * 60 * 1000
                );

                await pool.query(
                    `INSERT INTO sessions (session_id, expires_at, user_id)
                     VALUES ($1, $2, $3)`,
                    [session_Id, expires_at, user_result.rows[0].id]
                );

                res.setHeader(
                    "Set-Cookie",
                    `sessionId=${session_Id}; HttpOnly; Path=/; SameSite=Lax`
                );

                res.writeHead(201, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    message: "Account created successfully"
                }));

            } catch (error) {
                console.error(error);

                res.writeHead(500, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    message: error.message
                }));
            }
        });

        return;
    }

    // ---------------- PUT REQUEST ----------------

    else if (req.method === "PUT" && req.url === "/todo") {

        let user_Id = await authenticate(req, res);

        if (!user_Id) {
            return;
        }

        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", async () => {

            try {
                const data = JSON.parse(body);

                const result = await pool.query(
                    "UPDATE task_table SET task = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
                    [data.Updated_Task, data.Id, user_Id]
                );

                console.log(result.rows);

                if (result.rows.length === 0) {

                    res.writeHead(404, {
                        "Content-Type": "application/json"
                    });

                    res.end(JSON.stringify({
                        message: "Todo not found"
                    }));

                    return;
                }

                res.writeHead(200, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    message: "Todo updated successfully",
                    Updated_Row: result.rows[0]
                }));

            } catch (error) {
                console.error(error);

                res.writeHead(500, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    message: "Something went wrong"
                }));
            }
        });

        return;
    }

    // ---------------- DELETE TODO REQUEST ----------------

    else if (req.method === "DELETE" && req.url === "/todo") {

        let user_Id = await authenticate(req, res);

        if (!user_Id) {
            return;
        }

        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", async () => {

            try {
                const data = JSON.parse(body);

                const Id = data.Id;

                const result = await pool.query(
                    "DELETE FROM task_table WHERE id = $1 AND user_id = $2 RETURNING *",
                    [Id, user_Id]
                );

                if (result.rowCount === 0) {

                    res.writeHead(404, {
                        "Content-Type": "application/json"
                    });

                    res.end(JSON.stringify({
                        message: "Todo not found"
                    }));

                    return;
                }

                res.writeHead(200, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    message: "Task deleted successfully",
                    Delete_Row: result.rows[0]
                }));

            } catch (error) {
                console.error(error);

                res.writeHead(500, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    message: "Something went wrong"
                }));
            }
        });

        return;
    }

    // ---------------- LOGOUT REQUEST ----------------

    else if (req.method === "DELETE" && req.url === "/Logout") {

        try {
            const user_Id = await authenticate(req, res);

            if (!user_Id) {
                return;
            }

            const cookie = req.headers.cookie;

            const sessionCookie = cookie.split(";").find((item) => {
                return item.trim().startsWith("sessionId=");
            });

            const session_Id = sessionCookie.split("=")[1];

            await pool.query(
                "DELETE FROM sessions WHERE session_id = $1 AND user_id = $2",
                [session_Id, user_Id]
            );

            res.setHeader(
                "Set-Cookie",
                "sessionId=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0"
            );

            res.writeHead(200, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                message: "Logout successfully"
            }));

        } catch (error) {
            console.error(error);

            res.writeHead(500, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                message: error.message
            }));
        }
    }

    // ---------------- INVALID ROUTE ----------------

    else {

        res.writeHead(404, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
            message: "Route not found"
        }));
    }

});

server.listen(3000, () => {
    console.log("The server is listening now");
});
