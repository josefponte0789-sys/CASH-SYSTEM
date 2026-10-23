

const userForm = document.getElementById("userForm")
let stream = null;

const userWebcam = document.getElementById("userWebcam");
const startCamera = document.getElementById("startCamera");
const videoDate = document.getElementById("videoDate");
const dateTimeInput = document.getElementById("dateTime");
const dateOfCheck = document.getElementById("dateOfCheck");
const saveDataButton = document.getElementById("saveDataButton")



document.getElementById("codeName").addEventListener("wheel", function (e)  {
    e.preventDefault();
}, {passive: false})





function disableSaveDataButton() {
    saveDataButton.disabled = true;
    saveDataButton.style.backgroundColor = "#DEDEDE";
    saveDataButton.style.border = "none";
    saveDataButton.innerText = "Please start camera first."
    saveDataButton.style.color = "black";
}



disableSaveDataButton();
function enableSaveDataButton() {
    saveDataButton.disabled = false;
    saveDataButton.style.backgroundColor = "";
    saveDataButton.style.border = "";
    saveDataButton.innerText = "Save Data"
    saveDataButton.style.color = "";
}


async function getWebcam() {

    dateTimeInput.addEventListener("change", () => {
    videoDate.textContent = dateTimeInput.value;
    });       
    disableSaveDataButton();

    const constraints = {
        audio: false,
        video: true,
    }
    try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        userWebcam.srcObject = stream;
        console.log("it's working.");
        saveDataButton.innerText = "Processing..."
        setTimeout(() => {
            enableSaveDataButton();
        }, 1500)
        
    }
    catch (error) {
        console.error("An error has occurred!: ", error.name, error.message);
        alert("An error has occurred, please refresh the page or restart the camera.")
    }
   
}

startCamera.addEventListener("click", getWebcam);


function captureFrame(videoEl) {
    const canvas = document.createElement("canvas");
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

    ctx.font = "30px Arial";
    ctx.fontWeight = "bold";

    const x = canvas.width - 300;
    const y = canvas.height - 30;

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeText(dateTimeInput.value, x, y);

    ctx.fillStyle = "white";
    ctx.fillText(dateTimeInput.value, x, y);


    return new Promise((resolve, reject) => {
        canvas.toBlob(async (blob) => {
            if (!blob) return reject(new Error("Failed to capture frame"))
            const arrayBuffer = await blob.arrayBuffer()
            resolve(new Uint8Array(arrayBuffer))
        }, "image/png")
    })


}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop())
        stream = null;
    }
}


userForm.addEventListener("submit", async (event) => {
    event.preventDefault();


    if (!stream) {
        alert("Please start the camera first");
        return;
    }
    try {
            
    
    const dateFormat = document.getElementById("dateTime")._flatpickr;
    const dateCheckFormat = document.getElementById("dateOfCheck")._flatpickr;

    const dateSelected = dateFormat.selectedDates[0]
        ? flatpickr.formatDate(dateFormat.selectedDates[0], "Y-m-d h:i K")
        : null;

    const dateOfCheckSelected = dateCheckFormat.selectedDates[0]
        ? flatpickr.formatDate(dateCheckFormat.selectedDates[0], "Y-m-d h:i K")
        : null;

    if (!dateSelected || !dateOfCheckSelected) {
        alert("ERROR: Please select both dates.");
        return;
    }
    
        const dateTime = dateTimeInput.value;
        const webcamBytes = await captureFrame(userWebcam, dateTime);

        const formData = {
            clientName: document.getElementById("clientName").value.toUpperCase(),
            authorizedPersonnel: document.getElementById("authorizedPersonnel").value.toUpperCase(),
            codeName: document.getElementById("codeName").value,
            dateOfCheckValue: dateOfCheckSelected,
            dateTime: dateSelected,
            userWebcam: webcamBytes,
        }

        const result = await window.api.saveForm(formData, dateSelected, dateOfCheckSelected);
        

        if (result.success) {
            console.log("Saved at:", result.path)
            alert("SUCCESS: Data saved successfully! Press 'OK' to proceed.");
            userForm.reset();
            stopCamera();
            window.location.reload();
        } else {
            console.error(result.error);
            alert("ERROR: An error has occurred. Page will reload.");
            window.location.reload();
        }
    } catch (error) {
        alert(" ERROR: An error has occurred. Please reload the page.", error);
        console.error(" ERROR: An error has occurred", error);
    }
})


