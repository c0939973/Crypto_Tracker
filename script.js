const API_URL = 'https://api.coingecko.com/api/v3/coins/markets';
const listContainer = document.getElementById('list-container');
const sidebarContainer = document.getElementById('sidebar-container');
const comparisonContainer = document.getElementById('comparison-container');
const sortSelect = document.getElementById('sort');
const loadMoreBtn = document.getElementById('load-more');
const loadLessBtn = document.getElementById('load-less');
const sidebarMoreBtn = document.getElementById('sidebar-more');
const sidebarLessBtn = document.getElementById('sidebar-less');
const mainElement = document.getElementById('app-main');

let comparisonList = JSON.parse(localStorage.getItem('comparisonList')) || [];
let fullData = [];
let displayLimit = 10;
let sidebarLimit = 10;

async function fetchCryptoData() {
  try {
    const res = await fetch(`${API_URL}?vs_currency=usd&order=${sortSelect.value}&per_page=50&page=1&sparkline=true`);
    // alert(`${API_URL}?vs_currency=usd&order=${sortSelect.value}&per_page=50&page=1&sparkline=true`);
    const data = await res.json();
    fullData = data;
    displayCryptoList();
    displaySidebarList();
    updateComparison();
  } catch (err) {
    listContainer.innerHTML = '<p>Error loading data.</p>';
  }
}

function generateSparklinePoints(prices) {
  if (!prices || prices.length === 0) return '';
  const max = Math.max(...prices);
  const min = Math.min(...prices);
  return prices.map((price, i) => {
    const x = (i / prices.length) * 240;
    const y = 100 - ((price - min) / (max - min)) * 100;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
}

function displayCryptoList() {
  listContainer.innerHTML = '';
  fullData.slice(0, displayLimit).forEach(coin => {
    const itemHTML = `
      <div class="crypto-item">
        <h3>${coin.name} (${coin.symbol.toUpperCase()})</h3>
        <p>Price: $${coin.current_price.toFixed(2)}</p>
        <p>24h Change: ${coin.price_change_percentage_24h.toFixed(2)}%</p>
        <button onclick="addToComparison('${coin.id}')">Compare</button>
      </div>
    `;
    listContainer.insertAdjacentHTML('beforeend', itemHTML);
  });
  loadLessBtn.style.display = displayLimit > 10 ? 'inline-block' : 'none';
  loadMoreBtn.style.display = displayLimit >= fullData.length ? 'none' : 'inline-block';
}

function displaySidebarList() {
  sidebarContainer.innerHTML = '';
  fullData.slice(0, sidebarLimit).forEach(coin => {
    const itemHTML = `
      <div class="sidebar-item">
        <h4>${coin.name} (${coin.symbol.toUpperCase()})</h4>
        <p>Price: $${coin.current_price.toFixed(2)}</p>
        <p>24h Change: ${coin.price_change_percentage_24h.toFixed(2)}%</p>
        <button onclick="addToComparison('${coin.id}')">Compare</button>
      </div>
    `;
    sidebarContainer.insertAdjacentHTML('beforeend', itemHTML);
  });
  sidebarLessBtn.style.display = sidebarLimit > 10 ? 'inline-block' : 'none';
  sidebarMoreBtn.style.display = sidebarLimit >= fullData.length ? 'none' : 'inline-block';
}

function updateComparison() {
  comparisonContainer.innerHTML = '';
  const selected = fullData.filter(coin => comparisonList.includes(coin.id));
  selected.forEach(coin => {
    const sparklinePoints = generateSparklinePoints(coin.sparkline_in_7d?.price || []);
    const compEl = document.createElement('div');
    compEl.className = 'comparison-item';
    compEl.innerHTML = `
      <h4>${coin.name}</h4>
      <p>Price: $${coin.current_price.toFixed(2)}</p>
      <p>24h Change: ${coin.price_change_percentage_24h.toFixed(2)}%</p>
      <p>Market Cap: $${coin.market_cap.toLocaleString()}</p>
      <svg class="sparkline" viewBox="0 0 240 100">
        <polyline fill="none" stroke="#008cff" stroke-width="2" points="${sparklinePoints}" />
      </svg>
      <button onclick="removeFromComparison('${coin.id}')">Remove</button>
    `;
    comparisonContainer.appendChild(compEl);
  });
}

function addToComparison(id) {
  if (!comparisonList.includes(id)) {
    if (comparisonList.length < 5) {
      comparisonList.push(id);
      localStorage.setItem('comparisonList', JSON.stringify(comparisonList));
      updateComparison();
      mainElement.classList.add('show-comparison');
    } else {
      alert('You can compare up to 5 coins only.');
    }
  }
  mainElement.classList.add('show-comparison');
}

function removeFromComparison(id) {
  comparisonList = comparisonList.filter(cid => cid !== id);
  localStorage.setItem('comparisonList', JSON.stringify(comparisonList));
  updateComparison();
  if (comparisonList.length === 0) {
    mainElement.classList.remove('show-comparison');
  }
}

function showComparisonPanel() {
  mainElement.classList.add('show-comparison');
}

function hideComparisonPanel() {
  mainElement.classList.remove('show-comparison');
}

loadMoreBtn.addEventListener('click', () => {
  displayLimit += 10;
  displayCryptoList();
});

loadLessBtn.addEventListener('click', () => {
  displayLimit = Math.max(10, displayLimit - 10);
  displayCryptoList();
});

sidebarMoreBtn.addEventListener('click', () => {
  sidebarLimit += 10;
  displaySidebarList();
});

sidebarLessBtn.addEventListener('click', () => {
  sidebarLimit = Math.max(10, sidebarLimit - 10);
  displaySidebarList();
});

sortSelect.addEventListener('change', fetchCryptoData);
fetchCryptoData();
setInterval(fetchCryptoData, 60000);