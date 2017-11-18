const NumJS = require('numjs');
const OpenCV = require('opencv');

module.exports = {
    extractCoordinate: function(filename, callback){
        OpenCV.readImage(filename, function(error, image){
            
        });
    }
}


def initializeMap(laser_map, camera):
    for i in range(conf["theta_min"], conf["theta_max"]+1, conf["step"]):
        instruction = "echo 0="+str(i)+" > /dev/servoblaster"
        subprocess.call(instruction, shell=True)
        time.sleep(2)
        for j in range(conf["phi_min"], conf["phi_max"]+1, conf["step"]):
            instruction = "echo 1="+str(j)+" > /dev/servoblaster"
            subprocess.call(instruction, shell=True)
            time.sleep(2)
            camera.capture(rawCapture, format="bgr", use_video_port=True)
            image = rawCapture.array
            num = (image[:,:,2]>250)
            coordinate = num.nonzero()
            x = np.median(np.asarray(coordinate[0])).astype(np.int64)
            y = np.median(np.asarray(coordinate[1])).astype(np.int64)
            laser_map[x][y]=(i,j)
            rawCapture.truncate(0)
            print("Mapping servo position ("+str(i)+","+str(j)+") to image coordinate ("+str(x)+","+str(y)+")")
    return