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
    inquirer.prompt(
        {
            name: "choice",
            type: "list",
            message: "Choose an option",
            choices: [
                "View products for sale",
                "View low inventory",
                "Add to inventory",
                "Add new product"
            ]
        }
    ).then(function (answer) {
        let choice = answer.choice;
        switch (choice) {
            case "View products for sale":
                viewForSale();
                break;
            case "View low inventory":
                viewLowInv();
                break;
            case "Add to inventory":
                addToInv();
                break;
            case "Add new product":
                addNewProduct();
                break;
        }
    }).catch(function (err) {
        console.log(err);
    });
};

function viewForSale() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        console.log(res);
        connection.end();
    });
};

function viewLowInv() {
    let query = "SELECT * FROM products WHERE stock_quantity<5";
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.log(res);
        connection.end();
    });
};

function addToInv() {
    inquirer.prompt([
        {
            name: "itemChoice",
            type: "input",
            message: "Enter the ID for the item you would like to increase stock for: "
        }, {
            name: "amount",
            type: "input",
            message: "How many units would you like to add to the inventory?"
        }
    ]).then(function (answer) {
        let item = parseInt(answer.itemChoice);
        let amount = parseInt(answer.amount);
        let stock = 0;

        connection.query("SELECT * FROM products WHERE ?",
            {
                item_id: item
            }, function (err, res) {
                if (err) throw err;
                stock = res[0].stock_quantity + amount;

                let query = `UPDATE products SET ? WHERE ?`;
                connection.query(
                    query,
                    [
                        {
                            stock_quantity: stock
                        },
                        {
                            item_id: item
                        }
                    ],
                    function (err) {
                        if (err) throw err;
                        console.log("Inventory increased successfully.");
                        connection.end();
                        console.log(stock);
                        console.log(item);
                    }
                );
            })
    })
};

function addNewProduct() {
    inquirer.prompt([
        {
            name: "product",
            type: "input",
            message: "Enter the name for the product you'd like to add: "
        }, {
            name: "department",
            type: "input",
            message: "Enter the department name for the product: "
        }, {
            name: "price",
            type: "input",
            message: "What is the price of the new item? "
        }, {
            name: "stock",
            type: "input",
            message: "How many units would you like to add to the inventory?"
        }
    ]).then(function (answer) {
        let { product, department, price, stock } = answer;

        console.log(typeof (product), typeof (department), typeof (price), typeof (stock))
        let query = `INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ("${product}", "${department}", ${parseFloat(price)}, ${parseInt(stock)});`

        connection.query(query, function (err, result) {
            if (err) throw err;

            console.log('Successfully added product to store.')
        });
    })
};