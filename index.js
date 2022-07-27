const qs = require("qs");
const { default: BigNumber } = require("bignumber.js");
const Web3 = require("web3");

let currentTrade = {};
let currentSelectSide;
async function init() {
  await listAvailableTokens();
}
async function listAvailableTokens() {
  console.log("initializing");
  let response = await fetch("https://tokens.coingecko.com/uniswap/all.json");
  let tokenlistJSON = await response.json();
  console.log("List Available Token:", tokenlistJSON);
  tokens = tokenlistJSON.tokens;
  console.log("tokens:", tokens);
  let parent = document.getElementById("token_list");
  for (const i in tokens) {
    let div = document.createElement("div");
    div.className = "token_row";
    let html = `<img class="token_list_img" src="${tokens[i].logoURI}">
        <span class="token_list_text">${tokens[i].symbol}</span>`;
    div.innerHTML = html;
    div.onclick = () => {
      selectToken(tokens[i]);
    };
    parent.appendChild(div);
  }
}
function selectToken(token) {
  closeModal();
  currentTrade[currentSelectSide] = token;
  console.log("current trade:", currentTrade);
  renderInterface();
}
function renderInterface() {
  if (currentTrade.from) {
    document.getElementById("from_token_img").src = currentTrade.from.logoURI;
    document.getElementById("from_token_text").innerHTML =
      currentTrade.from.symbol;
  }
  if (currentTrade.to) {
    document.getElementById("to_token_img").src = currentTrade.to.logoURI;
    document.getElementById("to_token_text").innerHTML = currentTrade.to.symbol;
  }
}
async function connect() {
  if (typeof window.ethereum !== "undefined") {
    try {
      document.getElementById("login_button");
      await ethereum.request({ method: "eth_requestAccounts" });
    } catch (error) {
      console.log(error);
    }
    document.getElementById("login_button").innerHTML = "Connected";
    document.getElementById("swap_button").disabled = false;
  } else {
    document.getElementById("login_button").innerHTML = "Pls Install MetaMask";
  }
}
function openModal(side) {
  currentSelectSide = side;
  document.getElementById("token_modal").style.display = "block";
}
function closeModal() {
  document.getElementById("token_modal").style.display = "none";
}
async function getPrice() {
  if (
    !currentTrade.from ||
    !currentTrade.to ||
    !document.getElementById("from_amount").value
  )
    return;
  let amount = Number(
    document.getElementById("from_amount").value *
      10 ** currentTrade.from.decimals
  );
  const params = {
    sellToken: currentTrade.from.address,
    buyToken: currentTrade.to.address,
    sellAmount: amount,
  };
  const response = await fetch(
    `https://api.0x.org/swap/v1/price?${qs.stringify(params)}`
  );
  swapPriceJSON = await response.json();
  sources = swapPriceJSON.sources;
  console.log("Sources:", sources);
  var filSource = sources.filter(function (el) {
    return el.proportion > 0;
  });
  console.log("filter sources", filSource);
  let parent = document.getElementById("sources");
  for (const i in filSource) {
    let div = document.createElement("div");
    div.className = "sources_row";
    let html = `<span class="source_name">${filSource[i].name}</span>
        <span class="source_proportion">${filSource[i].proportion*100}%</span>`;
        document.getElementById("sources").innerHTML = "";
    div.innerHTML = html;
    parent.appendChild(div);
  }
  console.log("Price: ", swapPriceJSON);
  document.getElementById("to_amount").value =
    swapPriceJSON.buyAmount / 10 ** currentTrade.to.decimals;
  document.getElementById("gas_estimate").innerHTML =
    swapPriceJSON.estimatedGas;
}
init();

async function getQuote(accounts) {
  console.log("Getting Quote:");
  if (
    !currentTrade.from ||
    !currentTrade.to ||
    !document.getElementById("from_amount").value
  )
    return;
  let amount = Number(
    document.getElementById("from_amount").value *
      10 ** currentTrade.from.decimals
  );
  const params = {
    sellToken: currentTrade.from.address,
    buyToken: currentTrade.to.address,
    sellAmount: amount,
    takerAddress: accounts,
  };
  const response = await fetch(
    `https://api.0x.org/swap/v1/quote?${qs.stringify(params)}`
  );
  swapQuoteJSON = await response.json();
  console.log("Price: ", swapQuoteJSON);
  document.getElementById("to_amount").value =
    swapQuoteJSON.buyAmount / 10 ** currentTrade.to.decimals;
  document.getElementById("gas_estimate").innerHTML =
    swapQuoteJSON.estimatedGas;
  return swapQuoteJSON;
}

async function trySwap() {
  // The address, if any, of the most recently used account that the caller is permitted to access
  let accounts = await ethereum.request({ method: "eth_accounts" });
  let takerAddress = accounts[0];
  console.log("takerAddress: ", takerAddress);
  const swapQuoteJSON = await getQuote(takerAddress);
  const erc20abi = [
    {
      inputs: [
        { internalType: "string", name: "name", type: "string" },
        { internalType: "string", name: "symbol", type: "string" },
        { internalType: "uint256", name: "max_supply", type: "uint256" },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "spender",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "Approval",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        { indexed: true, internalType: "address", name: "to", type: "address" },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "Transfer",
      type: "event",
    },
    {
      inputs: [
        { internalType: "address", name: "owner", type: "address" },
        { internalType: "address", name: "spender", type: "address" },
      ],
      name: "allowance",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "approve",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "account", type: "address" }],
      name: "balanceOf",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
      name: "burn",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "account", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "burnFrom",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "decimals",
      outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "subtractedValue", type: "uint256" },
      ],
      name: "decreaseAllowance",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "addedValue", type: "uint256" },
      ],
      name: "increaseAllowance",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "name",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "symbol",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "totalSupply",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "recipient", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "transfer",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "sender", type: "address" },
        { internalType: "address", name: "recipient", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "transferFrom",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];
  // Set up approval amount for the token we want to trade from
  const fromTokenAddress = currentTrade.from.address;
  let approval_amount = Number(
    document.getElementById("from_amount").value *
      10 ** currentTrade.from.decimals
  );
  
  const web3 = new Web3(Web3.givenProvider);
  const ERC20TokenContract = new web3.eth.Contract(erc20abi, fromTokenAddress);
  console.log("setup ERC20TokenContract: ", ERC20TokenContract);
  const tx = await ERC20TokenContract.methods
    .approve(swapQuoteJSON.allowanceTarget, approval_amount)
    .send({ from: takerAddress })
    .then((tx) => {
      console.log("tx: ", tx);
    });
  const receipt = await web3.eth.sendTransaction(swapQuoteJSON);
  console.log("receipt: ", receipt);
}

document.getElementById("login_button").onclick = connect;
document.getElementById("from_token_select").onclick = () => {
  openModal("from");
};
document.getElementById("to_token_select").onclick = () => {
  openModal("to");
};
document.getElementById("modal_close").onclick = closeModal;
document.getElementById("from_amount").onblur = getPrice;
document.getElementById("swap_button").onclick = trySwap;
