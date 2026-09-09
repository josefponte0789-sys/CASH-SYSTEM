const userForm = document.getElementById("userForm")

userForm.addEventListener("submit", async (event) => {
    event.preventDefault();


    const data = {
        clientName: document.getElementById("clientName").value,
        codeName: document.getElementById("codeName").value,
        dateTime: document.getElementById("dateTime").value,


    }

    const result = await window.api.saveForm(data);


    if (result.success) {
        alert("Data saved successfully!"); 
        userForm.reset();

    } else {
        alert("An error has occurred.")
    }
})