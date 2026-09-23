// ============================================================
// DashCraft Account Status
// Uses the currently logged-in DashCraft account
// ============================================================

(() => {

    const API = "https://api.dashcraft.io";

    // ------------------------------------------------------------
    // Find the currently active token
    // ------------------------------------------------------------

    function getCurrentToken() {
        // Uses currentToken from the account switcher if available
        if (typeof currentToken !== "undefined" && currentToken) {
            return currentToken;
        }

        // Fallback: try to find the Authorization header through
        // the existing fetch system
        return null;
    }

    // ------------------------------------------------------------
    // API request helper
    // ------------------------------------------------------------

    async function api(url) {
        const token = getCurrentToken();

        if (!token) {
            throw new Error("No logged-in account detected.");
        }

        const response = await fetch(API + url, {
            headers: {
                Authorization: token
            }
        });

        if (!response.ok) {
            throw new Error(
                `API request failed: ${response.status} ${response.statusText}`
            );
        }

        return await response.json();
    }

    // ------------------------------------------------------------
    // Get currently logged-in account
    // ------------------------------------------------------------

    async function getAccount() {
        return await api("/auth/account");
    }

    // ------------------------------------------------------------
    // Get complete user information
    // ------------------------------------------------------------

    async function getUser(accountId) {
        return await api("/userv2/" + accountId);
    }

    // ------------------------------------------------------------
    // Format numbers
    // ------------------------------------------------------------

    function number(value) {
        return Number(value || 0).toLocaleString();
    }

    // ------------------------------------------------------------
    // Create UI
    // ------------------------------------------------------------

    function createUI() {

        const old = document.getElementById("dashcraftAccountStatus");

        if (old) {
            old.remove();
        }

        const container = document.createElement("div");

        container.id = "dashcraftAccountStatus";

        container.style.position = "fixed";
        container.style.top = "20px";
        container.style.right = "20px";
        container.style.width = "320px";
        container.style.maxHeight = "80vh";
        container.style.overflowY = "auto";

        container.style.background = "#2b2b2b";
        container.style.color = "white";

        container.style.border = "1px solid #555";
        container.style.borderRadius = "8px";

        container.style.padding = "15px";

        container.style.zIndex = "999999";

        container.style.fontFamily =
            "Arial, Helvetica, sans-serif";

        container.style.fontSize = "14px";

        container.innerHTML = `

            <div style="
                font-size:18px;
                font-weight:bold;
                margin-bottom:10px;
            ">
                DashCraft Account
            </div>

            <div id="dcAccountStatus">
                Loading...
            </div>

            <button id="dcRefreshAccount" style="
                margin-top:12px;
                width:100%;
                padding:8px;
                border:0;
                border-radius:5px;
                cursor:pointer;
            ">
                Refresh
            </button>

        `;

        document.body.appendChild(container);

        document
            .getElementById("dcRefreshAccount")
            .addEventListener("click", loadAccount);

        loadAccount();
    }

    // ------------------------------------------------------------
    // Display helper
    // ------------------------------------------------------------

    function row(name, value) {

        return `
            <div style="
                display:flex;
                justify-content:space-between;
                padding:4px 0;
                border-bottom:1px solid #444;
            ">
                <span>${name}</span>
                <b>${value}</b>
            </div>
        `;
    }

    // ------------------------------------------------------------
    // Load account
    // ------------------------------------------------------------

    async function loadAccount() {

        const output =
            document.getElementById("dcAccountStatus");

        if (!output) {
            return;
        }

        output.innerHTML = "Loading account...";

        try {

            const account = await getAccount();

            if (!account || !account._id) {
                throw new Error(
                    "DashCraft did not return an account ID."
                );
            }

            const user = await getUser(account._id);

            const levelData = user.levelData || {};

            const level =
                Number(levelData.level || 0) + 1;

            const xp =
                Number(levelData.xpInLevel || 0);

            const xpTotal =
                Number(levelData.totalXpInLevel || 0);

            const totalXP =
                Number(levelData.totalXp || 0);

            const league =
                Number(user.leagueNr || 0) + 1;

            // ----------------------------------------------------
            // Profile
            // ----------------------------------------------------

            let html = `

                <div style="
                    font-size:17px;
                    font-weight:bold;
                    margin-bottom:8px;
                ">
                    ${user.username || account.username || "Unknown"}
                </div>

                ${row("User ID", user._id)}

                <br>

                <div style="
                    font-weight:bold;
                    margin-bottom:5px;
                ">
                    PROFILE
                </div>

                ${row("Level", level)}

                ${row(
                    "XP",
                    `${number(xp)} / ${number(xpTotal)}`
                )}

                ${row("Total XP", number(totalXP))}

                ${row("League", league)}

                ${row(
                    "Followers",
                    number(user.followersCount)
                )}

                ${row(
                    "Likes",
                    number(user.likesCount)
                )}

            `;

            // ----------------------------------------------------
            // Extra information if returned by API
            // ----------------------------------------------------

            if (user.createdAt) {
                html += row(
                    "Created",
                    new Date(user.createdAt).toLocaleDateString()
                );
            }

            output.innerHTML = html;

        } catch (error) {

            console.error(
                "[DashCraft Account Status]",
                error
            );

            output.innerHTML = `

                <div style="
                    color:#ff6b6b;
                    font-weight:bold;
                ">
                    Failed to load account
                </div>

                <div style="
                    margin-top:8px;
                    color:#ccc;
                ">
                    ${error.message}
                </div>

            `;
        }
    }

    // ------------------------------------------------------------
    // Start
    // ------------------------------------------------------------

    createUI();

})();