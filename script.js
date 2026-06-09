 
// Dynamic Year
document.getElementById('year').textContent = new Date().getFullYear();

// Fetch Books
fetch('books.json')
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById('books-container');
        data.forEach(book => {
            container.innerHTML += `
                <article class="book-card">
                    <img src="${book.cover}" alt="${book.title}">
                    <h3>${book.title}</h3>
                    <p>${book.synopsis}</p>
                </article>
            `;
        });
    });