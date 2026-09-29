

document.getElementById("exportBtn").addEventListener("click", async () => {


    const dates = document.getElementById("dateRangeInput")._flatpickr.selectedDates;


    if (dates.length !== 2) {
        alert("Please select a start and end date.");
        return;
    }

    const startDate = flatpickr.formatDate(dates[0], "Y-m-d");
    const endDate = flatpickr.formatDate(dates[1], "Y-m-d");



    try {

        const result = await window.api.exportData(
            startDate,
            endDate,
        );

        if (result.success) {
            alert(`Exported data: ${result.count} records`);

        }


    } catch (err) {
        console.log(err.message);
        alert(`Export failed.`, err.message);

    }




});


document.getElementById("exportDatabase").addEventListener("click", async () => {

    try {
        const result = await window.api.downloadDatabase();
        if (result.success) {
            console.log("Save to:", result.path);
            alert('Database downloaded.');
        }

    }
    catch (err) {
        console.error("An error has occurred:", err.message);
        alert('Database download failed. Please reload the page.', err.message);

    }

})

document.getElementById("exportImages").addEventListener("click", async () => {

    const imageDates = document.getElementById("dateRangeInputImages")._flatpickr.selectedDates;


    if (imageDates.length !== 2) {
        alert("Please select a start and end date.");
        return;
    }

    const startDate = flatpickr.formatDate(imageDates[0], "Y-m-d");
    const endDate = flatpickr.formatDate(imageDates[1], "Y-m-d");

    try {
        const result = await window.api.exportImages(startDate, endDate);

        if (result.success) {
            console.log("Export success!", result.path);
            alert(`Exported ${result.count} image(s).`);
        }
    }
    catch (err) {
        console.error(result.error);
        alert(`Export failed: ${result.error}`);
    }

})

document.getElementById("importDatabase").addEventListener("click", async () =>{
     try {
        const result = await window.api.importDatabase();
        if (result.success) {
            console.log("Successfully imported:", result.path);
            alert('Database imported.');
        }

    }
    catch (err) {
        console.error("An error has occurred:", err.message);
        alert('Database import failed. Please reload the page.', err.message);

    }
})