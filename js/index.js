const userForm = document.getElementById("userForm")

userForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = {
        clientName: document.getElementById("clientName").value.toUpperCase(),
        codeName: document.getElementById("codeName").value,
        dateTime: document.getElementById("dateTime").value,
    }

    const result = await window.api.saveForm(formData);

    if (result.success) {
        console.log("Saved at:", result.path)
        alert("Data saved successfully!");
        userForm.reset();
    } else {
        console.error(result.error);
        alert("An error has occurred.");
    }
})