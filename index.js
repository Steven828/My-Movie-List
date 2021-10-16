const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const MOVIE_PER_PAGE = 12;

const movies = [];
let filteredMovies = [];
let page = 1;

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const changeMode = document.querySelector(".change-mode");

//Render MovieList
function renderMovieList(data) {
  let rawHTML = "";
  data.forEach((item) => {
    rawHTML += `
    <div class="col-md-12 my-2">
      <ul class="list-group">
        <li class="list-group-item d-flex justify-content-between">${item.title}
          <div class="col-md-3">
            <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </li>
        
    </div>
    `;
  });
  dataPanel.innerHTML = rawHTML;
}

//Render MovieCard
function renderMovieCard(data) {
  let rawHTML = "";
  data.forEach((item) => {
    rawHTML += `<div class="col-sm-3 card-group">
        <div class="mb-2">
          <div class="card">
            <img src="${POSTER_URL + item.image
      }" class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id
      }">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id
      }">+</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  dataPanel.innerHTML = rawHTML;
}
//Render Paginator
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIE_PER_PAGE);
  let rawHTML = "";
  for (let pageNumber = 1; pageNumber <= numberOfPages; pageNumber++) {
    if (page === pageNumber) {
      rawHTML += `<li class="page-item active"><a class="page-link" href="#" data-page="${pageNumber}">${pageNumber}</a></li>`;
    } else {
      rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${pageNumber}">${pageNumber}</a></li>`;
    }
  }
  paginator.innerHTML = rawHTML;
}

//取得每頁的12筆MovieList
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies;
  const startIndex = (page - 1) * MOVIE_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIE_PER_PAGE);
}

//修改Modal
function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="image-fuid">`;
  });
}

//建立favorite
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find((movie) => movie.id === id);
  console.log(movie);

  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經在收藏清單中!");
  }

  list.push(movie);
  console.log(list);

  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

//建立More與 + 按鈕的事件監聽器
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});
//建立paginator的事件監聽器
paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return;
  page = Number(event.target.dataset.page);
  if (dataPanel.innerHTML.includes("list-group")) {
    renderMovieList(getMoviesByPage(page));
  } else if (dataPanel.innerHTML.includes("card-group")) {
    renderMovieCard(getMoviesByPage(page));
  }
  filteredMovies.length > 0
    ? renderPaginator(filteredMovies.length)
    : renderPaginator(movies.length);
});

//表單監聽器
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );

  if (filteredMovies.length === 0) {
    return alert("Cannot find movies with keyword:" + keyword);
  }
  renderPaginator(filteredMovies.length);
  page = 1;
  if (dataPanel.innerHTML.includes("list-group")) {
    renderMovieList(getMoviesByPage(page));
  } else if (dataPanel.innerHTML.includes("card-group")) {
    renderMovieCard(getMoviesByPage(page));
  }
});

//changeMode監聽器
changeMode.addEventListener("click", function onIconClicked(event) {
  event.preventDefault();
  const target = event.target;
  if (target.matches(".list-mode")) {
    target.classList.toggle("icon");
    target.nextElementSibling.classList.remove("icon");
    renderMovieList(getMoviesByPage(page));
  } else if (target.matches(".card-mode")) {
    target.classList.toggle("icon");
    target.previousElementSibling.classList.remove("icon");
    renderMovieCard(getMoviesByPage(page));
  }
});
//請求API資料
axios.get(INDEX_URL).then((response) => {
  movies.push(...response.data.results);
  renderPaginator(movies.length);
  renderMovieCard(getMoviesByPage(page));
});