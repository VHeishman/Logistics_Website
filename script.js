async function dO() {
  let r = await api("/customers/advancedinfosearch",{"PageSize": 200, "PageNumber": 1})
  r = await r.json()
  console.log(r)
}
dO()
fetch("templates.html")
.then(response => response.text())
.then((compText) => {
  compText = compText.split("<!---->")
  var t1 = compText[1]
  var t2 = compText[2]
  var t3 = compText[3]
  template1 = document.createElement("tr");
  template1.innerHTML = t1;
  template1 = template1.children[0]
  template2 = document.createElement("div");
  template2.innerHTML = t2;
  template2 = template2.children[0]
  template3 = document.createElement("tr");
  template3.innerHTML = t3;
  template3 = template3.children[0]
  if (document.getElementsByTagName("title")[0].textContent == "Logistics Inventory") {
    onLoad()
  } else {
    populateCheckout()
  }
})

function checkValidity(inv, entry) {
  if (entry.CategoryDescription != "") {
      inv[entry.ItemNumber] = entry
  }
}

function onLoad() {
  funct = "ic/item/advancedinventorysearch"
  tenant_name = "cpatech"

  var info = {
    "PageSize": 500,
    "Sort": ["SiteName"],
    "Filter": {
      "filters": [
        {
          "field": "CategoryDescription",
          "operator": "doesnotcontain",
          "value": "Maintenance"
        },
        {
          "field": "CategoryDescription",
          "operator": "doesnotcontain",
          "value": "Electrical"
        },
        {
          "field": "CategoryDescription",
          "operator": "doesnotcontain",
          "value": "ECM shirts"
        },
        {
          "field": "CategoryDescription",
          "operator": "doesnotcontain",
          "value": "Tyvek Suits"
        },
        {
          "field": "SiteName",
          "operator": "string.IsInList",
          "value": [
            "Warehouse"
          ]
        }
      ]
    }
  }
  inventory = {}
  api(funct,info)
  .then(returned => returned.json())
  .then(data => data.Data.forEach(entry => checkValidity(inventory, entry)))
  .finally(() => populateTable(inventory))

  
  /*
  fetch('inventory_items.csv')
  .then(response => response.text())
  .then(text => text.split("\n"))
  .then(inv => populateTable(inv))
  */
}

returned => returned.json()

function thing(returned) {
  return returned.json()
}

function populateTable(inventory) {
  console.log(inventory)
  table = document.getElementById("mainItems")
  var row
  var x = 0
  var categories = []
  for (item in inventory) {
    if (x%3 == 0) {
      row = document.createElement("tr")
    }
    try {
      inventory[item].CategoryDescription.split(" - ").forEach(cat => {
        if (!categories.includes(cat)) {
          categories.push(cat)
          let option = document.createElement("option")
          option.textContent = cat
          document.getElementById("filter").appendChild(option)
        }
      })
    } catch{}
    var entry = addEntry(inventory[item], row)
    if (sessionStorage.getItem(item) != null) {
      addToCart(entry.getElementsByClassName("AddToCartButton")[0], parseInt(JSON.parse(sessionStorage.getItem(item)).quantity))
    }
    x++
    if (x >= 100) {
      break
    }
  }
}

function filterInventory() {
  var e = document.getElementById("filter")
  var chosenCategory = e.options[e.selectedIndex].textContent
  if (chosenCategory == "All") {
    return inventory
  }
  var inv = {}
  for (item in inventory) {
    if (inventory[item].CategoryDescription.split(" - ").includes(chosenCategory)) {
      inv[item] = inventory[item]
    }
  }
  return inv
}

function updateQuery() {
  var inventory = filterInventory()
  var searchBox = document.getElementById("searchQuery")
  var query = searchBox.value
  table.innerHTML = ""
  var row
  var x = 0
  for (item in inventory) {
    if ((x%3) == 0) {
      row = document.createElement("tr")
    }
    if (inventory[item].ItemDescription.toLowerCase().includes(query.toLowerCase())) {
      addEntry(inventory[item], row)
      x++
    }
  }
}

function addEntry(item, row) {
  var entry = template1.cloneNode(true)
  entry.setAttribute("id", item.ItemNumber)
  entry.getElementsByClassName("ItemPicture")[0].setAttribute("src", "/images/"+item.ItemNumber+".jpg")
  entry.getElementsByClassName("ItemName")[0].textContent = item.ItemDescription
  entry.getElementsByClassName("InStockQuantity")[0].textContent = item.TotalAvailable
  row.appendChild(entry)
  table.appendChild(row)
  return entry
}

function limitQuantity(inputBox) {
  var parent = inputBox.parentElement
  var quantity = parent.getElementsByClassName("InStockQuantity")[0].textContent
  quantity = parseInt(quantity)
  if (inputBox.value < 0) {
    inputBox.value = 0
  }
}

function addToCart(button, overRideQuantity = 0) {
  var parent = button.parentElement.parentElement
  var itemId = parent.getAttribute("id")
  var quantity = parent.getElementsByClassName("QuantityToOrder")[0].value
  var desc = parent.getElementsByClassName("ItemName")[0].textContent
  quantity = Math.max(quantity, overRideQuantity)
  var inStock = parseInt(parent.getElementsByClassName("InStockQuantity")[0].textContent)
  for (var i=0; i<document.getElementById("sidebar").children[0].children.length; i++) {
    let item = document.getElementById("sidebar").children[0].children[i]
    if (item.name == itemId) {
      item.getElementsByClassName("Message")[0].textContent = "Enough in stock: " + (inStock>=quantity) ? "" : "Not enough in stock"
      item.getElementsByClassName("CartAmount")[0].children[1].textContent = quantity
      sessionStorage.setItem(itemId, JSON.stringify({id:itemId, quantity:quantity, description:desc, inStock:inStock}))
      return
    }
  }

  var item = template2.cloneNode(true)
  item.getElementsByClassName("CartPicture")[0].setAttribute("src", "images/"+itemId+".jpg")
  item.getElementsByClassName("CartDescription")[0].textContent += desc
  item.getElementsByClassName("Message")[0].textContent = "Enough in stock: " + (inStock>=quantity) ? "" : "Not enough in stock"
  item.getElementsByClassName("CartAmount")[0].children[1].textContent = quantity
  item.name = itemId
  item.value = inStock
  document.getElementById("sidebar").children[0].appendChild(item)

  sessionStorage.setItem(itemId, JSON.stringify({id:itemId, quantity:quantity, description:desc, inStock:inStock}))
  document.getElementById("badge").textContent = parseInt(document.getElementById("badge").textContent)+1
}


const toggleSidebar = () => {
  if (document.getElementById("sidebar").getAttribute("value") == "closed") {
    document.getElementById("sidebar").style.width = "25vw";
    document.getElementsByTagName("body")[0].style.marginRight = "25vw";
    document.getElementById("sidebar").setAttribute("value", "open")
  } else if (document.getElementById("sidebar").getAttribute("value") == "open") {
    document.getElementById("sidebar").style.width = "0";
    document.getElementsByTagName("body")[0].style.marginRight = document.getElementsByTagName("body")[0].style.marginLeft;
    document.getElementById("sidebar").setAttribute("value", "closed")
  }
};

function reduce(button) {
  var parent = button.parentElement.parentElement.parentElement.parentElement
  var itemId = parent.name
  var quantity = Math.max(parseInt(parent.getElementsByClassName("CartAmount")[0].children[1].textContent)-1, 0)
  var inStock = parseInt(parent.value)
  parent.getElementsByClassName("Message")[0].textContent = (inStock>=quantity) ? "" : "Not enough in stock"
  parent.getElementsByClassName("CartAmount")[0].children[1].textContent = quantity
  var desc = JSON.parse(sessionStorage.getItem(itemId)).description
  sessionStorage.setItem(itemId, JSON.stringify({id:itemId, quantity:quantity, description:desc, inStock:inStock}))
}

function unreduce(button) {
  var parent = button.parentElement.parentElement.parentElement.parentElement
  var itemId = parent.name
  var quantity = parseInt(parent.getElementsByClassName("CartAmount")[0].children[1].textContent)+1
  var inStock = parseInt(parent.value)
  parent.getElementsByClassName("Message")[0].textContent = (inStock>=quantity) ? "" : "Not enough in stock"
  parent.getElementsByClassName("CartAmount")[0].children[1].textContent = quantity
  var desc = JSON.parse(sessionStorage.getItem(itemId)).description
  sessionStorage.setItem(itemId, JSON.stringify({id:itemId, quantity:quantity, description:desc, inStock:inStock}))
}

function populateCheckout() {
  var cart = document.getElementById("checkoutCart")
  var row
  for (var i=0; i<sessionStorage.length; i++) {
    if ((i%4) == 0) {
      row = document.createElement("tr")
      cart.appendChild(row)
    }
    var object = JSON.parse(sessionStorage.getItem(sessionStorage.key(i)))
    var item = template3.cloneNode(true)
    item.getElementsByClassName("ItemPicture")[0].setAttribute("src", "images/"+object.id+".jpg")
    item.getElementsByClassName("ItemName")[0].textContent += object.description
    item.getElementsByClassName("OrderAmount")[0].textContent = object.quantity
    item.name = object.id
    item.value = object.inStock
    row.appendChild(item)
  }
}