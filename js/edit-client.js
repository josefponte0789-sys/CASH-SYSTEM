document.addEventListener("DOMContentLoaded", function () {

    startCamera = document.getElementById("startCamera");
    const userWebcam = document.getElementById("userWebcam")
    const videoContainer = document.getElementById("video-container");
    const editForm = document.getElementById("editForm");
    const clientPhoto = document.getElementById("clientPhoto");
    let stream = null;
    let clientId = null;
    const videoDate = document.getElementById("videoDate");
    const dateTimeInput = document.getElementById("dateTime");
    const dateOfCheck = document.getElementById("dateOfCheck");
    const messageStatus = document.getElementById("messageStatus");
    const confirmModalTitle = document.getElementById("confirmModalTitle");
    const modalHeader = document.getElementById("modalHeader");
    const uploadPhotoBtn = document.getElementById("uploadPhoto");
    const uploadPhotoInput = document.getElementById("uploadPhotoInput");
    const uploadedPhoto = document.getElementById("uploadedPhoto");

    let photoURL = null;


    const confirmModal = new bootstrap.Modal(document.getElementById("confirmModal"));
    const editEntryModal = new bootstrap.Modal(document.getElementById("editEntryModal"));


    const saveDataButton = document.getElementById("saveDataButton")

    document.getElementById("codeName").addEventListener("wheel", function (e) {
        e.preventDefault();
    }, { passive: false })









    function disableSaveDataButton() {
        saveDataButton.disabled = true;
        saveDataButton.style.backgroundColor = "#DEDEDE";
        saveDataButton.style.border = "none";
        saveDataButton.innerText = "Please start camera first."
        saveDataButton.style.color = "black";
    }



    function enableSaveDataButton() {
        saveDataButton.disabled = false;
        saveDataButton.style.backgroundColor = "";
        saveDataButton.style.border = "";
        saveDataButton.innerText = "Save Data"
        saveDataButton.style.color = "";
    }

    uploadPhotoBtn.addEventListener("click", () => uploadPhotoInput.click());

    uploadPhotoInput.addEventListener("change", () => {
        const file = uploadPhotoInput.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please select an image file.")
            return;
        }
        
        
        if (photoURL) URL.revokeObjectURL(photoURL);
        photoURL = URL.createObjectURL(file);

        stopCamera();
        clientPhoto.style.display = "none";
        userWebcam.style.display = "none";
        uploadedPhoto.src = photoURL;
        uploadedPhoto.style.display = "block";
        

        uploadPhotoInput.value = "";

    });

    async function retakePhoto() {
        dateTimeInput.addEventListener("change", () => {
            videoDate.textContent = dateTimeInput.value;
        });
        const constraints = {
            audio: false,
            video: true,
        }
        uploadedPhoto.style.display = "none";
        userWebcam.style.display = "block";
        clientPhoto.remove();

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
     

        }
        catch (error) {
            console.error("An error has occurred!: ", error.name, error.message);
            alert("An error has occurred, please refresh the page or restart the camera.")
        }
        
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
        document.getElementById("authorizedPersonnel").value = client.authorizedPersonnel;
        document.getElementById("codeName").value = client.codeName;
        const dateOfCheckInput = document.getElementById("dateOfCheck")
        const dateInput = document.getElementById("dateTime");
        const dateFormat = dateInput._flatpickr;
        const dateOfCheckFormat = dateOfCheckInput._flatpickr;


        dateFormat.setDate(client.dateTime, false, "Y-m-d h:i K");
        dateOfCheckFormat.setDate(client.dateOfCheck, false, "Y-m-d");



  
    }

    loadClient();

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
            stream = null;
        }
    }

   function captureFrame(source) {
    const isVideo = source instanceof HTMLVideoElement;

    const width = isVideo ? source.videoWidth : source.naturalWidth;
    const height = isVideo ? source.videoHeight : source.naturalHeight;

    if (!width || !height) return Promise.resolve(null);
    if (isVideo && !source.srcObject) return Promise.resolve(null);

    const MAX = 1280;
    const scale = Math.min(1, MAX / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);

    const ctx = canvas.getContext("2d");
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);

    ctx.font = "bold 30px Arial";

    const x = canvas.width - 300;
    const y = canvas.height - 30;

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeText(dateTimeInput.value, x, y);

    ctx.fillStyle = "white";
    ctx.fillText(dateTimeInput.value, x, y);

    return new Promise((resolve, reject) => {
        canvas.toBlob(async (blob) => {
            if (!blob) return reject(new Error("Failed to capture frame"));
            const arrayBuffer = await blob.arrayBuffer();
            resolve(new Uint8Array(arrayBuffer));
        }, "image/png");
    });
}

    function pauseCamera() {
        userWebcam.pause();
    }

    function resumeCamera() {
        userWebcam.play();
    }
    




    const showConfirmDialog = document.getElementById("saveDataButton").addEventListener("click", function () {

        const editEntryModalTitle = document.getElementById("editEntryModalTitle");
        const editEntryMessage = document.getElementById("editEntryMessage");


        editEntryModalTitle.textContent = "Confirmation"
        editEntryModalTitle.style.color = "white";
        editEntryMessage.textContent = "Confirm saving this entry?"

        
        editEntryModal.show();
        if (stream !== null) {
            pauseCamera();
        }

         document.getElementById("editEntryModal").addEventListener("hidden.bs.modal",  () => {
            resumeCamera();
         }, {once: true});
    });
    const confirmEditButton = document.getElementById("confirmEditButton");

    confirmEditButton.addEventListener("click", async (event) => {
        event.preventDefault();
        editEntryModal.hide();


        

        const dateFormat = document.getElementById("dateTime")._flatpickr;
        const dateCheckFormat = document.getElementById("dateOfCheck")._flatpickr;
        const clientNameField = document.getElementById("clientName");
        const checkNoField = document.getElementById("codeName");


        const editDateSelected = dateFormat.selectedDates[0]
            ? flatpickr.formatDate(dateFormat.selectedDates[0], "Y-m-d h:i K")
            : null;

        const editDateCheckSelected = dateCheckFormat.selectedDates[0]
            ? flatpickr.formatDate(dateCheckFormat.selectedDates[0], "Y-m-d")
            : null;
    
        if (!editDateSelected || !editDateCheckSelected) {
            messageStatus.innerHTML = "<p>Missing data in one or both DATE fields. Please correct.</p>";
                modalHeader.style.backgroundColor = "#fd7e14";
                confirmModalTitle.textContent = "Notice";
                confirmModalTitle.style.color = "white";
                confirmModal.show();
                return;
        }

        if (!clientNameField.value.trim()) {
                messageStatus.innerHTML = "<p>Please input the client's name.</p>";
                modalHeader.style.backgroundColor = "#fd7e14";
                confirmModalTitle.textContent = "Notice";
                confirmModalTitle.style.color = "white";
                confirmModal.show();
                return;
            }

            if (!checkNoField.value) {
                messageStatus.innerHTML = "<p>Please input the check no.</p>";
                modalHeader.style.backgroundColor = "#fd7e14";
                confirmModalTitle.textContent = "Notice";
                confirmModalTitle.style.color = "white";
                confirmModal.show();
                return;
            }




        try {
            const dateTime = dateTimeInput.value;
            const activeSource = uploadedPhoto.style.display !== "none" ? uploadedPhoto : userWebcam;
            const webcamBytes = await captureFrame(activeSource, dateTime);
        

            const formData = {
                id: clientId,
                clientName: document.getElementById("clientName").value.toUpperCase(),
                authorizedPersonnel: document.getElementById("authorizedPersonnel").value.toUpperCase(),
                codeName: document.getElementById("codeName").value,
                dateOfCheckValue: editDateCheckSelected,
                dateTime: editDateSelected,
               
            }
            if (webcamBytes != null) {
                formData.userWebcam = webcamBytes;

            }

            const result = await window.api.updateForm(formData, editDateSelected, editDateCheckSelected);
            // const result = { success: false, error : "Test" };
            // const result = await new Promise.reject("Test Error");

            if (result.success) {
                console.log("Saved at:", result.path)
                stopCamera();
                messageStatus.innerHTML = "<p>Record saved successfully!</p>";
                modalHeader.style.backgroundColor = "#198754";
                confirmModalTitle.textContent = "Successful";
                confirmModalTitle.style.color = "white";

                    confirmModal.show();

 
                    document.getElementById("confirmModal").addEventListener(
                        "hidden.bs.modal",
                        () => {
                            window.location.reload();
                        },
                        { once: true }
                    );
            } else {
                console.error(result.error);
                console.log(formData);
                messageStatus.innerHTML = "<p>Saving failed. Please reload the page (CTRL+R).</p>";
                modalHeader.style.backgroundColor = "#dc3545";
                confirmModalTitle.textContent = "ERROR!";
                confirmModalTitle.style.color = "white";
                confirmModal.show();
                 document.getElementById("confirmModal").addEventListener(
                        "hidden.bs.modal",
                        () => {
                            window.location.reload();
                        },
                        { once: true }
                    );
            }
        
        } catch (error) {
             messageStatus.innerHTML = "<p>DATABASE ERROR! Please reload the page (CTRL+R).</p>";
            modalHeader.style.backgroundColor = "#dc3545";
            confirmModalTitle.textContent = "ERROR!";
            confirmModalTitle.style.color = "white";

                confirmModal.show();


                document.getElementById("confirmModal").addEventListener(
                    "hidden.bs.modal",
                    () => {
                        window.location.reload();
                    },
                    { once: true }
                );
            console.error("An error has occurred", error);
        }
    
    })
});