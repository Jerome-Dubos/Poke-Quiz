function getRandom(min, max) {
    min = 0;
    max = "https://tyradex.vercel.app/api/v1/pokemon/".length;
    return Math.floor(Math.random() * (max-min+1)) +min;
}

function getPokemon() {
    fetch(`https://tyradex.vercel.app/api/v1/pokemon/${getRandom()}`).then((response) =>{
        response.json().then((data)=>{
            document.querySelector(".zonePokemon").src = data.sprites.regular
        })  
    })
}

getPokemon()