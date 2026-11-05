
import http from "http";
import pool from "./db.js";

const server = http.createServer(async (req, res) => {

    console.log("METHOD:", req.method);
    console.log("URL:", req.url);

    // CORS configuration
    res.setHeader(
        "Access-Control-Allow-Origin",
        "http://localhost:5173"
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

            const result = await pool.query(
                "SELECT * FROM task_table"
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

    // ---------------- POST REQUEST ----------------

    else if (req.method === "POST" && req.url === "/todo") {

        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", async () => {

            try {

                const todo = JSON.parse(body);

                const result = await pool.query(
                    "INSERT INTO task_table (task) VALUES ($1) RETURNING *",
                    [todo.task]
                );

                res.writeHead(201, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    message: "Todo was created successfully",
                    todo: result.rows[0]
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

    // ---------------- PUT REQUEST ----------------

    else if (req.method === "PUT" && req.url === "/todo") {

        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", async () => {

            try {

                const data = JSON.parse(body);

                const result = await pool.query(
                    "UPDATE task_table SET task = $1 WHERE id = $2 RETURNING *",
                    [data.Updated_Task, data.Id]
                );

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
                    todo: result.rows[0]
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

    

    else if (req.method === "DELETE" && req.url === "/todo") {

        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", async () => {

            try {

                const data = JSON.parse(body);

                const id = data.Id;

                const result = await pool.query(
                    "DELETE FROM task_table WHERE id = $1 RETURNING *",
                    [id]
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
                    todo: result.rows[0]
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
