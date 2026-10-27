document.addEventListener("DOMContentLoaded", function () {

    const userForm = document.getElementById("userForm")
    let stream = null;

    const userWebcam = document.getElementById("userWebcam");
    const startCamera = document.getElementById("startCamera");
    const videoDate = document.getElementById("videoDate");
    const dateTimeInput = document.getElementById("dateTime");
    const dateOfCheck = document.getElementById("dateOfCheck");
    const saveDataButton = document.getElementById("saveDataButton");
    const messageStatus = document.getElementById("messageStatus");
    const confirmModalTitle = document.getElementById("confirmModalTitle");
    const modalHeader = document.getElementById("modalHeader");

    const confirmModal = new bootstrap.Modal(document.getElementById("confirmModal"));
    const addEntryModal = new bootstrap.Modal(document.getElementById("addEntryModal"));


    

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
            messageStatus.innerHTML = "<p>Camera starting failed. Please connect a camera to this PC and reload the page (CTRL+R).</p>";
            modalHeader.style.backgroundColor = "#dc3545";
            confirmModalTitle.textContent = "ERROR!";
            confirmModalTitle.style.color = "white";
            confirmModal.show();
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

    function pauseCamera(){
        userWebcam.pause();
    }

     function resumeCamera(){
        userWebcam.play();
    }


    const showConfirmDialog = document.getElementById("saveDataButton").addEventListener("click", function () {

        const addEntryModalTitle = document.getElementById("addEntryModalTitle");
        const addModalHeader = document.getElementById("addModalHeader");
        const addEntryMessage = document.getElementById("addEntryMessage");


        addEntryModalTitle.textContent = "Confirmation"
        addEntryModalTitle.style.color = "white";
        addModalHeader.style.backgroundColor = "#0d6efd";
        addEntryMessage.textContent = "Confirm saving this entry?"

        
         addEntryModal.show();
         pauseCamera();

         document.getElementById("addEntryModal").addEventListener("hidden.bs.modal",  () => {
            resumeCamera();
         });
    });

    const confirmSaveButton = document.getElementById("confirmSaveButton");

    confirmSaveButton.addEventListener("click", async (event) => {
        event.preventDefault();



        addEntryModal.hide();
   


        if (!stream) {
            messageStatus.innerHTML = "<p>Please start the camera first.</p>";
            modalHeader.style.backgroundColor = "#fd7e14";
            confirmModalTitle.textContent = "Notice";
            confirmModalTitle.style.color = "white";
            confirmModal.show();
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
                messageStatus.innerHTML = "<p>Missing data in one or both DATE fields. Please correct.</p>";
                modalHeader.style.backgroundColor = "#fd7e14";
                confirmModalTitle.textContent = "Notice";
                confirmModalTitle.style.color = "white";
                confirmModal.show();
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

            //for ERROR testing purposes VVVV
            // const result = {success:false, error: "result.error"}; standard error
            // const result = await new Promise.reject("DATABASE ERROR"); catchblock error 

            if (result.success) {
                
                console.log("Saved at:", result.path)
                
                userForm.reset();
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
            } else if (result.error) {
                console.error(result.error);
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
             console.error(error);
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
        }
    })


});