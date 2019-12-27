const mysql = require("mysql");
const inquirer = require("inquirer");

const connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    start();
});

function start() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        console.log(res);
        prompt();
    });
}

function prompt() {

    inquirer.prompt([
        {
            name: "itemChoice",
            type: "input",
            message: "Enter the ID for the item(s) you would like to purchase: "
        }, {
            name: "amount",
            type: "input",
            message: "How many units would you like to buy?"
        }
    ]).then(function (answer) {
        let itemId = answer.itemChoice;
        let unitAmount = answer.amount;

        let query = "SELECT * FROM products WHERE ?";
        connection.query(query, { item_id: itemId }, function (err, res) {
            if (err) throw err;
            let stock_quantity = res[0].stock_quantity;
            let price = res[0].price * unitAmount;

            let newAmount = stock_quantity - unitAmount;

            if (res.stock_quantity < unitAmount) {
                console.log("insufficient quantity!");
            } else {
                let query = "UPDATE products SET ? WHERE ?"
                connection.query(query,
                    [
                        {
                            stock_quantity: newAmount,
                        },
                        {
                            item_id: itemId,
                        }
                    ], function (err) {
                        if (err) throw err;

                        console.log("item(s) purchased succesfully")
                        console.log(`total cost: ${price}`)
                    })
            }
        });
    }).catch(function (error) {
        console.log(`Error:`, error);
    })
}