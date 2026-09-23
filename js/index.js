const userForm = document.getElementById("userForm")
let stream = null;

const userWebcam = document.getElementById("userWebcam");
const startCamera = document.getElementById("startCamera");




async function getWebcam() {

    const constraints = {
        audio: false,
        video: true,
    }
    try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        userWebcam.srcObject = stream;
        console.log("it's working.");

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
        const webcamBytes = await captureFrame(userWebcam)

        const formData = {
            clientName: document.getElementById("clientName").value.toUpperCase(),
            codeName: document.getElementById("codeName").value,
            dateTime: document.getElementById("dateTime").value,
            userWebcam: webcamBytes,
        }

        const result = await window.api.saveForm(formData);

        if (result.success) {
            console.log("Saved at:", result.path)
            alert("Data saved successfully!");
            userForm.reset();
            stopCamera();
        } else {
            console.error(result.error);
            alert("An error has occurred.");
        }
    } catch (error) {
        alert("An error has occurred. Please reload the page.");
        console.error("An error has occurred", error);
    }
})


