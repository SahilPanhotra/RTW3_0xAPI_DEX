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
document.getElementById("login_button").onclick=connect;