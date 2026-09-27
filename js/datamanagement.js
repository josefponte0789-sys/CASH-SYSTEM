flatpickr("#dateRangeInput", {
            mode: "range",
            dateFormat: "m-d-Y",
 });



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
