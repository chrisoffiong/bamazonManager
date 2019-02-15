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

  connection.connect();
  connection.query('SELECT * FROM products', function (err, res) {
    if (err) throw err;
    console.log('----------------\n')
    console.log('Hello! Thank you for using Bamazon')
    console.log('----------------\n')
    console.log('Current Inventory: ' + '\n')
    for (i = 0; i < res.length; i++) {
      console.log("ID: " + res[i].id + "\n" + "Product Name: " + res[i].product_name + '\n' + "Department Name: " + res[i].department_name + "\n" + "Current Price: " + res[i].price + '\n' + "Stock Remaining: " + res[i].stock_quantity + "\n\n")
    }
    selected =
      inquire
      .prompt([{
          name: "item",
          type: "input",
          message: "Enter the ID of the item you would like to buy from above"
        },
        {
          name: "count",
          type: "input",
          message: "How many of the item would you like to buy?"
        }
      ])
      .then(answers => {
        if ((res[parseInt(answers.item) - 1].stock_quantity) < 1) {
          console.log("The selected item has no remaining stock")
          return false
        } else if (res[parseInt(answers.item) - 1].stock_quantity - parseInt(answers.count) < 0) {
          console.log("There is not enough inventory for the request made. Try Again")
          console.log("----------------------------------------------------------------\n")
          return false
        } else {
          console.log("Your purchase of " + answers.count + ' ' + res[parseInt(answers.item) - 1].product_name + "/s total cost is: $ " + parseInt(res[parseInt(answers.item) - 1].price) * parseInt(answers.count));
          var quantityLeft = res[parseInt(answers.item) - 1].stock_quantity - answers.count;
          console.log("There are now " + quantityLeft +" " +  res[parseInt(answers.item) - 1].product_name + "s" + " remaining!" + "\n-------------------------------------");
          connection.query(
            "UPDATE products SET ? WHERE ?",
            [{
                stock_quantity: quantityLeft
              },
              {
                id: parseInt(answers.item) 
              }

            ]
          )
        }
      })
  });

}





start()
