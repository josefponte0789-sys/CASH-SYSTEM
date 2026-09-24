startCamera = document.getElementById("startCamera");
const userWebcam = document.getElementById("userWebcam")
const videoContainer = document.getElementById("video-container");
const editForm = document.getElementById("editForm");
const clientPhoto = document.getElementById("clientPhoto");
let stream = null;
let clientId = null;
const videoDate = document.getElementById("videoDate");
const dateTimeInput = document.getElementById("dateTime");


const saveDataButton = document.getElementById("saveDataButton")









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


async function retakePhoto() {

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

        if (userWebcam) {
            userWebcam.style.display = "block";
        }
        else {
            alert("An error has occurred. Please reload the page.")
            console.error(userWebcam.error);
        }
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
    clientPhoto.remove();
}

startCamera.addEventListener("click", retakePhoto);



async function loadClient() {
    const params = new URLSearchParams(window.location.search);
    

    const id = params.get("id");
    clientId = id;

    const result = await window.api.getClientId(id);

    if (!result.success) {
        console.error(result.error);
        alert("An error has occurred, please try again.");
        return;
    }

    const client = result.client;
    const photoEl = document.getElementById("clientPhoto");
    if (result.client.userWebcamUrl) {
        photoEl.src = result.client.userWebcamUrl;
        photoEl.style.display = "block";
        

    }
    else {
        photoEl.style.display = "none";
    }
    console.log("client object:", client);
    document.getElementById("clientName").value = client.clientName;
    document.getElementById("codeName").value = client.codeName;
    document.getElementById("dateTime").value = client.dateTime;

  
}

loadClient();

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop())
        stream = null;
    }
}

function captureFrame(videoEl) {
     if (!videoEl.srcObject || !videoEl.videoWidth || !videoEl.videoHeight) {
        return Promise.resolve(null);
    }
    const canvas = document.createElement("canvas");
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

    
    ctx.font = "30px Arial";
    ctx.fontWeight = "bold";

    const x = canvas.width - 180;
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


editForm.addEventListener("submit", async (event) => {
    event.preventDefault();

 
    try {
        const dateTime = dateTimeInput.value;
        const webcamBytes = await captureFrame(userWebcam, dateTime);
        

        const formData = {
            id: clientId,
                clientName: document.getElementById("clientName").value.toUpperCase(),
                codeName: document.getElementById("codeName").value,
            dateTime: dateTime,
               
        }
        if (webcamBytes != null) {
            formData.userWebcam = webcamBytes;

        }

            const result = await window.api.updateForm(formData);

        if (result.success) {
            userWebcam.pause();
            console.log("Saved at:", result.path)
            alert("Data saved successfully!");
            stopCamera();
            window.location.reload()
            } else {
                console.error(result.error);
                console.log(formData);
                alert("An error has occurred.");
            }
        
    } catch (error) {
        alert("An error has occurred. Please reload the page.");
        console.error("An error has occurred", error);
    }
    
})