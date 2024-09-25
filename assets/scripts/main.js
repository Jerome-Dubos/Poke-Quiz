const btnValider = document.getElementById("btnValider")
let pokemon = document.querySelector(".zonePokemon")
let score = document.querySelector(".zoneScore span")
let reponse = document.getElementById("inputEcriture")
let compteurScore = 0
let inputEcriture = document.getElementById("inputEcriture")

function initScore() {
    score.innerHTML = compteurScore
}

function getRandom(min, max) {
    min = 1;
    max = "https://tyradex.vercel.app/api/v1/pokemon/".length;
    return Math.floor(Math.random() * (max + 1));
}

function getPokemon() {
    fetch(`https://tyradex.vercel.app/api/v1/pokemon/${getRandom()}`).then((response) => {
        response.json().then((data) => {
            document.querySelector(".zonePokemon").src = data.sprites.regular
            let reponseCorrecte = data.name.fr
            console.log(reponseCorrecte);
        })
    })
}
let reponseCorrecte = "test"

function verifierReponse() {
    let reponseDonnee = inputEcriture.value
    console.log(reponseDonnee);
    if (reponseDonnee === reponseCorrecte){
        compteurScore++
        initScore()
    } else {
        window.alert(`La bonne réponse était ${reponseCorrecte}`)
    }
    inputEcriture.value = ''
}

btnValider.addEventListener('click', () => {
    verifierReponse()
    getPokemon()
})

getPokemon()

