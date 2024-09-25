const popupBackground = document.querySelector(".popupBackground")
const btnLancerJeu = document.querySelector(".lancer-jeu .btn")

function afficherPopup() {
    popupBackground.classList.add("active")
}

function cacherPopup() {
    popupBackground.classList.remove("active")
}

btnLancerJeu.addEventListener("click", () => {
    afficherPopup()
})

popupBackground.addEventListener("click", (event) => {
    if (event.target === popupBackground) {
        cacherPopup()
    }
})
