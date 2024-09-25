const btnValider = document.getElementById("btnValider")



function getRandom(min, max) {
    min = 0;
    max = "https://tyradex.vercel.app/api/v1/pokemon/".length;
    return Math.floor(Math.random() * (max));
}

function getPokemon() {
    fetch(`https://tyradex.vercel.app/api/v1/pokemon/${getRandom()}`).then((response) =>{
        response.json().then((data)=>{
            document.querySelector(".zonePokemon").src = data.sprites.regular
        })  
    })
}

btnValider.addEventListener('click', () => {
    getPokemon()
})


getPokemon()