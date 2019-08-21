let mysql = require("mysql");
let chalk = require("chalk");
let inquirer = require("inquirer");

let connection = mysql.createConnection({
    host: "localhost",
    user: "Alex",
    password: "Password123",
    database: "bamazon",
    port: 3306
});
connection.connect(function (err) {
    if (err) throw err;
    run();
});

function run() {
    inquirer
        .prompt([
            {
                name: "choice",
                type: "list",
                choices: ["View Products For Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "End"],
                message: chalk.green("What would you like to do today?")
            }

        ]).then(function (answer) {
        switch (answer.choice) {
            case "View Products For Sale":
                view();
                break;
            case "View Low Inventory":
                lowInv();
                break;
            case "Add to Inventory":
                addInv();
                break;
            case "Add New Product":
                addProd();
                break;
            case "End":
                connection.end();
        }
    })
}

function quitOrBack() {
    inquirer
        .prompt([
            {
                name: "choice",
                type: "list",
                choices: ["Go Back", "Quit"],
                message: chalk.green("Would you like to go back?")
            }

        ]).then(function (answer) {
        switch (answer.choice) {
            case "Go Back":
                run();
                break;
            case "View Low Inventory":
                connection.end();
        }
    })
}

function view() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        for (var i = 0; i < results.length; i++) {
            console.log(`ID: ${chalk.cyan(results[i].item_id)}   Name: ${chalk.yellow(results[i].product_name)} Price: $${chalk.blue(results[i].price)}  In Stock: ${chalk.red(results[i].stock_quantity)}`);
        }
        quitOrBack();
    })
}

function lowInv() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        for (var i = 0; i < results.length; i++) {
            if (results[i].stock_quantity < 30) {
                console.log(`ID: ${chalk.cyan(results[i].item_id)}   Name: ${chalk.yellow(results[i].product_name)} Price: $${chalk.blue(results[i].price)}  In Stock: ${chalk.red(results[i].stock_quantity)}`);
            }
        }
        quitOrBack();
    })
}

function addInv() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;

        inquirer
            .prompt([
                {
                    name: "itemList",
                    type: "rawlist",
                    choices: function () {
                        var choiceArray = [];
                        for (var i = 0; i < results.length; i++) {
                            choiceArray.push(`ID: ${chalk.cyan(results[i].item_id)}   Name: ${chalk.yellow(results[i].product_name)} In Stock: ${chalk.red(results[i].stock_quantity)}`);
                        }
                        return choiceArray;
                    },
                    message: chalk.green("What item would you like to add to?")
                },
                {
                    name: "amount",
                    type: "input",
                    message: chalk.green("How many would you like add?")
                }
            ])
            .then(function (answer) {
                let chosenItem;
                for (var i = 0; i < results.length; i++) {
                    if (answer.itemList === `ID: ${chalk.cyan(results[i].item_id)}   Name: ${chalk.yellow(results[i].product_name)} In Stock: ${chalk.red(results[i].stock_quantity)}`) {
                        chosenItem = results[i];
                    }
                }
                // console.log(chosenItem);
                let newQuantity = chosenItem.stock_quantity + parseInt(answer.amount);

                connection.query(
                    "UPDATE products SET ? WHERE ?",
                    [
                        {
                            stock_quantity: newQuantity
                        },
                        {
                            item_id: chosenItem.item_id
                        }
                    ],
                    function (error) {
                        if (error) throw err;
                        console.log(`Success!  New Quantity: ${newQuantity}`);
                        quitOrBack();
                    }
                );

            });
    });


}

function addProd() {

    inquirer
        .prompt([
            {
                name: "item",
                type: "input",
                message: "What is the item you would like to add?"
            },
            {
                name: "department",
                type: "input",
                message: "Department:"
            },
            {
                name: "price",
                type: "input",
                message: "Starting Price:"
            },
            {
                name: "startingQuantity",
                type: "input",
                message: "Starting Quantity:",
            }


        ])
        .then(function (answer) {
            connection.query(
                "INSERT INTO products SET ?",
                {
                    product_name: answer.item,
                    department_name: answer.department,
                    price: answer.price ,
                    stock_quantity: answer.startingQuantity
                },
                function (err) {
                    if (err) throw err;
                    console.log("Item Added!");
                    quitOrBack();
                }
            );
        });
}

