const API_URL = 'https://api.coingecko.com/api/v3/coins/markets';
    const listContainer = document.getElementById('list-container');
    const sidebarContainer = document.getElementById('crypto-sidebar');
    const comparisonContainer = document.getElementById('comparison-container');
    const sortSelect = document.getElementById('sort');
    const loadMoreBtn = document.getElementById('load-more');
    const loadLessBtn = document.getElementById('load-less');
    const mainElement = document.getElementById('app-main');

    let comparisonList = JSON.parse(localStorage.getItem('comparisonList')) || [];
    let fullData = [];
    let displayLimit = 10;

    async function fetchCryptoData() {
      try {
        const res = await fetch(`${API_URL}?vs_currency=usd&order=${sortSelect.value}&per_page=50&page=1&sparkline=false`);
        const data = await res.json();
        fullData = data;
        displayCryptoList();
        updateComparison();
      } catch (err) {
        listContainer.innerHTML = '<p>Error loading data.</p>';
      }
    }

    function displayCryptoList() {
      listContainer.innerHTML = '';
      sidebarContainer.innerHTML = '';
      fullData.slice(0, displayLimit).forEach(coin => {
        const coinHTML = `
          <div class="crypto-item">
            <h3>${coin.name} (${coin.symbol.toUpperCase()})</h3>
            <p>Price: $${coin.current_price.toFixed(2)}</p>
            <button onclick="addToComparison('${coin.id}')">Compare</button>
          </div>
        `;
        listContainer.innerHTML += coinHTML;
        sidebarContainer.innerHTML += coinHTML;
      });

      loadLessBtn.style.display = displayLimit > 10 ? 'inline-block' : 'none';
      loadMoreBtn.style.display = displayLimit >= fullData.length ? 'none' : 'inline-block';
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
    }

    function removeFromComparison(id) {
      comparisonList = comparisonList.filter(cid => cid !== id);
      localStorage.setItem('comparisonList', JSON.stringify(comparisonList));
      updateComparison();
      if (comparisonList.length === 0) {
        mainElement.classList.remove('show-comparison');
      }
    }

    function updateComparison() {
      comparisonContainer.innerHTML = '';
      const selected = fullData.filter(coin => comparisonList.includes(coin.id));
      selected.forEach(coin => {
        const compEl = document.createElement('div');
        compEl.className = 'comparison-item';
        compEl.innerHTML = `
          <h4>${coin.name}</h4>
          <p>Price: $${coin.current_price.toFixed(2)}</p>
          <p>24h Change: ${coin.price_change_percentage_24h.toFixed(2)}%</p>
          <p>Market Cap: $${coin.market_cap.toLocaleString()}</p>
          <button onclick="removeFromComparison('${coin.id}')">Remove</button>
        `;
        comparisonContainer.appendChild(compEl);
      });
    }

    loadMoreBtn.addEventListener('click', () => {
      displayLimit += 10;
      displayCryptoList();
    });

    loadLessBtn.addEventListener('click', () => {
      displayLimit = Math.max(10, displayLimit - 10);
      displayCryptoList();
    });

    sortSelect.addEventListener('change', fetchCryptoData);
    fetchCryptoData();
    setInterval(fetchCryptoData, 60000);