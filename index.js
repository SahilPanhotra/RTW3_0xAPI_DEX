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
document.getElementById("login_button").onclick=connect;
document.getElementById("from_token_select").onclick = openModal;
document.getElementById("modal_close").onclick=closeModal;