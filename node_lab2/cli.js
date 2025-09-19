import { Command } from "commander";
const program = new Command();
import fs from "fs/promises";
    
program
    .version('1.0.0')
    .description('CLI for managing users');

program
    .command('getone <id>')
    .description('Get a user by ID')
    .action(async (id) => {
        const data = await fs.readFile("./users.json", "utf-8");
        const parsedData = JSON.parse(data);
        const user = parsedData.find((user) => user.id === parseInt(id));
        console.log(user || 'User not found');
    });

program
    .command('getall')
    .description('Get all users')
    .action(async () => {
        const data = await fs.readFile("./users.json", "utf-8");
        console.log(JSON.parse(data));
    });

program
    .command('add <name>')
    .description('Add a new user')
    .action(async (name) => {
        const data = await fs.readFile("./users.json", "utf-8");
        const parsedData = JSON.parse(data);
        const newUser = {
            id: Date.now(),
            Name: name
        };
        parsedData.push(newUser);
        await fs.writeFile("./users.json", JSON.stringify(parsedData, null, 2));
        console.log('User added:', newUser);
    });

program
    .command('remove <id>')
    .description('Remove a user by ID')
    .action(async (id) => {
        const data = await fs.readFile("./users.json", "utf-8");
        let parsedData = JSON.parse(data);
        const before = parsedData.length;
        parsedData = parsedData.filter((user) => user.id !== parseInt(id));
        if (before === parsedData.length) {
            console.log('User not found');
        } else {
            await fs.writeFile("./users.json", JSON.stringify(parsedData, null, 2));
            console.log('User removed');
        }
    });

program
    .command('edit <id> <newName>')
    .description('Edit a user by ID')
    .action(async (id, newName) => {
        const data = await fs.readFile("./users.json", "utf-8");
        const parsedData = JSON.parse(data);
        const user = parsedData.find((user) => user.id === parseInt(id));
        if (user) {
            user.Name = newName;
            await fs.writeFile("./users.json", JSON.stringify(parsedData, null, 2));
            console.log('User edited:', user);
        } else {
            console.log('User not found');
        }
    });

program.parse(process.argv);