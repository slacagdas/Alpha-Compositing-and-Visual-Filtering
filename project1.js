function composite(BackGround, ForeGround, ForeGroundOpacity, ForeGroundPosition) {
    var bgData = BackGround.data; 
    var fgData = ForeGround.data;  
    var bgWidth = BackGround.width; 
    var bgHeight = BackGround.height; 
    var fgWidth = ForeGround.width; 
    var fgHeight = ForeGround.height; 

    var posX = ForeGroundPosition.x; 
    var posY = ForeGroundPosition.y; 

    for (var y = 0; y < fgHeight; y++) {
        for (var x = 0; x < fgWidth; x++) {
            var fgIndex = (y * fgWidth + x) * 4; 
            var bgIndex = ((y + posY) * bgWidth + (x + posX)) * 4; 

          
            if (x + posX < 0 || x + posX >= bgWidth || y + posY < 0 || y + posY >= bgHeight) {
                continue; 
            }

            var fgAlpha = fgData[fgIndex + 3] / 255 * ForeGroundOpacity; 
            var invAlpha = 1 - fgAlpha; 

      
            bgData[bgIndex] = fgData[fgIndex] * fgAlpha + bgData[bgIndex] * invAlpha;     
            bgData[bgIndex + 1] = fgData[fgIndex + 1] * fgAlpha + bgData[bgIndex + 1] * invAlpha; 
            bgData[bgIndex + 2] = fgData[fgIndex + 2] * fgAlpha + bgData[bgIndex + 2] * invAlpha; 

           
            bgData[bgIndex + 3] = 255; 
        }
    }
}

function applyFilter() {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var imgData = context.getImageData(0, 0, canvas.width, canvas.height); 
    var filter = document.getElementById('filterSelect').value; 
    var data = imgData.data;

   
    if (filter === 'grayscale') {
        for (var i = 0; i < data.length; i += 4) {
            var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg;  
            data[i + 1] = avg;  
            data[i + 2] = avg;  
        }

    
    } else if (filter === 'brightness') {
        for (var i = 0; i < data.length; i += 4) {
            data[i] = Math.min(data[i] + 20, 255);    
            data[i + 1] = Math.min(data[i + 1] + 20, 255);  
            data[i + 2] = Math.min(data[i + 2] + 20, 255); 
        }
    } else if (filter === 'vignette') {
        var centerX = canvas.width / 2;
        var centerY = canvas.height / 2;
        var maxDistance = Math.sqrt(centerX * centerX + centerY * centerY); 
        var vignetteStrength = 0.5; 
        for (var y = 0; y < canvas.height; y++) {
            for (var x = 0; x < canvas.width; x++) {
                var i = (y * canvas.width + x) * 4;
    
                var r = data[i];
                var g = data[i + 1];
                var b = data[i + 2];
    
               
                var distanceX = x - centerX;
                var distanceY = y - centerY;
                var distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
                
             
                var factor = Math.pow(distance / maxDistance, vignetteStrength);
    
            
                data[i] = r * (1 - factor);
                data[i + 1] = g * (1 - factor);
                data[i + 2] = b * (1 - factor);
            }
        }
    }
    

    context.putImageData(imgData, 0, 0); 
}


document.getElementById('imageLoader').addEventListener('change', (event) => {
    var reader = new FileReader();
    reader.onload = function(e) {
        var img = new Image();
        img.onload = function() {
            var canvas = document.getElementById('canvas');
            var context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height); 
            context.drawImage(img, 0, 0, canvas.width, canvas.height); 

           
            var tedupng = new Image();
            tedupng.src = 'path/to/tedu.png';
            tedupng.onload = function() {
                var cup = new Image();
                cup.src = 'path/to/cup.png'; 
                cup.onload = function() {
                    
               
                    context.drawImage(img, 0, 0, canvas.width, canvas.height);

               
                    applyFilter();

                  
                    var bgData = context.getImageData(0, 0, canvas.width, canvas.height);
                    var fgPosition = { x: 0, y: 0 }; 
                    composite(bgData, tedupng, 0.7, fgPosition); 

                   
                    fgPosition = { x: 100, y: 100 }; 
                    composite(bgData, cup, 0.8, fgPosition); 

                  
                    context.putImageData(bgData, 0, 0);
                }
            }
        }
        img.src = e.target.result;
    }
    reader.readAsDataURL(event.target.files[0]);
}, false);