

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
            <td>${client.dateTime}</td>
            <td>${client.clientName}</td>
            <td>${client.codeName}</td>
            <td class="action-buttoncontainers"><button type="button" data-id=${client.id} class="btn btn-primary edit-btn">Edit/View</button>
    `).join('');


    document.getElementById("tableDataOutput").addEventListener("click", (e) => {
        if (e.target.classList.contains("edit-btn")) {
            const id = e.target.dataset.id;
            window.location.href = `edit-client.html?id=${id}`
        }
    })
DataTable.type('num', 'className', 'dt-body-right');
DataTable.type('num-fmt', 'className', 'dt-body-right');
DataTable.type('date', 'className', 'dt-body-right');

    const table = new DataTable('#myTable', {
	columnDefs: [{ width:'10%', targets:0, },{ width:'40%', targets:1 }, { width:'30 %', targets:2 }, { width:'15%', targets:3 }]
});

    
}

loadData();
