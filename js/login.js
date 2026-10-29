document.addEventListener("DOMContentLoaded", () =>{

    const messageStatus = document.getElementById("messageStatus");
    const confirmModalTitle = document.getElementById("confirmModalTitle");
    const modalHeader = document.getElementById("modalHeader");

    const confirmModal = new bootstrap.Modal(document.getElementById("confirmModal"));



 if(sessionStorage.getItem("loggedOut")){
    sessionStorage.removeItem("loggedOut");
    messageStatus.innerHTML = "Logout successful.";
    modalHeader.style.backgroundColor = "#198754";
    confirmModalTitle.textContent = "Successful";
    confirmModalTitle.style.color = "white";
    confirmModal.show();
    
            
 }

    let registerMode = false;

    (async () =>{
       registerMode = !(await window.auth.hasUsers());
       if(registerMode){
        document.getElementById("title").textContent = "Register initial account";
        document.getElementById("submitBtn").textContent = "Register"

       }
    
    })();

     

    document.getElementById("loginForm").addEventListener("submit", async(e)=>{
        e.preventDefault();



        

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const errorEl = document.getElementById("error");


        if(!username.trim()){
            messageStatus.innerHTML = "Please enter a username.";
            modalHeader.style.backgroundColor = "#fd7e14";
            confirmModalTitle.textContent = "Notice";
            confirmModalTitle.style.color = "white";
            confirmModal.show();
        }

        if(!password.trim()){
            messageStatus.innerHTML = "Please enter a password.";
            modalHeader.style.backgroundColor = "#fd7e14";
            confirmModalTitle.textContent = "Notice";
            confirmModalTitle.style.color = "white";
            confirmModal.show();
        }

        if(registerMode){
            const reg = await window.auth.register({username, password});
            if(!reg.ok)
                {
                messageStatus.textContent = reg.error;
                modalHeader.style.backgroundColor = "#dc3545";
                confirmModalTitle.textContent = "Error:";
                confirmModalTitle.style.color = "white";
                confirmModal.show();
                return;
                }
               
            
        }

        if(!registerMode){
            const res = await window.auth.login({username, password});
            if(!res.ok){
                messageStatus.textContent = res.error;
                modalHeader.style.backgroundColor = "#dc3545";
                confirmModalTitle.textContent = "Error:";
                confirmModalTitle.style.color = "white";
                confirmModal.show();
                return;
                }  
        }

        window.location.href = 'index.html';

    });

});