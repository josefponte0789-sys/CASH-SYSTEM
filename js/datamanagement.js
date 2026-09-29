

document.getElementById("exportBtn").addEventListener("click", async()=>{


const dates = document.getElementById("dateRangeInput")._flatpickr.selectedDates;


if  (dates.length !== 2){
    alert("Please select a start and end date.");
    return;
}

const startDate = flatpickr.formatDate(dates[0], "Y-m-d");
const endDate = flatpickr.formatDate(dates[1], "Y-m-d");


const result = await window.api.exportData(
    startDate,
    endDate,
);

if (result.success){
    alert (`Exported data: ${result.count} records`);

}else{
    console.error(result.error);
    alert(result.message);
}

});


document.getElementById("exportDatabase").addEventListener("click", async ()=>{
    const result = await window.api.downloadDatabase();

    if(result.success){
        console.log("Save to:", result.path);
        alert('Database downloaded.');
    }
    else{
          console.log("An error has occurred", result.error);
        alert('Download failed, please reload the page and try again.', result.error);
    }


})

document.getElementById("exportImages").addEventListener("click", async() => {

const imageDates = document.getElementById("dateRangeInputImages")._flatpickr.selectedDates;


if  (imageDates.length !== 2){
    alert("Please select a start and end date.");
    return;
}

const startDate = flatpickr.formatDate(imageDates[0], "Y-m-d");
const endDate = flatpickr.formatDate(imageDates[1], "Y-m-d");


const result = await window.api.exportImages(startDate, endDate);

if (result.success) {
  alert(`Exported ${result.count} image(s).`);
} else if (!result.canceled) {
  console.error(result.error);
  alert(`Export failed: ${result.error}`);
}

})