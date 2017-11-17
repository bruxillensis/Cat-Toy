# import the necessary packages
from picamera.array import PiRGBArray
from picamera import PiCamera
import argparse
import warnings
import datetime
import json
import time
import cv2
import imutils
import subprocess
import numpy as np

def moveTo(laser_map, x, y):
    subprocess.call("echo 0="+str(laser_map[x][y][0])+" > /dev/servoblaster", shell=True)
    subprocess.call("echo 1="+str(laser_map[x][y][1])+" > /dev/servoblaster", shell=True)
    return

def track(x, y, w, h):
    moveTo(x+round(w/2,0), y+round(h/2,0))
    return

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

ap = argparse.ArgumentParser()
ap.add_argument("-c", "--conf", required=True, help="path to the JSON configuration file")
args = vars(ap.parse_args())

warnings.filterwarnings("ignore")
conf = json.load(open(args["conf"]))

resolution = tuple(conf["resolution"])
camera = PiCamera()
camera.resolution = resolution
camera.framerate = conf["fps"]
rawCapture = PiRGBArray(camera, size=resolution)

print("[INFO] warming up...")
time.sleep(conf["camera_warmup_time"])
avg = None
laser_map = [[0 for x in range(resolution[0])] for y in range(resolution[1])]
print("Initializing Map. Press any key to continue...")
cv2.waitKey(0)
initializeMap(laser_map, camera)

print("Initialization Complete. Press any key to begin tracking.")
cv2.waitKey(0)

for f in camera.capture_continuous(rawCapture, format="bgr", use_video_port=True):
    frame = f.array
    timestamp = datetime.datetime.now()
    text = "Unoccupied"

    frame = imutils.resize(frame, width=500)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (21, 21), 0)

    if avg is None:
        print("[INFO] starting background model...")
        avg = gray.copy().astype("float")
        rawCapture.truncate(0)
        continue

    frameDelta = cv2.absdiff(gray, cv2.convertScaleAbs(avg))

    thresh = cv2.threshold(frameDelta, conf["delta_thresh"], 255, cv2.THRESH_BINARY)[1]
    thresh = cv2.dilate(thresh, None, iterations=2)
    (_, cnts, _) = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    for c in cnts:
        if cv2.contourArea(c) > conf["max_area"]:
            continue
        (x, y, w, h) = cv2.boundingRect(c)
        track(x, y, w, h)
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
        text = "Occupied"

    cv2.putText(frame, "Room Status: {}".format(text), (10, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
    cv2.putText(frame, timestamp.strftime("%A %d %B %Y %I:%M:%S%p"), (10, frame.shape[0] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 0, 255), 1)

    if conf["show_video"]:
        cv2.imshow("Security Feed", frame)
        key = cv2.waitKey(1) & 0xFF

        if key == ord("q"):
            break

    rawCapture.truncate(0)
