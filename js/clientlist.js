async function loadData() {
    const result = await window.api.readForm();

    if (!result.success) {
        console.error(result.error)
        alert("An error has occurred. Please refresh the page.")
        return;
    }

    const tbody = document.getElementById("tableDataOutput");

    tbody.innerHTML = result.data.map(client => `
        <tr>
            <td>${client.clientName}</td>
            <td>${client.codeName}</td>
            <td>${client.dateTime}</td>
        </tr>
    `).join('');
}

loadData();