const apiKey = 'Bearer 975yJ0VPdlmcrceIFH6-';
const categorySelect = document.getElementById('category-select');
const itemSelect = document.getElementById('item-select');
const itemSelectionDiv = document.getElementById('item-selection');
const detailsContainer = document.getElementById('details-container');
const historyList = document.getElementById('history-list');
const HISTORY_KEY = 'searchHistory';

function saveToHistory(itemType, itemName) {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    
    const newEntry = {
        type: itemType,
        name: itemName,
    };
    history.unshift(newEntry);
    if (history.length > 10) history.pop();

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    renderHistory();
}
function renderHistory() {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    historyList.innerHTML = '';
    history.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${item.type.toUpperCase()}:</strong> ${item.name}
        `;
        historyList.appendChild(li);
    });
}
function fetchBooks() {
    fetch('https://the-one-api.dev/v2/book', { headers: { Authorization: apiKey } })
    .then(response => response.json())
    .then(data => populateDropdown(data.docs, 'book'))
    .catch(error => console.error('Error:', error));
}
function fetchMovies() {
    fetch('https://the-one-api.dev/v2/movie', { headers: { Authorization: apiKey } })
    .then(response => response.json())
    .then(data => populateDropdown(data.docs, 'movie'))
    .catch(error => console.error('Error:', error));
}
function fetchCharacters() {
    fetch('https://the-one-api.dev/v2/character', { headers: { Authorization: apiKey } })
    .then(response => response.json())
    .then(data => populateDropdown(data.docs, 'character'))
    .catch(error => console.error('Error:', error));
}
function populateDropdown(items, type) {
    itemSelect.innerHTML = '';
    itemSelectionDiv.style.display = 'block';

    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item._id;
        option.textContent = item.name;
        option.dataset.type = type; 
        itemSelect.appendChild(option);
    });

    itemSelect.onchange = () => {
        const selectedId = itemSelect.value;
        const selectedName = itemSelect.options[itemSelect.selectedIndex].textContent;
        const selectedType = itemSelect.options[itemSelect.selectedIndex].dataset.type;

        if (selectedType === 'movie') fetchMovieDetails(selectedId, selectedName);
        if (selectedType === 'character') fetchCharacterDetails(selectedId, selectedName);
        if (selectedType === 'book') fetchBookDetails(selectedId, selectedName);
    };
}
function fetchMovieDetails(movieId, movieName) {
    fetch(`https://the-one-api.dev/v2/movie/${movieId}`, { headers: { Authorization: apiKey } })
    .then(response => response.json())
    .then(data => {
        const movie = data.docs[0];
        const details = `
            <h2>${movie.name}</h2>
            <p><strong>Runtime:</strong> ${movie.runtimeInMinutes} minutes</p>
            <p><strong>Release Year:</strong> ${movie.releaseYear}</p>
            <p><strong>Award Wins:</strong> ${movie.academyAwardWins}</p>
            <p><strong>Nominations:</strong> ${movie.academyAwardNominations}</p>
            <p><strong>Box Office:</strong> $${movie.boxOfficeRevenueInMillions} million</p>
        `;
        detailsContainer.innerHTML = details;
        saveToHistory('Movie', movieName);
    });
}
function fetchCharacterDetails(characterId, characterName) {
    fetch(`https://the-one-api.dev/v2/character/${characterId}`, { headers: { Authorization: apiKey } })
    .then(response => response.json())
    .then(data => {
        const character = data.docs[0];
        const details = `
            <h2>${character.name}</h2>
            <p><strong>Race:</strong> ${character.race}</p>
            <p><strong>Gender:</strong> ${character.gender}</p>
            <p><strong>Birth:</strong> ${character.birth || 'N/A'}</p>
            <p><strong>Death:</strong> ${character.death || 'N/A'}</p>
            <p><strong>Height:</strong> ${character.height || 'N/A'}</p>
            <p><strong>Spouse:</strong> ${character.spouse || 'N/A'}</p>
            <p><strong>More Info:</strong> <a href="${character.wikiUrl}" target="_blank">Wiki</a></p>
        `;
        detailsContainer.innerHTML = details;
        saveToHistory('Character', characterName);
    });
}
function fetchBookDetails(bookId) {
    fetch(`https://the-one-api.dev/v2/book/${bookId}`, {
        headers: { Authorization: apiKey }
    })
    .then(response => response.json())
    .then(bookData => {
        const book = bookData.docs[0];

        fetch(`https://the-one-api.dev/v2/book/${bookId}/chapter`, {
            headers: { Authorization: apiKey }
        })
        .then(response => response.json())
        .then(chapterData => {
            const chapters = chapterData.docs.map(ch => ch.chapterName).join('<br>');

            const detailsHTML = `
                <h2>${book.name}</h2>
                <p><strong>ID:</strong> ${book._id}</p>
                <p><strong>Number of chapters:</strong> ${chapterData.docs.length}</p>
                <h3>Chapters:</h3>
                <p>${chapters || 'There are no chapter available'}</p>
            `;

            detailsContainer.innerHTML = detailsHTML;
            
            saveToHistory('book', book.name, detailsHTML);
        });
    })
    .catch(error => console.error('Chyba při načítání detailů knihy:', error));
}

categorySelect.addEventListener('change', () => {
    const selectedCategory = categorySelect.value;

    if (selectedCategory === 'movies') fetchMovies();
    if (selectedCategory === 'characters') fetchCharacters();
    if (selectedCategory === 'books') fetchBooks();
});

renderHistory();
