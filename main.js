const bookshelf = [];
const RENDER_EVENT = 'render-bookshelf';
const SAVED_EVENT = 'saved-bookshelf';
const STORAGE_KEY = 'BOOKSHELF_APPS';

document.addEventListener('DOMContentLoaded', function(){
    const submitBook = document.getElementById('inputBook');
    submitBook.addEventListener('submit', function(event){
        event.preventDefault();
        addBook();
        submitBook.reset();
    });

    function addBook(){
        const title = document.getElementById('inputBookTitle').value;
        const author = document.getElementById('inputBookAuthor').value;
        const year = document.getElementById('inputBookYear').value;
        const isCompleted = document.getElementById('inputBookIsComplete').checked;
    
        const generateID = generateId();
        const bookshelfObject = generateBookshelfObject((generateID, title, author, year, isCompleted, false));
        bookshelf.push(bookshelfObject);
    
        document.dispatchEvent(new Event(RENDER_EVENT));
        console.log({title, author, year})
        console.log(generateID)
        saveData();
    }
    
    function generateId(){
        return +new Date();
    }
    
    function generateBookshelfObject(id, title, author, year, isCompleted){
        return{
            id,
            title,
            author,
            year,
            isCompleted
        }
    }
    loadDataFromStorage();
});

function makeBookshelf(bookshelfObject){
    const textTitle = document.createElement('h2');
    textTitle.innerText = `${bookshelfObject.title}`;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = `Penulis : ${bookshelfObject.author}`;

    const textYear = document.createElement('p');
    textYear.innerText = `Tahun : ${bookshelfObject.year}`;

    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(textTitle, textAuthor, textYear);
    textContainer.setAttribute('id', `bookshelf-${bookshelfObject.id}`);

    if(bookshelfObject.isCompleted){
        const undoButton = document.createElement('button');
        undoButton.classList.add('undo-button');

        undoButton.addEventListener('click', function(){
            undoBookshelfFromCompleted(bookshelfObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button');

        trashButton.addEventListener('click', function(){
            removeBookshelfFromCompleted(bookshelfObject.id);
        });

        textContainer.append(undoButton,trashButton);
    }else{
        const checkButton = document.createElement('button');
        checkButton.classList.add('check-button');

        checkButton.addEventListener('click', function(){
            addBookshelfToCompleted(bookshelfObject.id);
        });

        textContainer.append(checkButton);
    }
    return textContainer;
}

document.addEventListener(RENDER_EVENT, function(){
    const uncompletedBookshelfList = document.getElementById('incompleteBookshelfList');
    uncompletedBookshelfList.innerHTML = '';

    const completedBookshelfList = document.getElementById('completeBookshelfList');
    completedBookshelfList.innerHTML = '';

    for(const bookshelfItem of bookshelf){
        const bookshelfElement = makeBookshelf(bookshelfItem);
        if(!bookshelfItem.isCompleted)
            uncompletedBookshelfList.append(bookshelfElement);
        else
            completedBookshelfList.append(bookshelfElement);
    }
});

function addBookshelfToCompleted(bookshelfId){
    const bookshelfTarget = findBookshelf(bookshelfId);

    if(bookshelfTarget == null) return;

    bookshelfTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBookshelf(bookshelfId){
    for(const bookshelfItem of bookshelf){
        if(bookshelfItem.id === bookshelfId){
            return bookshelfItem;
        }
    }
    return null;
}

function removeBookshelfFromCompleted(bookshelfId){
    const bookshelfTarget = findBookshelfIndex(bookshelfId);

    if(bookshelfTarget === -1) return;

    bookshelf.splice(bookshelfTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoBookshelfFromCompleted(bookshelfId){
    const bookshelfTarget = findBookshelf(bookshelfId);

    if(bookshelfTarget == null) return;

    bookshelfTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBookshelfIndex(bookshelfId){
    for(const index in bookshelf){
        if(bookshelf[index].id === bookshelfId){
            return index;
        }
    }
    return -1;
}

function saveData(){
    if(isStorageExist()){
        const parsed = JSON.stringify(bookshelf);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function isStorageExist(){
    if(typeof(Storage) === undefined){
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

document.addEventListener(SAVED_EVENT, function(){
    localStorage.getItem(STORAGE_KEY);
});

function loadDataFromStorage(){
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if(data !== null){
        for(const shelf of data ){
            bookshelf.push(shelf);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}