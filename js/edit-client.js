async function loadClient() {
    const params = new URLSearchParams(window.location.search);

    const id = params.get("id");

    const result = await window.api.getClientId(id);

    if (!result.success) {
        console.error(result.error);
        alert("An error has occurred, please try again.");
        return;
    }

    const client = result.client;
    console.log("client object:", client);
    document.getElementById("clientName").value = client.clientName;
    document.getElementById("codeName").value = client.codeName;
    document.getElementById("dateTime").value = client.dateTime;
}

loadClient();