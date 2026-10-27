
document.addEventListener("DOMContentLoaded", function () {


    const confirmModal = new bootstrap.Modal(document.getElementById("confirmModal"));
    const deleteEntryModal = new bootstrap.Modal(document.getElementById("deleteEntryModal"));
    const confirmDeleteButton = document.getElementById("confirmDeleteButton");





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
            <td>${client.authorizedPersonnel ? client.authorizedPersonnel : 'N/A'}</td>
            <td>${client.codeName}</td>
            <td class="action-buttoncontainers"><button type="button" data-id=${client.id} class="btn btn-primary edit-btn">Edit/View</button>
            <button type="button" data-id=${client.id} id="deleteEntry" class="btn btn-danger delete-btn">Delete Entry</button> </td>
    `).join('');
        
        let pendingDeleteId = null;
   

                      
        tbody.addEventListener("click", async (e) => {

        
                
            
            const editBtn = e.target.closest(".edit-btn");
            const deleteBtn = e.target.closest(".delete-btn");
             
            if (editBtn) {
                window.location.href = `edit-client.html?id=${editBtn.dataset.id}`
            }
            else if (deleteBtn) {
                pendingDeleteId = deleteBtn.dataset.id;
                deleteEntryModal.show();
            }
            confirmDeleteButton.addEventListener("click", async (event) => {
                    try {
                        event.preventDefault();
                        deleteEntryModal.hide();
                        if (!pendingDeleteId) return;
                        const result = await window.api.deleteEntry(pendingDeleteId);
                        // const result = {success: false, error: "Testing error."}
                        // const result = await new Promise.reject("Testing error");


                        if (result.success) {
                            console.log("Deleted entry:", result.path);
                            messageStatus.innerHTML = "<p>Successfully deleted entry!</p>";
                            modalHeader.style.backgroundColor = "#198754";
                            confirmModalTitle.textContent = "Successful";
                            confirmModalTitle.style.color = "white";
                            confirmModal.show();
                            pendingDeleteId = null;
                            document.getElementById("confirmModal").addEventListener(
                            "hidden.bs.modal",
                                () => {
                                window.location.reload();
                            },
                            { once: true }
                        );
                            
                    
                        }
                        else {
                            console.log("ERROR: An error has occurred", result.error);
                            messageStatus.innerHTML = "<p>Failed to delete entry.</p>";
                            modalHeader.style.backgroundColor = "#dc3545";
                            confirmModalTitle.textContent = "ERROR";
                            confirmModalTitle.style.color = "white";
                            confirmModal.show();
                            pendingDeleteId = null;
                            document.getElementById("confirmModal").addEventListener(
                            "hidden.bs.modal",
                                () => {
                                window.location.reload();
                            },
                            { once: true }
                        );
                    };
                } catch (err) {
                     console.log("ERROR: An error has occurred:", err);
                        messageStatus.innerHTML = "<p>An error has occurred.</p>";
                        modalHeader.style.backgroundColor = "#dc3545";
                        confirmModalTitle.textContent = "ERROR";
                        confirmModalTitle.style.color = "white";
                        confirmModal.show();
                        pendingDeleteId = null;
                        document.getElementById("confirmModal").addEventListener(
                        "hidden.bs.modal",
                            () => {
                            window.location.reload();
                        },
                        { once: true }
                    );
                };
                 
             });
            
        });
        
        
               


        DataTable.type('num', 'className', 'dt-body-left');
        DataTable.type('num-fmt', 'className', 'dt-body-left');
        DataTable.type('date', 'className', 'dt-body-left');

        const table = new DataTable('#myTable', {
            columnDefs: [
                {
                    width: '15%',
                    targets: 0,
                    render: function (data, type, row) {
                        if (type === 'display' && data) {
                            const [date, ...time] = data.split(' ');
                            const [year, month, day] = date.split('-');
                            return `${month}-${day}-${year}-${time.join(' ')}`;
                        }
                        return data;
                    }
                },
                {
                    width: '25%',
                    targets: 1
                },
                {
                    width: '25%',
                    targets: 2
          
                },
                {
                    width: '15%',
                    targets: 3
                },
                {
                    width: '20%',
                    targets: 4
                }
            ]
        });

    
    }

    loadData();


});