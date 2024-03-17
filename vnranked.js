let playerData = []; // Array to store fetched player data
let sortT = 1; // Flag to track sorting type

async function fetchUUIDs() {
    try {
        const response = await fetch('uuids.json'); // Fetch the JSON file
        const uuids = await response.json(); // Parse JSON response
        return uuids;
    } catch (error) {
        console.error('Error fetching UUIDs:', error);
        return [];
    }
}

async function fetchDataForUUIDs() {
    playerData = [];
    try {
        const uuids = await fetchUUIDs();
        for (const uuid of uuids) {
            const apiUrl = `https://mcsrranked.com/api/users/${uuid}`;
            const userDataResponse = await fetch(apiUrl);
            const userData = await userDataResponse.json();
            const eloRate = userData.data.eloRate;
            const bestTimeRanked = userData.data.statistics.season.bestTime.ranked;
            const winsRanked = userData.data.statistics.season.wins.ranked;
            const losesRanked = userData.data.statistics.season.loses.ranked;
            const forfeitsRanked = userData.data.statistics.season.forfeits.ranked;
            const playedMatchesRanked = userData.data.statistics.season.playedMatches.ranked;

            if (eloRate !== null && eloRate !== "null" && playedMatchesRanked !== 0) {
                const ffRate = (forfeitsRanked / playedMatchesRanked) * 100; // Calculate FF rate
                playerData.push({ uuid, nickname: userData.data.nickname, eloRate, bestTimeRanked, winsRanked, losesRanked, ffRate });
            }
        }

        sortPlayerData();
        displayPlayerData();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function sortPlayerData() {
    if (sortT == 1) {
        playerData.sort((a, b) => b.eloRate - a.eloRate);
    } else {
        playerData.sort((a, b) => {
            // Handle cases where best time is null
            if (!a.bestTimeRanked && !b.bestTimeRanked) return 0;
            if (!a.bestTimeRanked) return 1;
            if (!b.bestTimeRanked) return -1;
            return a.bestTimeRanked - b.bestTimeRanked;
        });
    }
}

// Function to format time in mm:ss.xxx format
function formatTime(timeInMs) {
    const minutes = Math.floor(timeInMs / (60 * 1000));
    const seconds = Math.floor((timeInMs % (60 * 1000)) / 1000);
    const milliseconds = Math.floor((timeInMs % 1000));
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

document.addEventListener('DOMContentLoaded', function() {
    const eloHeader = document.querySelector('th:nth-child(3)');
    const bestTimeHeader = document.querySelector('th:nth-child(4)');
    const ffRateHeader = document.querySelector('th:nth-child(5)');
    const winRateHeader = document.querySelector('th:nth-child(6)');

    eloHeader.addEventListener('click', function() {
        sortT = 1;
        sortPlayerData(); // Sort player data based on Elo Rate
        displayPlayerData(); // Display sorted player data
    });

    bestTimeHeader.addEventListener('click', function() {
        sortT = 2;
        sortPlayerData(); // Sort player data based on Best Time
        displayPlayerData(); // Display sorted player data
    });
});

fetchDataForUUIDs();

setInterval(function() {
    fetchDataForUUIDs(); // Fetch new data
}, 180000);

function displayPlayerData() {
    const rankedBody = document.getElementById('rankedBody');
    rankedBody.innerHTML = '';

    playerData.forEach((userData, index) => {
        const row = rankedBody.insertRow();
        const rankCell = row.insertCell(0);
        rankCell.textContent = index + 1;
        rankCell.style.textAlign = 'center';

        const nameCell = row.insertCell(1);
        nameCell.style.textAlign = 'left';
        const profileNameContainer = document.createElement('div');
        profileNameContainer.style.display = 'inline-block';

        const profilePic = document.createElement('img');
        profilePic.src = `https://mc-heads.net/head/${userData.uuid}`;
        profilePic.width = 16;
        profilePic.height = 16;
        profilePic.alt = 'Profile Picture';
        profilePic.style.marginRight = '4px';

        const playerName = document.createElement('span');
        playerName.textContent = userData.nickname;

        profileNameContainer.appendChild(profilePic);
        profileNameContainer.appendChild(playerName);
        nameCell.appendChild(profileNameContainer);

        const eloCell = row.insertCell(2);
        eloCell.textContent = userData.eloRate;
        eloCell.style.textAlign = 'center';

        const bestTimeCell = row.insertCell(3);
        bestTimeCell.textContent = userData.bestTimeRanked ? formatTime(userData.bestTimeRanked) : '-';
        bestTimeCell.style.textAlign = 'center';

        const winRate = (userData.winsRanked / (userData.winsRanked + userData.losesRanked)) * 100 || 0;
        const winRateCell = row.insertCell(4);
        winRateCell.textContent = winRate.toFixed(2) + "%";
        winRateCell.style.textAlign = 'center';

        const ffRate = userData.ffRate.toFixed(2);
        const ffRateCell = row.insertCell(5); // New column for FF rate
        ffRateCell.textContent = `${ffRate}%`;
        ffRateCell.style.textAlign = 'center';

        if (userData.eloRate >= 2000) {
            eloCell.style.color = 'purple';
        } else if (userData.eloRate >= 1500 && userData.eloRate <= 1999) {
            eloCell.style.color = 'cyan';
        } else if (userData.eloRate >= 1200 && userData.eloRate <= 1499) {
            eloCell.style.color = 'lime';
        } else if (userData.eloRate >= 900 && userData.eloRate <= 1199) {
            eloCell.style.color = 'gold';
        } else if (userData.eloRate >= 600 && userData.eloRate <= 899) {
            eloCell.style.color = 'silver';
        } else {
            eloCell.style.color = 'black';
        }

        row.addEventListener('click', function (event) {
            const profileUrl = `https://mcsrrankedtracker.vercel.app/users/${userData.nickname}`;
            window.open(profileUrl, '_blank');
        });

        row.classList.add('player-row');
    });
}
