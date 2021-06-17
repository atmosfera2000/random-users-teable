const FILTER_ELEM = document.getElementById("filter");
const SEARCH_ELEM = document.getElementById("search");
const USERS_ELEM = document.getElementById("users-block");
const RESET_BTN = document.querySelector("button[type='reset']");

let tableElem;
let alertElem;
let prev;  //previous tooltip
let spinnerElem;

let searchAlert = "There is not such user";

let users;

let columns = "Name, Picture, Location, Email, Phone, Registered date";

showSpinner();

fetch("https://randomuser.me/api/?results=15")
    .then(response => response.json())    
    .then(function(usersObj) {
        SEARCH_ELEM.value = "";
        FILTER_ELEM.hidden = false;
        users = usersObj.results;
        spinnerElem.remove();
        buildTable(users);
    })
    .catch(function(err) {
        spinnerElem.remove();
        showAlert(err);
    });

  
USERS_ELEM.addEventListener("mouseover", e => showTooltip(e));

SEARCH_ELEM.addEventListener("input", debounce(filterUsers, 1000));

RESET_BTN.addEventListener("click", function() {

    tableElem.remove();

    if (alertElem) {
        alertElem.remove();
        alertElem = null;
    }    
     
    buildTable(users);    
});

function buildTable(users) {
          
    let props = columns.toLowerCase().split(", ").map(prop => prop.replace(/\s+\w+/g, ""));
    
    let table = document.createElement("table");
    let thead = document.createElement("thead");
    let trOfThead = document.createElement("tr");
    let tbody = document.createElement("tbody");

   
    for (let title of columns.split(", ")) {
        let th = document.createElement("th");
        th.textContent = title;
        th.setAttribute("scope", "col");
        trOfThead.append(th);
    }

   
    for (let user of users) {

        let tr = document.createElement("tr");

        for (let prop of props) {
            
            for (let key in user) {

                if (prop == key) {

                    let td = document.createElement("td");

                    switch (key) {
                        case "name":
                            td.textContent = user[key].first + ' ' + user[key].last; 
                            break;
                        case "picture":
                            td.insertAdjacentHTML("afterbegin", `<img src="${user[key].thumbnail}" class="img-thumbnail" alt="thumbnail" data-tooltip-url="${user[key].large}">`); 
                            break;
                        case "location":
                            td.textContent = user[key].state + ' ' + user[key].city; 
                            break;
                        case "registered":
                            let date = new Date(user[key].date);
                            let formatter = new Intl.DateTimeFormat("ru");
                            td.textContent = formatter.format(date); 
                            break;
                        default:
                            td.textContent = user[key]; 
                    } 

                    tr.append(td);
                }
            }
        }

        tbody.append(tr);
    }

    table.className = "table";
    thead.prepend(trOfThead);
    table.prepend(thead);
    table.append(tbody);    

    tableElem = table;
    USERS_ELEM.prepend(table);    
}

function showTooltip(event) {       
    
    let thumb = event.target.closest('img.img-thumbnail');   

    if (!thumb) {
        if (prev) prev.remove();
        return;
    }

    if (prev) prev.remove();

    let td = event.target.closest("td");

    td.className = "position-relative";

    let url = thumb.dataset.tooltipUrl;

    let img = document.createElement("img");
    img.className = "img-fluid img-tooltip img-thumbnail";
    img.setAttribute("src", url);
    img.setAttribute("alt", "User picture"); 
    prev = img;
    td.append(img);

}


function filterUsers() {  
      
    tableElem.remove();

    let filtered = users.filter(function(user) {

       let first = user.name.first.toLowerCase();
       let last = user.name.last.toLowerCase();
       let name = `${first} ${last}`;
       let search = SEARCH_ELEM.value.toLowerCase().trim();  
           
       return name.startsWith(search);

    });

    
    if (filtered.length == 0) {

        showAlert(searchAlert);

    }
    else {

        if (alertElem) {

            alertElem.remove();
            alertElem = null;

        }

        buildTable(filtered);

    }     
    
}

function debounce(func, ms) {
    return function() {
        setTimeout(func, ms);
    }    
}

function showAlert(message) {

    if (alertElem) return;
       
    let div = document.createElement("div");
    div.className = "alert alert-primary";
    div.setAttribute("role", "alert");
    div.textContent = message;
    alertElem = div;
    USERS_ELEM.prepend(alertElem);

}

function showSpinner() {
    let wrap = document.createElement("div");
    wrap.className = "text-center mt-5";

    let div = document.createElement("div");
    div.className = "spinner-border text-primary";
    div.setAttribute("role", "status");
    div.insertAdjacentHTML("afterbegin", `<span class="visually-hidden">Loading...</span>`);
    spinner = div;

    wrap.prepend(spinner);
    spinnerElem = wrap;

    USERS_ELEM.prepend(wrap);
}



