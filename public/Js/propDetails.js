 
const viewPhnNumber = document.getElementById("viewPhnNumber");

viewPhnNumber.addEventListener("click",() => {
    openmodal()
})

        function openmodalimg(modalimgId) {
            var modalimg = document.getElementById(modalimgId);
            modalimg.style.display = "flex";
        }

        function closemodalimg(modalimgId) {
            var modalimg = document.getElementById(modalimgId);
            modalimg.style.display = "none";
        }


   function openmodal() {
            var modal = document.getElementById( 'viewPhn');
            modal.style.display = "flex";
        }
     
        function closeViewPhn() {
    document.getElementById('viewPhn').style.display = 'none';
}

function showContactForm() {
    document.getElementById('contactForm').style.display = 'block';

    document.getElementById('div-text-info').style.display = 'none';
    
}
const getBackForm = document.getElementById("getBackForm")

getBackForm.addEventListener("click",() => {
    document.getElementById('contactForm').style.display = 'none';

document.getElementById('div-text-info').style.display = 'block';

})
 
document.getElementById('contactOwnerForm').addEventListener('submit', function (e) {

    alert('Form submitted. The owner will contact you soon.');
    closeViewPhn();
});


document.getElementById('payBtn').onclick = async function() {
            const response = await fetch('/api/razorpay/createOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: 30, // Amount in INR
                    currency: 'INR',
                    receipt: 'receipt_id_1'
                  

                })
            });
            const order = await response.json();
            
            const options = {
                key: 'rzp_test_SLeOOqQEvpGxpv', 
                amount: order.amount,  
                currency: order.currency,
                name: 'RentEase - YashDev',
                description: 'Payment for accessing phone number',
                order_id: order.id,
                handler: function (response) {
    fetch('/api/razorpay/verifyPayment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            order_id: order.id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature
        })
    }).then(response => response.json())
      .then(data => {
          if (data.success) {
              alert('Payment successful! Phone number will be revealed once also it will sent to your email address.');

              document.getElementById("originalPhnNumber").style.display ="block";
              document.getElementById("fakePhn").style.display = "none";
              document.getElementById("viewPhn").style.display ="none";
              document.getElementById("viewPhnNumber").style.display ="none";
               
              const originalPhnNumber = document.getElementById("originalPhnNumber").innerHTML;
              fetch('/got-number-onmail',{
                method:'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    mobileNumber: originalPhnNumber
                })
              }).then(response => response.json())
                .then(data => {
                    if(data.success) {
                        console.log("number sent on registered email")
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
              
              console.log("yasH");

              // Reveal the phone number here
          } else {
              alert('Payment verification failed');
          }
      })
      .catch(error => {
          console.error('Error:', error);
      });
},

            };

            const rzp1 = new Razorpay(options);
            rzp1.open();
        }
 