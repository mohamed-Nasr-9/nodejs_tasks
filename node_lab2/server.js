import http from "http";
import fs from "fs/promises";
import { content } from "./main.js";

console.log("🚀 ~ content:", content);
const PORT = 3000;

// pre-load static files
const cssContent = await fs.readFile("styles.css", "utf-8");

// pre-load users.json
let users = await fs.readFile("users.json", "utf-8");
let parsedUsers = JSON.parse(users);

const server = http.createServer(async(req, res) => {
    console.log(req.url);
    const reg = new RegExp(/^\/users\/\d*$/);

    switch (req.method) {
        case "GET":
            switch (req.url) {
                case "/":
                    res.writeHead(200, { "Content-Type": "text/html" });
                    res.end(content("menna"));
                    break;

                case "/styles.css":
                    console.log("hello");
                    res.writeHead(200, { "Content-Type": "text/css" });
                    res.end(cssContent);
                    break;

                case "/users":
                    res.writeHead(200, { "content-type": "application/json" });
                    res.end(users);
                    break;

                default:
                    if (reg.test(req.url)) {
                        const id = req.url.split('/')[2];
                        console.log("🚀 ~ id:", id);
                        const user = parsedUsers.find(u => u.id === parseInt(id));
                        if (!user) {
                            res.writeHead(404, { "content-type": "text/plain" });
                            res.end("NOT FOUND");
                            return;
                        }
                        res.writeHead(200, { "content-type": "application/json" });
                        res.end(JSON.stringify(user));
                        break;
                    }
                    res.writeHead(404);
                    res.end(`<h1 style="color='red'"> Error!</h1>`);
                    break;
            }
            break;

        case "POST":
            if (req.url === '/users') {
                let body = [];
                req
                    .on("data", (chunk) => {
                        body.push(chunk);
                    })
                    .on("end", async () => {
                        try {
                            body = Buffer.concat(body).toString();
                            console.log("🚀 ~ body:", body);
                            const newUser = JSON.parse(body);
                            newUser.id = Date.now(); // Generate unique ID
                            parsedUsers.push(newUser);

                            await fs.writeFile(
                                "./users.json",
                                JSON.stringify(parsedUsers, null, 2)
                            );
                            users = JSON.stringify(parsedUsers);

                            res.writeHead(201, { "content-type": "application/json" });
                            res.end(JSON.stringify(newUser));
                        } catch (error) {
                            res.writeHead(400);
                            res.end("Invalid user data");
                        }
                    });
            } else {
                res.writeHead(404);
                res.end("Invalid endpoint");
            }
            break;

        case "PUT":
            if (reg.test(req.url)) {
                const id = parseInt(req.url.split('/')[2]);
                let body = [];

                req
                    .on("data", (chunk) => {
                        body.push(chunk);
                    })
                    .on("end", async () => {
                        try {
                            body = Buffer.concat(body).toString();
                            const updatedData = JSON.parse(body);
                            const userIndex = parsedUsers.findIndex(u => u.id === id);

                            if (userIndex === -1) {
                                res.writeHead(404);
                                res.end("User not found");
                                return;
                            }

                            parsedUsers[userIndex] = { ...parsedUsers[userIndex], ...updatedData, id };
                            await fs.writeFile(
                                "./users.json",
                                JSON.stringify(parsedUsers, null, 2)
                            );
                            users = JSON.stringify(parsedUsers);

                            res.writeHead(200, { "content-type": "application/json" });
                            res.end(JSON.stringify(parsedUsers[userIndex]));
                        } catch (error) {
                            res.writeHead(400);
                            res.end("Invalid update data");
                        }
                    });
            } else {
                res.writeHead(404);
                res.end("Invalid endpoint");
            }
            break;

        case "DELETE":
    if (reg.test(req.url)) {
        try {
            const id = parseInt(req.url.split('/')[2]);
            const initialLength = parsedUsers.length;
            parsedUsers = parsedUsers.filter(u => u.id !== id);

            if (parsedUsers.length === initialLength) {
                res.writeHead(404);
                res.end("User not found");
                return;
            }

            await fs.writeFile(
                "./users.json",
                JSON.stringify(parsedUsers, null, 2)
            );
            users = JSON.stringify(parsedUsers);

            res.writeHead(200);
            res.end("User deleted successfully");
        } catch (error) {
            console.error("Delete operation failed:", error);
            res.writeHead(500);
            res.end("Server error while deleting user");
        }
        return;
    }
            break;

        default:
            res.writeHead(405);
            res.end("Method not allowed");
            break;
    }
});

server.listen(PORT, "localhost", () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});