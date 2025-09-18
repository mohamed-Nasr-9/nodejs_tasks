import fs from "fs/promises";
import { parse } from "path";

const data = await fs.readFile("./users.json", "utf-8");
let parsedData = JSON.parse(data);
// console.log("🚀 ~ parsedData:", parsedData);
const [, , action, args, args2] = process.argv;

//to get one user by id
function getOne(id) {
    console.log(parsedData.find((user) => user.id === parseInt(id)));
}

//get all users
function getAll() {
    console.log(parsedData);
}

//add new user
function addUser(name) {
    const newUser = {
        id: Date.now(),
        Name: name,
    };
    parsedData.push(newUser);
    fs.writeFile("./users.json", JSON.stringify(parsedData, null, 2));
    console.log("user added:", newUser);
}

//remove user by id
function removeUser(id) {
    const before = parsedData.length;
    parsedData = parsedData.filter((user) => user.id !== parseInt(id));
    if (before === parsedData.length) {
        console.log("user not found")
    } else {
        fs.writeFile("./users.json", JSON.stringify(parsedData, null, 2));
        console.log("user removed");
    }
}

//edit user by id
function editUser(id, newName) {
    const user = parsedData.find((user) => user.id === parseInt(id));
    if (user) {
        user.Name = newName;
        fs.writeFile("./users.json", JSON.stringify(parsedData, null, 2));
        console.log("user edited:", user);
    } else {
        console.log("user not found");
    }
}

switch (action) {
    case 'getone':
        getOne(args)
        break;
    case 'getall':
        getAll()
        break;
    case 'adding':
        addUser(args)
        break;
    case 'removing':
        removeUser(args)
        break;
    case 'editing':
        editUser(args, args2)
        break;
    default:
        break;
}