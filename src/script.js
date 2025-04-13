const navLinks = document.querySelectorAll("nav a");

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const page = event.target.closest("a").getAttribute("data-page");
    handleNavigation(page);
  });
});

document
  .getElementById("login-btn")
  .addEventListener("click", function (event) {
    event.preventDefault();

    const userNameInput = document.getElementById("user-name-input");
    const loginButton = event.target;

    if (loginButton.innerText === "Logoff") {
      userNameInput.disabled = false;
      loginButton.innerText = "Login";
      console.log("Logoff realizado.");
      alert("Você foi deslogado.");
    } else {
      const username = userNameInput.value.trim();

      if (!username) {
        alert("Por favor, insira um nome de usuário.");
        return;
      }

      userNameInput.disabled = true;
      loginButton.innerText = "Logoff";
      alert("Login realizado com sucesso.");
    }
  });

function handleNavigation(page) {
  navLinks.forEach((link) => link.classList.remove("active"));
  const activeLink = [...navLinks].find(
    (link) => link.getAttribute("data-page") === page
  );
  activeLink.classList.add("active");

  switch (page) {
    case "home":
      renderHome();
      break;
    case "pnow":
      renderPnow();
      break;
    case "backlog":
      renderBacklog();
      break;
    default:
      renderHome();
      break;
  }
}

function renderHome() {
  content.innerHTML = `
    <div class="search-section">
      <input type="text" id="search-input" placeholder="Busque por um jogo..." />
      <div id="search-results" class="results-grid"></div>
      <div id="loading-indicator" class="loading-indicator">Carregando...</div>
    </div>
  `;

  const searchInput = document.getElementById("search-input");
  const resultsContainer = document.getElementById("search-results");
  const loadingIndicator = document.getElementById("loading-indicator");

  loadingIndicator.style.display = "none";

  let debounceTimeout;
  function debounce(fn, delay) {
    return (...args) => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => fn(...args), delay);
    };
  }

  async function searchGames(query) {
    if (!query) {
      resultsContainer.innerHTML = "";
      loadingIndicator.style.display = "none";
      return;
    }

    loadingIndicator.style.display = "block";

    const response = await fetch(
      `https://api.rawg.io/api/games?search=${query}&key=${window.config.RAWG_API_KEY}&page_size=4`
    );
    const data = await response.json();

    loadingIndicator.style.display = "none";

    resultsContainer.innerHTML = data.results
      .map(
        (game) => `
      <div class="game-card" data-game='${JSON.stringify(game).replace(
        /'/g,
        "&apos;"
      )}'>
        <img src="${game.background_image}" alt="${game.name}" />
        <h3>${game.name}</h3>
        <p>${game.rating} ⭐</p>
        <p>Ano de Lançamento: ${
          game.released ? new Date(game.released).getFullYear() : "N/A"
        }</p>
        <p>${game.tags?.[0].name || "N/A"}</p>
      </div>
    `
      )
      .join("");

    document.querySelectorAll(".game-card").forEach((card) => {
      card.addEventListener("click", () => {
        const game = JSON.parse(card.dataset.game.replace(/&apos;/g, "'"));
        renderGameDetails(game);
      });
    });
  }

  searchInput.addEventListener(
    "input",
    debounce((e) => {
      const query = e.target.value.trim();
      searchGames(query);
    }, 500)
  );
}

function renderGameDetails(game) {
  content.innerHTML = `
    <div class="details-container">
      <div class="game-image-container">
        <img src="${game.background_image}" alt="${
    game.name
  }" class="game-image" />
        <div class="action-buttons">
          <button id="register-playing-btn">Registrar como Jogando</button>
          <button id="verificar-reviews-btn">Verificar Reviews</button>
        </div>
      </div>
      <div class="game-info">
        <button class="back-button">Voltar</button>
        <h2>${game.name}</h2>
        <p><strong>Nota:</strong> ${game.rating} ⭐</p>
        <p><strong>Lançamento:</strong> ${game.released}</p>
        <p><strong>Gêneros:</strong> ${
          game.genres?.map((g) => g.name).join(", ") || "N/A"
        }</p>
        <p><strong>Tags:</strong> ${
          game.tags
            ?.slice(0, 5)
            .map((t) => t.name)
            .join(", ") || "N/A"
        }</p>
        <p><strong>Desenvolvedor(es):</strong> ${
          game.developers?.map((d) => d.name).join(", ") || "N/A"
        }</p>
        <p><strong>Publisher(s):</strong> ${
          game.publishers?.map((p) => p.name).join(", ") || "N/A"
        }</p>
        <p><strong>Duração média:</strong> ${
          game.playtime ? `${game.playtime} horas` : "N/A"
        }</p>
        <p><strong>Plataformas:</strong> ${
          game.platforms?.map((p) => p.platform.name).join(", ") || "N/A"
        }</p>
      </div>
    </div>
  `;

  const backButton = document.querySelector(".back-button");
  backButton.addEventListener("click", () => {
    renderHome();
  });

  document
    .getElementById("register-playing-btn")
    .addEventListener("click", function () {
      const userNameInput = document.getElementById("user-name-input");
      const username = userNameInput.value.trim();
      const gameName = game.name;

      if (!username || !gameName) {
        alert("Por favor, preencha o nome de usuário e o nome do jogo.");
        return;
      }

      const data = {
        username: username,
        game_name: gameName,
        is_finished: false,
      };

      fetch("http://127.0.0.1:5000/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Jogo adicionado:", data);
          alert("Jogo registrado com sucesso!");
        })
        .catch((error) => {
          console.error("Erro ao registrar jogo:", error);
          alert("Erro ao registrar o jogo. Tente novamente.");
        });
    });
    
  document.getElementById('verificar-reviews-btn').addEventListener('click', function() {
    const gameName = game.name; 

    fetch(`http://localhost:5001/review?game_name=${encodeURIComponent(gameName)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(data => {
      if (data.length > 0) {
        let reviewsHtml = data.map(review => `
          <div class="review-card">
            <p><strong>${review.username}</strong> (${review.created_at}):</p>
            <p>${review.review}</p>
            <p><em>${review.likes} likes</em></p>
          </div>
        `).join('');
        
        document.getElementById('content').innerHTML = reviewsHtml;
      } else {
        document.getElementById('content').innerHTML = '<p>Nenhuma review encontrada para este jogo.</p>';
      }
    })
    .catch(error => {
      console.error('Erro ao buscar as reviews:', error);
      document.getElementById('content').innerHTML = '<p>Erro ao buscar as reviews. Tente novamente mais tarde.</p>';
    });

   });
  }

function renderMyGameDetails(game) {
  content.innerHTML = `
    <div class="details-container">
      <div class="game-image-container">
        <img src="${game.background_image}" alt="${
    game.name
  }" class="game-image" />
        <div class="action-buttons">
          <button id="finish-btn">Finalizar</button>
          <button id="delete-button">Apagar registro</button>
          <button id="fazer-review-btn">Fazer uma Review</button>
        </div>
      </div>
      <div id="review-modal" class="modal">
  <div class="modal-content">
    <span id="close-review-modal" class="close-button">&times;</span>
    <h2>Fazer uma Review</h2>
    <form id="review-form">
      <label for="rating">Nota (1 a 5):</label>
      <input type="number" id="rating" name="rating" min="1" max="5" required />

      <label for="review-text">Review:</label>
      <textarea id="review-text" name="review" rows="4" required></textarea>

      <button type="submit">Enviar Review</button>
    </form>
  </div>
</div>
      <div class="game-info">
        <button class="back-button">Voltar</button>
        <h2>${game.name}</h2>
        <p><strong>Nota:</strong> ${game.rating} ⭐</p>
        <p><strong>Lançamento:</strong> ${game.released}</p>
        <p><strong>Gêneros:</strong> ${
          game.genres?.map((g) => g.name).join(", ") || "N/A"
        }</p>
        <p><strong>Tags:</strong> ${
          game.tags
            ?.slice(0, 5)
            .map((t) => t.name)
            .join(", ") || "N/A"
        }</p>
        <p><strong>Desenvolvedor(es):</strong> ${
          game.developers?.map((d) => d.name).join(", ") || "N/A"
        }</p>
        <p><strong>Publisher(s):</strong> ${
          game.publishers?.map((p) => p.name).join(", ") || "N/A"
        }</p>
        <p><strong>Duração média:</strong> ${
          game.playtime ? `${game.playtime} horas` : "N/A"
        }</p>
        <p><strong>Plataformas:</strong> ${
          game.platforms?.map((p) => p.platform.name).join(", ") || "N/A"
        }</p>
      </div>
    </div>
  `;

  const backButton = document.querySelector(".back-button");
  backButton.addEventListener("click", () => {
    renderPnow();
  });

  document.getElementById("finish-btn").addEventListener("click", function () {
    const userNameInput = document.getElementById("user-name-input");
    const username = userNameInput.value.trim();

    if (!username) {
      alert("Por favor, insira um nome de usuário.");
      return;
    }

    const data = {
      game_name: game.name,
      username: username,
    };

    fetch("http://127.0.0.1:5000/games", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.message);
      })
      .catch((error) => {
        console.error("Erro ao finalizar o jogo:", error);
        alert("Erro ao tentar finalizar o jogo");
      });
  });

  const deleteButton = content.querySelector("#delete-button");

  deleteButton.addEventListener("click", function () {
    const userNameInput = document.getElementById("user-name-input");
    const username = userNameInput.value.trim();
    const gameName = game.game_name;

    const data = {
      game_name: game.name,
      username: username,
    };

    fetch("http://127.0.0.1:5000/games", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.message || "Jogo removido com sucesso!");
        renderPnow();
      })
      .catch((error) => {
        console.error("Erro ao remover o jogo:", error);
        alert("Erro ao remover o jogo.");
      });
  });

document.getElementById('fazer-review-btn').addEventListener('click', function() {
  document.getElementById('review-modal').style.display = 'block';
});

document.getElementById('close-review-modal').addEventListener('click', function() {
  document.getElementById('review-modal').style.display = 'none';
});

window.addEventListener('click', function(event) {
  if (event.target == document.getElementById('review-modal')) {
    document.getElementById('review-modal').style.display = 'none';
  }
});

document.getElementById('review-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const rating = document.getElementById('rating').value;
  const reviewText = document.getElementById('review-text').value;
  const gameName = game.name; 
  const username = document.getElementById('user-name-display').innerText.replace('Usuário: ', ''); 

  const reviewData = {
    username: username,
    game_name: gameName,
    rating: parseInt(rating), 
    review: reviewText,
  };

  fetch('http://localhost:5001/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reviewData),
  })
  .then(response => response.json())
  .then(data => {
    alert('Review enviada com sucesso!');
    document.getElementById('review-modal').style.display = 'none';
  })
  .catch(error => {
    console.error('Erro ao enviar a review:', error);
    alert('Erro ao enviar a review. Tente novamente mais tarde.');
  });
});
}

function renderPnow() {
  const userNameInput = document.getElementById("user-name-input");
  const loggedInUser = userNameInput.value.trim();

  if (!loggedInUser) {
    alert("Por favor, insira seu nome de usuário!");
    return;
  }

  content.innerHTML = `
    <div id="games-playing" class="results-grid"></div>
    <div id="loading-indicator" class="loading-indicator">Carregando...</div>
  `;

  const gamesContainer = document.getElementById("games-playing");
  const loadingIndicator = document.getElementById("loading-indicator");

  loadingIndicator.style.display = "none";

  async function fetchPlayingGames() {
    loadingIndicator.style.display = "block";

    const response = await fetch(
      `http://127.0.0.1:5000/games?username=${loggedInUser}`
    );
    const data = await response.json();

    loadingIndicator.style.display = "none";

    function formatDate(dateString) {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }

    gamesContainer.innerHTML = data
      .map((game) => {
        const startedAt = formatDate(game.started_at);
        const finishedAt = game.is_finished
          ? formatDate(game.finished_at)
          : null;

        return `
        <div class="game-card" data-game='${JSON.stringify(game).replace(
          /'/g,
          "&apos;"
        )}'>
          <h3>${game.game_name}</h3>
          <p>Status: ${game.is_finished ? "Finalizado" : "Em progresso"}</p>
          <p>Iniciado em: ${startedAt}</p>
          ${finishedAt ? `<p>Finalizado em: ${finishedAt}</p>` : ""}
        </div>
      `;
      })
      .join("");

    document.querySelectorAll(".game-card").forEach((card) => {
      card.addEventListener("click", async () => {
        const game = JSON.parse(card.dataset.game.replace(/&apos;/g, "'"));

        const gameDetails = await fetchGameDetails(game.game_name);
        renderMyGameDetails(gameDetails);
      });
    });
  }

  fetchPlayingGames();
}

async function fetchGameDetails(gameName) {
  const response = await fetch(
    `https://api.rawg.io/api/games?key=${window.config.RAWG_API_KEY}&search=${gameName}`
  );
  const data = await response.json();
  return data.results[0];
}

function renderBacklog() {
  content.innerHTML = `
    <div class="backlog-section">
      <h2>Últimas Reviews</h2>
      <div id="backlog-reviews" class="reviews-list"></div>
      <div id="loading-indicator" class="loading-indicator">Carregando...</div>
    </div>
  `;

  const backlogReviewsContainer = document.getElementById("backlog-reviews");
  const loadingIndicator = document.getElementById("loading-indicator");

  loadingIndicator.style.display = "block";

  fetch('http://localhost:5001/review/last') 
    .then(response => response.json())
    .then(data => {
      loadingIndicator.style.display = "none";

      if (data.length > 0) {
        backlogReviewsContainer.innerHTML = data.map(review => `
          <div class="review-card" id="review-${review.game_name}">
            <h3>${review.game_name}</h3>
            <p><strong>${review.username}</strong> (${review.created_at}):</p>
            <p>${review.review}</p>
            <div>
              <button class="like-button" data-game-name="${review.game_name}" data-likes="${review.likes}">
                Curtir (${review.likes})
              </button>
            </div>
          </div>
        `).join('');
        
        document.querySelectorAll('.like-button').forEach(button => {
          button.addEventListener('click', handleLikeClick);
        });
      } else {
        backlogReviewsContainer.innerHTML = '<p>Nenhuma review encontrada.</p>';
      }
    })
    .catch(error => {
      loadingIndicator.style.display = "none";
      backlogReviewsContainer.innerHTML = '<p>Erro ao buscar as últimas reviews. Tente novamente mais tarde.</p>';
      console.error("Erro ao buscar as reviews:", error);
    });
}

function handleLikeClick(event) {
  const button = event.target;
  const gameName = button.getAttribute('data-game-name');
  const currentLikes = parseInt(button.getAttribute('data-likes'));

  const userNameInput = document.getElementById("user-name-input"); 
  const username = userNameInput ? userNameInput.value : "";  

  if (!username) {
    alert("Nome de usuário não encontrado!");
    button.disabled = false;
    return;
  }

  button.disabled = true;

  fetch(`http://localhost:5001/review/like`, {
    method: 'PUT', 
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      game_name: gameName,
      username: username 
    })
  })
    .then(response => response.json())
    .then(data => {
      if (data.message === "Like adicionado com sucesso!") {
        button.innerText = `Curtir (${currentLikes + 1})`;
        button.setAttribute('data-likes', currentLikes + 1); 
      } else {
        alert('Erro ao curtir a review. Tente novamente.');
      }
      button.disabled = false;
    })
    .catch(error => {
      console.error('Erro ao curtir a review:', error);
      button.disabled = false;
    });
}

renderHome();
