const userWebcam = document.getElementById("userWebcam");
const startCamera = document.getElementById("startCamera");

async function getWebcam() {
    const constraints = {
        audio: false,
        video: true,
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        userWebcam.srcObject = stream;
        console.log("it's working.");

    }
    catch (error) {
        console.error("An error has occurred!: ", error.name, error.message);
        alert("An error has occurred, please refresh the page or restart the camera.")
    }

}

startCamera.addEventListener("click", getWebcam);
