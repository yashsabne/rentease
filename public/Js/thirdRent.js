const form = document.getElementById('uploadFormRoom');
          const message = document.getElementById('message');
          const imageContainer = document.getElementById('imageContainer');
  
          form.addEventListener('submit', async (e) => {
              e.preventDefault();
  
              const formData = new FormData(form);
  
              try {
                  const response = await fetch('/rent-sell-home/submit-third', {
                      method: 'POST',
                      body: formData
                  });
  
                  const result = await response.json();
                  if (response.ok) {
                      message.innerText = result.message;
  
                      // Display uploaded images
                      formData.forEach((file, key) => {
                          if (key === 'propertyImage') {
                              const url = URL.createObjectURL(file);
                              imageContainer.innerHTML += `<img src="${url}" alt="Uploaded Image" style="max-width: 100px; margin: 10px;">`;
                          }
                      });
  
                  } else {
                      message.innerText = result.message;
                  }
              } catch (error) {
                  message.innerText = 'An error occurred.';
                  console.error(error);
              }
          });