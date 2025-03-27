class PokemonQuiz {
  constructor() {
    this.pokemons = [];
    this.currentPokemon = null;
    this.score = 0;
    this.timer = null;
    this.timeLeft = 30;
    this.leaderboard =
      JSON.parse(localStorage.getItem("pokemonQuizLeaderboard")) || [];
    this.isPlaying = false;
    this.remainingPokemons = [];
    this.skippedPokemons = [];
    this.isSecondChance = false;

    this.initializeElements();
    this.addEventListeners();
    this.loadPokemons();
  }

  initializeElements() {
    const elements = {
      startButton: "startQuiz",
      quizModal: "quizModal",
      leaderboardModal: "leaderboardModal",
      scoreModal: "scoreModal",
      confirmStopModal: "confirmStopModal",
      pokemonImage: "pokemonImage",
      pokemonGuess: "pokemonGuess",
      submitButton: "submitAnswer",
      skipButton: "skipButton",
      scoreElement: "score",
      timerElement: "timer",
      leaderboardList: "leaderboardList",
      closeLeaderboardButton: "closeLeaderboard",
      stopButton: "stopQuiz",
      confirmStopButton: "confirmStop",
      cancelStopButton: "cancelStop",
      finalScoreElement: "finalScore",
      playerNameInput: "playerName",
      saveScoreButton: "saveScore",
    };

    Object.entries(elements).forEach(([key, id]) => {
      this[key] = document.getElementById(id);
    });
  }

  addEventListeners() {
    this.startButton.addEventListener("click", () => this.startQuiz());
    this.submitButton.addEventListener("click", () => this.checkAnswer());
    this.skipButton.addEventListener("click", () => this.skipPokemon());
    this.pokemonGuess.addEventListener(
      "keypress",
      (e) => e.key === "Enter" && this.checkAnswer()
    );
    this.closeLeaderboardButton.addEventListener("click", () =>
      this.hideLeaderboard()
    );
    this.stopButton.addEventListener("click", () => this.showConfirmStop());
    this.confirmStopButton.addEventListener("click", () =>
      this.confirmStopQuiz()
    );
    this.cancelStopButton.addEventListener("click", () =>
      this.hideConfirmStop()
    );
    this.saveScoreButton.addEventListener("click", () => this.saveScore());
    this.playerNameInput.addEventListener(
      "keypress",
      (e) => e.key === "Enter" && this.saveScore()
    );
  }

  async loadPokemons() {
    try {
      const response = await fetch("https://tyradex.vercel.app/api/v1/gen/1");
      const data = await response.json();

      this.pokemons = data.map((pokemon) => ({
        id: pokemon.pokedex_id,
        name: pokemon.name.fr,
        types: pokemon.types.map((type) => type.name),
        stats: [
          { stat: { name: "PV" }, base_stat: pokemon.stats.hp },
          { stat: { name: "Attaque" }, base_stat: pokemon.stats.atk },
          { stat: { name: "Défense" }, base_stat: pokemon.stats.def },
          {
            stat: { name: "Attaque Spéciale" },
            base_stat: pokemon.stats.spe_atk,
          },
          {
            stat: { name: "Défense Spéciale" },
            base_stat: pokemon.stats.spe_def,
          },
          { stat: { name: "Vitesse" }, base_stat: pokemon.stats.vit },
        ],
        image: pokemon.sprites.regular,
        category: pokemon.category,
        talents: pokemon.talents.map((talent) => talent.name),
      }));
    } catch (error) {
      console.error("Erreur lors du chargement des Pokémon:", error);
    }
  }

  showMessage(text, isSuccess = false) {
    const message = document.createElement("div");
    message.className = `message ${isSuccess ? "success" : "error"}`;
    message.textContent = text;
    document.body.appendChild(message);

    // Force le reflow pour déclencher l'animation
    message.offsetHeight;
    message.classList.add("show");

    // Supprime le message après 2 secondes
    setTimeout(() => {
      message.classList.remove("show");
      setTimeout(() => {
        document.body.removeChild(message);
      }, 300);
    }, 1500); // Réduit à 1.5 secondes pour une meilleure fluidité
  }

  hideMessage() {
    if (this.isPlaying) {
      this.nextQuestion();
    }
  }

  showConfirmStop() {
    this.stopTimer(); // Pause le timer
    this.confirmStopModal.classList.add("show");
  }

  hideConfirmStop() {
    this.confirmStopModal.classList.remove("show");
    if (this.isPlaying) {
      this.startTimer(); // Reprend le timer si le jeu est toujours en cours
    }
  }

  confirmStopQuiz() {
    this.isPlaying = false;
    clearInterval(this.timer);
    this.quizModal.classList.remove("show");
    this.confirmStopModal.classList.remove("show");
    this.startButton.focus();
  }

  startQuiz() {
    this.score = 0;
    this.scoreElement.textContent = this.score;
    this.isPlaying = true;
    this.isSecondChance = false;
    this.quizModal.classList.add("show");

    // Sélectionner aléatoirement 10 Pokémon pour cette partie
    const shuffled = [...this.pokemons].sort(() => 0.5 - Math.random());
    this.remainingPokemons = shuffled.slice(0, 10);
    this.skippedPokemons = [];
    this.nextQuestion();
  }

  nextQuestion() {
    if (!this.isPlaying) return;

    // Réactiver le bouton passer pour le nouveau Pokémon
    this.skipButton.disabled = false;
    this.skipButton.style.opacity = "0.9";

    if (this.remainingPokemons.length === 0) {
      if (this.skippedPokemons.length === 0 || this.isSecondChance) {
        // Fin du jeu
        this.finishQuiz();
        return;
      } else {
        // Seconde chance avec les Pokémon passés
        this.remainingPokemons = [...this.skippedPokemons];
        this.skippedPokemons = [];
        this.isSecondChance = true;
        this.showMessage("Seconde chance ! Points réduits de moitié", true);
      }
    }

    const randomIndex = Math.floor(
      Math.random() * this.remainingPokemons.length
    );
    this.currentPokemon = this.remainingPokemons[randomIndex];
    this.remainingPokemons.splice(randomIndex, 1);

    // S'assurer que l'image est masquée avant de changer sa source
    this.pokemonImage.classList.add("hidden");
    setTimeout(() => {
      this.pokemonImage.src = this.currentPokemon.image;
      this.pokemonImage.classList.remove("revealed");
      this.pokemonImage.classList.remove("hidden");
    }, 50);

    this.pokemonGuess.value = "";
    this.timeLeft = 30;
    this.timerElement.textContent = this.timeLeft;

    // Nettoyer et afficher les indices
    const hints = document.querySelector(".hints");
    hints.innerHTML = "";

    const typeHint = document.createElement("p");
    typeHint.textContent = `Type(s): ${this.currentPokemon.types.join(", ")}`;
    hints.appendChild(typeHint);

    const categoryHint = document.createElement("p");
    categoryHint.textContent = `Catégorie: ${this.currentPokemon.category}`;
    hints.appendChild(categoryHint);

    const talentHint = document.createElement("p");
    talentHint.textContent = `Talents: ${this.currentPokemon.talents.join(
      ", "
    )}`;
    hints.appendChild(talentHint);

    const statsHint = document.createElement("p");
    const highestStat = this.currentPokemon.stats.reduce((max, stat) =>
      stat.base_stat > max.base_stat ? stat : max
    );
    statsHint.textContent = `Statistique la plus élevée: ${highestStat.stat.name} (${highestStat.base_stat})`;
    hints.appendChild(statsHint);

    this.startTimer();
  }

  startTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.timeLeft--;
      this.timerElement.textContent = this.timeLeft;
      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.timeLeft = 0;
        this.timerElement.textContent = 0;
        this.handleTimeUp();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  handleTimeUp() {
    this.stopTimer();
    this.pokemonImage.classList.add("revealed");
    this.showMessage(
      `Temps écoulé ! Le Pokémon était ${this.currentPokemon.name}`,
      false
    );
    setTimeout(() => this.nextQuestion(), 2000);
  }

  normalizeString(str) {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
  }

  checkAnswer() {
    const guess = this.pokemonGuess.value.trim().toLowerCase();
    const correctName = this.currentPokemon.name.toLowerCase();
    const normalizedGuess = this.normalizeString(guess);
    const normalizedCorrectName = this.normalizeString(correctName);

    if (normalizedGuess === normalizedCorrectName) {
      this.stopTimer();
      const timeLeft = parseInt(this.timerElement.textContent);
      let points = 10 + timeLeft;

      // Réduire les points de moitié en seconde chance
      if (this.isSecondChance) {
        points = Math.floor(points / 2);
      }

      this.score += points;
      this.scoreElement.textContent = this.score;
      this.pokemonImage.classList.add("revealed");
      this.showMessage(`Correct ! +${points} points`, true);
      this.pokemonGuess.value = "";
      setTimeout(() => this.nextQuestion(), 2000);
    } else {
      this.showMessage("Incorrect, essayez encore !", false);
      this.pokemonGuess.value = "";
    }
  }

  skipPokemon() {
    // Désactiver le bouton après utilisation
    this.skipButton.disabled = true;
    this.skipButton.style.opacity = "0.5";
    this.stopTimer();

    if (this.isSecondChance) {
      // En seconde chance, on révèle le Pokémon
      this.pokemonImage.classList.add("revealed");
      this.showMessage(`Le Pokémon était ${this.currentPokemon.name}`, false);
      setTimeout(() => {
        if (this.remainingPokemons.length === 0) {
          this.finishQuiz();
        } else {
          this.nextQuestion();
        }
      }, 1500);
    } else {
      // Premier passage, on ne révèle pas le Pokémon
      this.showMessage("Pokémon passé", false);
      this.skippedPokemons.push(this.currentPokemon);

      // Si on a déjà passé tous les Pokémon, passer en seconde chance
      if (this.remainingPokemons.length === 0) {
        this.remainingPokemons = [...this.skippedPokemons];
        this.skippedPokemons = [];
        this.isSecondChance = true;
        setTimeout(() => {
          this.showMessage("Seconde chance ! Points réduits de moitié", true);
          this.nextQuestion();
        }, 1500);
      } else {
        setTimeout(() => this.nextQuestion(), 1500);
      }
    }
  }

  finishQuiz() {
    this.isPlaying = false;
    clearInterval(this.timer);
    this.quizModal.classList.remove("show");
    this.showScoreModal();
  }

  showScoreModal() {
    this.finalScoreElement.textContent = `Score final : ${this.score} points`;
    this.scoreModal.classList.add("show");
    this.playerNameInput.focus();
  }

  showLeaderboard() {
    this.leaderboardModal.classList.add("show");
    this.updateLeaderboardDisplay();
  }

  hideLeaderboard() {
    this.leaderboardModal.classList.remove("show");
  }

  updateLeaderboardDisplay() {
    this.leaderboardList.innerHTML = "";
    const sortedLeaderboard = [...this.leaderboard].sort(
      (a, b) => b.score - a.score
    );
    sortedLeaderboard.slice(0, 10).forEach((entry, index) => {
      const item = document.createElement("div");
      item.className = "leaderboard-item";
      item.textContent = `${index + 1}. ${entry.name}: ${entry.score} points`;
      this.leaderboardList.appendChild(item);
    });
  }

  saveScore() {
    const playerName = this.playerNameInput.value.trim();
    if (playerName) {
      this.leaderboard.push({
        name: playerName,
        score: this.score,
        date: new Date().toISOString(),
      });
      localStorage.setItem(
        "pokemonQuizLeaderboard",
        JSON.stringify(this.leaderboard)
      );
      this.scoreModal.classList.remove("show");
      this.showLeaderboard();
    } else {
      this.showMessage("Veuillez entrer votre nom", false);
    }
  }
}

// Initialisation unique du quiz
document.addEventListener("DOMContentLoaded", () => {
  // Supprimer l'ancien messageModal du DOM s'il existe
  const oldMessageModal = document.getElementById("messageModal");
  if (oldMessageModal) {
    oldMessageModal.remove();
  }

  new PokemonQuiz();
});
