let mysql = require("mysql");
let chalk = require("chalk");
let inquirer = require("inquirer");
let PORT = 3306;

let connection = mysql.createConnection({
    host: "localhost",
    user: "Alex",
    password: "Password123",
    database: "bamazon",
    port: 3306
});
connection.connect(function(err) {
    if (err) throw err;
    run();
});

function run(){
    inquirer
        .prompt([
            {
                name: "choice",
                type: "list",
                choices: ["Yes", "No"],
                message: chalk.green("Hey! Welcome to Bamazon, would you like to purchase one of our products today?")
            }

    ]).then(function(answer){
        switch (answer.choice) {
            case "Yes":
                buy();
                break;
            case "No":
                connection.end();
        }
    })
}





function buy() {
    connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    inquirer
        .prompt([
            {
                name: "itemlist",
                type: "rawlist",
                choices: function() {
                    var choiceArray = [];
                    for (var i = 0; i < results.length; i++) {
                        choiceArray.push(results[i].product_name + chalk.blue("  $" + results[i].price) + chalk.red("  In Stock:" + results[i].stock_quantity));
                    }
                    return choiceArray;
                },
                message: chalk.green("What item would you like to purchase?")
            },
            {
                name: "amount",
                type: "input",
                message: chalk.green("How many would you like to buy?")
            }
        ])
        .then(function(answer) {
            let chosenItem;
            for (var i = 0; i < results.length; i++) {
                if (results[i].item_name === answer.itemList) {
                    chosenItem = results[i];
                }
            }


            if (chosenItem.stock_quantity > parseInt(answer.amount)) {

                let newQuantity = chosenItem.stock_quantity - answer.amount;

                let totalCost = chosenItem.price * answer.amount;

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
                    function(error) {
                        if (error) throw err;
                        console.log(`Purchase success!  Total amount spent: $${totalCost}`);
                        run();
                    }
                );
            }
            else {
                // bid wasn't high enough, so apologize and start over
                console.log("Not enough in stock! Try again.");
                run();
            }
        });
});


}
