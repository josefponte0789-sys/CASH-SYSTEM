


        const loader = document.getElementById("loader");

        loader.style.transition = "opacity 1.75s";
        loader.style.opacity = "0";

        setTimeout(() => {
            loader.style.display = "none";
            document.getElementById("userForm").style.display = "block";
        }, 550)


