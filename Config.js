module.exports = {
    "camera":{
        "show_video": false,
        "min_motion_frames": 8,
        "camera_warmup_time": 2.5,
        "delta_thresh": 5,
        "resolution": [640, 480],
        "fps": 16,
        "min_area": 5000,
    },
    "servo":{
        "theta": "P1-7",
        "phi": "P1-11",
        "min" : 250,
        "max" : 1250,
        "step" : 2
    }
}
