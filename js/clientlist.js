

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
            <button type="submit" data-id=${client.id} id="deleteEntry" class="btn btn-danger delete-btn" onclick="return confirm ('DELETE this user data?')">Delete Entry</button> </td>
    `).join('');


    document.getElementById("tableDataOutput").addEventListener("click", async(e) => {
        if (e.target.classList.contains("edit-btn")) {
            const id = e.target.dataset.id;
            window.location.href = `edit-client.html?id=${id}`
        }
        else if (e.target.classList.contains("delete-btn")) {
            const id = e.target.dataset.id;
             const result = await window.api.deleteEntry(id);

            if(result.success){
                console.log("Save to:", result.path);
                alert('Delete successful.');
                
            }
            else{
                console.log("An error has occurred", result.error);
                alert('Delete failed, please reload the page and try again.', result.error);
            }


        }
    })
DataTable.type('num', 'className', 'dt-body-left');
DataTable.type('num-fmt', 'className', 'dt-body-left');
DataTable.type('date', 'className', 'dt-body-left');

const table = new DataTable('#myTable', {
    columnDefs: [
        {
            width: '10%',
            targets: 0,
            render: function(data, type, row){
                if (type === 'display'){
                    const [year, month, day] = data.split('-');
                    return `${month}-${day}-${year}`;
                }
                return data;
            }
        },
        {
            width: '40%',
            targets: 1
        },
        {
            width: '30%',
            targets: 2
          
        },
        {
            width: '15%',
            targets: 3
        }
    ]
});

    
}

loadData();
