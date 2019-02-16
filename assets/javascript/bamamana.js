let mysql = require('mysql')
let inquire = require('inquirer')
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon_db"
})

function start() {
    function viewProducts() {

        connection.connect();
        connection.query('SELECT * FROM products', function (err, res) {
            console.log('Current Inventory: ' + '\n')
            for (i = 0; i < res.length; i++) {
                console.log("ID: " + res[i].id + "\n" + "Product Name: " + res[i].product_name + '\n' + "Department Name: " + res[i].department_name + "\n" + "Current Price: " + res[i].price + '\n' + "Stock Remaining: " + res[i].stock_quantity + "\n\n")
            }
        })
    }

    function lowInv() {
        connection.connect();
        connection.query("SELECT * FROM products WHERE stock_quantity < 5", function (error, res) {
            console.log('Low inventory: ' + '\n')
            for (j = 0; j < res.length; j++) {
                console.log("ID: " + res[j].id + "\n" + "Product Name: " + res[j].product_name + '\n' + "Department Name: " + res[j].department_name + "\n" + "Current Price: " + res[j].price + '\n' + "Stock Remaining: " + res[j].stock_quantity + "\n\n")
            }
        })
    }

    function addInv() {
        console.log('-------------------\n' + "Updating Inventory: " + '\n');

        connection.query('SELECT * FROM Products', function (err, res) {
            if (err) throw err;
            var itemArray = [];
            for (var i = 0; i < res.length; i++) {
                itemArray.push(res[i].product_name);
            }

            inquire.prompt([{
                type: "list",
                name: "product",
                choices: itemArray,
                message: "Which item would you like to add inventory?"
            }, {
                type: "input",
                name: "qty",
                message: "How much would you like to add?",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    } else {
                        return false;
                    }
                }
            }]).then(function (ans) {
                var currentQty;
                for (var i = 0; i < res.length; i++) {
                    if (res[i].product_name === ans.product) {
                        currentQty = res[i].stock_quantity;
                    }
                }
                connection.query('UPDATE products SET ? WHERE ?', [{
                        stock_quantity: currentQty + parseInt(ans.qty)
                    },
                    {
                        product_name: ans.product
                    }
                ], function (err, res) {
                    if (err) throw err;
                    console.log('The quantity has been successful updated.');
                    start();
                });
            })
        });
    }
    function addNew() {
        inquire.prompt([
            {
                type: "input",
                name: "newProductName",
                message: "What product would you like to add?"
            },
            {
                type: "list",
                name: "department",
                message: "Which department does this product fall into?",
                choices: ["Electronics", "Beauty", "Shoes", "Sports", "Home", "Books"]
            },
            {
                type: "input",
                name: "cost",
                message: "How much does it cost?",
                validate: function(cost) {
                    if (!isNaN(cost)) {
                        return true;
                    }
                    console.log("Please enter a valid cost.");
                    return false;
                }
            },
            {
                type: "input",
                name: "iniQuantity",
                message: "How many do we have?",
                validate: function(iniQuantity) {
                    if (!isNaN(iniQuantity)) {
                        return true;
                    }
                    console.log("Please enter a valid quantity.");
                    return false;
                }
            }
        ]).then(function (answers){
    
            //grab the new product info from answer and add to (insert into) the database table
            var queryString = "INSERT INTO products SET ?";
            connection.query(queryString, {
                product_name: answers.newProductName,
                department_name: answers.department,
                price: answers.cost,
                stock_quantity: answers.iniQuantity,
            })
    
            //show message that the product has been added.
            console.log(answers.newProductName + " has been added to Bamazon.");
    

        });     
    
    
    }

        console.log('----------------')
        console.log('Bamazon Manager')
        console.log('----------------\n')
        inquire.prompt([{
            type: 'list',
            message: 'Select from list below what action you would like to complete.',
            choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product'],
            name: "action"
        }, ]).then(function (answers) {
            switch (answers.action) {
                case 'View Products for Sale':
                    viewProducts();
                    break;

                case 'View Low Inventory':
                    lowInv();
                    break;

                case 'Add to Inventory':
                    addInv();
                    break;

                case 'Add New Product':
                    addNew();
                    break;
            }
        }).catch(function (error) {
            throw error;
        });

    }


    start()