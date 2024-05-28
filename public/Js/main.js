const sidebarLinks = document.querySelectorAll('.sidebar a');

// Loop through each anchor tag
sidebarLinks.forEach(link => {
    // Add click event listener
    link.addEventListener('click', function() {
        // Remove 'active' class from all anchor tags
        sidebarLinks.forEach(link => {
            link.classList.remove('active');
        });
        // Add 'active' class to the clicked anchor tag
        this.classList.add('active');
    });
}); 

let i=0;
var txt = "World's Best NoBrokerage Property Site..made by YASH";
var speed = 50;

function typeWriter() {
    if (i < txt.length) {
      document.getElementById("statement").innerHTML += txt.charAt(i);
      i++;
      setTimeout(typeWriter, speed);
    }
  }
typeWriter();

 
function openModal() {
  document.getElementById("myModal").style.display = 'flex';
   
}
const openModalLinks = document.querySelectorAll('.openModalLink');

openModalLinks.forEach(link => {
    link.addEventListener("click", () => {
        openModal();
    });
});

function openReg() {
    document.getElementById("myModals").style.display = 'flex';
}

const openModalLinksReg = document.querySelectorAll('.openModalLinkReg');

openModalLinksReg.forEach(link => {
    link.addEventListener("click", () => {
        openReg();
    });
});


window.addEventListener('click', function(event) {
  var modal = document.getElementById('myModal');
  if (event.target == modal) {
    modal.style.display = 'none';
  }
});
window.addEventListener('click', function(event) {
  var modal = document.getElementById('myModals');
  if (event.target == modal) {
    modal.style.display = 'none';
  }
});

document.getElementById("sendOTP").addEventListener("click", async function() {
  const username = document.getElementById("imput-ur").value;
  console.log(username);
  
  fetch("/send-email-otp", {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({ username: username })
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Error sending OTP');
      }
      return response.text(); // Return response as text
  })
  .then(data => {
      console.log(data);
      // alert("OTP sent successfully.");
      console.log("otp sent");
      document.getElementById("sendOTP").innerHTML = "otp sucessfully sent";
      document.getElementById("otpField").style.display = "block";
      document.getElementById("verifyOTP").style.display = "block";
  })
  .catch(error => {
      console.error("Error:", error);
      alert("Error sending OTP please ensure correct email");
  });
  });
  
  document.getElementById("verifyOTP").addEventListener("click", async () => {
    const username = document.getElementById("imput-ur").value;
    const otp = document.getElementById("imput-otpr").value;
  
    try {
      const response = await fetch("/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, otp })
      });
  
      const result = await response.json();
  
      if (result.success) {
        // OTP verification successful, enable the register button
       
        document.getElementById("funNAme").disabled = false;
        document.getElementById("verifyOTP").innerHTML = "OTP Verified"
        document.getElementById("otpField").style.display = "none";
        document.getElementById("sendOTP").style.display = "none";
        document.getElementById("imput-otp").style.display = "none";
  
        const verifyBtn = document.getElementById("verifyOTP");
  
        setTimeout(() => {
          verifyBtn.style.display = 'none'
        }, 1000);
  
  } else {
        // OTP verification failed, display error message
        alert("Incorrect OTP. Please try again.");
      }
    } catch (error) {
     
      console.log(error)
    }
  });

 

//form for renting home or selling home

const pincodeBtn = document.getElementById("getCity")

pincodeBtn.addEventListener("click", () => {
  const ownerPincode = document.getElementById("enterPincode").value;
 

  fetch(`https://api.postalpincode.in/pincode/${ownerPincode}/`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data[0].Status);

      const  cityName = document.getElementById("your-city");

      if (data[0].Status === "Success") {
        cityName.innerHTML = data[0].PostOffice[0].Block;
      } 
      else {
        cityName.innerHTML = "Enter valid pincode";
      }
    });
});

const rentOrSell = document.querySelectorAll('.Stype');
let selectedRentOrSell = '';  
let selectedCommRes = '';  

rentOrSell.forEach(link => {
    link.addEventListener('click', function() {
        rentOrSell.forEach(link => {
            link.classList.remove('active-type');
        });
        this.classList.add('active-type');
        selectedRentOrSell = this.innerText; // Update selectedRentOrSell variable

        // Call the callback function to indicate that the variable has been updated
        callback(selectedRentOrSell, selectedCommRes);
    });
});

const commRes = document.querySelectorAll(".land-typeCR");
commRes.forEach(link => {
    link.addEventListener('click', function() {
        commRes.forEach(link => {
            link.classList.remove('active-type');
        });
        this.classList.add('active-type');
        selectedCommRes = this.innerText; // Update selectedCommRes variable
    });
});

function callback(rentOrSell, commRes) {
  console.log("Main " + selectedCommRes) 
  console.log(selectedRentOrSell) 
}

document.querySelector('form').addEventListener('submit', function(event) {
  // Check if any of the required fields are empty or not selected
  const nameOfHouseOwner = document.querySelector('input[name="nameOfHouseOwner"]').value;
  const emailOfOwner = document.querySelector('input[name="emailOfOwner"]').value;
  const ownerPhnNumber = document.querySelector('input[name="ownerPhnNumber"]').value;
  const pincodeOfOwner = document.querySelector('input[name="pincodeOfOwner"]').value;
  const cityName = document.getElementById("your-city").innerText;
 
  const propertyTypeElement = document.querySelector('input[name="propertyType"]:checked');
  const BuyOrSellType = document.querySelector('input[name="rentOrSell"]:checked')
  const propertyType = propertyTypeElement ? propertyTypeElement.value : '';
  const subTypeProperty = BuyOrSellType ? BuyOrSellType.value:'';
  console.log(subTypeProperty)

  if (!nameOfHouseOwner || !emailOfOwner || !ownerPhnNumber || !pincodeOfOwner || !propertyType || !subTypeProperty) {
      alert('Please fill out all required fields.');
      return;
  }


  fetch('/rent-sell-home/submit-first', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nameOfHouseOwner: nameOfHouseOwner,
          emailOfOwner: emailOfOwner,
          ownerPhnNumber: ownerPhnNumber,
          pincodeOfOwner: pincodeOfOwner,
          cityName: cityName,
          propertyType: propertyType,
          subTypeProperty: subTypeProperty
        })
    }).then(response => {
      if (response.ok) {
          // If needed, show additional details section or redirect
          console.log("Form submitted successfully");
          // document.querySelector('.additional-details').style.display = 'block';
          // document.querySelector('.form-rent-home').style.display = 'none';
      } else {
          response.text().then(errorMessage => {
              console.error(`Failed to submit: ${errorMessage}`);
          });
      }
    }).catch(error => {
        console.error('Failed:', error);
    });
});

// otp 
function viewPass() {
  const passview = document.getElementById("imput-p");

  if (passview.type === 'password') {
    passview.type = 'text'
  }
  else {
    passview.type = 'password'
  }
  const cnf = document.getElementById("imput-cnf");

  if (cnf.type === 'password') {
    cnf.type = 'text'
  }
  else {
    cnf.type = 'password'
  }
}

document.getElementById("sendOTP").addEventListener("click", async function() {
const username = document.getElementById("imput-ur").value;
console.log(username);

fetch("/send-email-otp", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({ username: username })
})
.then(response => {
    if (!response.ok) {
        throw new Error('Error sending OTP');
    }
    return response.text(); // Return response as text
})
.then(data => {
    console.log(data);
    // alert("OTP sent successfully.");
    console.log("otp sent");
    document.getElementById("sendOTP").innerHTML = "otp sucessfully sent";
    document.getElementById("otpField").style.display = "block";
    document.getElementById("verifyOTP").style.display = "block";
})
.catch(error => {
    console.error("Error:", error);
    alert("Error sending OTP please ensure correct email");
});
});

document.getElementById("verifyOTP").addEventListener("click", async () => {
  const username = document.getElementById("imput-ur").value;
  const otp = document.getElementById("imput-otpr").value;

  try {
    const response = await fetch("/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, otp })
    });

    const result = await response.json();

    if (result.success) {
      // OTP verification successful, enable the register button
     
      document.getElementById("funNAme").disabled = false;
      document.getElementById("verifyOTP").innerHTML = "OTP Verified"
      document.getElementById("otpField").style.display = "none";
      document.getElementById("sendOTP").style.display = "none";
      document.getElementById("imput-otp").style.display = "none";

      const verifyBtn = document.getElementById("verifyOTP");

      setTimeout(() => {
        verifyBtn.style.display = 'none'
      }, 1000);

} else {
      // OTP verification failed, display error message
      alert("Incorrect OTP. Please try again.");
    }
  } catch (error) {
   
    console.log(error)
  }
});


 



 