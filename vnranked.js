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

async function fetchDataForUUIDs() {
    const rankedBody = document.getElementById('rankedBody');
    let rank = 1;

    try {
        const userDataArray = [];

        for (const uuid of uuids) {
            const apiUrl = `https://mcsrranked.com/api/users/${uuid}`;
            const userDataResponse = await fetch(apiUrl);
            const userData = await userDataResponse.json();
            const eloRate = userData.data.eloRate;

            if (eloRate !== null && eloRate !== "null") {
                userDataArray.push({ uuid, nickname: userData.data.nickname, eloRate });
            }
        }

        userDataArray.sort((a, b) => b.eloRate - a.eloRate);

        for (const userData of userDataArray) {
            const row = rankedBody.insertRow();
            const rankCell = row.insertCell(0);
            rankCell.textContent = rank++;
            const nameCell = row.insertCell(1);
            nameCell.textContent = userData.nickname;
            const eloCell = row.insertCell(2);
            eloCell.textContent = userData.eloRate;

            // Attach click event listener to each row
            row.addEventListener('click', function() {
                // Construct profile URL and open in new tab
                const profileUrl = `https://mcsrranked.com/profile/${userData.nickname}`;
                window.open(profileUrl, '_blank');
            });

            // Add CSS class to the row for styling
            row.classList.add('player-row');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

fetchDataForUUIDs();
