const btnValider = document.getElementById("btnValider")
const pokemon = document.querySelector(".zonePokemon")
const score = document.querySelector(".zoneScore span")
const reponse = document.getElementById("inputEcriture")
const inputEcriture = document.getElementById("inputEcriture")
const listPokemon = "https://tyradex.vercel.app/api/v1/pokemon/"
let compteurScore = 0
let reponseCorrecte = ''
const arrayId = []

inputEcriture.addEventListener('keyup', (e) => {
    if(e.key === 'Enter'){
        e.preventDefault
        validerReponse()
    }
})

btnValider.addEventListener('click', (event) => {
    event.preventDefault
    validerReponse()
})


function initScore() {
    score.innerHTML = compteurScore
}

function getRandom(min, max) {
    return Math.floor(Math.random() * (max) + 1)
}

function getPokemon() {
    const rand = getRandom(1, 150)
    while(arrayId.includes(rand)){
        rand = getRandom(1, 150)
    }
    arrayId.push(rand)
    fetch(`${listPokemon}${rand}`).then((response) => {
        response.json().then((data) => {
            document.querySelector(".zonePokemon").src = data.sprites.regular
            reponseCorrecte = data.name.fr
        })
    })
}


function verifierReponse() {
    let reponseDonnee = inputEcriture.value
    if (reponseDonnee.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === reponseCorrecte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()) {
        compteurScore++
        initScore()
    } else {
        window.alert(`La bonne réponse était ${reponseCorrecte}`)
    }
    inputEcriture.value = ''
}

function validerReponse() {
    verifierReponse()
    getPokemon()
}


getPokemon()

