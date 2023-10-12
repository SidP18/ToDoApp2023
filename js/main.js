import ToDoList from "./todolist.js";
import ToDoItem from "./todoitem.js";

const toDoList = new ToDoList();

// Launches the application
document.addEventListener("readystatechange", (event) => {
    if (event.target.readyState === "complete") {
        initApp();
    }
});

const initApp = () => {
    //add event listeners
    const itemEntryForm = document.getElementById("itemEntryForm");
    itemEntryForm.addEventListener("submit", (event) => {
        event.preventDefault();
        processSubmission();
    });

    const clearItems = document.getElementById("clearItems");
    clearItems.addEventListener("click", (event) => {
        const list = toDoList.getList();
        if (list.length) {
            const confirmed = confirm("Are you sure you want to clear the entire list?");
            if (confirmed) {
                toDoList.clearList();
                updatePersistentData(toDoList.getList());
                refreshThePage();
            }
        }
    })
    //procedural things
    //loads the list object out of webstorage and read it into the app as soon as it starts up
    loadListObject();
    //refresh the page */
    refreshThePage();
};

const loadListObject = () => {
    const storedList = localStorage.getItem("myToDoList");
    //if the stored list is not of type string, while it should be since that's what I am storing, then exit out the method
    if (typeof storeList !== "string") return;
    const parsedList = JSON.parse(storedList);
    //loops through each item on the list
    parsedList.forEach(itemObj => {
        //creates the new item that we will load onto the list and since they don't have getters and setters yet, since they are not true item objects just yet, we have to create them
        const newToDoItem = createNewItem(itemObj._id, itemObj._item);
        //then each item on the parsed list is added to the list of items
        toDoList.addItemToList(newToDoItem);
    })
}

const refreshThePage = () => {
    clearListDisplay();
    renderList(); 
    clearItemEntryField(); //text input where we enter anything since we don't want anything leftover
    setFocusOnItemEntry(); //to set focus back to the item entry whenever the page refreshes
};

const clearListDisplay = () => {
    //parent element for all of the list items
    const parentElement = document.getElementById("listItems");
    deleteContents(parentElement);
};

const deleteContents = (parentElement) => {
    let child = parentElement.lastElementChild;
    while (child) {
        parentElement.removeChild(child);
        child = parentElement.lastElementChild;
    }
};

const renderList = () => {
    const list = toDoList.getList();
    list.forEach(item => {
        buildListItem(item);
    });
};

const buildListItem = (item) => {
    const div = document.createElement("div");
    div.className = "item";
    const check = document.createElement("input");
    check.type = "checkbox";
    check.id = item.getId();
    check.tabIndex = 0;
    addClickListenerToCheckbox(check);
    const label = document.createElement("label");
    label.htmlFor = item.getId();
    label.textContent = item.getItem();
    div.appendChild(check);
    div.appendChild(label);
    const container = document.getElementById("listItems");
    container.appendChild(div);
};

const addClickListenerToCheckbox = (checkbox) => {
    checkbox.addEventListener("click", (event) => {
        toDoList.removeItemFromList(checkbox.id);
        updatePersistentData(toDoList.getList());
        const removedText = getLabelText(checkbox.id);
        updateScreenReaderConfirmation(removedText, "removed from list");
        setTimeout(() => {
            refreshThePage();
        }, 1000);
    });
};

//grabs the label text for the removign text in order for the screen reader to work properly
const getLabelText = (checkboxId) => {
    return document.getElementById(checkboxId).nextElementSibling.textContent;
}

const updatePersistentData = (listArray) => {
    //local storage only stores strings so thats why we use JSON since it will convert it to JSON anyways
    localStorage.setItem("myToDoList", JSON.stringify(listArray))
}

//clears out the text input box
const clearItemEntryField = () => {
    document.getElementById("newItem").value = "";
};

//sets the focus back to the input that the user wants to add to the list
const setFocusOnItemEntry = () => {
    document.getElementById("newItem").focus();
};

const processSubmission = () => {
    const newEntryText = getNewEntry();
    //if theres no length to the submission that the user inputs, the don't process and just exit the function else you do process it
    if (!newEntryText.length) return;
    const nextItemId = calcNextItemId();
    const toDoItem = createNewItem(nextItemId, newEntryText);
    toDoList.addItemToList(toDoItem);
    updatePersistentData(toDoList.getList());
    updateScreenReaderConfirmation(newEntryText, "added");
    refreshThePage();
};

const getNewEntry = () => {
    return document.getElementById("newItem").value.trim();
};

const calcNextItemId = () => {
    let nextItemId = 1;
    const list = toDoList.getList();
    if (list.length > 0) {
        //refers to the last item's ID on the list
        nextItemId = list[list.length - 1].getId() + 1; 
    }
    return nextItemId;
};

// a new item is created to add to the list
const createNewItem = (itemId, itemText) => {
    const toDo = new ToDoItem();
    toDo.setId(itemId);
    toDo.setItem(itemText);
    return toDo;
}

//accepts the new item and the screen reader will read it aloud immediately after it is added to the list after refreshing the page
const updateScreenReaderConfirmation = (newEntryText, actionVerb) => {
    document.getElementById("confirmation").textContent = `${newEntryText} ${actionVerb}.`;
}