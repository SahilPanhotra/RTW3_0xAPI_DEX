async function init(){
    await listAvailableTokens();
}
async function listAvailableTokens() {
    console.log("initializing");
    let response = await fetch('https://tokens.coingecko.com/uniswap/all.json');
    let tokenlistJSON = await response.json();
    console.log("List Available Token:",tokenlistJSON);
    tokens = tokenlistJSON.tokens;
    console.log("tokens:",tokens);
    let parent = document.getElementById("token_list");
    for(const i in tokens){
        let div= document.createElement("div");
        div.className="token_row";
        let html = 
        `<img class="token_list_img" src="${tokens[i].logoURI}">
        <span class="token_list_text">${tokens[i].symbol}</span>1`;
        div.innerHTML=html;
        parent.appendChild(div);
    }

}
async function connect(){
    if(typeof window.ethereum !== "undefined"){
        try {
            document.getElementById("login_button")
            await ethereum.request({method: "eth_requestAccounts"});
        } catch (error) {
            console.log(error);
        }
        document.getElementById("login_button").innerHTML = "Connected";
        document.getElementById("swap_button").disabled =false;
    }
    else{
        document.getElementById("login_button").innerHTML = "Pls Install MetaMask";
    }
}
function openModal() {
    document.getElementById("token_modal").style.display="block";
}
function closeModal() {
    document.getElementById("token_modal").style.display="none";
}
init();
document.getElementById("login_button").onclick=connect;
document.getElementById("from_token_select").onclick = openModal;
document.getElementById("modal_close").onclick=closeModal;