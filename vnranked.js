// List of UUIDs
const uuids = [
    "80a5c332139b4de09e7c2eb508f5e3a0",
    "d39c42992602442cbcbe5f4ead016690",
    "5c616ce347da454292bf6015a6c3c9d9",
    "a9832b363a9f412696245a52fa94738b",
    "ef6582ce79894573aff029862e7418af",
    "d602ce8abdd04560a6e48fa4afee8a17",
    "28235eb31e2a4ce1b55af10a97792b30",
    "7072c8df2af44086a3d8cb81c974dd71",
    "6ce961f5d6854d10a9212a5d3a163147",
    "dbaeeaf62a9348698a3604cded144298",
    "3a8036be8f8a4105b66b9021018d291c",
    "089ea5ab85424aea95bd49cb8c338cb3",
    "c3df7fa17f0d4689a90f1032aac7e2e1",
    "6409b1f605aa447f9fe537aac3db3ce4",
    "45c7a2108e9a47b1a1ed94b423e1cdd2",
    "d7d0c0f5d2bd47d29bf305ceedd7ba85",
    "d590007fa5f1402b96e40942658f5e1b"
];

let playerData = []; // Array to store fetched player data
let sortByElo = true; // Flag to track sorting type

async function fetchDataForUUIDs() {
    const rankedBody = document.getElementById('rankedBody');
    let rank = 1;

    try {
        for (const uuid of uuids) {
            const apiUrl = `https://mcsrranked.com/api/users/${uuid}`;
            const userDataResponse = await fetch(apiUrl);
            const userData = await userDataResponse.json();
            const eloRate = userData.data.eloRate;
            const bestTimeRanked = userData.data.statistics.season.bestTime.ranked;
            const winsRanked = userData.data.statistics.season.wins.ranked;
            const losesRanked = userData.data.statistics.season.loses.ranked;

            if (eloRate !== null && eloRate !== "null") {
                playerData.push({ uuid, nickname: userData.data.nickname, eloRate, bestTimeRanked, winsRanked, losesRanked });
            }
        }

        sortPlayerData(); // Sort the player data
        displayPlayerData(); // Display the sorted player data
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Function to sort player data based on sorting type
function sortPlayerData() {
    if (sortByElo) {
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

// Function to display player data in the table
function displayPlayerData() {
    const rankedBody = document.getElementById('rankedBody');
    rankedBody.innerHTML = ''; // Clear table body

    playerData.forEach((userData, index) => {
        const row = rankedBody.insertRow();
        const rankCell = row.insertCell(0);
        rankCell.textContent = index + 1;
        const nameCell = row.insertCell(1);
        nameCell.textContent = userData.nickname;
        const eloCell = row.insertCell(2);
        eloCell.textContent = userData.eloRate;
        const bestTimeCell = row.insertCell(3);
        bestTimeCell.textContent = userData.bestTimeRanked ? formatTime(userData.bestTimeRanked) : '-';
        const winRate = (userData.winsRanked / (userData.winsRanked + userData.losesRanked)) * 100 || 0; // Calculate win rate
        const winRateCell = row.insertCell(4);
        winRateCell.textContent = winRate.toFixed(2) + "%"; // Display win rate with 2 decimal places

        // Attach click event listener to each row
        row.addEventListener('click', function(event) {
            // Construct profile URL and open in new tab for left/middle click
                const profileUrl = `https://mcsrranked.com/profile/${userData.nickname}`;
                window.open(profileUrl, '_blank');
        });

        // Add CSS class to the row for styling
        row.classList.add('player-row');
    });
}

// Function to format time in mm:ss.xxx format
function formatTime(timeInMs) {
    const minutes = Math.floor(timeInMs / (60 * 1000));
    const seconds = Math.floor((timeInMs % (60 * 1000)) / 1000);
    const milliseconds = Math.floor((timeInMs % 1000));
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

// Function to toggle sort type when table header is clicked
function toggleSortType() {
    sortByElo = !sortByElo; // Toggle the sort type
    sortPlayerData(); // Sort player data based on new sorting type
    displayPlayerData(); // Display sorted player data
}

document.addEventListener('DOMContentLoaded', function() {
    const eloHeader = document.querySelector('th:nth-child(3)');
    const bestTimeHeader = document.querySelector('th:nth-child(4)');

    eloHeader.addEventListener('click', function() {
        sortByElo = true;
        sortPlayerData(); // Sort player data based on Elo Rate
        displayPlayerData(); // Display sorted player data
    });

    bestTimeHeader.addEventListener('click', function() {
        sortByElo = false;
        sortPlayerData(); // Sort player data based on Best Time
        displayPlayerData(); // Display sorted player data
    });
});

// Fetch data when the page loads
fetchDataForUUIDs();
