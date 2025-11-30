const API_URL = 'http://localhost:8000/menuitems';

let editMode = false;
let editId = null;
let allItems = [];

window.onload = function () {
   
    // load existing menu items
    loadItems();

    // row button actions
    document.querySelector("#itemsList").addEventListener("click", onTableClick);

    // add/update
    document.querySelector("#doneButton").addEventListener("click", doDone);

    // cancel edit
    document.querySelector("#cancelBtn").addEventListener("click", doCancel);

    // input panel for nwe item
    document.querySelector("#addButton").addEventListener("click", function() {
        doCancel(); //reset form
        document.getElementById("inputPanel").classList.remove("hidden");
        document.getElementById("cancelBtn").style.display = "inline-block";
        window.scrollTo(0, 0);
    });
};

async function loadItems() {
    try {
        let response = await fetch(API_URL);
        let result = await response.json();
        if (result.err) {
            showMessage(result.err, "error");
            return;
        }        
        allItems = result.data;
        displayItems(allItems);
    } catch (err) {
        showMessage("Error loading items", "error");
    }
}

//display items in table
function displayItems(items) {
    let container = document.getElementById("itemsList");
    container.innerHTML = "";

    if (!items.length) {
        container.innerHTML = "<p>No items found.</p>";
        return;
    }

    let html = `
        <table>
            <tr>
                <th>ID</th>
                <th>Cat</th>
                <th>Description</th>
                <th>Veg?</th>
                <th>Price</th>
                <th></th>
            </tr>
    `;

    items.forEach(item => {
        let rowClass =
            item.category === "APP" ? "app-row" :
            item.category === "ENT" ? "ent-row" :
            item.category === "DES" ? "des-row" : "";

        html += `
            <tr class="${rowClass}">
                <td>${item.id}</td>
                <td>${item.category}</td>
                <td>${item.description}</td>
                <td>${item.vegetarian ? "Yes" : "No"}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>
                    <button class="edit-btn" data-id="${item.id}">Edit</button>
                    <button class="delete-btn" data-id="${item.id}">Delete</button>
                </td>
            </tr>
        `;
    });

    html += `</table>`;
    container.innerHTML = html;
}

// table click handler
function onTableClick(e) {
    if (e.target.tagName !== "BUTTON") return;

    let id = parseInt(e.target.getAttribute("data-id"));

    if (e.target.classList.contains("edit-btn")) {
        editItem(id);
    }

    if (e.target.classList.contains("delete-btn")) {
        deleteItem(id);
    }
}

// edit
async function editItem(id) {
    let item = allItems.find(i => i.id === id);
    
    if (!item) {
        showMessage("Item not found", "error");
        return;
    }

    document.getElementById("id").value = item.id;
    document.getElementById("id").disabled = true;

    document.getElementById("category").value = item.category;
    document.getElementById("description").value = item.description;
    document.getElementById("price").value = item.price;
    document.getElementById("vegetarian").checked = item.vegetarian;

    editMode = true;
    editId = id;

    document.getElementById("inputPanel").classList.remove("hidden");
    document.getElementById("cancelBtn").style.display = "inline-block";

    window.scrollTo(0, 0);
}

// add/update
function doDone() {
    let data = {
        id: Number(document.getElementById("id").value),
        category: document.getElementById("category").value,
        description: document.getElementById("description").value,
        price: Number(document.getElementById("price").value),
        vegetarian: document.getElementById("vegetarian").checked
    };

    if (editMode) {
        updateItem(data);
    } else {
        createItem(data);
    }
}

// create
async function createItem(data) {
    try {
        let response = await fetch(`${API_URL}/${data.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        let result = await response.json();

        if (response.ok) {
            showMessage("Item added!", "success");
            doCancel();
            loadItems();
        } else {
            showMessage(result.err || "Error creating item", "error");
        }
    } catch (err) {
        showMessage("Error creating item", "error");
    }
}

//update
async function updateItem(data) {
    try {
        let response = await fetch(`${API_URL}/${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        let result = await response.json();

        if (response.ok) {
            showMessage("Item updated!", "success");
            doCancel();
            loadItems();
        } else {
            showMessage(result.err || "Error updating item", "error");
        }
    } catch (err) {
        showMessage("Error updating item", "error");
    }
}

//delete
async function deleteItem(id) {
    if (!confirm("Delete this item?")) return;

    try {
        let response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        let result = await response.json();

        if (response.ok) {
            showMessage("Item deleted", "success");
            loadItems();
        } else {
            showMessage(result.err || "Error deleting item", "error");
        }
    } catch (err) {
        showMessage("Error deleting item", "error");
    }
}

//cancel/reset
function doCancel() {
    document.getElementById("id").disabled = false;

    document.getElementById("id").value = "";
    document.getElementById("category").value = "";
    document.getElementById("description").value = "";
    document.getElementById("price").value = "";
    document.getElementById("vegetarian").checked = false;

    editMode = false;
    editId = null;

    document.getElementById("cancelBtn").style.display = "none";
    document.getElementById("inputPanel").classList.add("hidden");
}

//msg
function showMessage(text, type) {
    let msg = document.getElementById("message");
    msg.textContent = text;
    msg.className = type;

    msg.style.display = "block";
  
}