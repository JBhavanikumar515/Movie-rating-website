const apiKey = "60f8a403003962581a1f57d0acce83ec"; 
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const moviesContainer = document.getElementById('moviesContainer');

const imgBase = "https://image.tmdb.org/t/p/w200";

searchBtn.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (query.length === 0) {
    moviesContainer.innerHTML = "<p>Please enter a movie name.</p>";
    return;
  }
  fetchMovies(query);
});

function fetchMovies(query) {
  moviesContainer.innerHTML = "<p>Loading...</p>";
  fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
      if (data.results && data.results.length > 0) displayMovies(data.results);
      else moviesContainer.innerHTML = `<p>No movies found for "${query}".</p>`;
    })
    .catch(err => {
      console.error(err);
      moviesContainer.innerHTML = "<p>Error fetching movies. Try again later.</p>";
    });
}

function displayMovies(movies) {
  moviesContainer.innerHTML = "";
  const ratings = JSON.parse(localStorage.getItem('ratings') || '{}');

  movies.forEach(movie => {
    const movieDiv = document.createElement('div');
    movieDiv.classList.add('movie');

    const poster = movie.poster_path ? imgBase + movie.poster_path : 'https://via.placeholder.com/80x120?text=No+Image';
    movieDiv.innerHTML = `
      <img src="${poster}" alt="${movie.title}">
      <div>
        <h3>${movie.title} (${movie.release_date ? movie.release_date.slice(0,4) : 'N/A'})</h3>
        <div class="stars" data-id="${movie.id}">
          ${[1,2,3,4,5].map(i => `<span data-star="${i}">&#9733;</span>`).join('')}
        </div>
        <p>Rating: <span class="avg">0</span></p>
      </div>
    `;
    moviesContainer.appendChild(movieDiv);

    const stars = movieDiv.querySelectorAll('.stars span');
    const avgSpan = movieDiv.querySelector('.avg');

    if (ratings[movie.id]) {
      const rating = ratings[movie.id];
      stars.forEach(s => s.classList.toggle('selected', s.dataset.star <= rating));
      avgSpan.textContent = rating;
    }

    stars.forEach(star => {
      star.addEventListener('click', () => {
        const rating = Number(star.dataset.star);
        ratings[movie.id] = rating;
        localStorage.setItem('ratings', JSON.stringify(ratings));
        stars.forEach(s => s.classList.toggle('selected', s.dataset.star <= rating));
        avgSpan.textContent = rating;
      });
    });
  });
}

window.addEventListener('load', () => {
  fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      if (data.results && data.results.length > 0) displayMovies(data.results);
    });
});
